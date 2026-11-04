
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';

@Component({
  selector: 'app-bienvenido',
  templateUrl: './bienvenido.page.html',
  styleUrls: ['./bienvenido.page.scss'],
})
export class BienvenidoPage implements OnInit {

  constructor(
    private router: Router,
    private firebaseauthService: FirebaseauthService
  ) {}

  ngOnInit(): void {
    this.firebaseauthService.stateAuth()
      .pipe(take(1))
      .subscribe(user => {
        if (user) {
          this.router.navigateByUrl('/home', {
            replaceUrl: true
          });
        }
      });
  }

  goToLogin(): void {
    this.router.navigate(['/perfil']);
  }

}
