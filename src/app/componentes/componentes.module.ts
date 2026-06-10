import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropiedadComponent } from './propiedad/propiedad.component';
import { IonicModule } from '@ionic/angular';
import { Router, RouterModule } from '@angular/router';
import { CuentaComponent } from './cuenta/cuenta.component';

@NgModule({
  declarations: [PropiedadComponent, CuentaComponent],
  imports: [CommonModule, IonicModule, RouterModule],
  exports: [PropiedadComponent, CuentaComponent],
})
export class ComponentesModule {}
