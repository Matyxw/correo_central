import { useState } from 'react';
import { envioService } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function NuevoEnvioModal({ isOpen, onClose, onSuccess }: Props) {
  const [remitente, setRemitente] = useState('');
  const [destinatario, setDestinatario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await envioService.create({ remitente, destinatario });
      // Si Java nos da el OK (201 Created), limpiamos todo y cerramos
      setRemitente('');
      setDestinatario('');
      onSuccess(); 
      onClose();
    } catch (err: any) {
      // Si mandamos algo mal, atajamos el JSON de error del backend
      setError(err.message || 'Error desconocido al conectar con el clúster');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Registrar Nuevo Envío</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 font-bold text-xl">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg font-medium">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Centro Remitente</label>
              <input
                type="text"
                value={remitente}
                onChange={(e) => setRemitente(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-gray-900 bg-white"
                placeholder="Ej. Centro Logístico Caseros"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Destinatario Final</label>
              <input
                type="text"
                value={destinatario}
                onChange={(e) => setDestinatario(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black outline-none transition-all text-gray-900 bg-white"
                placeholder="Nombre y Apellido"
                required
              />
            </div>
          </div>

          <div className="mt-8 flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-5 py-2.5 text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 flex items-center"
            >
              {loading ? 'Generando UUID...' : 'Registrar Paquete'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}