import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { Cliente } from 'src/app/models';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { FirestorageService } from 'src/app/services/firestorage.service';
import { Subscriber, Subscription } from 'rxjs';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss'],
})
export class PerfilComponent implements OnInit {
  cliente: Cliente = {
    uid: '',
    email: '',
    nombre: '',
    password: '',
    foto: '',
    confirmacion: '',
    ubicacion: null,
  };
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
        this.initCliente();
      }
    });
  }

  async ngOnInit() {
    const uid = await this.firebaseauthService.getUid();
    console.log(uid);
  }
  initCliente() {
    this.uid = '';
    this.cliente = {
      uid: '',
      email: '',
      nombre: '',
      password: '',
      foto: '',
      confirmacion: '',
      ubicacion: null,
    };
  }
  async newImageUpload(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.newfile = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (image: any) => {
        this.cliente.foto = image.target.result as string;
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  }
  async registrarse() {
    const credenciales = {
      email: this.cliente.email,
      password: this.cliente.password,
    };
    const res = await this.firebaseauthService
      .registrar(credenciales.email, credenciales.password)
      .catch((err) => {
        console.log('error ->', err);
      });
    const uid = await this.firebaseauthService.getUid();
    this.cliente.uid = uid;
    this.guardarUser();
    console.log(uid);
  }

  async guardarUser() {
    this.loading = await this.loadingController.create({
      message: 'Guardando usuario...',
      spinner: 'dots',
      translucent: true,
    });
    await this.loading.present();

    const path = 'Clientes';
    const name = this.cliente.nombre;

    if (this.newfile !== undefined) {
      const res = await this.firestorageService.uploadImage(
        this.newfile,
        path,
        name,
      );
      this.cliente.foto = res;
    }

    this.firestoreService
      .creatDoc(this.cliente, path, this.cliente.uid)
      .then(async () => {
        console.log('Usuario guardado con éxito');
        await this.loading.dismiss();
        this.presentConfirmationAlert();
        this.router.navigate(['home']);
      })
      .catch(async (error) => {
        console.error('Error al guardar el usuario', error);
        await this.loading.dismiss();
      });
  }

  async presentConfirmationAlert() {
    const alert = await this.alertController.create({
      header: 'Usuario guardado',
      message: 'El usuario ha sido guardado correctamente.',
      buttons: ['OK'],
    });

    await alert.present();
  }

  // ...
  async salir() {
    this.firebaseauthService.logout();
    this.subcriberUserInfo?.unsubscribe();
  }

  getUserInfo(uid: string) {
    const path = 'Clientes';
    this.subcriberUserInfo = this.firestoreService
      .getDoc(path, uid)
      .subscribe((res) => {
        this.cliente = res as Cliente;
      });
  }
  ingresar() {
    const credenciales = {
      email: this.cliente.email,
      password: this.cliente.password,
    };
    this.firebaseauthService
      .login(credenciales.email, credenciales.password)
      .then((res) => {
        console.log('ingresado');
        this.router.navigate(['home']);
      });
  }

  goToBack() {
    this.navCrtl.back();
  }

  nombreControl = new FormControl('', [
    Validators.required,
    Validators.pattern('[a-zA-Z ]*'),
  ]);
  emailControl = new FormControl('', [Validators.required, Validators.email]);
  passwordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.pattern(/^(?=.*[!@#$%^&*.])[a-zA-Z0-9!@#$%^&*.]+$/),
  ]);
  CpasswordControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.pattern(/^(?=.*[!@#$%^&*.])[a-zA-Z0-9!@#$%^&*.]+$/),
  ]);

  showPassword: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  showConfirmPassword: boolean = false;

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
