// types/envio.ts

export type EstadoEnvio = 'RECIBIDO' | 'EN_TRANSITO' | 'EN_SUCURSAL' | 'ENTREGADO' | 'CANCELADO';

export interface Evento {
  descripcion: string;
  fechaEvento: string;
  ubicacion: string;
}

export interface Envio {
  id: string;
  trackingNumber: string;
  estadoActual: EstadoEnvio;
  remitente: string;
  destinatario: string;
  historial: Evento[];
  fechaCreacion: string;
  ultimaActualizacion: string;
}

// Interfaz para la respuesta paginada de Spring Boot
export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}