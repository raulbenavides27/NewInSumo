import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import {
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { Usuario } from 'src/app/models/usuario.model';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { FirestorageService } from 'src/app/services/firestorage.service';
import { Subscription } from 'rxjs';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {

  usuario: Usuario = this.crearUsuarioVacio();

  /**
   * Credenciales utilizadas solamente por Firebase Authentication.
   * No se guardan en Firestore.
   */
  password = '';
  confirmacion = '';

  newfile: any;
  uid = '';
  subcriberUserInfo: Subscription | undefined;
  loading: any;
  ingresarEnable = false;
  route: any;

  constructor(
    public menucontroler: MenuController,
    public fb: FormBuilder,
    public firebaseauthService: FirebaseauthService,
    public alertController: AlertController,
    public loadingController: LoadingController,
    public firestoreService: FirestoreService,
    private navCrtl: NavController,
    public firestorageService: FirestorageService,
    private router: Router,
  ) {
    this.firebaseauthService.stateAuth().subscribe((res) => {

      console.log(res);

      if (res !== null) {
        this.uid = res.uid;
        this.getUserInfo(this.uid);
      } else {
        this.initUsuario();
      }

    });
  }

  async ngOnInit() {
    const uid = await this.firebaseauthService.getUid();
    console.log(uid);
  }

  private crearUsuarioVacio(): Usuario {
    return {
      uid: '',
      email: '',
      nombre: '',
      foto: '',
      rol: 'OPERADOR',
      cargo: '',
      estado: 'ACTIVO',
      fechaCreacion: new Date(),
    };
  }

  initUsuario(): void {

    this.uid = '';

    this.usuario = this.crearUsuarioVacio();

    this.password = '';
    this.confirmacion = '';

    this.newfile = undefined;

    this.nombreControl.reset();
    this.emailControl.reset();
    this.passwordControl.reset();
    this.CpasswordControl.reset();
  }

  async newImageUpload(event: any) {

    if (event.target.files && event.target.files[0]) {

      this.newfile = event.target.files[0];

      const reader = new FileReader();

      reader.onload = (image: any) => {
        this.usuario.foto = image.target.result as string;
      };

      reader.readAsDataURL(event.target.files[0]);
    }
  }

  async registrarse(): Promise<void> {

    if (
      this.emailControl.invalid ||
      this.nombreControl.invalid ||
      this.passwordControl.invalid ||
      this.CpasswordControl.invalid
    ) {
      return;
    }

    if (this.password !== this.confirmacion) {

      await this.showMessage(
        'Error',
        'Las contraseñas no coinciden.'
      );

      return;
    }

    try {

      const credenciales = {
        email: this.usuario.email,
        password: this.password,
      };

      await this.firebaseauthService.registrar(
        credenciales.email,
        credenciales.password
      );

      const uid = await this.firebaseauthService.getUid();

      if (!uid) {
        throw new Error(
          'No fue posible obtener el UID del usuario.'
        );
      }

      this.usuario.uid = uid;

      await this.guardarUser();

    } catch (error: any) {

      console.error('Error al registrar usuario:', error);

      await this.showMessage(
        'Error',
        error?.message ?? 'No fue posible registrar el usuario.'
      );
    }
  }

  async guardarUser(): Promise<void> {

    this.loading = await this.loadingController.create({
      message: 'Guardando usuario...',
      spinner: 'dots',
      translucent: true,
    });

    await this.loading.present();

    try {

      const path = 'usuarios';

      const name = this.usuario.nombre || this.usuario.uid;

      if (this.newfile !== undefined) {

        const res = await this.firestorageService.uploadImage(
          this.newfile,
          path,
          name,
        );

        this.usuario.foto = res;
      }

      await this.firestoreService.createDoc(
        this.usuario,
        path,
        this.usuario.uid
      );

      console.log('Usuario guardado con éxito');

      await this.loading.dismiss();

      await this.presentConfirmationAlert();

      this.router.navigate(['home']);

    } catch (error) {

      console.error(
        'Error al guardar el usuario',
        error
      );

      await this.loading.dismiss();

      await this.showMessage(
        'Error',
        'No fue posible guardar el usuario.'
      );
    }
  }

  async presentConfirmationAlert(): Promise<void> {

    const alert = await this.alertController.create({
      header: 'Usuario guardado',
      message: 'El usuario ha sido guardado correctamente.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  async salir(): Promise<void> {

    await this.firebaseauthService.logout();

    this.subcriberUserInfo?.unsubscribe();

    this.initUsuario();
  }

  getUserInfo(uid: string): void {

    const path = 'usuarios';

    this.subcriberUserInfo = this.firestoreService
      .getDoc<Usuario>(path, uid)
      .subscribe((res) => {

        if (res) {
          this.usuario = res;
        }

      });
  }

  ingresar(): void {

    if (
      this.emailControl.invalid ||
      this.passwordControl.invalid
    ) {
      return;
    }

    const credenciales = {
      email: this.usuario.email,
      password: this.password,
    };

    this.firebaseauthService
      .login(
        credenciales.email,
        credenciales.password
      )
      .then(() => {

        console.log('Ingresado');

        this.router.navigate(['home']);

      })
      .catch(async (error) => {

        console.error(
          'Error al iniciar sesión:',
          error
        );

        await this.showMessage(
          'Error',
          'Correo o contraseña incorrectos.'
        );
      });
  }

  goToBack(): void {
    this.navCrtl.back();
  }

  nombreControl = new FormControl('', [
    Validators.required,
    Validators.pattern('[a-zA-ZáéíóúÁÉÍÓÚñÑ ]*'),
  ]);

  emailControl = new FormControl('', [
    Validators.required,
    Validators.email,
  ]);

  passwordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.pattern(
      /^(?=.*[!@#$%^&*.])[a-zA-Z0-9!@#$%^&*.]+$/
    ),
  ]);

  CpasswordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.pattern(
      /^(?=.*[!@#$%^&*.])[a-zA-Z0-9!@#$%^&*.]+$/
    ),
  ]);

  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  showConfirmPassword = false;

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword =
      !this.showConfirmPassword;
  }

  private async showMessage(
    header: string,
    message: string
  ): Promise<void> {

    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}