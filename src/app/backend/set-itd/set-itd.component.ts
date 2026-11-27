
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { HistorialItd, Itd, ItdProducto } from 'src/app/models/itd.model';
import { Seller } from 'src/app/models/seller.model';
import { Usuario } from 'src/app/models/usuario.model';

import { SellerService } from 'src/app/services/seller.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestorageService } from 'src/app/services/firestorage.service';

interface FotoSeleccionada {
  archivo: File;
  nombre: string;
  url: string;
  esVideo: boolean;
}

@Component({
  selector: 'app-set-itd',
  templateUrl: './set-itd.component.html',
  styleUrls: ['./set-itd.component.scss'],
})
export class SetItdComponent implements OnInit, OnDestroy {
  sellers: Seller[] = [];
  searchTerm = '';
  itd: Itd = this.crearItdVacio();

  fotosSeleccionadas: FotoSeleccionada[] = [];
  fotosExistentes: string[] = [];
  fotosConError = new Set<string>();
  cargando = false;
  progresoCarga = 0;
  estadoOperacion = '';
  modoEdicion = false;
  motivoEdicion = '';
  private uidActual = '';
  private nombreUsuarioActual = '';
  private cargoUsuarioActual = '';
  private rolUsuarioActual = '';

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly sellerService: SellerService,
    private readonly firestoreService: FirestoreService,
    private readonly firebaseauthService: FirebaseauthService,
    private readonly firestorageService: FirestorageService
  ) {}

  async ngOnInit(): Promise<void> {
    this.cargarSellers();
    await this.cargarResponsable();
    const idEdicion = this.route.snapshot.queryParamMap.get('editar');
    if (idEdicion) {
      await this.cargarItdParaEditar(idEdicion);
    } else {
      await this.cargarSiguienteFolio();
    }
  }

  ngOnDestroy(): void {
    this.liberarVistasPrevias();
  }

  private cargarSellers(): void {
    this.sellerService.getAll().subscribe({
      next: (sellers: Seller[]) => {
        this.sellers = sellers
          .filter(seller => seller.estado === 'ACTIVO')
          .sort((a, b) => a.nombre.localeCompare(b.nombre));
      },
      error: error => {
        console.error('Error al cargar Sellers:', error);
        this.sellers = [];
        alert('No fue posible cargar los Sellers.');
      }
    });
  }

  private async cargarResponsable(): Promise<void> {
    try {
      const uid = await this.firebaseauthService.getUid();
      this.uidActual = uid || '';

      if (!uid) {
        this.itd.responsableCreacion = '';
        this.itd.cargoCreacion = '';
        return;
      }

      const usuario = await firstValueFrom(
        this.firestoreService.getDoc<Usuario>('usuarios', uid)
      );

      if (!usuario) {
        this.itd.responsableCreacion = '';
        this.itd.cargoCreacion = '';
        return;
      }

      this.nombreUsuarioActual = usuario.nombre || '';
      this.cargoUsuarioActual = usuario.cargo || '';
      this.rolUsuarioActual = usuario.rol || '';
      this.itd.responsableCreacion = usuario.nombre || '';
      this.itd.cargoCreacion = usuario.cargo || 'Sin cargo asignado';
    } catch (error) {
      console.error('Error al cargar responsable:', error);
      this.itd.responsableCreacion = '';
      this.itd.cargoCreacion = '';
    }
  }

  private async cargarSiguienteFolio(): Promise<void> {
    try {
      const itds = await firstValueFrom(
        this.firestoreService.getCollection<Itd>('itds')
      );

      const folios = itds
        .map(itd => Number(itd.folio))
        .filter(folio => Number.isFinite(folio) && folio > 0);

      this.itd.folio = folios.length
        ? Math.max(...folios) + 1
        : 1;
    } catch (error) {
      console.error('Error al obtener el siguiente folio:', error);
      this.itd.folio = 1;
      alert('No fue posible consultar los ITD existentes. Se utilizará temporalmente el folio 01.');
    }
  }

  get folioFormateado(): string {
    return String(this.itd.folio || 0).padStart(2, '0');
  }

  private obtenerFechaLocal(): string {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  crearItdVacio(): Itd {
    return {
      id: '',
      folio: 0,
      fechaCreacion: new Date(),
      fechaRecepcion: this.obtenerFechaLocal(),
      sellerId: '',
      sellerNombre: '',
      sellerCodigo: null,
      documento: '',
      ocPedido: '',
      numeroSeguimiento: '',
      detalleEstado: '',
      responsableCreacion: '',
      cargoCreacion: '',
      fotos: [],
      productos: [this.crearProductoVacio()]
    };
  }

  goPerfil(): void {
    this.router.navigate(['perfil']);
  }

  crearProductoVacio(): ItdProducto {
    return {
      sku: '',
      descripcion: '',
      cantidad: 1,
      estadoProducto: 'BUEN_ESTADO'
    };
  }

  seleccionarSellerHtml(): void {
    const seller = this.sellers.find(s => s.id === this.itd.sellerId);

    if (!seller) {
      this.itd.sellerNombre = '';
      this.itd.sellerCodigo = null;
      return;
    }

    this.itd.sellerNombre = seller.nombre;
    this.itd.sellerCodigo = seller.codigo;
  }

  agregarProducto(): void {
    this.itd.productos.push(this.crearProductoVacio());
  }

  eliminarProducto(index: number): void {
    if (this.itd.productos.length === 1) {
      alert('Debe existir al menos un producto.');
      return;
    }

    this.itd.productos.splice(index, 1);
  }

  /**
   * Agrega imágenes y genera URL temporales
   * para mostrar sus vistas previas.
   */
  agregarFoto(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivos = Array.from(input.files ?? []);

    for (const archivo of archivos) {
      const esImagen = archivo.type.startsWith('image/');
      const esVideo = archivo.type.startsWith('video/');
      if (!esImagen && !esVideo) continue;
      if (archivo.size > 100 * 1024 * 1024) {
        alert('El archivo ' + archivo.name + ' supera el máximo permitido de 100 MB.');
        continue;
      }

      const duplicada = this.fotosSeleccionadas.some(
        foto =>
          foto.nombre === archivo.name &&
          foto.archivo.size === archivo.size &&
          foto.archivo.lastModified === archivo.lastModified
      );

      if (duplicada) {
        continue;
      }

      this.fotosSeleccionadas.push({
        archivo,
        nombre: archivo.name,
        url: URL.createObjectURL(archivo),
        esVideo
      });

      this.itd.fotos.push(archivo.name);
    }

    // Permite seleccionar nuevamente el mismo archivo.
    input.value = '';
  }

  eliminarFoto(index: number): void {
    const foto = this.fotosSeleccionadas[index];

    if (!foto) {
      return;
    }

    URL.revokeObjectURL(foto.url);
    this.fotosSeleccionadas.splice(index, 1);

    const indiceNombre = this.itd.fotos.indexOf(foto.nombre);

    if (indiceNombre !== -1) {
      this.itd.fotos.splice(indiceNombre, 1);
    }
  }

  private liberarVistasPrevias(): void {
    for (const foto of this.fotosSeleccionadas) {
      URL.revokeObjectURL(foto.url);
    }

    this.fotosSeleccionadas = [];
  }

  private async cargarItdParaEditar(id: string): Promise<void> {
    this.cargando = true;
    try {
      const registro = await firstValueFrom(this.firestoreService.getDoc<Itd>('itds', id));
      if (!registro) {
        alert('No se encontró el ITD solicitado.');
        await this.router.navigate(['/all-itd']);
        return;
      }
      const gestiones = await firstValueFrom(this.firestoreService.getCollection<HistorialItd>('gestiones_itd'));
      const ultimaGestion = gestiones.filter(gestion => gestion.itdId === id)
        .sort((a, b) => this.convertirFecha(b.fechaGestion).getTime() - this.convertirFecha(a.fechaGestion).getTime())[0];
      if (ultimaGestion?.estadoGestion === 'CERRADO') {
        alert('Este ITD está cerrado y no admite modificaciones.');
        await this.router.navigate(['/all-itd']);
        return;
      }
      this.itd = { ...registro, fechaCreacion: this.convertirFecha(registro.fechaCreacion), fechaRecepcion: registro.fechaRecepcion || registro.fechaDeclarada || this.obtenerFechaLocal(), productos: (registro.productos || []).map(producto => ({ ...producto })), fotos: [...(registro.fotos || [])] };
      this.fotosExistentes = await Promise.all((registro.fotos || []).map(async referencia => {
        try { return await this.firestorageService.getImageUrl(referencia, id); }
        catch (error) { console.warn('No se pudo resolver la fotografía del ITD:', referencia, error); return referencia; }
      }));
      this.modoEdicion = true;
    } catch (error) {
      console.error('Error al cargar ITD para edición:', error);
      alert('No fue posible cargar el ITD para editarlo.');
      await this.router.navigate(['/all-itd']);
    } finally {
      this.cargando = false;
    }
  }

  esVideo(referencia: string): boolean {
    const ruta = decodeURIComponent((referencia || '').split('?')[0]).toLowerCase();
    return /\.(mp4|webm|mov|m4v|ogg|3gp)$/.test(ruta);
  }

  marcarFotoNoDisponible(url: string): void {
    this.fotosConError.add(url);
  }

  quitarFotoExistente(url: string): void {
    this.fotosExistentes = this.fotosExistentes.filter(foto => foto !== url);
    this.itd.fotos = this.itd.fotos.filter(foto => foto !== url);
    this.fotosConError.delete(url);
  }

  private convertirFecha(fecha: any): Date {
    if (fecha && typeof fecha.toDate === 'function') return fecha.toDate();
    return fecha instanceof Date ? fecha : new Date(fecha || 0);
  }

  private async subirEvidencias(itdId: string): Promise<string[]> {
    const archivos = this.fotosSeleccionadas;
    if (!archivos.length) return [];

    const progresoPorArchivo = archivos.map(() => 0);
    const totalBytes = archivos.reduce((total, foto) => total + foto.archivo.size, 0) || 1;
    this.progresoCarga = 0;
    this.estadoOperacion = 'Subiendo evidencias...';

    const urls = await Promise.all(archivos.map(async (foto, index) => {
      const nombre = Date.now() + '_' + index + '_' + foto.nombre.replace(/[^a-zA-Z0-9._-]/g, '_');
      return this.firestorageService.uploadImage(
        foto.archivo,
        'itds/' + itdId + '/fotos',
        nombre,
        porcentaje => {
          progresoPorArchivo[index] = porcentaje;
          const bytesCompletados = archivos.reduce((total, archivo, i) =>
            total + archivo.archivo.size * progresoPorArchivo[i] / 100, 0);
          this.progresoCarga = Math.min(85, Math.round(bytesCompletados / totalBytes * 85));
        }
      );
    }));

    this.progresoCarga = 88;
    return urls;
  }

  private async guardarEdicion(): Promise<void> {
    const motivo = this.motivoEdicion.trim();
    if (!motivo) { alert('Debes indicar el motivo de la corrección.'); return; }
    const original = await firstValueFrom(this.firestoreService.getDoc<Itd>('itds', this.itd.id));
    if (!original) throw new Error('El ITD ya no existe.');
    const gestionesActuales = await firstValueFrom(this.firestoreService.getCollection<HistorialItd>('gestiones_itd'));
    const gestionActual = gestionesActuales.filter(gestion => gestion.itdId === original.id)
      .sort((a, b) => this.convertirFecha(b.fechaGestion).getTime() - this.convertirFecha(a.fechaGestion).getTime())[0];
    if (gestionActual?.estadoGestion === 'CERRADO') {
      alert('Este ITD fue cerrado y ya no admite modificaciones.');
      await this.router.navigate(['/all-itd']);
      return;
    }
    const fotosNuevas = await this.subirEvidencias(this.itd.id);
    const actualizado: Itd = {
      ...this.itd,
      id: original.id,
      folio: original.folio,
      fechaCreacion: this.convertirFecha(original.fechaCreacion),
      responsableCreacion: original.responsableCreacion,
      cargoCreacion: original.cargoCreacion,
      fotos: [...this.fotosExistentes, ...fotosNuevas],
      productos: this.itd.productos.map(producto => ({ ...producto }))
    };
    const campos = ['fechaRecepcion','sellerId','sellerNombre','sellerCodigo','documento','ocPedido','numeroSeguimiento','productos','detalleEstado','fotos'];
    const cambios: any = {};
    campos.forEach(campo => {
      const antes = (original as any)[campo];
      const despues = (actualizado as any)[campo];
      if (JSON.stringify(antes) !== JSON.stringify(despues)) cambios[campo] = { antes, despues };
    });
    this.estadoOperacion = 'Guardando información del ITD...';
    this.progresoCarga = 94;
    await this.firestoreService.updateDoc<Itd>(actualizado, 'itds', original.id);
    const fotosEliminadas = (original.fotos || []).filter(url => !this.fotosExistentes.includes(url));
    for (const url of fotosEliminadas) {
      try { await this.firestorageService.deleteImage(url); }
      catch (error) { console.warn('No se pudo eliminar el archivo de Storage:', url, error); }
    }
    const idHistorial = this.firestoreService.getId();
    await this.firestoreService.createDoc({
      id: idHistorial, itdId: original.id, folio: original.folio,
      fechaModificacion: new Date(), motivo, uidUsuario: this.uidActual,
      usuario: this.nombreUsuarioActual, cargo: this.cargoUsuarioActual, rol: this.rolUsuarioActual, cambios
    }, 'historial_ediciones_itd', this.firestoreService.getId());
    this.progresoCarga = 100;
    this.estadoOperacion = '¡Actualización completada!';
    alert('ITD ' + String(original.folio).padStart(2, '0') + ' actualizado correctamente.');
    this.liberarVistasPrevias();
    await this.router.navigate(['/all-itd']);
  }

  async guardarITD(): Promise<void> {
    if (!this.validarFormulario()) {
      return;
    }
    if (this.modoEdicion) {
      if (this.cargando) return;
      this.cargando = true;
      this.progresoCarga = 3;
      this.estadoOperacion = 'Preparando actualización...';
      try { await this.guardarEdicion(); }
      catch (error) { console.error('Error al actualizar ITD:', error); alert('No fue posible actualizar el ITD.'); }
      finally { this.cargando = false; this.estadoOperacion = ''; this.progresoCarga = 0; }
      return;
    }

    if (this.cargando) {
      return;
    }

    this.cargando = true;
    this.progresoCarga = 3;
    this.estadoOperacion = 'Preparando registro...';

    try {
      await this.cargarSiguienteFolio();

      const id = this.firestoreService.getId();

      const fotosUrls: string[] = await this.subirEvidencias(id);

      const registro: Itd = {
        ...this.itd,
        id,
        folio: this.itd.folio,
        fechaCreacion: new Date(),
        productos: this.itd.productos.map(producto => ({ ...producto })),
        fotos: fotosUrls
      };

      this.estadoOperacion = 'Guardando información del ITD...';
      this.progresoCarga = 95;
      await this.firestoreService.createDoc(registro, 'itds', id);
      this.progresoCarga = 100;
      this.estadoOperacion = '¡ITD creado correctamente!';

      alert(
        `ITD ${String(registro.folio).padStart(2, '0')} registrado correctamente.`
      );

      await this.prepararNuevoItd();
    } catch (error) {
      console.error('Error al guardar ITD:', error);
      alert('No fue posible guardar el ITD o subir sus fotografías. Revise la conexión e inténtelo nuevamente.');
    } finally {
      this.cargando = false;
      this.estadoOperacion = '';
      this.progresoCarga = 0;
    }
  }

  validarFormulario(): boolean {
    if (!this.itd.fechaRecepcion) {
      alert('Debe ingresar la fecha de recepción.');
      return false;
    }

    if (!this.itd.documento?.toString().trim()) {
      alert('Debe ingresar el número de documento.');
      return false;
    }

    if (!this.itd.sellerId) {
      alert('Debe seleccionar un Seller.');
      return false;
    }

    if (!this.itd.ocPedido?.trim()) {
      alert('Debe ingresar la OC o Pedido.');
      return false;
    }

    if (!this.modoEdicion && !this.itd.responsableCreacion) {
      alert('No fue posible identificar al usuario responsable del ITD.');
      return false;
    }

    for (let i = 0; i < this.itd.productos.length; i++) {
      const producto = this.itd.productos[i];

      if (!producto.sku.trim()) {
        alert(`Debe ingresar el SKU del producto ${i + 1}.`);
        return false;
      }

      if (!producto.descripcion.trim()) {
        alert(`Debe ingresar la descripción del producto ${i + 1}.`);
        return false;
      }

      if (!producto.cantidad || producto.cantidad <= 0) {
        alert(`La cantidad del producto ${i + 1} debe ser mayor que cero.`);
        return false;
      }
    }

    return true;
  }

  async cancelar(): Promise<void> {
    if (this.modoEdicion) { await this.router.navigate(['/all-itd']); return; }
    await this.prepararNuevoItd();
  }

  private async prepararNuevoItd(): Promise<void> {
    this.liberarVistasPrevias();
    this.itd = this.crearItdVacio();

    await this.cargarResponsable();
    await this.cargarSiguienteFolio();
  }
}
