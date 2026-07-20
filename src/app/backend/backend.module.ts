import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { SetItdComponent } from './set-itd/set-itd.component';

import { SellerComponent } from './seller/seller.component';
import { AllItdComponent } from './all-itd/all-itd.component';

@NgModule({
  declarations: [
  
    SetItdComponent,

    SellerComponent,
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