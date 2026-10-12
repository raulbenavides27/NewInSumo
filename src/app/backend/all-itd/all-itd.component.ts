import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Itd } from 'src/app/models/itd.model';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-all-itd',
  templateUrl: './all-itd.component.html',
  styleUrls: ['./all-itd.component.scss']
})
export class AllItdComponent implements OnInit {

  searchTerm: string = '';

  itds: Itd[] = [];
  itdsFiltrados: Itd[] = [];

  cargando: boolean = false;

  constructor(
    public menucontroller: MenuController,
    private router: Router,
    private firestoreService: FirestoreService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.cargarITDs();
  }

  async cargarITDs(): Promise<void> {
    this.cargando = true;

    try {
      const itds = await firstValueFrom(
        this.firestoreService.getCollection<Itd>('itds')
      );

      this.itds = [...itds].sort((a, b) => {
        return Number(b.folio) - Number(a.folio);
      });

      this.itdsFiltrados = [...this.itds];

    } catch (error) {
      console.error('Error al cargar los ITD:', error);
      alert('No fue posible cargar el registro de ITD.');
    } finally {
      this.cargando = false;
    }
  }

  filterProperties(): void {
    const termino = this.searchTerm.trim().toLowerCase();

    if (!termino) {
      this.itdsFiltrados = [...this.itds];
      return;
    }

    this.itdsFiltrados = this.itds.filter((itd) => {
      return (
        String(itd.folio).toLowerCase().includes(termino) ||
        (itd.sellerNombre || '').toLowerCase().includes(termino) ||
        (itd.documento || '').toLowerCase().includes(termino) ||
        (itd.ocPedido || '').toLowerCase().includes(termino) ||
        (itd.numeroSeguimiento || '').toLowerCase().includes(termino)
      );
    });
  }

  goPerfil(): void {
    this.router.navigate(['perfil']);
  }

  openMenu(): void {
    this.menucontroller.toggle('principal');
  }

  verITD(itd: Itd): void {
    console.log('ITD seleccionado:', itd);
  }
}