import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Itd } from '../models';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class ItdService {

  private readonly collection = 'itd';

  constructor(
    private firestoreService: FirestoreService
  ) { }

  /**
   * Obtiene todos los ITD
   */
  getAll(): Observable<Itd[]> {
    return this.firestoreService.getCollection<Itd>(this.collection);
  }

  /**
   * Obtiene un ITD por ID
   */
  getById(id: string): Observable<Itd> {
    return this.firestoreService.getDoc<Itd>(this.collection, id);
  }

  /**
   * Crea un nuevo ITD
   */
  create(itd: Itd): Promise<void> {
    return this.firestoreService.createDoc(itd, this.collection, itd.id);
  }

  /**
   * Actualiza un ITD
   */
  update(itd: Itd): Promise<void> {
    return this.firestoreService.updateDoc(itd, this.collection, itd.id);
  }

  /**
   * Elimina un ITD
   */
  delete(id: string): Promise<void> {
    return this.firestoreService.deleteDoc(this.collection, id);
  }
}