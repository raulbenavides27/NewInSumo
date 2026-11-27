import { Component, OnDestroy, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Usuario, UsuarioRol, UsuarioEstado, PermisosPersonalizados, PermisoModulo, PermisoAccion, EstadoPermiso, PermisosSistema, RolPermisos } from 'src/app/models/usuario.model';
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
  guardandoPermisos = false;
  accesoPermitido = false;
  usuarioEditando: Usuario | null = null;
  vistaPermisos: 'rol' | 'usuario' = 'rol';
  rolSeleccionado: UsuarioRol = 'ADMIN';
  usuarioPermisosUid = '';
  permisosRolEditando: PermisosSistema = this.crearPermisosVacios();
  permisosUsuarioEditando: PermisosPersonalizados = {};

  private usuariosSub?: Subscription;
  private rolesSub?: Subscription;
  private perfilSub?: Subscription;

  readonly roles: UsuarioRol[] = ['ADMIN', 'SUPERVISOR', 'OPERADOR', 'COMERCIAL'];
  readonly estados: UsuarioEstado[] = ['ACTIVO', 'INACTIVO'];
  readonly areas = ['Logística', 'Comercial', 'Administrativo', 'Operacional'];
  readonly modulos: { key: PermisoModulo; label: string }[] = [
    { key: 'itd', label: 'ITD' },
    { key: 'vendedores', label: 'Vendedores' },
    { key: 'usuarios', label: 'Usuarios' },
    { key: 'administracion', label: 'Administración' },
  ];
  readonly acciones: { key: PermisoAccion; label: string }[] = [
    { key: 'ver', label: 'Ver' },
    { key: 'crear', label: 'Crear' },
    { key: 'editar', label: 'Editar' },
    { key: 'eliminar', label: 'Eliminar' },
  ];

  private rolesConfigurados: RolPermisos[] = [];

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

    this.perfilSub = this.firestore.getDoc<Usuario>('usuarios', this.usuarioActualUid).subscribe(perfil => {
      this.accesoPermitido = perfil?.rol === 'ADMIN' && perfil.estado === 'ACTIVO';
      if (this.accesoPermitido && !this.usuariosSub) {
        this.cargarUsuarios();
        this.cargarRolesConfigurados();
      } else if (!this.accesoPermitido) {
        this.cargando = false;
      }
    });
  }

  private cargarUsuarios(): void {
    this.usuariosSub = this.firestore.getCollection<Usuario>('usuarios')
      .subscribe(usuarios => {
        this.usuarios = usuarios.sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
        if (this.usuarioPermisosUid) {
          const usuario = this.usuarios.find(item => item.uid === this.usuarioPermisosUid);
          this.permisosUsuarioEditando = usuario?.permisosPersonalizados
            ? { ...usuario.permisosPersonalizados }
            : {};
        }
        this.cargando = false;
      }, error => {
        console.error('No fue posible cargar usuarios:', error);
        this.cargando = false;
      });
  }

  private cargarRolesConfigurados(): void {
    this.rolesSub = this.firestore.getCollection<RolPermisos>('roles')
      .subscribe(roles => {
        this.rolesConfigurados = roles;
        this.cargarPermisosRol(this.rolSeleccionado);
      }, error => {
        console.error('No fue posible cargar la configuración de roles:', error);
      });
  }

  editar(usuario: Usuario): void {
    this.usuarioEditando = { ...usuario };
  }

  cancelarEdicion(): void {
    this.usuarioEditando = null;
  }

  cargarPermisosRol(rol: UsuarioRol): void {
    this.rolSeleccionado = rol;
    const configuracion = this.rolesConfigurados.find(item => item.nombre === rol);
    this.permisosRolEditando = configuracion?.permisos
      ? this.copiarPermisos(configuracion.permisos)
      : this.crearPermisosVacios();
  }

  cambiarPermisoRol(modulo: PermisoModulo, accion: PermisoAccion, habilitado: boolean): void {
    this.permisosRolEditando[modulo][accion] = habilitado;
  }

  async guardarPermisosRol(): Promise<void> {
    if (this.guardandoPermisos) return;
    this.guardandoPermisos = true;
    const configuracion: RolPermisos = {
      nombre: this.rolSeleccionado,
      permisos: this.copiarPermisos(this.permisosRolEditando),
      actualizadoEn: new Date().toISOString(),
    };

    try {
      const existente = this.rolesConfigurados.find(item => item.nombre === this.rolSeleccionado);
      if (existente) {
        await this.firestore.updateDoc<RolPermisos>(
          { permisos: configuracion.permisos, actualizadoEn: configuracion.actualizadoEn },
          'roles',
          existente.id || this.rolSeleccionado
        );
      } else {
        await this.firestore.createDoc<RolPermisos>(
          configuracion,
          'roles',
          this.rolSeleccionado
        );
      }
      await this.mostrarAlerta('Permisos guardados', 'La configuración del rol fue actualizada.');
    } catch (error) {
      console.error('Error guardando permisos del rol:', error);
      await this.mostrarAlerta('Error', 'No fue posible guardar los permisos del rol.');
    } finally {
      this.guardandoPermisos = false;
    }
  }

  cargarPermisosUsuario(uid: string): void {
    this.usuarioPermisosUid = uid;
    const usuario = this.usuarios.find(item => item.uid === uid);
    this.permisosUsuarioEditando = usuario?.permisosPersonalizados
      ? { ...usuario.permisosPersonalizados }
      : {};
  }

  obtenerPermisoUsuario(modulo: PermisoModulo, accion: PermisoAccion): EstadoPermiso {
    const valor = this.permisosUsuarioEditando[modulo]?.[accion];
    if (valor === undefined || valor === null) return 'HEREDAR';
    return valor ? 'PERMITIR' : 'DENEGAR';
  }

  cambiarPermisoUsuario(modulo: PermisoModulo, accion: PermisoAccion, estado: EstadoPermiso): void {
    const permisosModulo = { ...(this.permisosUsuarioEditando[modulo] || {}) };
    permisosModulo[accion] = estado === 'HEREDAR' ? null : estado === 'PERMITIR';
    this.permisosUsuarioEditando = {
      ...this.permisosUsuarioEditando,
      [modulo]: permisosModulo,
    };
  }

  async guardarPermisosUsuario(): Promise<void> {
    if (!this.usuarioPermisosUid || this.guardandoPermisos) return;
    this.guardandoPermisos = true;
    try {
      await this.firestore.updateDoc<Usuario>(
        { permisosPersonalizados: this.permisosUsuarioEditando },
        'usuarios',
        this.usuarioPermisosUid
      );
      await this.mostrarAlerta('Permisos guardados', 'Las excepciones individuales fueron actualizadas.');
    } catch (error) {
      console.error('Error guardando permisos del usuario:', error);
      await this.mostrarAlerta('Error', 'No fue posible guardar los permisos del usuario.');
    } finally {
      this.guardandoPermisos = false;
    }
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

  private crearPermisosVacios(): PermisosSistema {
    return {
      itd: { ver: false, crear: false, editar: false, eliminar: false },
      vendedores: { ver: false, crear: false, editar: false, eliminar: false },
      usuarios: { ver: false, crear: false, editar: false, eliminar: false },
      administracion: { ver: false, crear: false, editar: false, eliminar: false },
    };
  }

  private copiarPermisos(permisos: PermisosSistema): PermisosSistema {
    return {
      itd: { ...permisos.itd },
      vendedores: { ...permisos.vendedores },
      usuarios: { ...permisos.usuarios },
      administracion: { ...permisos.administracion },
    };
  }

  private async mostrarAlerta(header: string, message: string): Promise<void> {
    const alert = await this.alertController.create({ header, message, buttons: ['OK'] });
    await alert.present();
  }

  ngOnDestroy(): void {
    this.usuariosSub?.unsubscribe();
    this.rolesSub?.unsubscribe();
    this.perfilSub?.unsubscribe();
  }
}
