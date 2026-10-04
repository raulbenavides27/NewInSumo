export type UsuarioRol =
  | 'ADMIN'
  | 'SUPERVISOR'
  | 'OPERADOR';

export type UsuarioEstado =
  | 'ACTIVO'
  | 'INACTIVO';

export interface Usuario {
  /**
   * UID generado por Firebase Authentication.
   */
  uid: string;

  /**
   * Nombre del usuario.
   */
  nombre: string;

  /**
   * Correo utilizado para el acceso.
   */
  email: string;

  /**
   * URL de la fotografía del usuario.
   */
  foto: string;

  /**
   * Rol dentro del sistema.
   */
  rol: UsuarioRol;

  /**
   * Cargo que desempeña el usuario.
   */
  cargo: string;

  /**
   * Estado del usuario.
   */
  estado: UsuarioEstado;

  /**
   * Fecha de creación del registro.
   */
  fechaCreacion: Date;
} 