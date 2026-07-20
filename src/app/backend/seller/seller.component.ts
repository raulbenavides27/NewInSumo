import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Router } from '@angular/router';

import { Seller } from 'src/app/models/models';
import { SellerService } from 'src/app/services/seller.service';

@Component({
  selector: 'app-seller',
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.scss'],
})
export class SellerComponent implements OnInit {

  // ===========================
  // Propiedades
  // ===========================

  enableLista = true;
  enableNuevo = false;
  editando = false;

  searchTerm = '';

  sellers: Seller[] = [];

  newSeller: Seller = this.getSellerVacio();

  // ===========================
  // Constructor
  // ===========================

  constructor(
    private readonly sellerService: SellerService,
    private readonly alertController: AlertController,
    private readonly router: Router
  ) {}

  // ===========================
  // Lifecycle
  // ===========================

  ngOnInit(): void {

    this.cargarSellers();

  }

  // ===========================
  // Navegación
  // ===========================

  goPerfil(): void {

    this.router.navigate(['perfil']);

  }

  // ===========================
  // Métodos públicos
  // ===========================

  nuevoSeller(): void {

    this.editando = false;

    this.newSeller = this.getSellerVacio();

    this.enableLista = false;
    this.enableNuevo = true;

  }

  cancelar(): void {

    this.enableLista = true;
    this.enableNuevo = false;

    this.editando = false;

    this.newSeller = this.getSellerVacio();

  }

  editarSeller(seller: Seller): void {

    this.editando = true;

    this.newSeller = {
      ...seller
    };

    this.enableLista = false;
    this.enableNuevo = true;

  }

  async guardarSeller(): Promise<void> {

    try {

      if (this.editando) {

        await this.sellerService.update(
          this.newSeller
        );

      } else {

        await this.sellerService.create(
          this.newSeller
        );

      }

      this.cancelar();

      await this.showMessage(
        'Correcto',
        'Seller guardado correctamente.'
      );

    } catch (error: any) {

      console.error(error);

      await this.showMessage(
        'Error',
        error?.message ??
        'No fue posible guardar el Seller.'
      );

    }

  }

  async cambiarEstado(
    seller: Seller,
    nuevoEstado: 'ACTIVO' | 'INACTIVO'
  ): Promise<void> {

    const alert = await this.alertController.create({

      header: 'Confirmar',

      message: '¿Desea cambiar el estado del Seller?',

      buttons: [

        {
          text: 'Cancelar',
          role: 'cancel'
        },

        {
          text: 'Aceptar',

          handler: async () => {

            try {

              await this.sellerService.changeStatus(
                seller,
                nuevoEstado
              );

            } catch (error) {

              console.error(error);

              await this.showMessage(
                'Error',
                'No fue posible cambiar el estado.'
              );

            }

          }

        }

      ]

    });

    await alert.present();

  }

  // ===========================
  // Métodos privados
  // ===========================

  private cargarSellers(): void {

    this.sellerService
      .getAll()
      .subscribe({

        next: sellers => {

          this.sellers = sellers;

        },

        error: async () => {

          await this.showMessage(
            'Error',
            'No fue posible cargar los Sellers.'
          );

        }

      });

  }

  private getSellerVacio(): Seller {

    return {

      id: '',

      nombre: '',

      codigo: null,

      observacion: '',

      estado: 'ACTIVO',

      fechaCreacion: new Date()

    };

  }

  private async showMessage(
    header: string,
    message: string
  ): Promise<void> {

    const alert = await this.alertController.create({

      header,

      message,

      buttons: ['Aceptar']

    });

    await alert.present();

  }

}