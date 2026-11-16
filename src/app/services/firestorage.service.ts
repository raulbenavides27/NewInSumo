import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { firstValueFrom } from 'rxjs';
import { last, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FirestorageService {
  constructor(public FireStorage: AngularFireStorage) {}

  async uploadImage(file: File, path: string, nombre: string): Promise<string> {
    const filePath = `${path}/${nombre}`;
    const ref = this.FireStorage.ref(filePath);
    const task = ref.put(file);

    try {
      return await firstValueFrom(
        task.snapshotChanges().pipe(
          last(),
          switchMap(() => ref.getDownloadURL())
        )
      );
    } catch (error) {
      console.error('Error al subir fotografía:', error);
      throw error;
    }
  }
}
