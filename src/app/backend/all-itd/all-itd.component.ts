import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-all-itd',
  templateUrl: './all-itd.component.html',
  styleUrls: ['./all-itd.component.scss']
})
export class AllItdComponent implements OnInit {

  searchTerm: string = '';

  constructor(
    public menucontroller: MenuController,
    private router: Router
  ) {}

  ngOnInit(): void {}

  filterProperties() {
    console.log('Buscar:', this.searchTerm);
  }

  goPerfil() {
    this.router.navigate(['perfil']);
  }

  openMenu() {
    this.menucontroller.toggle('principal');
  }
}