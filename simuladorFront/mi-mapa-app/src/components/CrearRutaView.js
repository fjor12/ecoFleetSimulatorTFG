import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function CrearRutaView({ onCerrarLista }) {
  const [contenedores, setContenedores] = useState([]);
  const [filtro, setFiltro] = useState('');
  const [contenedoresMarcadosRuta, setContenedoresMarcadosRuta] = useState({});
  const [rutasGeneradas, setRutasGeneradas] = useState([]);
  const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
  const [nombreRuta, setNombreRuta] = useState('');
  const [cargando, setCargando] = useState(true);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    async function fetchDatos() {
      try {
        const [resContenedores, resRutas] = await Promise.all([
          fetch('http://localhost:8080/api/contenedores'),
          fetch('http://localhost:8080/api/ruta/list'),
        ]);
        setContenedores(await resContenedores.json());
        setRutasGeneradas(await resRutas.json());
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    }
    fetchDatos();
  }, []);

  const toggleContenedorRuta = (id) => {
    setContenedoresMarcadosRuta(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const seleccionadosCount = Object.values(contenedoresMarcadosRuta).filter(Boolean).length;

  const guardarSeleccionRuta = async () => {
    const seleccionados = contenedores.filter(c => contenedoresMarcadosRuta[c.id]);
    if (seleccionados.length === 0 || !nombreRuta.trim()) return;

    setGenerando(true);
    try {
      const response = await fetch('http://localhost:8080/api/ruta/personalizada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nombreRuta, contenedores: seleccionados })
      });

      if (response.ok) {
        const nuevaRuta = await response.json();
        setRutasGeneradas(prev => [...prev, nuevaRuta]);
        setContenedoresMarcadosRuta({});
        setNombreRuta('');
      }
    } catch (error) {
      console.error('Error al enviar la ruta personalizada:', error);
    } finally {
      setGenerando(false);
    }
  };

  const eliminarRuta = (id) => {
    setRutasGeneradas(prev => prev.filter(r => r.id !== id));
    if (rutaSeleccionada?.id === id) setRutaSeleccionada(null);
  };

  const getRutaCenter = (ruta) => {
    if (!ruta?.path?.length) return [40.4168, -3.7038];
    const lats = ruta.path.map(p => p.lat);
    const lons = ruta.path.map(p => p.lon);
    return [lats.reduce((a, b) => a + b, 0) / lats.length, lons.reduce((a, b) => a + b, 0) / lons.length];
  };

  function FlyToRuta({ ruta }) {
    const map = useMap();
    useEffect(() => {
      if (ruta?.path?.length > 0) {
        map.flyTo(getRutaCenter(ruta), 15, { duration: 1.5 });
      }
    }, [ruta, map]);
    return null;
  }

  const contenedoresFiltrados = contenedores.filter(c =>
    c.address.toLowerCase().includes(filtro.toLowerCase()) ||
    c.district.toLowerCase().includes(filtro.toLowerCase())
  );

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Cargando datos...</span>
      </div>
    );
  }

  return (
    <div className="crear-ruta-wrapper">
      <div className="crear-ruta-panels">
        {/* Panel contenedores */}
        <div className="lista-contenedores">
          <input
            type="text"
            className="input-field"
            placeholder="Buscar contenedores..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
          <ul className="contenedor-list">
            {contenedoresFiltrados.map(c => (
              <li
                key={c.id}
                className={`contenedor-item ${contenedoresMarcadosRuta[c.id] ? 'selected' : ''}`}
              >
                <label className="contenedor-label">
                  <input
                    type="checkbox"
                    checked={!!contenedoresMarcadosRuta[c.id]}
                    onChange={() => toggleContenedorRuta(c.id)}
                  />
                  <strong>{c.address}</strong>
                  <span className="contenedor-district">{c.district}</span>
                </label>
              </li>
            ))}
          </ul>
          {seleccionadosCount > 0 && (
            <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              {seleccionadosCount} contenedor(es) seleccionado(s)
            </div>
          )}
        </div>

        {/* Panel rutas generadas */}
        <div className="lista-contenedores">
          <h4 className="panel-subtitle">Rutas generadas ({rutasGeneradas.length})</h4>
          {rutasGeneradas.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-light)', fontSize: '0.85rem' }}>
              Sin rutas aún. Crea la primera.
            </div>
          ) : (
            <ul className="contenedor-list">
              {rutasGeneradas.map((ruta, index) => (
                <li
                  key={ruta.id}
                  className={`contenedor-item ${rutaSeleccionada?.id === ruta.id ? 'selected' : ''}`}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span
                    onClick={() => setRutaSeleccionada(ruta)}
                    style={{ cursor: 'pointer', flex: 1, fontSize: '0.9rem' }}
                  >
                    {ruta.nombre || `Ruta ${index + 1}`}
                  </span>
                  <button
                    className="btn-delete"
                    onClick={(e) => { e.stopPropagation(); eliminarRuta(ruta.id); }}
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Nombre + Botón */}
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Nombre de la ruta
          </label>
          <input
            type="text"
            className="input-field"
            value={nombreRuta}
            onChange={(e) => setNombreRuta(e.target.value)}
            placeholder="Ej: Ruta Centro Norte"
          />
        </div>
        <button
          className="btn btn-success"
          onClick={guardarSeleccionRuta}
          disabled={!nombreRuta.trim() || seleccionadosCount === 0 || generando}
          style={{ whiteSpace: 'nowrap', height: '42px' }}
        >
          {generando ? 'Generando...' : '➕ Crear ruta'}
        </button>
      </div>

      {/* Mapa */}
      {rutaSeleccionada?.path?.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 12px', color: 'var(--text-primary)' }}>
            Vista previa: {rutaSeleccionada.nombre}
          </h4>
          <div className="map-container" style={{ height: '400px' }}>
            <MapContainer center={getRutaCenter(rutaSeleccionada)} zoom={14} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Polyline
                positions={rutaSeleccionada.path.map(p => [p.lat, p.lon])}
                pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.8 }}
              />
              <FlyToRuta ruta={rutaSeleccionada} />
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default CrearRutaView;
