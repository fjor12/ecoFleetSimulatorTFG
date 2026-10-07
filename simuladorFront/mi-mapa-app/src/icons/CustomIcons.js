// src/customIcons.js
import L from 'leaflet';
import iconUrlContenedor from './garbage.png';
import iconUrlCamion from './tRight.png';
import 'leaflet/dist/leaflet.css';

// Icono clásico de Leaflet (para camiones)
export const iconoCamion = new L.Icon({
  iconUrl: iconUrlCamion,
  iconSize: [52, 52],        // tamaño del icono
  iconAnchor: [16, 32],      // punto donde "toca" el mapa
  popupAnchor: [0, -32],     // donde aparece el popup
});

// Icono personalizado para contenedores
export const iconoContenedor = new L.Icon({
  iconUrl: iconUrlContenedor,
  iconSize: [32, 32],        // tamaño del icono
  iconAnchor: [16, 32],      // punto donde "toca" el mapa
  popupAnchor: [0, -32],     // donde aparece el popup
});
