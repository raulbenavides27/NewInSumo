import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Itd } from '../models';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class ItdService {

  /**
   * Nombre de la colección en Firestore.
   */
  private readonly collection = 'itds';

  constructor(
    private readonly firestoreService: FirestoreService
  ) { }

  /**
   * Obtiene todos los ITD.
   */
  getAll(): Observable<Itd[]> {
    return this.firestoreService.getCollection<Itd>(this.collection);
  }

  /**
   * Obtiene un ITD por su ID.
   */
  getById(id: string): Observable<Itd | undefined> {
    return this.firestoreService.getDoc<Itd>(this.collection, id);
  }

  /**
   * Crea un nuevo ITD.
   */
  create(itd: Itd): Promise<void> {
    return this.firestoreService.createDoc<Itd>(
      itd,
      this.collection,
      itd.id
    );
  }

  /**
   * Actualiza un ITD existente.
   */
  update(itd: Itd): Promise<void> {
    return this.firestoreService.updateDoc<Itd>(
      itd,
      this.collection,
      itd.id
    );
  }

  /**
   * Elimina un ITD.
   */
  delete(id: string): Promise<void> {
    return this.firestoreService.deleteDoc(
      this.collection,
      id
    );
  }

}