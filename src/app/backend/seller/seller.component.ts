import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Seller } from 'src/app/models';

@Component({
  selector: 'app-seller',
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.scss'],
})
export class SellerComponent implements OnInit {

  enableLista: boolean = true;
  enableNuevo: boolean = false;
  editando: boolean = false;

  sellers: Seller[] = [];

  newSeller: Seller = {
    id: '',
    nombre: '',
    codigo: null,
    observacion: '',
    estado: 'ACTIVO',
    fechaCreacion: new Date()
  };

  constructor(
    private alertController: AlertController
  ) {}

  ngOnInit(): void {

    // DATOS DE PRUEBA

    this.sellers = [
      {
        id: 'SEL0000',
        nombre: 'PARTICULAR',
        codigo: null,
        observacion: 'INGRESO MANUAL',
        estado: 'ACTIVO',
        fechaCreacion: new Date()
      },
      {
        id: 'SEL0001',
        nombre: 'RIPLEY MKP',
        codigo: 4030,
        observacion: 'SOLO FACTURAS',
        estado: 'ACTIVO',
        fechaCreacion: new Date()
      },
      {
        id: 'SEL0002',
        nombre: 'WALMART MKP',
        codigo: 4014,
        observacion: 'SOLO FACTURAS',
        estado: 'ACTIVO',
        fechaCreacion: new Date()
      }
    ];

  }

  getSellerVacio(): Seller {

    return {
      id: '',
      nombre: '',
      codigo: null,
      observacion: '',
      estado: 'ACTIVO',
      fechaCreacion: new Date()
    };

  }

  nuevoSeller(): void {

    this.editando = false;

    this.newSeller = this.getSellerVacio();

    this.enableLista = false;
    this.enableNuevo = true;

  }

  cancelar(): void {

    this.enableLista = true;
    this.enableNuevo = false;

    this.newSeller = this.getSellerVacio();

  }

  generarId(): string {

    const numero = this.sellers.length + 1;

    return 'SEL' + ('0000' + numero).slice(-4);

  }

  guardarSeller(): void {

    if (this.newSeller.nombre.trim() === '') {
      alert('Debe ingresar un nombre');
      return;
    }

    if (
      this.newSeller.nombre.toUpperCase() === 'PARTICULAR'
    ) {
      this.newSeller.codigo = null;
    }

    if (!this.editando) {

      this.newSeller.id = this.generarId();

      this.newSeller.fechaCreacion = new Date();

      this.sellers.push({
        ...this.newSeller
      });

    } else {

      const index = this.sellers.findIndex(
        seller => seller.id === this.newSeller.id
      );

      if (index >= 0) {

        const fechaOriginal =
          this.sellers[index].fechaCreacion;

        this.sellers[index] = {
          ...this.newSeller,
          fechaCreacion: fechaOriginal
        };

      }

    }

    this.cancelar();

  }

  editarSeller(seller: Seller): void {

    this.editando = true;

    this.newSeller = {
      ...seller
    };

    this.enableLista = false;
    this.enableNuevo = true;

  }

  async cambiarEstado(
    seller: Seller,
    nuevoEstado: 'ACTIVO' | 'INACTIVO'
  ): Promise<void> {

    const estadoAnterior = seller.estado;

    const alert = await this.alertController.create({

      header: 'Confirmar',

      message:
        '¿Desea cambiar el estado del Seller?',

      buttons: [

        {
          text: 'Cancelar',
          role: 'cancel',

          handler: () => {

            seller.estado = estadoAnterior;

          }

        },

        {
          text: 'Aceptar',

          handler: () => {

            seller.estado = nuevoEstado;

          }

        }

      ]

    });

    await alert.present();

  }

}