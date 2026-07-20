/* =====================================================
   USUARIO
===================================================== */

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
   * Correo de acceso.
   */
  email: string;

  /**
   * Contraseña.
   * Solo utilizada durante el proceso de autenticación.
   */
  password: string;

  /**
   * Confirmación de contraseña.
   * Solo utilizada durante el registro.
   */
  confirmacion: string;

  /**
   * URL de la fotografía del usuario.
   */
  foto: string;

  /**
   * Rol dentro del ERP.
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