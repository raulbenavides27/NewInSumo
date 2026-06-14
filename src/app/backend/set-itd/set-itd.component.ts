import { Component, OnInit } from '@angular/core';
import { Itd, Seller } from 'src/app/models';

@Component({
  selector: 'app-set-itd',
  templateUrl: './set-itd.component.html',
  styleUrls: ['./set-itd.component.scss'],
})
export class SetItdComponent implements OnInit {

  sellers: Seller[] = [];

  itd: Itd = this.crearItdVacio();

  constructor() {}

  ngOnInit(): void {

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

      fechaDeclarada: new Date().toISOString().substring(0, 10) as any,

      sellerId: '',

      sellerNombre: '',

      sellerCodigo: null,

      ocPedido: '',

      documento: '',

      numeroSeguimiento: '',

      sku: '',

      descripcion: '',

      cantidad: 1,

      detalleEstado: '',

      estadoProducto: 'BUEN_ESTADO',

      responsableCreacion: '',

      cargoCreacion: '',

      fotos: [],
    };
  }

  seleccionarSeller(event: any) {

    const seller = this.sellers.find(
      (s) => s.id === event.detail.value
    );

    if (!seller) {
      return;
    }

    this.itd.sellerId = seller.id;
    this.itd.sellerNombre = seller.nombre;
    this.itd.sellerCodigo = seller.codigo;
  }

  agregarFoto(event: any) {

    const archivos = event.target.files;

    if (!archivos) {
      return;
    }

    for (let i = 0; i < archivos.length; i++) {

      this.itd.fotos.push(
        archivos[i].name
      );

    }
  }

  guardarITD() {

    console.log('ITD');
    console.log(this.itd);

    alert('ITD registrado correctamente');

    this.cancelar();
  }

  cancelar() {

    this.itd = this.crearItdVacio();

  }
}