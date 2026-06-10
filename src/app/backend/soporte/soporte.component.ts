import {
  Component,
  OnInit,
  Directive,
  importProvidersFrom,
} from '@angular/core';
import {
  AlertController,
  LoadingController,
  MenuController,
  ToastController,
} from '@ionic/angular';
import { FirestorageService } from 'src/app/services/firestorage.service';
import { Soporte } from 'src/app/models';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { FirestoreService } from 'src/app/services/firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-soporte',
  templateUrl: './soporte.component.html',
  styleUrls: ['./soporte.component.scss'],
})
export class SoporteComponent {
  nombre: string = '';
  correo: string = '';
  descripcion: string = '';
  enviandoSolicitud: boolean = false;

  constructor(
    private toastController: ToastController,
    public router: Router,
  ) {}

  async enviarSolicitud() {
    this.enviandoSolicitud = true;

    // Simulación de envío de solicitud
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Aquí puedes agregar la lógica para enviar la solicitud de ayuda

    // Ejemplo: Mostrar un mensaje de éxito
    const toast = await this.toastController.create({
      message: 'Solicitud enviada correctamente',
      duration: 2000,
      position: 'middle',
    });
    toast.present();

    // Limpiar los campos del formulario después de enviar la solicitud
    this.nombre = '';
    this.correo = '';
    this.descripcion = '';
    this.enviandoSolicitud = false;
  }
  goPerfil() {
    this.router.navigate(['perfil']);
  }
}
