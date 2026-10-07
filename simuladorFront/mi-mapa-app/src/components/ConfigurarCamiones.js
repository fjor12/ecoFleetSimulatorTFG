import React, { useEffect, useState } from 'react';
import './ConfigurarCamiones.css';

function ConfigurarCamiones() {
  const [camiones, setCamiones] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nuevoCamion, setNuevoCamion] = useState({
    capacidadDisponible: '',
    velocidad: '',
    path: ''
  });

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:8080/api/camiones').then(r => r.json()),
      fetch('http://localhost:8080/api/ruta/list').then(r => r.json())
    ]).then(([cam, rut]) => {
      setCamiones(cam);
      setRutas(rut);
      setCargando(false);
    }).catch(err => {
      console.error('Error cargando datos:', err);
      setCargando(false);
    });
  }, []);

  const cargarCamiones = () => {
    fetch('http://localhost:8080/api/camiones')
      .then(res => res.json())
      .then(data => setCamiones(data))
      .catch(err => console.error('Error al cargar camiones:', err));
  };

  const handleInputChange = (e) => {
    setNuevoCamion({ ...nuevoCamion, [e.target.name]: e.target.value });
  };

  const agregarCamion = () => {
    if (!nuevoCamion.capacidadDisponible || !nuevoCamion.velocidad || !nuevoCamion.path) {
      return;
    }

    const camionAEnviar = {
      capacidadDisponible: nuevoCamion.capacidadDisponible,
      velocidad: nuevoCamion.velocidad,
      color: nuevoCamion.color,
      id: nuevoCamion.path
    };

    fetch('http://localhost:8080/api/camiones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(camionAEnviar)
    })
      .then(res => {
        if (res.ok) {
          cargarCamiones();
          setNuevoCamion({ capacidadDisponible: '', velocidad: '', color: '', path: '' });
        }
      })
      .catch(err => console.error('Error en la petición:', err));
  };

  const borrarCamion = (id) => {
    fetch(`http://localhost:8080/api/camiones/${id}`, { method: 'DELETE' })
      .then(res => { if (res.ok) cargarCamiones(); });
  };

  if (cargando) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <span className="loading-text">Cargando camiones...</span>
      </div>
    );
  }

  return (
    <div className="camiones-wrapper">
      {/* TABLA */}
      <div className="camiones-section">
        <div className="section-header">
          <h2 className="section-heading">Flota de Camiones</h2>
          <span className="section-count">{camiones.length} camiones</span>
        </div>

        {camiones.length === 0 ? (
          <div className="camiones-empty">
            <span className="empty-icon-sm">🚛</span>
            <p>No hay camiones configurados. Añade uno nuevo.</p>
          </div>
        ) : (
          <div className="camiones-table-wrap">
            <table className="camiones-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Capacidad (kg)</th>
                  <th>Velocidad (km/h)</th>
                  <th>Ruta</th>
                  <th>Recogidos</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {camiones.map(camion => (
                  <tr key={camion.id}>
                    <td><span className="id-badge">#{camion.id}</span></td>
                    <td>{camion.capacidadDisponible}</td>
                    <td>{camion.velocidad}</td>
                    <td>{camion.nombreRuta || '—'}</td>
                    <td>{camion.contenedoresRecogidos}</td>
                    <td>
                      <span className={`status-tag ${camion.lleno ? 'tag-full' : 'tag-active'}`}>
                        {camion.lleno ? 'Lleno' : 'Activo'}
                      </span>
                    </td>
                    <td>
                      <button className="btn-delete" onClick={() => borrarCamion(camion.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FORMULARIO */}
      <div className="camiones-form-card">
        <h3 className="form-heading">Añadir Nuevo Camión</h3>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Capacidad (kg)</label>
            <input
              type="number"
              name="capacidadDisponible"
              className="input-field"
              placeholder="Ej: 3000"
              value={nuevoCamion.capacidadDisponible}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Velocidad (km/h)</label>
            <input
              type="number"
              name="velocidad"
              className="input-field"
              placeholder="Ej: 40"
              value={nuevoCamion.velocidad}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Ruta asignada</label>
            <select
              name="path"
              className="select-field"
              value={nuevoCamion.path}
              onChange={handleInputChange}
            >
              <option value="">Selecciona una ruta</option>
              {rutas.map((ruta) => (
                <option key={ruta.id} value={ruta.id}>
                  {ruta.nombre || `Ruta #${ruta.id}`}
                </option>
              ))}
            </select>
          </div>
        </div>
        <button
          className="btn btn-success btn-add"
          onClick={agregarCamion}
          disabled={!nuevoCamion.capacidadDisponible || !nuevoCamion.velocidad || !nuevoCamion.path}
        >
          ➕ Añadir Camión
        </button>
      </div>
    </div>
  );
}

export default ConfigurarCamiones;
