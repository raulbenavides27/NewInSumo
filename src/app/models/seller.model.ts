export type SellerEstado = 'ACTIVO' | 'INACTIVO';

export interface Seller {

  /**
   * ID interno del Seller.
   * Ejemplo: SEL0001
   */
  id: string;

  /**
   * Nombre del Seller.
   * Ejemplo: RIPLEY MKP
   */
  nombre: string;

  /**
   * Código ERP.
   * Particular siempre será null.
   */
  codigo: number | null;

  /**
   * Observaciones del Seller.
   */
  observacion: string;

  /**
   * Estado del Seller.
   */
  estado: SellerEstado;

  /**
   * Fecha de creación del registro.
   */
  fechaCreacion: Date;

}