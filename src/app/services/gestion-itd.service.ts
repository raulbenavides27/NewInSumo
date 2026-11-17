import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { HistorialItd } from '../models/itd.model';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class GestionItdService {
  private readonly collection = 'gestiones_itd';

  constructor(
    private readonly firestoreService: FirestoreService
  ) {}

  getAll(): Observable<HistorialItd[]> {
    return this.firestoreService.getCollection<HistorialItd>(this.collection);
  }

  create(gestion: HistorialItd): Promise<void> {
    const id = this.firestoreService.getId();

    return this.firestoreService.createDoc<HistorialItd>(
      { ...gestion, id },
      this.collection,
      id
    );
  }
}
