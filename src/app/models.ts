// Nuestro principal es la propiedad

export interface Propiedad {
  id: string;
  id_propiedad: string;
  referencia: string;
  direccion: string;
  numero: number;
  comuna: string;
  contacto: string;
  telefono: number;
  fecha: Date;
  tipo: string;
  estado: string;
  condicion: string;
  ubicacion: any;
}

// Cliente es el usuario de la inmobiliaria

export interface Cliente {
  uid: string;
  email: string;
  password: string;
  nombre: string;
  foto: string;
  confirmacion: string;
  ubicacion: any;
}

// Entidad es contacto el cual arrienda o es dueño de la propiedad

export interface Entidad {
  id_entidad: string;
  id_propiedad: string;
  nombre: string;
  apellidop: string;
  apellidom: string;
  rut: string;
  tipoContacto: string;
  tipoEntidad: string; // Persona natural / empresa
  giro: string; // Solo para empresas
  email: string;
  direccion: string;
  telefono: string;
  tipoServicio: string;
}

export interface Cuentas {
  idCuentas: string;
  id_propiedad: string;
  tipoCuenta: string;
  empresa: string;
  numCliente: string;
}

export interface Gastos {
  Estado: string;
  Nombre_emisor: string;
  Num_documento: number;
  Numero_cliente: string;
  Total: number;
  fecha_emision: Date;
  fecha_vencimiento: Date;
  rut_emisor: string;
  neto: number;
  id_documento: string;
  iva: number;
  giro: string;
}

export interface Estado {
  id: string;
  id_propiedad: string;
  puertas: string;
  piso: string;
  paredes: string;
  ventanas: string;
  muebles: string;
  cocina: string;
  foto: string;
  bano: string;
  dormitorios: string;
  sala: string;
  cielo: string;
  enchufes: string;
  grifos: string;
  observacion: string;
  fecha: Date;
}

export interface Soporte {
  name: string;
  email: string;
  idSoporte: string;
  mensaje: string;
}

export interface Historial {
  id_historial: string;
  id_responsable: string;
  id_propiedad: string;
  fecha: Date;
  tipo: string;
  estado: string;
  condicion: string;
  ubicacion: any;
}

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
export interface Itd {

  id: string;

  fechaCreacion: Date;

  sellerId: string;

  sellerNombre: string;

  ocPedido: string;

  documento: string;

  sku: string;

  descripcion: string;

  cantidad: number;

  estadoProducto:
    | 'BUEN_ESTADO'
    | 'RECUPERABLE'
    | 'MAL_ESTADO';

  responsableCreacion: string;

  cargoCreacion: string;

}
export interface HistorialItd {

  id: string;

  itdId: string;

  fechaGestion: Date;

  observacion: string;

  compensacion: string;

  responsableGestion: string;

  cargoGestion: string;

}