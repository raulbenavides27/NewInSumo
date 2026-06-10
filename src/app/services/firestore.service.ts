import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { Propiedad } from '../models';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  seletPropiedad!: Propiedad;

  constructor(public database: AngularFirestore) {}

  // Crear documento con ID personalizado
  creatDoc<T extends firebase.firestore.DocumentData>(
    data: T,
    path: string,
    id: string,
  ) {
    const collection = this.database.collection<T>(path);
    return collection.doc(id).set(data);
  }

  // Obtener un documento por ID
  getDoc<T extends firebase.firestore.DocumentData>(path: string, id: string) {
    const collection = this.database.collection<T>(path);
    return collection.doc(id).valueChanges();
  }

  // Eliminar un documento
  deletDoc(path: string, id: string) {
    const collection = this.database.collection(path);
    return collection.doc(id).delete();
  }

  // Actualizar un documento
  updateDoc<T extends firebase.firestore.DocumentData>(
    data: Partial<T>,
    path: string,
    id: string,
  ) {
    const collection = this.database.collection<T>(path);
    return collection.doc(id).update(data);
  }

  // Obtener ID generado automáticamente
  getId() {
    return this.database.createId();
  }

  // Obtener todos los documentos de una colección
  getColletion<T extends firebase.firestore.DocumentData>(path: string) {
    const collection = this.database.collection<T>(path);
    return collection.valueChanges();
  }

  // Seleccionar propiedad (para flujo interno)
  setDoc(propiedad: Propiedad) {
    this.seletPropiedad = propiedad;
  }

  getProp() {
    return this.seletPropiedad;
  }
}
