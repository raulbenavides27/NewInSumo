import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { PerfilComponent } from './perfil/perfil.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ComponentesModule } from '../componentes/componentes.module';
import { TareasComponent } from './tareas/tareas.component';
import { ItdComponent } from './itd/itd.component';

@NgModule({
  declarations: [HomeComponent, PerfilComponent, TareasComponent, ItdComponent],
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    ComponentesModule,
  ],
})
export class PagesModule {}
