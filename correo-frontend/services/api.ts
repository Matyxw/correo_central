// services/api.ts
import { Envio, PageResponse } from '../types/envio';

const API_URL = 'http://localhost:8080/api/envios';

export const envioService = {
  // Obtener todos (Paginado)
  getAll: async (page = 0, size = 20): Promise<PageResponse<Envio>> => {
    const res = await fetch(`${API_URL}?page=${page}&size=${size}`);
    if (!res.ok) throw new Error('Error al cargar envíos');
    return res.json();
  },

  // Obtener por tracking
  getByTracking: async (tracking: string): Promise<Envio> => {
    const res = await fetch(`${API_URL}/${tracking}`);
    if (!res.ok) throw new Error('Envío no encontrado');
    return res.json();
  },

  // Crear envío
  create: async (data: { remitente: string; destinatario: string }): Promise<Envio> => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al crear envío');
    }
    return res.json();
    },
  // Actualizar estado
  actualizarEstado: async (id: string, estadoActual: string): Promise<Envio> => {
    const res = await fetch(`${API_URL}/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estadoActual }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al actualizar el estado');
    }
    return res.json();
  },

  // Cancelar envío (Soft Delete)
  cancelar: async (id: string): Promise<Envio> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al cancelar el envío');
    }
    return res.json();
  },
};