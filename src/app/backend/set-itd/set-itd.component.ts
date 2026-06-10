import { Component } from '@angular/core';

@Component({
  selector: 'app-set-itd',
  templateUrl: './set-itd.component.html',
  styleUrls: ['./set-itd.component.scss'],
})
export class SetItdComponent {
  itd: any = {
    fecha: '',
    folio: '',
    seller: '',
    documento: '',
    ocPedido: '',
    seguimiento: '',
    detalleEstado: '',
    conclusion: '',
  };

  productos: any[] = [];

  constructor() {}

  agregarProducto() {
    this.productos.push({
      sku: '',
      descripcion: '',
      cantidad: 1,
      observacion: '',
    });
  }

  eliminarProducto(index: number) {
    this.productos.splice(index, 1);
  }

  guardarITD() {
    console.log(this.itd);
    console.log(this.productos);

    // luego conectaremos firestore
  }
}
