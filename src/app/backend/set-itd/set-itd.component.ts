import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Itd, ItdProducto } from 'src/app/models/itd.model';
import { Seller } from 'src/app/models/seller.model';
import { Usuario } from 'src/app/models/usuario.model';

import { SellerService } from 'src/app/services/seller.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';

@Component({
  selector: 'app-set-itd',
  templateUrl: './set-itd.component.html',
  styleUrls: ['./set-itd.component.scss'],
})
export class SetItdComponent implements OnInit {

  sellers: Seller[] = [];

  searchTerm = '';

  itd: Itd = this.crearItdVacio();

  cargando = false;

  constructor(
    private readonly router: Router,
    private readonly sellerService: SellerService,
    private readonly firestoreService: FirestoreService,
    private readonly firebaseauthService: FirebaseauthService
  ) {}

  async ngOnInit(): Promise<void> {

    this.cargarSellers();

    await this.cargarResponsable();

    await this.cargarSiguienteFolio();
  }

  /**
   * Carga desde Firestore solamente
   * los Sellers que están ACTIVO.
   */
  private cargarSellers(): void {

    this.sellerService
      .getAll()
      .subscribe({
        next: (sellers: Seller[]) => {

          this.sellers = sellers
            .filter(
              seller => seller.estado === 'ACTIVO'
            )
            .sort(
              (a, b) =>
                a.nombre.localeCompare(b.nombre)
            );

        },

        error: error => {

          console.error(
            'Error al cargar Sellers:',
            error
          );

          this.sellers = [];

          alert(
            'No fue posible cargar los Sellers.'
          );
        }
      });
  }

  /**
   * Obtiene el usuario actualmente autenticado
   * y utiliza sus datos para completar
   * responsable y cargo del ITD.
   */
  private async cargarResponsable(): Promise<void> {

    try {

      const uid =
        await this.firebaseauthService.getUid();

      if (!uid) {

        this.itd.responsableCreacion = '';
        this.itd.cargoCreacion = '';

        console.warn(
          'No existe un usuario autenticado.'
        );

        return;
      }

      const usuario =
        await firstValueFrom(
          this.firestoreService.getDoc<Usuario>(
            'usuarios',
            uid
          )
        );

      if (!usuario) {

        this.itd.responsableCreacion = '';
        this.itd.cargoCreacion = '';

        console.warn(
          'No se encontró el perfil del usuario:',
          uid
        );

        return;
      }

      this.itd.responsableCreacion =
        usuario.nombre || '';

      this.itd.cargoCreacion =
        usuario.cargo || 'Sin cargo asignado';

    } catch (error) {

      console.error(
        'Error al cargar responsable:',
        error
      );

      this.itd.responsableCreacion = '';
      this.itd.cargoCreacion = '';
    }
  }

  /**
   * Busca todos los ITD existentes,
   * obtiene el folio más alto
   * y asigna el siguiente.
   *
   * Si no existen ITD:
   * folio = 1.
   */
  private async cargarSiguienteFolio(): Promise<void> {

    try {

      const itds =
        await firstValueFrom(
          this.firestoreService.getCollection<Itd>(
            'itds'
          )
        );

      const folios =
        itds
          .map(itd => Number(itd.folio))
          .filter(
            folio =>
              Number.isFinite(folio) &&
              folio > 0
          );

      if (folios.length === 0) {

        this.itd.folio = 1;

        return;
      }

      this.itd.folio =
        Math.max(...folios) + 1;

    } catch (error) {

      console.error(
        'Error al obtener el siguiente folio:',
        error
      );

      this.itd.folio = 1;

      alert(
        'No fue posible consultar los ITD existentes. Se utilizará temporalmente el folio 01.'
      );
    }
  }

  /**
   * Formatea el folio para mostrarlo
   * con mínimo dos dígitos.
   *
   * Ejemplo:
   * 1   -> 01
   * 9   -> 09
   * 10  -> 10
   * 114 -> 114
   */
  get folioFormateado(): string {

    return String(
      this.itd.folio || 0
    ).padStart(2, '0');
  }

  /**
   * Obtiene la fecha actual en formato
   * YYYY-MM-DD utilizando la fecha local.
   */
  private obtenerFechaLocal(): string {

    const hoy = new Date();

    const year =
      hoy.getFullYear();

    const month =
      String(
        hoy.getMonth() + 1
      ).padStart(2, '0');

    const day =
      String(
        hoy.getDate()
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  crearItdVacio(): Itd {

    return {

      id: '',

      folio: 0,

      fechaCreacion: new Date(),

      fechaDeclarada:
        this.obtenerFechaLocal(),

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

      productos: [
        this.crearProductoVacio()
      ]

    };
  }

  goPerfil(): void {

    this.router.navigate([
      'perfil'
    ]);
  }

  crearProductoVacio(): ItdProducto {

    return {

      sku: '',

      descripcion: '',

      cantidad: 1,

      estadoProducto: 'BUEN_ESTADO'

    };
  }

  /**
   * Se ejecuta cuando se selecciona
   * un Seller desde el select HTML.
   */
  seleccionarSellerHtml(): void {

    const seller =
      this.sellers.find(
        s => s.id === this.itd.sellerId
      );

    if (!seller) {

      this.itd.sellerNombre = '';
      this.itd.sellerCodigo = null;

      return;
    }

    this.itd.sellerNombre =
      seller.nombre;

    this.itd.sellerCodigo =
      seller.codigo;
  }

  agregarProducto(): void {

    this.itd.productos.push(
      this.crearProductoVacio()
    );
  }

  eliminarProducto(index: number): void {

    if (this.itd.productos.length === 1) {

      alert(
        'Debe existir al menos un producto.'
      );

      return;
    }

    this.itd.productos.splice(
      index,
      1
    );
  }

  /**
   * Por ahora solamente conserva
   * los nombres de los archivos seleccionados
   * para mostrarlos en pantalla.
   *
   * La subida real a Firebase Storage
   * se implementará cuando incorporemos
   * FirestorageService.
   */
  agregarFoto(event: Event): void {

    const input =
      event.target as HTMLInputElement;

    const archivos =
      input.files;

    if (!archivos) {
      return;
    }

    for (
      let i = 0;
      i < archivos.length;
      i++
    ) {

      this.itd.fotos.push(
        archivos[i].name
      );
    }
  }

  /**
   * Guarda el ITD en Firestore.
   */
  async guardarITD(): Promise<void> {

    if (!this.validarFormulario()) {
      return;
    }

    if (this.cargando) {
      return;
    }

    this.cargando = true;

    try {

      /*
       * Se vuelve a consultar el último folio
       * justo antes de guardar.
       */
      await this.cargarSiguienteFolio();

      const id =
        this.firestoreService.getId();

      const registro: Itd = {

        ...this.itd,

        id,

        folio: this.itd.folio,

        fechaCreacion: new Date(),

        productos:
          this.itd.productos.map(
            producto => ({
              ...producto
            })
          ),

        fotos:
          [...this.itd.fotos]
      };

      await this.firestoreService.createDoc(
        registro,
        'itds',
        id
      );

      alert(
        `ITD ${String(registro.folio).padStart(2, '0')} registrado correctamente.`
      );

      await this.prepararNuevoItd();

    } catch (error) {

      console.error(
        'Error al guardar ITD:',
        error
      );

      alert(
        'No fue posible guardar el ITD. Revise la consola para más información.'
      );

    } finally {

      this.cargando = false;
    }
  }

  validarFormulario(): boolean {

    if (!this.itd.fechaDeclarada) {

      alert(
        'Debe ingresar la fecha.'
      );

      return false;
    }

    if (
      !this.itd.documento
        ?.toString()
        .trim()
    ) {

      alert(
        'Debe ingresar el número de documento.'
      );

      return false;
    }

    if (!this.itd.sellerId) {

      alert(
        'Debe seleccionar un Seller.'
      );

      return false;
    }

    if (!this.itd.ocPedido?.trim()) {

      alert(
        'Debe ingresar la OC o Pedido.'
      );

      return false;
    }

    if (!this.itd.responsableCreacion) {

      alert(
        'No fue posible identificar al usuario responsable del ITD.'
      );

      return false;
    }

    for (
      let i = 0;
      i < this.itd.productos.length;
      i++
    ) {

      const producto =
        this.itd.productos[i];

      if (!producto.sku.trim()) {

        alert(
          `Debe ingresar el SKU del producto ${i + 1}.`
        );

        return false;
      }

      if (
        !producto.descripcion.trim()
      ) {

        alert(
          `Debe ingresar la descripción del producto ${i + 1}.`
        );

        return false;
      }

      if (
        !producto.cantidad ||
        producto.cantidad <= 0
      ) {

        alert(
          `La cantidad del producto ${i + 1} debe ser mayor que cero.`
        );

        return false;
      }
    }

    return true;
  }

  /**
   * Limpia el formulario sin consumir
   * un folio nuevo en Firestore.
   *
   * Después vuelve a consultar el último
   * folio registrado para determinar
   * cuál corresponde al siguiente ITD.
   */
  async cancelar(): Promise<void> {

    await this.prepararNuevoItd();
  }

  /**
   * Prepara un nuevo formulario.
   */
  private async prepararNuevoItd(): Promise<void> {

    this.itd =
      this.crearItdVacio();

    await this.cargarResponsable();

    await this.cargarSiguienteFolio();
  }

}