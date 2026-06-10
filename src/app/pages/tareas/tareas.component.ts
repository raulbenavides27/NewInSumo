import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { publicDecrypt } from 'crypto';
import { Cliente, Entidad, Propiedad } from 'src/app/models';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.component.html',
  styleUrls: ['./tareas.component.scss'],
})
export class TareasComponent implements OnInit {
  id: any;
  propiedad!: Propiedad;
  constructor(
    public menucontroler: MenuController,
    public activatedRoute: ActivatedRoute,
    public firestoreService: FirestoreService,
    public firebaseauthService: FirebaseauthService,
    public router: Router,
  ) {}
  async ngOnInit() {
    //aqui se adquiere la id de la propiedad por opcion de router
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    console.log('la id recibida es:', this.id);
    this.getPropiedad();
  }

  getPropiedad() {
    const path = 'Propiedad';
    this.firestoreService.getDoc<Propiedad>(path, this.id).subscribe((res) => {
      this.propiedad = res as Propiedad;
      console.log('Propiedad buscada', this.propiedad);
    });
  }
}
