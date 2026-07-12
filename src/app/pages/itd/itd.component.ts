import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-itd',
  templateUrl: './itd.component.html',
  styleUrls: ['./itd.component.scss'],
})
export class ItdComponent implements OnInit {
 

  searchTerm: string = '';

  constructor(
    public menucontroler: MenuController,
    public firestoreService: FirestoreService,
    private router: Router,
  ) {
    
  }

  ngOnInit() {}

  openMenu() {
    console.log('open menu');
    this.menucontroler.toggle('principal');
  }

 
  
  path<T>(path: any) {
    throw new Error('Method not implemented.');
  }


  goPerfil() {
    this.router.navigate(['perfil']);
  }
}
