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
  
  // Estados para el motor de búsqueda
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [busquedaActiva, setBusquedaActiva] = useState(false);

  useEffect(() => {
    cargarEnvios();
  }, []);

  const cargarEnvios = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await envioService.getAll(0, 20);
      setEnvios(data.content);
      setBusquedaActiva(false);
      setTerminoBusqueda('');
    } catch (err) {
      console.error("Fallo real de conexión:", err);
      setError('Fallo la conexión con el núcleo de datos. Revisá la consola (F12).');
    } finally {
      setLoading(false);
    }
  };

  const manejarBusqueda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminoBusqueda.trim()) {
      cargarEnvios();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const envioEncontrado = await envioService.getByTracking(terminoBusqueda.trim());
      setEnvios([envioEncontrado]);
      setBusquedaActiva(true);
    } catch (err: any) {
      setError(`No se encontró ningún paquete con el código de tracking: "${terminoBusqueda}"`);
      setEnvios([]);
      setBusquedaActiva(true);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera Principal */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-sans">ClipperOps Logística</h1>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white px-5 py-2.5 text-sm font-medium rounded-md hover:bg-gray-800 transition-colors shadow-sm"
          >
            + Nuevo Envío
          </button>
        </div>

        {/* BARRA DE BÚSQUEDA TÁCTICA */}
        <form onSubmit={manejarBusqueda} className="mb-6 flex gap-3">
          <input
            type="text"
            placeholder="Buscar por Código de Tracking (Ej: CL-9D1D78D5)..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white text-gray-900 outline-none transition-all font-mono text-sm"
          />
          <button
            type="submit"
            className="bg-gray-900 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors"
          >
            Buscar
          </button>
          {busquedaActiva && (
            <button
              type="button"
              onClick={cargarEnvios}
              className="bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              Limpiar Filtro
            </button>
          )}
        </form>

        {/* Alertas de Error / No encontrado */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium font-mono flex justify-between items-center">
            <span>{error}</span>
            {!busquedaActiva && (
              <button onClick={cargarEnvios} className="underline font-bold text-xs uppercase tracking-wider">Reintentar</button>
            )}
          </div>
        )}

        {/* Tabla de Control Operativo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-mono text-sm">Sincronizando clúster...</div>
          ) : (
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
                  <tr 
                    key={envio.id} 
                    onClick={() => setSelectedEnvio(envio)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {new Date(envio.ultimaActualizacion).toLocaleString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          
          {!loading && envios.length === 0 && !error && (
            <div className="p-12 text-center text-gray-500 font-medium">
              No hay envíos en el clúster.
            </div>
          )}
        </div>

        {/* Modales del Sistema */}
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