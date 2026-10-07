import React, { useState, useEffect, useRef, useCallback } from 'react';
import MapaPrincipal from './components/MapaPrincipal';
import CrearRutaModal from './components/CrearRutaView';
import ConfigurarCamiones from './components/ConfigurarCamiones';
import ConfigurarMapa from './components/ConfigurarMapa'; 
import GenerarInforme from './components/GenerarInforme';
import './App.css';

const menuItems = [
  { id: 'mapa',              icon: '🗺️', label: 'Visualizar Mapa',     section: 'principal' },
  { id: 'localizar',         icon: '📍', label: 'Localizar Contenedor', section: 'principal' },
  { id: 'crearRuta',         icon: '➕', label: 'Crear Ruta',           section: 'rutas' },
  { id: 'generarInforme',    icon: '📊', label: 'Estadísticas',        section: 'analytics' },
  { id: 'configurarCamiones', icon: '🚛', label: 'Configurar Camiones', section: 'config' },
  { id: 'configurarMapa',    icon: '⚙️', label: 'Configurar Mapa',     section: 'config' },
];

const sectionLabels = {
  principal: 'Principal',
  rutas: 'Gestión de Rutas',
  analytics: 'Analytics',
  config: 'Configuración',
};

const STATS_POLL_INTERVAL = 3000;

function App() {
  const [menuMinimizado, setMenuMinimizado] = useState(false);
  const [vistaActual, setVistaActual] = useState('');
  const [contenedores, setContenedores] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const pollRef = useRef(null);

  useEffect(() => {
    fetch('http://localhost:8080/api/contenedores')
      .then(res => res.json())
      .then(data => setContenedores(data))
      .catch(err => console.error('Error cargando contenedores:', err));
  }, []);

  const fetchEstadisticas = useCallback(() => {
    return fetch('http://localhost:8080/api/camiones/estadisticas')
      .then(res => res.json())
      .then(data => {
        setEstadisticas(data);
        return data;
      })
      .catch(err => console.error('Error cargando estadísticas:', err));
  }, []);

  // Auto-refresh polling when on statistics view
  useEffect(() => {
    if (vistaActual === 'generarInforme' && autoRefresh) {
      pollRef.current = setInterval(() => {
        fetchEstadisticas();
      }, STATS_POLL_INTERVAL);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [vistaActual, autoRefresh, fetchEstadisticas]);

  const handleMenuClick = (id) => {
    if (id === 'generarInforme') {
      setCargando(true);
      setVistaActual(id);
      fetchEstadisticas().then(() => setCargando(false));
    } else {
      setVistaActual(id);
    }
  };

  const cerrarVista = () => setVistaActual('');

  const guardarRuta = (idsSeleccionados) => {
    cerrarVista();
  };

  // Group menu items by section
  const sections = [...new Set(menuItems.map(i => i.section))];

  return (
    <div className="app-layout">
      {/* SIDEBAR */}
      <aside className={`sidebar ${menuMinimizado ? 'minimizado' : ''}`}>
        <div className="sidebar-brand">
          <button className="boton-hamburguesa" onClick={() => setMenuMinimizado(!menuMinimizado)}>
            {menuMinimizado ? '▶' : '☰'}
          </button>
          {!menuMinimizado && <span className="sidebar-brand-text">EcoFleet Simulator</span>}
        </div>

        {!menuMinimizado && (
          <nav className="sidebar-nav">
            {sections.map(section => (
              <React.Fragment key={section}>
                <div className="sidebar-section-label">{sectionLabels[section]}</div>
                {menuItems.filter(i => i.section === section).map(item => (
                  <button
                    key={item.id}
                    className={`sidebar-button ${vistaActual === item.id ? 'active' : ''}`}
                    onClick={() => handleMenuClick(item.id)}
                  >
                    <span className="sidebar-button-icon">{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </React.Fragment>
            ))}
          </nav>
        )}
      </aside>

      {/* MAIN */}
      <main className="main-content">
        <header className="app-header">
          <h1 className="app-title">
            {vistaActual ? menuItems.find(i => i.id === vistaActual)?.label || 'EcoFleet' : 'Panel de Control'}
          </h1>
          <p className="app-subtitle">
            {vistaActual
              ? 'Gestión dinámica, rutas optimizadas y control en tiempo real'
              : 'Selecciona una opción del menú para comenzar'}
          </p>
        </header>

        <div className="main-view-area">
          {!vistaActual && (
            <div className="welcome-screen">
              <div className="welcome-icon">🚛</div>
              <h2 className="welcome-title">Bienvenido a EcoFleet Simulator</h2>
              <p className="welcome-desc">
                Gestiona tu flota de camiones, optimiza rutas de recogida de residuos y 
                analiza estadísticas en tiempo real. Selecciona una opción del menú lateral para comenzar.
              </p>
            </div>
          )}

          {vistaActual === 'mapa' && (
            <MapaPrincipal
              mostrarLista={false}
              mostrarRutaPersonalizada={false}
              onCerrarLista={cerrarVista}
            />
          )}

          {vistaActual === 'localizar' && (
            <MapaPrincipal
              mostrarLista={true}
              mostrarRutaPersonalizada={false}
              onCerrarLista={cerrarVista}
            />
          )}

          {vistaActual === 'crearRuta' && (
            <CrearRutaModal
              contenedores={contenedores}
              onCerrar={cerrarVista}
              onGuardar={guardarRuta}
            />
          )}

          {vistaActual === 'configurarCamiones' && (
            <ConfigurarCamiones onVolver={cerrarVista} />
          )}

          {vistaActual === 'configurarMapa' && (
            <ConfigurarMapa onVolver={cerrarVista} />
          )}

          {vistaActual === 'generarInforme' && (
            cargando ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <span className="loading-text">Cargando estadísticas...</span>
              </div>
            ) : (
              <GenerarInforme
                data={estadisticas}
                onVolver={cerrarVista}
                autoRefresh={autoRefresh}
                onToggleAutoRefresh={() => setAutoRefresh(prev => !prev)}
              />
            )
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
