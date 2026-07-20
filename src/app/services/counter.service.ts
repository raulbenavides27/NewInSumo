import { Injectable } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FirestoreService } from './firestore.service';

@Injectable({
  providedIn: 'root'
})
export class CounterService {

  private readonly collection = 'counters';

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly firestore: AngularFirestore
  ) { }

  /**
   * Obtiene el siguiente ID de Seller.
   * Ejemplo:
   * SEL0001
   */
  async getNextSellerId(): Promise<string> {

    const number = await this.getNextNumber(
      'seller'
    );

    return `SEL${number.toString().padStart(4, '0')}`;

  }

  /**
   * Obtiene el siguiente ID de ITD.
   * Ejemplo:
   * ITD000001
   */
  async getNextItdId(): Promise<string> {

    const number = await this.getNextNumber(
      'itd'
    );

    return `ITD${number.toString().padStart(6, '0')}`;

  }

  /**
   * Obtiene el siguiente correlativo
   * utilizando una transacción.
   */
  private async getNextNumber(
    counterId: string
  ): Promise<number> {

    return this.firestoreService.runTransaction<number>(

      async (transaction) => {

        const docRef = this.firestore
          .collection(this.collection)
          .doc(counterId)
          .ref;

        const snapshot =
          await transaction.get(docRef);

        let ultimo = 0;

        if (snapshot.exists) {

          const data = snapshot.data() as { ultimo?: number };

          if (data) {
            ultimo = data.ultimo ?? 0;
          }

        }

        const siguiente = ultimo + 1;

        transaction.set(
          docRef,
          {
            ultimo: siguiente
          },
          {
            merge: true
          }
        );

        return siguiente;

      }

    );

  }

}