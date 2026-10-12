
import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { FirebaseauthService } from './services/firebaseauth.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  isWelcomePage = true;

  constructor(
    private firebaseauthservice: FirebaseauthService,
    private router: Router
  ) {
    this.updateWelcomeState(this.router.url);

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.updateWelcomeState(event.urlAfterRedirects);
      }
    });
  }

  private updateWelcomeState(url: string): void {
    const currentUrl = url.split('?')[0].split('#')[0];

    this.isWelcomePage =
      currentUrl === '' ||
      currentUrl === '/' ||
      currentUrl === '/bienvenido' ||
      currentUrl.endsWith('/bienvenido');
  }
}
