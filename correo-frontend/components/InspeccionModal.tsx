import { useState } from 'react';
import { envioService } from '../services/api';
import { Envio } from '../types/envio';

interface Props {
  envio: Envio | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InspeccionModal({ envio, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!envio) return null;

  const esTerminal = envio.estadoActual === 'ENTREGADO' || envio.estadoActual === 'CANCELADO';

  const handleTransicion = async (nuevoEstado: string) => {
    setLoading(true);
    setError('');
    try {
      if (nuevoEstado === 'CANCELADO') {
        await envioService.cancelar(envio.id);
      } else {
        await envioService.actualizarEstado(envio.id, nuevoEstado);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error en la transición de estado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="text-lg font-bold text-gray-900 font-mono">{envio.trackingNumber}</h3>
            <p className="text-sm text-gray-500">Inspección de Paquete</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 font-bold text-2xl transition-colors">
            ×
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Origen</span>
              <span className="text-gray-900 font-medium">{envio.remitente}</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Destino</span>
              <span className="text-gray-900 font-medium">{envio.destinatario}</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-4 border-b pb-2">Historial de Auditoría</h4>
            <div className="space-y-4">
              {envio.historial.map((evento, idx) => (
                <div key={idx} className="flex gap-4 items-start">
                  <div className="mt-1 w-2 h-2 rounded-full bg-black shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{evento.descripcion}</p>
                    <div className="flex gap-2 text-xs text-gray-500 mt-0.5">
                      <span className="font-mono">{new Date(evento.fechaEvento).toLocaleString('es-AR')}</span>
                      <span>•</span>
                      <span>{evento.ubicacion}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de Control de Estados */}
        {!esTerminal && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Forzar Transición</h4>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => handleTransicion('EN_TRANSITO')} disabled={loading || envio.estadoActual === 'EN_TRANSITO'} className="px-4 py-2 bg-yellow-100 text-yellow-800 text-sm font-bold rounded-md hover:bg-yellow-200 disabled:opacity-50 transition-colors">
                Marcar En Tránsito
              </button>
              <button onClick={() => handleTransicion('EN_SUCURSAL')} disabled={loading || envio.estadoActual === 'EN_SUCURSAL'} className="px-4 py-2 bg-purple-100 text-purple-800 text-sm font-bold rounded-md hover:bg-purple-200 disabled:opacity-50 transition-colors">
                Marcar En Sucursal
              </button>
              <button onClick={() => handleTransicion('ENTREGADO')} disabled={loading} className="px-4 py-2 bg-green-100 text-green-800 text-sm font-bold rounded-md hover:bg-green-200 disabled:opacity-50 transition-colors">
                Confirmar Entrega
              </button>
              <button onClick={() => handleTransicion('CANCELADO')} disabled={loading} className="ml-auto px-4 py-2 bg-red-100 text-red-800 text-sm font-bold rounded-md hover:bg-red-200 disabled:opacity-50 transition-colors">
                Abortar Envío
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}