import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-bienvenido',
  templateUrl: './bienvenido.page.html',
  styleUrls: ['./bienvenido.page.scss'],
})
export class BienvenidoPage implements OnInit {

  constructor(private route: Router) {}

  ngOnInit() {}

  goToLogin() {
    this.route.navigate(['/perfil']);
  }

}