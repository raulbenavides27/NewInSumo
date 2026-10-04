/* =====================================================
   ITD
===================================================== */

export type EstadoProducto =
  | 'BUEN_ESTADO'
  | 'RECUPERABLE'
  | 'MAL_ESTADO';


/* =====================================================
   PRODUCTO ITD
===================================================== */

export interface ItdProducto {

  /**
   * SKU o código del producto.
   */
  sku: string;

  /**
   * Descripción del producto.
   */
  descripcion: string;

  /**
   * Cantidad de unidades.
   */
  cantidad: number;

  /**
   * Estado comercial/físico del producto.
   */
  estadoProducto: EstadoProducto;

}


/* =====================================================
   ITD
===================================================== */

export interface Itd {

  /**
   * ID interno del documento en Firestore.
   */
  id: string;

  /**
   * Número correlativo del ITD.
   */
  folio: number;

  /**
   * Fecha en que se registra el ITD.
   */
  fechaCreacion: Date;

  /**
   * Fecha declarada por el usuario.
   * Se mantiene como YYYY-MM-DD porque
   * proviene de un input type="date".
   */
  fechaDeclarada: string;


  /* ---------------------------------------------------
     DATOS COMERCIALES
  --------------------------------------------------- */

  /**
   * ID del Seller seleccionado.
   */
  sellerId: string;

  /**
   * Nombre del Seller.
   */
  sellerNombre: string;

  /**
   * Código del Seller.
   * Particular puede no tener código.
   */
  sellerCodigo: number | null;

  /**
   * Documento asociado al ITD.
   */
  documento: string;

  /**
   * Número de OC o Pedido.
   */
  ocPedido: string;

  /**
   * Número de seguimiento.
   */
  numeroSeguimiento: string;


  /* ---------------------------------------------------
     PRODUCTOS
  --------------------------------------------------- */

  /**
   * Productos incluidos dentro del ITD.
   */
  productos: ItdProducto[];


  /* ---------------------------------------------------
     ESTADO
  --------------------------------------------------- */

  /**
   * Detalle general del estado de los productos.
   */
  detalleEstado: string;


  /* ---------------------------------------------------
     RESPONSABLE
  --------------------------------------------------- */

  /**
   * Nombre del usuario que creó el ITD.
   */
  responsableCreacion: string;

  /**
   * Cargo del usuario que creó el ITD.
   */
  cargoCreacion: string;


  /* ---------------------------------------------------
     FOTOGRAFÍAS
  --------------------------------------------------- */

  /**
   * URLs de las fotografías almacenadas.
   *
   * Actualmente el formulario trabaja con nombres
   * de archivos. Posteriormente se reemplazará
   * por las URLs de Firebase Storage.
   */
  fotos: string[];

}


/* =====================================================
   HISTORIAL ITD
===================================================== */

export interface HistorialItd {

  /**
   * ID del registro de historial.
   */
  id: string;

  /**
   * ID del ITD relacionado.
   */
  itdId: string;

  /**
   * Fecha en que se realizó la gestión.
   */
  fechaGestion: Date;

  /**
   * Observación realizada durante la gestión.
   */
  observacion: string;

  /**
   * Compensación asociada a la gestión.
   */
  compensacion: string;

  /**
   * Persona que realizó la gestión.
   */
  responsableGestion: string;

  /**
   * Cargo de la persona que realizó la gestión.
   */
  cargoGestion: string;

}