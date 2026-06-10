import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AlertController,
  LoadingController,
  MenuController,
  ToastController,
} from '@ionic/angular';
import { Entidad, Propiedad } from 'src/app/models';
import { FirestorageService } from 'src/app/services/firestorage.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.component.html',
  styleUrls: ['./contacto.component.scss'],
})
export class ContactoComponent implements OnInit {
  tiporazon!: string;
  newContacto!: Entidad;
  private path = 'Entidad/';
  loading: any;
  P!: Propiedad;
  siEmpresa = false;
  constructor(
    public menucontroler: MenuController,
    public FirestoService: FirestoreService,
    public loadingController: LoadingController,
    public toastController: ToastController,
    public alertController: AlertController,
    public activatedRoute: ActivatedRoute,
    public firestorageService: FirestorageService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.tiporazon;
    const propiedad = this.FirestoService.getProp();
    console.log('la propiedad es la:', propiedad);
    if (propiedad !== undefined) {
      this.P = propiedad;
    } else {
      this.router.navigate(['set-propiedad']);
    }
    this.newContacto = {
      id_entidad: this.FirestoService.getId(),
      id_propiedad: propiedad.id,
      /// id_responsable: '',// para cuando exista historial
      nombre: '',
      apellidop: '',
      apellidom: '',
      rut: '',
      tipoContacto: '', // Arrendataio/Propietario
      tipoEntidad: '', //persona natural / empresa
      giro: '', //solo para empresas
      email: '',
      direccion: '',
      telefono: '',
      tipoServicio: '',
    };
  }

  handleChange(value: any) {
    return (this.tiporazon = value);
    console.log('tipo selecionado:', value);
  }
  async guardarContacto() {
    this.presentLoading();
    const path = 'Entidad/';
    const name = this.newContacto.nombre;
    this.FirestoService.creatDoc(
      this.newContacto,
      this.path,
      this.newContacto.id_entidad,
    )
      .then((res) => {
        this.loading.dismiss();
        this.presentToast('Guardado con exito');
      })
      .catch((error) => {
        this.presentToast('Error intente mas tarde');
      });
  }
  async presentLoading() {
    this.loading = await this.loadingController.create({
      cssClass: '',
      message: 'Guardando...',
    });
    await this.loading.present();
    this.router.navigate(['set-propiedad']);
  }
  async presentToast(msg: string) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }
}
