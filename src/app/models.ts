

/* =====================================================
   SELLER
===================================================== */

export interface Seller {
  id: string;
  nombre: string;
  codigo: number | null;
  observacion: string;
  estado: 'ACTIVO' | 'INACTIVO';
  fechaCreacion: Date;
}

/* =====================================================
   ITD PRODUCTO
===================================================== */

export interface ItdProducto {
  sku: string;

  descripcion: string;

  cantidad: number;

  estadoProducto:
    | 'BUEN_ESTADO'
    | 'RECUPERABLE'
    | 'MAL_ESTADO';
}

/* =====================================================
   ITD
===================================================== */

export interface Itd {
  id: string;

  folio: number;

  fechaCreacion: Date;

  fechaDeclarada: Date;

  sellerId: string;

  sellerNombre: string;

  sellerCodigo: number | null;

  documento: string;

  ocPedido: string;

  numeroSeguimiento: string;

  detalleEstado: string;

  responsableCreacion: string;

  cargoCreacion: string;

  fotos: string[];

  productos: ItdProducto[];
}

/* =====================================================
   HISTORIAL ITD
===================================================== */

export interface HistorialItd {
  id: string;

  itdId: string;

  fechaGestion: Date;

  observacion: string;

  compensacion: string;

  responsableGestion: string;

  cargoGestion: string;
}