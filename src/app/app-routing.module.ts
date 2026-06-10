import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { TareasComponent } from './pages/tareas/tareas.component';
import { ItdComponent } from './pages/itd/itd.component';

import { SetPropiedadComponent } from './backend/set-propiedad/set-propiedad.component';
import { SetItdComponent } from './backend/set-itd/set-itd.component';

import { ContactoComponent } from './backend/contacto/contacto.component';
import { SoporteComponent } from './backend/soporte/soporte.component';

import { SellerComponent } from './backend/seller/seller.component';
import { SetSellerComponent } from './backend/set-seller/set-seller.component';


import { AllItdComponent } from './backend/all-itd/all-itd.component';

import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [

  {
    path: '',
    loadChildren: () =>
      import('./pages/bienvenido/bienvenido.module')
        .then(m => m.BienvenidoPageModule)
  },

  {
    path: 'perfil',
    component: PerfilComponent
  },

  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'tareas',
    component: TareasComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'itd',
    component: ItdComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'set-itd',
    component: SetItdComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'all-itd',
    component: AllItdComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'seller',
    component: SellerComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'set-seller',
    component: SetSellerComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'set-propiedad',
    component: SetPropiedadComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'contacto',
    component: ContactoComponent,
    canActivate: [AuthGuard]
  },

  {
    path: 'soporte',
    component: SoporteComponent,
    canActivate: [AuthGuard]
  },

  {
    path: '**',
    redirectTo: ''
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes,
      {
        preloadingStrategy: PreloadAllModules
      }
    )
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }