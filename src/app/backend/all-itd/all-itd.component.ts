import { ApplicationRef, ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import {
  EstadoGestionItd,
  HistorialItd,
  Itd
} from 'src/app/models/itd.model';
import { FirestoreService } from 'src/app/services/firestore.service';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { GestionItdService } from 'src/app/services/gestion-itd.service';

type ItdListado = Itd & {
  ultimaGestion?: HistorialItd;
};

@Component({
  selector: 'app-all-itd',
  templateUrl: './all-itd.component.html',
  styleUrls: ['./all-itd.component.scss']
})
export class AllItdComponent implements OnInit {
  searchTerm = '';
  itds: ItdListado[] = [];
  itdsFiltrados: ItdListado[] = [];
  cargando = false;
  guardandoGestion = false;
  editandoItdId: string | null = null;
  modoSeleccion = false;
  seleccionadosIds = new Set<string>();
  private readonly claveSeleccionStorage = 'newinsumo_itd_seleccionados';
  totalRegistros = 0;
  totalSeleccionados = 0;
  ordenActual: 'folio-asc' | 'folio-desc' | 'fecha-asc' | 'fecha-desc' = 'folio-desc';

  gestionForm: {
    observacion: string;
    compensacion: number;
    estadoGestion: EstadoGestionItd;
  } = this.formularioVacio();

  constructor(
    public menucontroller: MenuController,
    private router: Router,
    private firestoreService: FirestoreService,
    private gestionItdService: GestionItdService,
    private firebaseAuth: FirebaseauthService,
    private changeDetector: ChangeDetectorRef,
    private ngZone: NgZone,
    private appRef: ApplicationRef
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarITDs();
  }

  async cargarITDs(): Promise<void> {
    this.cargando = true;

    try {
      const [registros, gestiones] = await Promise.all([
        firstValueFrom(this.firestoreService.getCollection<Itd>('itds')),
        firstValueFrom(this.gestionItdService.getAll())
      ]);

      const ultimaGestionPorItd = new Map<string, HistorialItd>();

      gestiones
        .map(gestion => ({
          ...gestion,
          fechaGestion: this.convertirFecha(gestion.fechaGestion)
        }))
        .sort((a, b) => b.fechaGestion.getTime() - a.fechaGestion.getTime())
        .forEach(gestion => {
          if (!ultimaGestionPorItd.has(gestion.itdId)) {
            ultimaGestionPorItd.set(gestion.itdId, gestion);
          }
        });

      this.ngZone.run(() => {
        this.itds = registros
          .map(itd => ({
            ...itd,
            ultimaGestion: ultimaGestionPorItd.get(itd.id)
          }))
          .sort((a, b) => Number(b.folio) - Number(a.folio));
        this.restaurarSeleccionGuardada();
        this.actualizarContadores();
        this.ordenarRegistros();
        this.filterProperties();
        this.changeDetector.detectChanges();
      });
    } catch (error) {
      console.error('Error al cargar los ITD:', error);
      alert('No fue posible cargar el registro de ITD.');
    } finally {
      this.ngZone.run(() => {
        this.cargando = false;
        this.actualizarContadores();
        this.changeDetector.markForCheck();
        this.appRef.tick();
      });
    }
  }

  filterProperties(): void {
    const termino = this.searchTerm.trim().toLowerCase();

    this.itdsFiltrados = this.itds.filter(itd => {
      const coincideTexto = !termino || (
      String(itd.folio).toLowerCase().includes(termino) ||
      (itd.sellerNombre || '').toLowerCase().includes(termino) ||
      (itd.documento || '').toLowerCase().includes(termino) ||
      (itd.ocPedido || '').toLowerCase().includes(termino) ||
      (itd.numeroSeguimiento || '').toLowerCase().includes(termino) ||
      (itd.productos || []).some(producto =>
        (producto.sku || '').toLowerCase().includes(termino) ||
        (producto.descripcion || '').toLowerCase().includes(termino)
      ));
      return coincideTexto;
    });
    this.actualizarContadores();
    this.changeDetector.detectChanges();
  }

  abrirGestion(itd: ItdListado): void {
    if (this.editandoItdId === itd.id) {
      this.cancelarGestion();
      return;
    }

    this.editandoItdId = itd.id;
    this.gestionForm = {
      observacion: itd.ultimaGestion?.observacion || '',
      compensacion: Number(itd.ultimaGestion?.compensacion ?? 0),
      estadoGestion: itd.ultimaGestion?.estadoGestion || 'ABIERTO'
    };
  }

  cancelarGestion(): void {
    this.editandoItdId = null;
    this.gestionForm = this.formularioVacio();
  }

  async guardarGestion(itd: ItdListado): Promise<void> {
    const compensacion = Number(this.gestionForm.compensacion);

    if (!Number.isFinite(compensacion) || compensacion < 0 || compensacion > 100) {
      alert('La compensación debe ser un valor entre 0 y 100.');
      return;
    }

    this.guardandoGestion = true;

    try {
      const usuario = await this.firebaseAuth.auth.currentUser;
      await this.gestionItdService.create({
        id: '',
        itdId: itd.id,
        fechaGestion: new Date(),
        observacion: this.gestionForm.observacion.trim(),
        compensacion,
        estadoGestion: this.gestionForm.estadoGestion,
        responsableGestion: usuario?.email || 'Usuario',
        cargoGestion: ''
      });

      this.cancelarGestion();
      await this.cargarITDs();
      alert('La gestión del ITD se guardó correctamente.');
    } catch (error) {
      console.error('Error al guardar la gestión del ITD:', error);
      alert('No fue posible guardar la gestión. Inténtalo nuevamente.');
    } finally {
      this.guardandoGestion = false;
    }
  }

  estadoGestion(itd: ItdListado): EstadoGestionItd {
    return itd.ultimaGestion?.estadoGestion || 'ABIERTO';
  }

  editarITD(itd: ItdListado): void {
    this.router.navigate(['/set-itd'], { queryParams: { editar: itd.id } });
  }

  goPerfil(): void {
    this.router.navigate(['perfil']);
  }

  openMenu(): void {
    this.menucontroller.toggle('principal');
  }

  verITD(itd: ItdListado): void {
    this.abrirGestion(itd);
  }

  private formularioVacio(): {
    observacion: string;
    compensacion: number;
    estadoGestion: EstadoGestionItd;
  } {
    return {
      observacion: '',
      compensacion: 0,
      estadoGestion: 'ABIERTO'
    };
  }

  private convertirFecha(fecha: any): Date {
    if (fecha && typeof fecha.toDate === 'function') {
      return fecha.toDate();
    }
    return fecha instanceof Date ? fecha : new Date(fecha || 0);
  }


  toggleModoSeleccion(): void {
    this.modoSeleccion = !this.modoSeleccion;
    if (!this.modoSeleccion) this.limpiarSeleccion();
  }

  estaSeleccionado(itd: Itd): boolean {
    return this.seleccionadosIds.has(itd.id);
  }

  todosVisiblesSeleccionados(): boolean {
    return this.itdsFiltrados.length > 0 &&
      this.itdsFiltrados.every(itd => this.seleccionadosIds.has(itd.id));
  }

  private restaurarSeleccionGuardada(): void {
    try {
      const guardados = JSON.parse(localStorage.getItem(this.claveSeleccionStorage) || '[]');
      const idsValidos = new Set(this.itds.map(itd => itd.id));
      this.seleccionadosIds = new Set<string>(
        Array.isArray(guardados)
          ? guardados.filter((id: unknown): id is string => typeof id === 'string' && idsValidos.has(id))
          : []
      );
      this.modoSeleccion = this.seleccionadosIds.size > 0;
      this.guardarSeleccion();
    } catch (error) {
      console.warn('No fue posible restaurar la selección de ITD:', error);
      this.seleccionadosIds = new Set<string>();
      this.modoSeleccion = false;
    }
  }

  private guardarSeleccion(): void {
    try {
      localStorage.setItem(this.claveSeleccionStorage, JSON.stringify(Array.from(this.seleccionadosIds)));
    } catch (error) {
      console.warn('No fue posible guardar la selección de ITD:', error);
    }
  }

  contarSeleccionadosEnLista(): number {
    return this.itdsFiltrados.filter(itd => this.seleccionadosIds.has(itd.id)).length;
  }

  private actualizarContadores(): void {
    this.totalRegistros = this.itds.length;
    this.totalSeleccionados = this.seleccionadosIds.size;
  }

  cambiarSeleccionVisibles(marcado: boolean): void {
    this.itdsFiltrados.forEach(itd => {
      if (marcado) this.seleccionadosIds.add(itd.id);
      else this.seleccionadosIds.delete(itd.id);
    });
    this.seleccionadosIds = new Set(this.seleccionadosIds);
    this.guardarSeleccion();
    this.actualizarContadores();
    this.changeDetector.detectChanges();
  }

  cambiarSeleccion(itd: Itd, marcado: boolean): void {
    if (marcado) this.seleccionadosIds.add(itd.id);
    else this.seleccionadosIds.delete(itd.id);
    this.seleccionadosIds = new Set(this.seleccionadosIds);
    this.guardarSeleccion();
    this.actualizarContadores();
    this.changeDetector.detectChanges();
  }

  limpiarSeleccion(): void {
    this.seleccionadosIds.clear();
    this.seleccionadosIds = new Set<string>();
    this.guardarSeleccion();
    this.actualizarContadores();
    this.changeDetector.detectChanges();
  }

  ordenarPor(campo: 'folio' | 'fecha'): void {
    if (campo === 'folio') {
      this.ordenActual = this.ordenActual === 'folio-asc' ? 'folio-desc' : 'folio-asc';
    } else {
      this.ordenActual = this.ordenActual === 'fecha-asc' ? 'fecha-desc' : 'fecha-asc';
    }
    this.ordenarRegistros();
    this.filterProperties();
  }

  private ordenarRegistros(): void {
    const ascendente = this.ordenActual.endsWith('asc');
    this.itds.sort((a, b) => {
      const diferencia = this.ordenActual.startsWith('folio')
        ? Number(a.folio) - Number(b.folio)
        : new Date(a.fechaDeclarada || 0).getTime() - new Date(b.fechaDeclarada || 0).getTime();
      return ascendente ? diferencia : -diferencia;
    });
  }

  exportarExcel(): void {
    const registros = this.seleccionadosIds.size
      ? this.itds.filter(itd => this.seleccionadosIds.has(itd.id))
      : this.itdsFiltrados;

    if (!registros.length) {
      alert('No hay registros para exportar.');
      return;
    }

    const encabezados = ['Folio', 'Fecha declarada', 'Fecha creación', 'Seller', 'Código seller', 'Documento', 'OC/Pedido', 'Número seguimiento', 'SKU', 'Descripción producto', 'Cantidad', 'Estado producto', 'Observaciones gestión', 'Compensación (%)', 'Estado gestión', 'Responsable creación', 'Cargo creación', 'Detalle estado'];
    const filas: unknown[][] = [];
    registros.forEach(itd => {
      const productos = itd.productos?.length ? itd.productos : [null];
      productos.forEach(producto => {
        filas.push([
          itd.folio, itd.fechaDeclarada, this.convertirFecha(itd.fechaCreacion).toLocaleDateString('es-CL'),
          itd.sellerNombre, itd.sellerCodigo ?? '', itd.documento, itd.ocPedido, itd.numeroSeguimiento,
          producto?.sku ?? '', producto?.descripcion ?? '', producto?.cantidad ?? '', producto?.estadoProducto ?? '',
          itd.ultimaGestion?.observacion || '', itd.ultimaGestion?.compensacion ?? '',
          itd.ultimaGestion?.estadoGestion || 'ABIERTO', itd.responsableCreacion, itd.cargoCreacion, itd.detalleEstado
        ]);
      });
    });
    const csv = [encabezados, ...filas].map(fila =>
      fila.map((valor: unknown) => '"' + String(valor ?? '').replace(/"/g, '""') + '"').join(';')
    ).join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = 'listado_ITD_' + new Date().toISOString().slice(0, 10) + '.csv';
    enlace.click();
    URL.revokeObjectURL(url);
  }

  generarPDFSeleccionados(): void {
    const registros = this.itds.filter(itd => this.seleccionadosIds.has(itd.id));
    if (!registros.length) {
      alert('Selecciona al menos un ITD para generar el PDF consolidado.');
      return;
    }
    this.generarPDFMultiple(registros);
  }

  private generarPDFMultiple(registros: ItdListado[]): void {
    const ventana = window.open('', '_blank');
    if (!ventana) {
      alert('El navegador bloqueó la ventana del informe. Permite las ventanas emergentes e inténtalo nuevamente.');
      return;
    }
    const escapar = (valor: unknown): string => String(valor ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    const fecha = (valor: string): string => {
      if (!valor) return '';
      const partes = valor.split('-');
      return partes.length === 3 ? partes[2] + '-' + partes[1] + '-' + partes[0] : escapar(valor);
    };
    const paginas = registros.map((itd, indice) => {
      const filas = (itd.productos || []).map(producto =>
        '<tr><td>' + escapar(producto.sku) + '</td><td>' + escapar(producto.descripcion) + '</td><td>' + escapar(producto.cantidad) + '</td><td>' + escapar(itd.documento) + '</td><td>' + escapar(itd.ocPedido) + '</td><td>' + escapar(itd.numeroSeguimiento) + '</td><td>' + escapar(producto.estadoProducto) + '</td></tr>'
      ).join('');
      const fotos = (itd.fotos || []).filter(url => typeof url === 'string' && (url.indexOf('https://') === 0 || url.indexOf('http://') === 0));
      const galeria = fotos.length ? '<section class="galeria">' + fotos.map((url, i) => '<figure><img src="' + escapar(url) + '" alt="Fotografía ' + (i + 1) + '"></figure>').join('') + '</section>' : '';
      return '<section class="informe ' + (indice ? 'salto-pagina' : '') + '">' +
        '<header class="empresa-header"><div class="identidad-empresa"><img src="assets/imgs/logo-alcazar.webp" alt="Alcázar"><div><strong>Comercial Coyahue SpA</strong><span>RUT: 78.644.350-4</span><small>Marca: Alcázar</small></div></div><div class="datos-itd"><span>' + escapar(fecha(itd.fechaDeclarada)) + '</span><strong>Folio: ' + escapar(String(itd.folio).padStart(4, '0')) + '</strong></div></header>' +
        '<p><strong>Atención a ' + escapar(itd.sellerNombre) + '</strong></p><h1>Informe de recepción de producto</h1>' +
        '<p>Fecha declarada: ' + escapar(fecha(itd.fechaDeclarada)) + '</p>' +
        '<table><thead><tr><th>SKU</th><th>Descripción</th><th>Cantidad</th><th>Documento</th><th>OC / Pedido</th><th>N.º Seguimiento</th><th>Estado</th></tr></thead><tbody>' + filas + '</tbody></table>' +
        '<p>Esto corresponde a una devolución realizada por: <strong>' + escapar(itd.sellerNombre) + '</strong></p>' +
        '<h2>Detalle del estado</h2><p class="detalle">' + escapar(itd.detalleEstado || 'Sin detalle informado.') + '</p>' + galeria +
        '<div class="firma"><strong>' + escapar(itd.responsableCreacion) + '</strong><span>' + escapar(itd.cargoCreacion) + '</span></div></section>';
    }).join('');
    ventana.document.open();
    ventana.document.write('<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><base href="' + window.location.origin + '/"><title>Informes ITD seleccionados</title><style>@page{size:A4;margin:12mm}*{box-sizing:border-box}body{font:10pt Arial;color:#171717;line-height:1.35}.empresa-header{display:flex;justify-content:space-between;align-items:center;gap:12px;padding-bottom:9px;border-bottom:1px solid #d8d8d8;margin-bottom:14px}.identidad-empresa{display:flex;align-items:center;gap:10px}.identidad-empresa img{display:block;width:105px;max-height:28px;object-fit:contain}.identidad-empresa strong,.identidad-empresa span,.identidad-empresa small{display:block}.identidad-empresa strong{font-size:10pt}.identidad-empresa span,.identidad-empresa small{font-size:8pt;color:#555}.datos-itd{text-align:right;font-size:9pt}.datos-itd span,.datos-itd strong{display:block}.informe{min-height:260mm}.salto-pagina{break-before:page;page-break-before:always}h1{font-size:17pt;margin:16px 0 12px}h2{font-size:12pt;margin-top:18px}table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:8pt}th,td{border:1px solid #555;padding:6px 5px;text-align:left;overflow-wrap:anywhere;vertical-align:top}th{background:#eee}.detalle{white-space:pre-wrap;overflow-wrap:anywhere}.galeria{display:grid;grid-template-columns:repeat(2,1fr);gap:8mm;margin-top:10mm}.galeria figure{height:66mm;margin:0;border:1px solid #ddd;display:flex;align-items:center;justify-content:center;padding:2mm;break-inside:avoid}.galeria img{max-width:100%;max-height:100%;object-fit:contain}.firma{margin-top:22mm;text-align:right}.firma strong,.firma span{display:block}tr{break-inside:avoid}</style></head><body>' + paginas + '</body></html>');
    ventana.document.close();
    const imprimir = (): void => {
      const imagenes = Array.from(ventana.document.images);
      Promise.all(imagenes.map(imagen => imagen.complete ? Promise.resolve() : new Promise<void>(resolve => { imagen.onload = () => resolve(); imagen.onerror = () => resolve(); }))).then(() => { ventana.focus(); ventana.print(); });
    };
    if (ventana.document.readyState === 'complete') imprimir(); else ventana.onload = imprimir;
  }

  generarPDF(itd: Itd): void {
    const ventana = window.open('', '_blank');

    if (!ventana) {
      alert('El navegador bloqueó la ventana del informe. Permite las ventanas emergentes e inténtalo nuevamente.');
      return;
    }

    const escapar = (valor: unknown): string =>
      String(valor ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const fecha = (valor: string): string => {
      if (!valor) return '';
      const partes = valor.split('-');
      return partes.length === 3
        ? `${partes[2]}-${partes[1]}-${partes[0]}`
        : escapar(valor);
    };

    const estadoProducto = (estado: string): string => {
      switch (estado) {
        case 'BUEN_ESTADO': return 'Buen estado';
        case 'RECUPERABLE': return 'Recuperable';
        case 'MAL_ESTADO': return 'Mal estado';
        default: return 'Sin definir';
      }
    };

    const productos = (itd.productos || []).map(producto => `
      <tr>
        <td>${escapar(producto.sku)}</td>
        <td>${escapar(producto.descripcion)}</td>
        <td class="centrado">${escapar(producto.cantidad)}</td>
        <td>${escapar(itd.documento)}</td>
        <td>${escapar(itd.ocPedido)}</td>
        <td>${escapar(itd.numeroSeguimiento)}</td>
        <td>${escapar(estadoProducto(producto.estadoProducto))}</td>
      </tr>
    `).join('');

    const fotos = (itd.fotos || []).filter(url =>
      typeof url === 'string' && /^https?:\/\//i.test(url)
    );

    const crearGaleria = (imagenes: string[]): string => {
      if (!imagenes.length) return '';
      return `
        <section class="galeria">
          ${imagenes.map((url, index) => `
            <figure class="foto">
              <img src="${escapar(url)}" alt="Fotografía ${index + 1}">
            </figure>
          `).join('')}
        </section>
      `;
    };

    const paginasFotograficas: string[] = [];
    for (let i = 4; i < fotos.length; i += 4) {
      paginasFotograficas.push(`
        <section class="pagina-fotos">
          <h2>Registro fotográfico · ITD ${escapar(itd.folio)}</h2>
          ${crearGaleria(fotos.slice(i, i + 4))}
        </section>
      `);
    }

    ventana.document.open();
    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Informe de recepción · ITD ${escapar(itd.folio)}</title>
        <base href="${window.location.origin}/">
        <style>
          @page { size: A4; margin: 12mm; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #171717; font-family: Arial, Helvetica, sans-serif; font-size: 10pt; line-height: 1.35; }
          h1 { margin: 16px 0 12px; font-size: 17pt; }
          h2 { margin: 18px 0 8px; font-size: 12pt; }
          .empresa-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding-bottom: 9px; border-bottom: 1px solid #d8d8d8; margin-bottom: 14px; }
          .identidad-empresa { display: flex; align-items: center; gap: 10px; }
          .identidad-empresa img { display: block; width: 105px; max-height: 28px; object-fit: contain; }
          .identidad-empresa strong, .identidad-empresa span, .identidad-empresa small { display: block; }
          .identidad-empresa strong { font-size: 10pt; }
          .identidad-empresa span, .identidad-empresa small { font-size: 8pt; color: #555; }
          .datos-itd { text-align: right; font-size: 9pt; }
          .datos-itd span, .datos-itd strong { display: block; }
          .destinatario { margin: 18px 0; font-weight: bold; }
          .fecha-recepcion { margin: 12px 0; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 8pt; }
          th, td { border: 1px solid #555; padding: 6px 5px; text-align: left; overflow-wrap: anywhere; vertical-align: top; }
          th { background: #f0f0f0; font-weight: bold; }
          .centrado { text-align: center; }
          .devolucion { margin: 16px 0; }
          .detalle { margin-top: 16px; white-space: pre-wrap; overflow-wrap: anywhere; }
          .galeria { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8mm; margin-top: 10mm; }
          .foto { height: 66mm; margin: 0; border: 1px solid #ddd; display: flex; align-items: center; justify-content: center; padding: 2mm; break-inside: avoid; }
          .foto img { display: block; max-width: 100%; max-height: 100%; object-fit: contain; }
          .pagina-fotos { break-before: page; page-break-before: always; }
          .pagina-fotos h2 { margin-top: 0; }
          .firma { margin-top: 22mm; text-align: right; }
          .firma strong, .firma span { display: block; }
          .pie { margin-top: 14mm; font-weight: bold; }
          tr, figure { break-inside: avoid; }
          @media screen { body { max-width: 210mm; min-height: 297mm; margin: 16px auto; padding: 12mm; box-shadow: 0 0 8px #bbb; } }
        </style>
      </head>
      <body>
        <header class="empresa-header">
          <div class="identidad-empresa">
            <img src="assets/imgs/logo-alcazar.webp" alt="Alcázar">
            <div>
              <strong>Comercial Coyahue SpA</strong>
              <span>RUT: 78.644.350-4</span>
              <small>Marca: Alcázar</small>
            </div>
          </div>
          <div class="datos-itd">
            <span>${escapar(fecha(itd.fechaDeclarada))}</span>
            <strong>Folio: ${escapar(String(itd.folio).padStart(4, '0'))}</strong>
          </div>
        </header>
        <div class="destinatario">Atención a ${escapar(itd.sellerNombre)}</div>
        <h1>Informe de recepción de producto</h1>
        <p class="fecha-recepcion">Fecha declarada: ${escapar(fecha(itd.fechaDeclarada))}</p>
        <table>
          <thead><tr><th>SKU</th><th>Descripción</th><th>Cantidad</th><th>Documento</th><th>OC / Pedido</th><th>N.º Seguimiento</th><th>Obs.</th></tr></thead>
          <tbody>${productos}</tbody>
        </table>
        <p class="devolucion">Esto corresponde a una devolución realizada por: <strong>${escapar(itd.sellerNombre)}</strong></p>
        <section class="detalle"><h2>Detalle del estado</h2><p>${escapar(itd.detalleEstado || 'Sin detalle informado.')}</p></section>
        ${crearGaleria(fotos.slice(0, 4))}
        <div class="firma"><strong>${escapar(itd.responsableCreacion)}</strong><span>${escapar(itd.cargoCreacion)}</span></div>
        ${paginasFotograficas.join('')}
      </body>
      </html>
    `);
    ventana.document.close();

    const imprimirCuandoEsteListo = (): void => {
      const imagenes = Array.from(ventana.document.images);
      Promise.all(imagenes.map(imagen => {
        if (imagen.complete) return Promise.resolve();
        return new Promise<void>(resolve => {
          imagen.onload = () => resolve();
          imagen.onerror = () => resolve();
        });
      })).then(() => {
        ventana.focus();
        ventana.print();
      });
    };

    if (ventana.document.readyState === 'complete') {
      imprimirCuandoEsteListo();
    } else {
      ventana.onload = imprimirCuandoEsteListo;
    }
  }
}
