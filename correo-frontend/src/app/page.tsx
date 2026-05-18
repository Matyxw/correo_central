'use client';

import { useEffect, useState } from 'react';
import { envioService } from '../../services/api';       
import { Envio } from '../../types/envio';
import NuevoEnvioModal from '../../components/NuevoEnvioModal';
import InspeccionModal from '../../components/InspeccionModal';

export default function Dashboard() {
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnvio, setSelectedEnvio] = useState<Envio | null>(null);

  useEffect(() => {
    cargarEnvios();
  }, []);

  const cargarEnvios = async () => {
    try {
      // Pedimos la página 0 con 20 elementos al motor de Java
      const data = await envioService.getAll(0, 20);
      setEnvios(data.content);
    } catch (err) {
      setError('Fallo la conexión con el núcleo de datos en el puerto 8080.');
    } finally {
      setLoading(false);
    }
  };

  // Motor de renderizado de estados visuales
  const getColorEstado = (estado: string) => {
    const colores: Record<string, string> = {
      'RECIBIDO': 'bg-blue-100 text-blue-800',
      'EN_TRANSITO': 'bg-yellow-100 text-yellow-800',
      'EN_SUCURSAL': 'bg-purple-100 text-purple-800',
      'ENTREGADO': 'bg-green-100 text-green-800',
      'CANCELADO': 'bg-red-100 text-red-800',
    };
    return colores[estado] || 'bg-gray-100 text-gray-800';
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-mono">Sincronizando con ClipperOps Core...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold font-mono">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">ClipperOps Logística</h1>
          <button 
            className="bg-black text-white px-5 py-2.5 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors shadow-sm"
            onClick={() => setIsModalOpen(true)}
          >
            + Nuevo Envío
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tracking</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Ruta</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Última Actividad</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {envios.map((envio) => (
                <tr key={envio.id} 
                  onClick={() => setSelectedEnvio(envio)}
                  className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-gray-900">
                    {envio.trackingNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{envio.remitente}</div>
                    <div className="text-xs text-gray-500">→ {envio.destinatario}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2.5 py-1 inline-flex text-xs font-bold rounded-md ${getColorEstado(envio.estadoActual)}`}>
                      {envio.estadoActual}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(envio.ultimaActualizacion).toLocaleString('es-AR')}
                  </td>
                  
                </tr>
              ))}
            </tbody>
          </table>
          
          {envios.length === 0 && (
            <div className="p-12 text-center text-gray-500 font-medium">
              No hay envíos registrados en el clúster.
            </div>
          )}
        </div>
        <NuevoEnvioModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={cargarEnvios} 
        />
        <InspeccionModal 
          envio={selectedEnvio}
          onClose={() => setSelectedEnvio(null)}
          onSuccess={() => {
            setSelectedEnvio(null);
            cargarEnvios();
          }}
        />
      </div>
    </div>
  );
}