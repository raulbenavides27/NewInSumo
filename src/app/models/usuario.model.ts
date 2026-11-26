export type UsuarioRol =
  | 'ADMIN'
  | 'SUPERVISOR'
  | 'OPERADOR'
  | 'COMERCIAL';

export type UsuarioEstado =
  | 'ACTIVO'
  | 'INACTIVO';

export interface Usuario {
  /** UID generado por Firebase Authentication. */
  uid: string;

  /** Nombre del usuario. */
  nombre: string;

  /** Correo utilizado para el acceso. */
  email: string;

  /** URL de la fotografía del usuario. */
  foto: string;

  /** Rol de acceso y permisos dentro del sistema. */
  rol: UsuarioRol;

  /** Cargo o función laboral (ej.: Coordinador Logístico, KAM). */
  cargo: string;

  /** Área organizacional (ej.: Logística, Comercial). */
  area: string;

  /** Estado del usuario. */
  estado: UsuarioEstado;

  /** Fecha de creación del registro. */
  fechaCreacion: Date;
}
