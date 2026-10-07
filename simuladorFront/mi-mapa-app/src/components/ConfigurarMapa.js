import React, { useState } from 'react';
import './ConfigurarMapa.css';

const estilosDisponibles = [
    {
        id: 'osm',
        nombre: 'OpenStreetMap',
        descripcion: 'Mapa clásico con calles y detalles',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        preview: 'https://tile.openstreetmap.org/10/511/383.png'
    },
    {
        id: 'satellite',
        nombre: 'Satélite',
        descripcion: 'Vista aérea por satélite',
        url: 'https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        preview: 'https://mt1.google.com/vt/lyrs=s&x=511&y=383&z=10'
    }
];

function ConfigurarMapa({ onGuardarConfiguracion }) {
    const [estiloSeleccionado, setEstiloSeleccionado] = useState(
        localStorage.getItem('estiloMapa') || 'osm'
    );
    const [guardado, setGuardado] = useState(false);

    const manejarCambioEstilo = (id) => {
        setEstiloSeleccionado(id);
        localStorage.setItem('estiloMapa', id);
        if (onGuardarConfiguracion) {
            onGuardarConfiguracion(id);
        }
        setGuardado(true);
        setTimeout(() => setGuardado(false), 2000);
    };

    return (
        <div className="config-mapa-wrapper">
            <div className="config-mapa-header">
                <h2 className="config-mapa-title">Estilo del Mapa</h2>
                <p className="config-mapa-desc">Selecciona el tipo de visualización para el mapa principal.</p>
            </div>

            <div className="estilos-grid">
                {estilosDisponibles.map((estilo) => (
                    <div
                        key={estilo.id}
                        className={`estilo-card ${estiloSeleccionado === estilo.id ? 'estilo-active' : ''}`}
                        onClick={() => manejarCambioEstilo(estilo.id)}
                    >
                        <div className="estilo-img-wrap">
                            <img src={estilo.preview} alt={estilo.nombre} />
                            {estiloSeleccionado === estilo.id && (
                                <div className="estilo-check">✓</div>
                            )}
                        </div>
                        <div className="estilo-info">
                            <span className="estilo-name">{estilo.nombre}</span>
                            <span className="estilo-desc">{estilo.descripcion}</span>
                        </div>
                    </div>
                ))}
            </div>

            {guardado && (
                <div className="config-toast">
                    ✅ Estilo aplicado correctamente
                </div>
            )}
        </div>
    );
}

export default ConfigurarMapa;
