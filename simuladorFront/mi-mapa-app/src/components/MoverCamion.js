// MoverCamion.js
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Marker, Polyline, Tooltip, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

import tup from '../icons/tup.png';
import tdown from '../icons/tdown.png';
import tleft from '../icons/tleft.png';
import tright from '../icons/tRight.png';

const iconosDireccion = {
  up: L.icon({ iconUrl: tup, iconSize: [60, 60] }),
  down: L.icon({ iconUrl: tdown, iconSize: [60, 60] }),
  left: L.icon({ iconUrl: tleft, iconSize: [60, 60] }),
  right: L.icon({ iconUrl: tright, iconSize: [60, 60] })
};

function calcularDireccion(p1, p2) {
  const dx = p2[1] - p1[1];
  const dy = p2[0] - p1[0];
  return Math.abs(dx) > Math.abs(dy)
    ? (dx > 0 ? 'right' : 'left')
    : (dy > 0 ? 'up' : 'down');
}

function MoverCamion({ ruta, color, velocidad, id, capacidad, contenedores, setContenedores }) {
  const [posicion, setPosicion] = useState(ruta[0]);
  const [recorrido, setRecorrido] = useState([ruta[0]]);
  const [direccionActual, setDireccionActual] = useState('right');
  const [contenedoresProcesados, setContenedoresProcesados] = useState(new Set());
  const [recogiendo, setRecogiendo] = useState(false);
  const [capacidadActual, setCapacidadActual] = useState(capacidad);
  const [rutaCompletada, setRutaCompletada] = useState(false);

  const indexRef = useRef(0);
  const progresoRef = useRef(0);
  const animRef = useRef(null);
  const lastTimeRef = useRef(null);
  const velocidadRef = useRef(velocidad);

  // Real-time tracking refs
  const distanciaAcumuladaRef = useRef(0); // meters
  const tiempoAcumuladoRef = useRef(0); // ms
  const lastReportRef = useRef(0); // timestamp of last progress report

  const umbralDistancia = 10; // metros
  const REPORT_INTERVAL_MS = 2000; // report progress every 2 seconds

  useEffect(() => {
    velocidadRef.current = velocidad;
  }, [velocidad]);

  const reportarProgreso = useCallback((pos, force = false) => {
    const now = Date.now();
    if (!force && now - lastReportRef.current < REPORT_INTERVAL_MS) return;
    lastReportRef.current = now;

    const distKm = Math.round((distanciaAcumuladaRef.current / 1000) * 100) / 100;
    axios.post(`http://localhost:8080/api/camiones/${id}/progreso`, {
      lat: pos[0],
      lon: pos[1],
      distanciaKm: distKm,
      tiempoMs: tiempoAcumuladoRef.current
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!ruta || ruta.length < 2) return;

    const mover = (timestamp) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
        animRef.current = requestAnimationFrame(mover);
        return;
      }

      const elapsed = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;

      if (recogiendo) {
        animRef.current = requestAnimationFrame(mover);
        return;
      }

      let idx = indexRef.current;
      if (idx >= ruta.length - 1) {
        if (!rutaCompletada) {
          setRutaCompletada(true);
          reportarProgreso(ruta[ruta.length - 1], true);
          axios.post(`http://localhost:8080/api/camiones/${id}/completar`).catch(() => {});
        }
        return;
      }

      const start = L.latLng(ruta[idx]);
      const end = L.latLng(ruta[idx + 1]);
      const distancia = start.distanceTo(end);
      const avance = velocidadRef.current * elapsed * 0.3;
      progresoRef.current += avance / distancia;

      // Track real distance & time
      distanciaAcumuladaRef.current += avance;
      tiempoAcumuladoRef.current += elapsed * 1000;

      let nuevaPos;
      if (progresoRef.current >= 1) {
        indexRef.current += 1;
        progresoRef.current = 0;
        nuevaPos = ruta[indexRef.current];
        setPosicion(nuevaPos);
        setRecorrido(prev => [...prev, nuevaPos]);

        if (indexRef.current < ruta.length - 1) {
          setDireccionActual(calcularDireccion(ruta[indexRef.current], ruta[indexRef.current + 1]));
        }
      } else {
        const lat = start.lat + (end.lat - start.lat) * progresoRef.current;
        const lon = start.lng + (end.lng - start.lng) * progresoRef.current;
        nuevaPos = [lat, lon];
        setPosicion(nuevaPos);
      }

      // Report progress to backend periodically
      reportarProgreso(nuevaPos);

      // Contenedores
      contenedores.forEach(cont => {
        const contId = cont.id;
        if (contenedoresProcesados.has(contId) || recogiendo) return;

        const distanciaAlContenedor = L.latLng(nuevaPos).distanceTo([cont.coordenada.lat, cont.coordenada.lon]);
        if (distanciaAlContenedor <= umbralDistancia) {
          setRecogiendo(true);

          axios.post(`http://localhost:8080/api/camiones/${id}/recoger`, {
            lat: nuevaPos[0],
            lon: nuevaPos[1]
          }).then(res => {
            if (res.data.recogido) {
              const tiempo = res.data.tiempoEsperaMs || 3000;
              setTimeout(() => {
                const contenedorId = res.data.contenedorId;

                setContenedores(prev =>
                  prev.map(c =>
                    c.id === contenedorId ? { ...c, procesado: true } : c
                  )
                );

                setContenedoresProcesados(prev => {
                  const nuevo = new Set(prev);
                  nuevo.add(contenedorId);
                  return nuevo;
                });

                setCapacidadActual(prev => prev - cont.capacidadUsada);
                setRecogiendo(false);
              }, tiempo);
            } else {
              setRecogiendo(false);
            }
          }).catch(() => setRecogiendo(false));
        }
      });

      animRef.current = requestAnimationFrame(mover);
    };

    animRef.current = requestAnimationFrame(mover);
    return () => cancelAnimationFrame(animRef.current);
  }, [ruta, contenedores, id, recogiendo, rutaCompletada, reportarProgreso]);

  if (!posicion) return null;

  const shadowColor = '#00000033';
  const recorridoColor = color || 'blue';

  return (
    <>
      <Polyline positions={ruta} pathOptions={{ color: shadowColor, weight: 8, opacity: 0.3, lineCap: 'round' }} />
      <Polyline positions={ruta} pathOptions={{ color: recorridoColor, weight: 4, opacity: 0.3, dashArray: '8,8', lineCap: 'round' }} />
      {recorrido.length > 1 && (
        <Polyline positions={recorrido} pathOptions={{ color: recorridoColor, weight: 5, opacity: 1, lineJoin: 'round', lineCap: 'round' }} />
      )}

      <Marker position={posicion} icon={iconosDireccion[direccionActual]} zIndexOffset={1000}>
        <Tooltip direction="top" offset={[0, -10]} permanent>
          🚛 Camión #{id} {rutaCompletada ? '✅' : ''}
        </Tooltip>
        <Popup>
          <strong>Camión #{id}</strong><br />
          <strong>Capacidad disponible:</strong> {Math.round(capacidadActual * 100) / 100}<br />
          <strong>Distancia:</strong> {(distanciaAcumuladaRef.current / 1000).toFixed(2)} km<br />
          <strong>Contenedores recogidos:</strong> {contenedoresProcesados.size}
        </Popup>
      </Marker>
    </>
  );
}

export default MoverCamion;
