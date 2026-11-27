export type UsuarioRol =
  | 'ADMIN'
  | 'SUPERVISOR'
  | 'OPERADOR'
  | 'COMERCIAL';

export type UsuarioEstado =
  | 'ACTIVO'
  | 'INACTIVO';

export type PermisoModulo =
  | 'itd'
  | 'vendedores'
  | 'usuarios'
  | 'administracion';

export type PermisoAccion =
  | 'ver'
  | 'crear'
  | 'editar'
  | 'eliminar';

export type EstadoPermiso =
  | 'HEREDAR'
  | 'PERMITIR'
  | 'DENEGAR';

export interface PermisosModulo {
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

export type PermisosSistema = Record<PermisoModulo, PermisosModulo>;

export type PermisosPersonalizados = Partial<
  Record<PermisoModulo, Partial<Record<PermisoAccion, boolean | null>>>
>;

export interface RolPermisos {
  id?: string;
  nombre: UsuarioRol;
  permisos: PermisosSistema;
  actualizadoEn?: string;
}

export interface Usuario {
  /** UID generado por Firebase Authentication. */
  uid: string;

  /** Nombre del usuario. */
  nombre: string;

  /** Correo utilizado para el acceso. */
  email: string;

  /** URL de la fotografía del usuario. */
  foto: string;

  /** Rol de acceso y permisos base dentro del sistema. */
  rol: UsuarioRol;

  /** Excepciones individuales: true permite, false deniega y null hereda del rol. */
  permisosPersonalizados?: PermisosPersonalizados;

  /** Cargo o función laboral (ej.: Coordinador Logístico, KAM). */
  cargo: string;

  /** Área organizacional (ej.: Logística, Comercial). */
  area: string;

  /** Estado del usuario. */
  estado: UsuarioEstado;

  /** Fecha de creación del registro. */
  fechaCreacion: Date;
}
