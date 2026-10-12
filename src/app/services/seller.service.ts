import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  ) {}

  getAll(): Observable<Seller[]> {
    return this.firestoreService
      .getCollection<Seller>(this.collection)
      .pipe(
        map((sellers: any[]) =>
          sellers.map(seller => ({
            ...seller,
            fechaCreacion: this.convertirFecha(seller.fechaCreacion)
          }))
        )
      );
  }

  getById(id: string): Observable<Seller | undefined> {
    return this.firestoreService
      .getDoc<Seller>(
        this.collection,
        id
      )
      .pipe(
        map((seller: any) => {
          if (!seller) {
            return undefined;
          }

          return {
            ...seller,
            fechaCreacion: this.convertirFecha(
              seller.fechaCreacion
            )
          };
        })
      );
  }

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

  async changeStatus(
    seller: Seller,
    estado: 'ACTIVO' | 'INACTIVO'
  ): Promise<void> {

    await this.firestoreService.updateDoc(
      { estado },
      this.collection,
      seller.id
    );
  }

  delete(id: string): Promise<void> {
    return this.firestoreService.deleteDoc(
      this.collection,
      id
    );
  }

  private validateSeller(seller: Seller): void {
    if (!seller.nombre || seller.nombre.trim() === '') {
      throw new Error('Debe ingresar un nombre.');
    }
  }

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

  private convertirFecha(fecha: any): Date {
    if (!fecha) {
      return new Date();
    }

    if (
      typeof fecha.toDate === 'function'
    ) {
      return fecha.toDate();
    }

    if (fecha instanceof Date) {
      return fecha;
    }

    if (typeof fecha === 'string') {
      return new Date(fecha);
    }

    if (
      typeof fecha === 'number'
    ) {
      return new Date(fecha);
    }

    return new Date();
  }
}