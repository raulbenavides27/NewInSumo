import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Seller } from '../models/seller.model';
import { FirestoreService } from '../services/firestore.service';
import { CounterService } from '../services/counter.service';

@Injectable({
  providedIn: 'root'
})
export class SellerService {

  private readonly collection = 'sellers';

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly counterService: CounterService
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
    return this.firestoreService.getDoc<Seller>(
      this.collection,
      id
    );
  }

  /**
   * Crea un nuevo Seller.
   */
  async create(seller: Seller): Promise<void> {

    this.validateSeller(seller);

    const id = await this.counterService.getNextSellerId();

    const newSeller: Seller = {
      ...seller,
      id,
      codigo: this.normalizeCodigo(seller),
      nombre: seller.nombre.trim().toUpperCase(),
      fechaCreacion: new Date()
    };

    await this.firestoreService.createDoc(
      newSeller,
      this.collection,
      id
    );

  }

  /**
   * Actualiza un Seller.
   */
  async update(seller: Seller): Promise<void> {

    this.validateSeller(seller);

    const updatedSeller: Seller = {
      ...seller,
      codigo: this.normalizeCodigo(seller),
      nombre: seller.nombre.trim().toUpperCase()
    };

    await this.firestoreService.updateDoc(
      updatedSeller,
      this.collection,
      seller.id
    );

  }

  /**
   * Cambia el estado.
   */
  async changeStatus(
    seller: Seller,
    estado: 'ACTIVO' | 'INACTIVO'
  ): Promise<void> {

    await this.firestoreService.updateDoc(
      {
        estado
      },
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

  /**
   * Valida un Seller.
   */
  private validateSeller(
    seller: Seller
  ): void {

    if (!seller.nombre || seller.nombre.trim() === '') {
      throw new Error('Debe ingresar un nombre.');
    }

  }

  /**
   * Particular siempre tiene código null.
   */
  private normalizeCodigo(
    seller: Seller
  ): number | null {

    if (
      seller.nombre.trim().toUpperCase() === 'PARTICULAR'
    ) {
      return null;
    }

    return seller.codigo;

  }

}