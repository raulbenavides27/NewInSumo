import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Itd } from 'src/app/models/itd.model';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-all-itd',
  templateUrl: './all-itd.component.html',
  styleUrls: ['./all-itd.component.scss']
})
export class AllItdComponent implements OnInit {

  searchTerm: string = '';

  itds: Itd[] = [];
  itdsFiltrados: Itd[] = [];

  cargando: boolean = false;

  constructor(
    public menucontroller: MenuController,
    private router: Router,
    private firestoreService: FirestoreService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarITDs();
  }

  async cargarITDs(): Promise<void> {
    this.cargando = true;

    try {
      const itds = await firstValueFrom(
        this.firestoreService.getCollection<Itd>('itds')
      );

      this.itds = [...itds].sort((a, b) => {
        return Number(b.folio) - Number(a.folio);
      });

      this.itdsFiltrados = [...this.itds];

    } catch (error) {
      console.error('Error al cargar los ITD:', error);
      alert('No fue posible cargar el registro de ITD.');
    } finally {
      this.cargando = false;
    }
  }

  filterProperties(): void {
    const termino = this.searchTerm.trim().toLowerCase();

    if (!termino) {
      this.itdsFiltrados = [...this.itds];
      return;
    }

    this.itdsFiltrados = this.itds.filter((itd) => {
      return (
        String(itd.folio).toLowerCase().includes(termino) ||
        (itd.sellerNombre || '').toLowerCase().includes(termino) ||
        (itd.documento || '').toLowerCase().includes(termino) ||
        (itd.ocPedido || '').toLowerCase().includes(termino) ||
        (itd.numeroSeguimiento || '').toLowerCase().includes(termino)
      );
    });
  }

  goPerfil(): void {
    this.router.navigate(['perfil']);
  }

  openMenu(): void {
    this.menucontroller.toggle('principal');
  }

  verITD(itd: Itd): void {
    console.log('ITD seleccionado:', itd);
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
        <style>
          @page { size: A4; margin: 12mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #171717;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 10pt;
            line-height: 1.35;
          }
          h1 { margin: 16px 0 12px; font-size: 17pt; }
          h2 { margin: 18px 0 8px; font-size: 12pt; }
          .cabecera { display: flex; justify-content: space-between; gap: 16px; }
          .folio { text-align: right; font-weight: bold; }
          .destinatario { margin: 18px 0; font-weight: bold; }
          .fecha-recepcion { margin: 12px 0; }
          table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 8pt; }
          th, td { border: 1px solid #555; padding: 6px 5px; text-align: left; overflow-wrap: anywhere; vertical-align: top; }
          th { background: #f0f0f0; font-weight: bold; }
          .centrado { text-align: center; }
          .devolucion { margin: 16px 0; }
          .detalle { margin-top: 16px; white-space: pre-wrap; overflow-wrap: anywhere; }
          .galeria {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8mm;
            margin-top: 10mm;
          }
          .foto {
            height: 66mm;
            margin: 0;
            border: 1px solid #ddd;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2mm;
            break-inside: avoid;
          }
          .foto img { display: block; max-width: 100%; max-height: 100%; object-fit: contain; }
          .pagina-fotos { break-before: page; page-break-before: always; }
          .pagina-fotos h2 { margin-top: 0; }
          .firma { margin-top: 22mm; text-align: right; }
          .firma strong, .firma span { display: block; }
          .pie { margin-top: 14mm; font-weight: bold; }
          tr, figure { break-inside: avoid; }
          @media screen {
            body { max-width: 210mm; min-height: 297mm; margin: 16px auto; padding: 12mm; box-shadow: 0 0 8px #bbb; }
          }
        </style>
      </head>
      <body>
        <div class="cabecera">
          <div>${escapar(fecha(itd.fechaDeclarada))}</div>
          <div class="folio">Folio: ${escapar(String(itd.folio).padStart(4, '0'))}</div>
        </div>

        <div class="destinatario">Atención a ${escapar(itd.sellerNombre)}</div>
        <h1>Informe de recepción de producto</h1>
        <p class="fecha-recepcion">Fecha declarada: ${escapar(fecha(itd.fechaDeclarada))}</p>

        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Descripción</th>
              <th>Cantidad</th>
              <th>Documento</th>
              <th>OC / Pedido</th>
              <th>N.º Seguimiento</th>
              <th>Obs.</th>
            </tr>
          </thead>
          <tbody>${productos}</tbody>
        </table>

        <p class="devolucion">Esto corresponde a una devolución realizada por: <strong>${escapar(itd.sellerNombre)}</strong></p>

        <section class="detalle">
          <h2>Detalle del estado</h2>
          <p>${escapar(itd.detalleEstado || 'Sin detalle informado.')}</p>
        </section>

        ${crearGaleria(fotos.slice(0, 4))}

        <div class="firma">
          <strong>${escapar(itd.responsableCreacion)}</strong>
          <span>${escapar(itd.cargoCreacion)}</span>
        </div>
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