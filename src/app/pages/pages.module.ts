import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { ItdComponent } from './itd/itd.component';

@NgModule({
  declarations: [
    ItdComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule
  ],
  exports: [
    ItdComponent
  ]
})
export class PagesModule { }