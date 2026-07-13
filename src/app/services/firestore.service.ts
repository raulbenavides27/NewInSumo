import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {

  constructor(
    private readonly database: AngularFirestore
  ) {}

  /**
   * Crear documento con ID personalizado.
   */
  createDoc<T extends firebase.firestore.DocumentData>(
    data: T,
    path: string,
    id: string
  ): Promise<void> {
    return this.database
      .collection<T>(path)
      .doc(id)
      .set(data);
  }

  /**
   * Obtener documento por ID.
   */
  getDoc<T extends firebase.firestore.DocumentData>(
    path: string,
    id: string
  ): Observable<T | undefined> {
    return this.database
      .collection<T>(path)
      .doc(id)
      .valueChanges();
  }

  /**
   * Actualizar documento.
   */
  updateDoc<T extends firebase.firestore.DocumentData>(
    data: Partial<T>,
    path: string,
    id: string
  ): Promise<void> {
    return this.database
      .collection<T>(path)
      .doc(id)
      .update(data);
  }

  /**
   * Eliminar documento.
   */
  deleteDoc(
    path: string,
    id: string
  ): Promise<void> {
    return this.database
      .collection(path)
      .doc(id)
      .delete();
  }

  /**
   * Obtener todos los documentos de una colección.
   */
  getCollection<T extends firebase.firestore.DocumentData>(
    path: string
  ): Observable<T[]> {
    return this.database
      .collection<T>(path)
      .valueChanges();
  }

  /**
   * Generar ID de Firestore.
   */
  getId(): string {
    return this.database.createId();
  }

}