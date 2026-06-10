import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SetPropiedadComponent } from './set-propiedad/set-propiedad.component';
import { ContactoComponent } from './contacto/contacto.component';
import { SoporteComponent } from './soporte/soporte.component';
import { SetItdComponent } from './set-itd/set-itd.component';

import { SellerComponent } from './seller/seller.component';
import { SetSellerComponent } from './set-seller/set-seller.component';
import { AllItdComponent } from './all-itd/all-itd.component';

@NgModule({
  declarations: [
    SetPropiedadComponent,
    SoporteComponent,
    ContactoComponent,
    SetItdComponent,

    SellerComponent,
    SetSellerComponent,
    AllItdComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    RouterModule
  ]
})
export class BackendModule { }