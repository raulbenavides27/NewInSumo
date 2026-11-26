import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Usuario, UsuarioRol, UsuarioEstado } from 'src/app/models/usuario.model';
import { FirebaseauthService } from 'src/app/services/firebaseauth.service';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-administracion',
  templateUrl: './administracion.component.html',
  styleUrls: ['./administracion.component.scss'],
})
export class AdministracionComponent implements OnInit, OnDestroy {
  usuarios: Usuario[] = [];
  usuarioActualUid = '';
  cargando = true;
  guardando = false;
  accesoPermitido = false;
  usuarioEditando: Usuario | null = null;
  private usuariosSub?: Subscription;

  readonly roles: UsuarioRol[] = ['ADMIN', 'SUPERVISOR', 'OPERADOR', 'COMERCIAL'];
  readonly estados: UsuarioEstado[] = ['ACTIVO', 'INACTIVO'];
  readonly areas = ['Logística', 'Comercial', 'Administrativo', 'Operacional'];

  constructor(
    private auth: FirebaseauthService,
    private firestore: FirestoreService,
    private alertController: AlertController
  ) {}

  async ngOnInit(): Promise<void> {
    this.usuarioActualUid = (await this.auth.getUid()) || '';
    if (!this.usuarioActualUid) {
      this.cargando = false;
      return;
    }

    this.firestore.getDoc<Usuario>('usuarios', this.usuarioActualUid).subscribe(perfil => {
      this.accesoPermitido = perfil?.rol === 'ADMIN' && perfil.estado === 'ACTIVO';
      if (this.accesoPermitido && !this.usuariosSub) {
        this.cargarUsuarios();
      } else if (!this.accesoPermitido) {
        this.cargando = false;
      }
    });
  }

  private cargarUsuarios(): void {
    this.usuariosSub = this.firestore.getCollection<Usuario>('usuarios')
      .subscribe(usuarios => {
        this.usuarios = usuarios.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        this.cargando = false;
      }, error => {
        console.error('No fue posible cargar usuarios:', error);
        this.cargando = false;
      });
  }

  editar(usuario: Usuario): void {
    this.usuarioEditando = { ...usuario };
  }

  cancelarEdicion(): void {
    this.usuarioEditando = null;
  }

  async guardarCambios(): Promise<void> {
    if (!this.usuarioEditando || this.guardando) return;
    if (!this.usuarioEditando.cargo.trim() || !this.usuarioEditando.area.trim()) {
      await this.mostrarAlerta('Datos incompletos', 'Indica el cargo y el área del usuario.');
      return;
    }

    this.guardando = true;
    try {
      const { uid, rol, cargo, area, estado } = this.usuarioEditando;
      await this.firestore.updateDoc<Usuario>(
        { rol, cargo: cargo.trim(), area: area.trim(), estado },
        'usuarios',
        uid
      );
      this.usuarioEditando = null;
      await this.mostrarAlerta('Cambios guardados', 'El perfil del usuario fue actualizado.');
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      await this.mostrarAlerta('Error', 'No fue posible actualizar el perfil.');
    } finally {
      this.guardando = false;
    }
  }

  private async mostrarAlerta(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }

  ngOnDestroy(): void {
    this.usuariosSub?.unsubscribe();
  }
}
