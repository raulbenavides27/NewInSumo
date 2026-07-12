import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { ItdComponent } from './pages/itd/itd.component';

import { SetItdComponent } from './backend/set-itd/set-itd.component';


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