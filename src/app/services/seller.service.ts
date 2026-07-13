import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Seller } from '../models';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class SellerService {

  /**
   * Nombre de la colección en Firestore.
   */
  private readonly collection = 'sellers';

  constructor(
    private readonly firestoreService: FirestoreService
  ) { }

  /**
   * Obtiene todos los Sellers.
   */
  getAll(): Observable<Seller[]> {
    return this.firestoreService.getCollection<Seller>(this.collection);
  }

  /**
   * Obtiene un Seller por ID.
   */
  getById(id: string): Observable<Seller | undefined> {
    return this.firestoreService.getDoc<Seller>(this.collection, id);
  }

  /**
   * Crea un nuevo Seller.
   */
  create(seller: Seller): Promise<void> {
    return this.firestoreService.createDoc<Seller>(
      seller,
      this.collection,
      seller.id
    );
  }

  /**
   * Actualiza un Seller existente.
   */
  update(seller: Seller): Promise<void> {
    return this.firestoreService.updateDoc<Seller>(
      seller,
      this.collection,
      seller.id
    );
  }

  /**
   * Elimina un Seller.
   */
  delete(id: string): Promise<void> {
    return this.firestoreService.deleteDoc(
      this.collection,
      id
    );
  }

}