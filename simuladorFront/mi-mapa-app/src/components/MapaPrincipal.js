import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { iconoCamion, iconoContenedor } from '../icons/CustomIcons';
import MoverCamion from './MoverCamion';
import './ContenedoresLista.css';
import '../App.css';

const coloresRuta = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899', '#f97316'];

const estilosTileLayer = {
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  satellite: {
    url: 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
    attribution: '&copy; Google',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
  },
};

function MapaPrincipal({ mostrarLista, mostrarRutaPersonalizada, onCerrarLista }) {
  const [camiones, setCamiones] = useState([]);
  const [contenedores, setContenedores] = useState([]);
  const [marcados, setMarcados] = useState({});
  const [contenedoresMarcados, setContenedoresMarcados] = useState([]);
  const [filtro, setFiltro] = useState('');
  const markerRefs = useRef({});
  const [marcadosCamiones, setMarcadosCamiones] = useState({});
  const [contenedoresMarcadosRuta, setContenedoresMarcadosRuta] = useState({});
  const [estiloMapa, setEstiloMapa] = useState('osm');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const estiloGuardado = localStorage.getItem('estiloMapa');
    if (estiloGuardado && estilosTileLayer[estiloGuardado]) {
      setEstiloMapa(estiloGuardado);
    }
  }, []);

  useEffect(() => {
    async function fetchDatos() {
      try {
        const [resCamiones, resContenedores] = await Promise.all([
          fetch('http://localhost:8080/api/camiones'),
          fetch('http://localhost:8080/api/contenedores'),
        ]);
        setCamiones(await resCamiones.json());
        setContenedores(await resContenedores.json());
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setCargando(false);
      }
    }
    fetchDatos();
  }, []);

  const toggleCamion = (id) => {
    setMarcadosCamiones(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleContenedor = (id) => {
    setMarcados(prev => prev[id] ? {} : { [id]: true });
  };

  const toggleContenedorRuta = (id) => {
    setContenedoresMarcadosRuta(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const center = [40.294, -3.809];

  const guardarSeleccion = () => {
    const seleccionados = contenedores.filter(c => marcados[c.id]);
    setContenedoresMarcados(seleccionados);
  };

  const guardarSeleccionRuta = async () => {
    const seleccionados = contenedores.filter(c => contenedoresMarcadosRuta[c.id]);
    if (seleccionados.length === 0) return;

    try {
      const response = await fetch('http://localhost:8080/api/ruta/personalizada', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seleccionados)
      });
      if (!response.ok) {
        console.error('Error al enviar ruta');
      }
    } catch (error) {
      console.error('Error al enviar la ruta personalizada:', error);
    }
  };

  useEffect(() => {
    contenedoresMarcados.forEach((c) => {
      const ref = markerRefs.current[c.id];
      if (ref) ref.openPopup();
    });
  }, [contenedoresMarcados]);

  const startTimeRef = useRef(performance.now());

  const contenedoresFiltrados = contenedores.filter(c =>
    c.address.toLowerCase().includes(filtro.toLowerCase()) ||
    c.district.toLowerCase().includes(filtro.toLowerCase())
  );

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Cargando mapa...</span>
      </div>
    );
  }

  return (
    <>
      {/* Buscador de contenedores */}
      {mostrarLista && (
        <div className="map-panel">
          <div className="lista-contenedores">
            <input
              type="text"
              className="input-field"
              placeholder="Buscar contenedor por dirección o distrito..."
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
            <ul className="contenedor-list">
              {contenedoresFiltrados.map(c => (
                <li
                  key={c.id}
                  className={`contenedor-item ${marcados[c.id] ? 'selected' : ''}`}
                >
                  <label className="contenedor-label">
                    <input
                      type="checkbox"
                      checked={!!marcados[c.id]}
                      onChange={() => toggleContenedor(c.id)}
                    />
                    <strong>{c.address}</strong>
                    <span className="contenedor-district">{c.district}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
          <div className="map-panel-actions">
            <button className="boton-guardar-seleccion" onClick={guardarSeleccion}>
              📍 Localizar en el mapa
            </button>
            <button className="boton-guardar-seleccion" onClick={onCerrarLista}>
              Ocultar
            </button>
          </div>
        </div>
      )}

      {/* Ruta personalizada */}
      {mostrarRutaPersonalizada && (
        <div className="map-panel">
          <div className="map-panel-row">
            <div className="lista-contenedores">
              <input
                type="text"
                className="input-field"
                placeholder="Buscar contenedores para la ruta..."
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
            </div>

            <div className="lista-contenedores">
              <h4 className="panel-subtitle">Asignar camión</h4>
              <ul className="contenedor-list">
                {camiones.map(c => (
                  <li
                    key={c.id}
                    className={`contenedor-item ${marcadosCamiones?.[c.id] ? 'selected' : ''}`}
                  >
                    <label className="contenedor-label">
                      <input
                        type="checkbox"
                        checked={!!marcadosCamiones?.[c.id]}
                        onChange={() => toggleCamion(c.id)}
                      />
                      <strong>Camión {c.id}</strong>
                      <span className="contenedor-district">Cap: {c.capacidadDisponible}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="map-panel-actions">
            <button className="boton-guardar-seleccion" onClick={guardarSeleccionRuta}>
              Generar ruta
            </button>
            <button className="boton-guardar-seleccion" onClick={() => { setMarcados({}); setContenedoresMarcadosRuta({}); }}>
              Limpiar
            </button>
            <button className="boton-guardar-seleccion" onClick={onCerrarLista}>
              Ocultar
            </button>
          </div>
        </div>
      )}

      {/* Mapa */}
      <div className="map-container">
        <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%', borderRadius: '12px' }}>
          <TileLayer
            url={estilosTileLayer[estiloMapa].url}
            attribution={estilosTileLayer[estiloMapa].attribution}
            {...(estilosTileLayer[estiloMapa].subdomains ? { subdomains: estilosTileLayer[estiloMapa].subdomains } : {})}
          />

          {camiones.map((camion, index) => {
            const ruta = camion.ruta?.path?.map(coord => [coord.lat, coord.lon]) || [];
            const color = coloresRuta[index % coloresRuta.length];
            const velocidad = camion.velocidad;

            return (
              <React.Fragment key={camion.id}>
                {ruta.length > 1 && (
                  <MoverCamion
                    ruta={ruta}
                    color={color}
                    velocidad={velocidad}
                    id={camion.id}
                    capacidad={camion.capacidadDisponible}
                    contenedores={contenedores}
                    setContenedores={setContenedores}
                    startTime={startTimeRef.current}
                  />
                )}
              </React.Fragment>
            );
          })}

          {contenedores.map(container => (
            <Marker
              key={container.id}
              position={[container.coordenada.lat, container.coordenada.lon]}
              icon={iconoContenedor}
              zIndexOffset={0}
              ref={(ref) => { if (ref) markerRefs.current[container.id] = ref; }}
            >
              <Popup>
                <div className="popup-content">
                  <strong>{container.address}</strong>
                  <span>Distrito: {container.district}</span>
                  <span>Estado: {container.procesado ? '✅ Procesado' : '⏳ Pendiente'}</span>
                  <span>Capacidad: {container.capacidadUsada}%</span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  );
}

export default MapaPrincipal;
