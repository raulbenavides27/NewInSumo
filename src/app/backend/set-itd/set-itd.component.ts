import { Component, OnInit } from '@angular/core';
import {
  Itd,
  ItdProducto,
  Seller
} from 'src/app/models';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Cliente, Cuentas, Entidad, Gastos, Propiedad } from 'src/app/models';
import { FirestorageService } from 'src/app/services/firestorage.service';
import { Router } from '@angular/router';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';


@Component({
  selector: 'app-set-itd',
  templateUrl: './set-itd.component.html',
  styleUrls: ['./set-itd.component.scss'],
})
export class SetItdComponent implements OnInit {

  sellers: Seller[] = [];
  searchTerm: string = '';
  itd: Itd = this.crearItdVacio();

  constructor(
    private router: Router,
  ) {}

  ngOnInit(): void {

    // Simulación último folio
    // Posteriormente vendrá desde Firebase

    this.itd.folio = 114;

    // Simulación usuario autenticado
    // Posteriormente vendrá desde Firebase Auth

    this.itd.responsableCreacion =
      'Raúl Benavides';

    this.itd.cargoCreacion =
      'Ingeniero Informático';

    // Sellers de prueba

    this.sellers = [

      {
        id: 'SEL0001',
        nombre: 'PARTICULAR',
        codigo: null,
        observacion: '',
        estado: 'ACTIVO',
        fechaCreacion: new Date(),
      },

      {
        id: 'SEL0002',
        nombre: 'RIPLEY MKP',
        codigo: 4030,
        observacion: '',
        estado: 'ACTIVO',
        fechaCreacion: new Date(),
      },

      {
        id: 'SEL0003',
        nombre: 'WALMART MKP',
        codigo: 4014,
        observacion: '',
        estado: 'ACTIVO',
        fechaCreacion: new Date(),
      },

    ];

  }

  crearItdVacio(): Itd {

    return {

      id: '',

      folio: 0,

      fechaCreacion: new Date(),

      fechaDeclarada:
        new Date()
          .toISOString()
          .substring(0, 10) as any,

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

 go() {
    this.router.navigate(['cuentas']);
  }
  goPerfil() {
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

  seleccionarSellerHtml() {

  const seller = this.sellers.find(
    s => s.id === this.itd.sellerId
  );

  if (!seller) {
    return;
  }

  this.itd.sellerNombre = seller.nombre;

  this.itd.sellerCodigo = seller.codigo;

}

  agregarProducto() {

    this.itd.productos.push(
      this.crearProductoVacio()
    );

  }

  eliminarProducto(index: number) {

    if (
      this.itd.productos.length === 1
    ) {

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

  agregarFoto(event: any) {

    const archivos =
      event.target.files;

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

guardarITD() {

  if (!this.validarFormulario()) {
    return;
  }

  console.log(this.itd);

  alert('ITD registrado correctamente');

  this.cancelar();

}
  validarFormulario(): boolean {

  if (!this.itd.fechaDeclarada) {
    alert('Debe ingresar la fecha.');
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

  cancelar() {

    const siguienteFolio =
      this.itd.folio + 1;

    const responsable =
      this.itd.responsableCreacion;

    const cargo =
      this.itd.cargoCreacion;

    this.itd =
      this.crearItdVacio();

    this.itd.folio =
      siguienteFolio;

    this.itd.responsableCreacion =
      responsable;

    this.itd.cargoCreacion =
      cargo;

  }

}