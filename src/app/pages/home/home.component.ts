import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {

  constructor(
    public menuController: MenuController,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  openMenu(): void {
    this.menuController.toggle('principal');
  }

  goPerfil(): void {
    this.router.navigate(['/perfil']);
  }

  goItd(): void {
    this.router.navigate(['/itd']);
  }

  goCrearItd(): void {
    this.router.navigate(['/set-itd']);
  }

  goHistorial(): void {
    this.router.navigate(['/all-itd']);
  }

  goSeller(): void {
    this.router.navigate(['/seller']);
  }

  cerrarSesion(): void {
    // Más adelante aquí se llamará a FirebaseAuthService.logout()
    this.router.navigate(['/']);
  }

}