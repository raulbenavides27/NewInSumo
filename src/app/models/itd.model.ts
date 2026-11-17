/* =====================================================
   ITD
===================================================== */

export type EstadoProducto =
  | 'BUEN_ESTADO'
  | 'RECUPERABLE'
  | 'MAL_ESTADO';

export type EstadoGestionItd = 'ABIERTO' | 'CERRADO';

/* =====================================================
   PRODUCTO ITD
===================================================== */

export interface ItdProducto {
  sku: string;
  descripcion: string;
  cantidad: number;
  estadoProducto: EstadoProducto;
}

/* =====================================================
   ITD
===================================================== */

export interface Itd {
  id: string;
  folio: number;
  fechaCreacion: Date;
  fechaDeclarada: string;
  sellerId: string;
  sellerNombre: string;
  sellerCodigo: number | null;
  documento: string;
  ocPedido: string;
  numeroSeguimiento: string;
  productos: ItdProducto[];
  detalleEstado: string;
  responsableCreacion: string;
  cargoCreacion: string;
  fotos: string[];
}

/* =====================================================
   HISTORIAL DE GESTIONES ITD
===================================================== */

export interface HistorialItd {
  id: string;
  itdId: string;
  fechaGestion: Date;
  observacion: string;
  compensacion: number;
  estadoGestion: EstadoGestionItd;
  responsableGestion: string;
  cargoGestion: string;
}
