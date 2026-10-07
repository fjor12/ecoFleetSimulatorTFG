package com.urjc.containers.simulador.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urjc.containers.simulador.model.Camion;
import com.urjc.containers.simulador.model.CamionDTO;
import com.urjc.containers.simulador.model.CamionEstadisticasDTO;
import com.urjc.containers.simulador.model.Contenedor;
import com.urjc.containers.simulador.model.Coordenada;
import com.urjc.containers.simulador.model.ResumenGeneralDTO;
import com.urjc.containers.simulador.model.Ruta;
import com.urjc.containers.simulador.services.CamionServicio;
import com.urjc.containers.simulador.services.ContenedorServicio;
import com.urjc.containers.simulador.services.RutaServicio;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/camiones")
public class CamionController {

	private final RutaServicio rutaServicio;
	private final ContenedorServicio contenedorServicio;
	private final CamionServicio camionServicio;

	public CamionController(RutaServicio rutaServicio, ContenedorServicio contenedorServicio,
			CamionServicio camionServicio) {
		this.rutaServicio = rutaServicio;
		this.contenedorServicio = contenedorServicio;
		this.camionServicio = camionServicio;
	}

	@GetMapping
	public List<Camion> getCamiones() {
		return camionServicio.getListaCamiones();
	}

	@PostMapping
	public void crearCamion(@RequestBody CamionDTO dto) {

		try {
			UUID rutaId = dto.getId();
			Ruta ruta = rutaServicio.getRutaPorId(rutaId);
			int lastId = camionServicio.getListaCamiones().size() + 1;
			if (ruta != null) {
				Camion c = new Camion(lastId, ruta, dto.getCapacidadDisponible(), dto.getVelocidad(), ruta.getNombre());
				camionServicio.guardarCamion(c);
			}
		} catch (IllegalArgumentException e) {
			System.err.println("Error al crear camion");
		}

	}

	@DeleteMapping("/{id}")
	public void eliminarCamion(@PathVariable long id) {
		camionServicio.eliminarCamion(id);
	}

	@PostMapping("/{id}/recoger")
	public ResponseEntity<?> recogerContenedores(
	        @PathVariable long id,
	        @RequestBody Coordenada posicionActual) {

	    Camion camion = camionServicio.findCamion(id);
	    if (camion == null) {
	        return ResponseEntity.notFound().build();
	    }

	    // Busca contenedores cercanos
	    List<Contenedor> contenedoresCercanos =
	        contenedorServicio.buscarCercanos(posicionActual, 10.0);

	    // Intenta recoger un contenedor
	    Optional<Contenedor> contRecogido =
	        camionServicio.intentarRecogerContenedores(camion, contenedoresCercanos);

	    if (contRecogido.isPresent()) {
	        // Genera un tiempo de espera aleatorio entre 3 y 5 segundos
	        int tiempoEsperaMs = 5000 + new Random().nextInt(4000);

	        Map<String, Object> response = new HashMap<>();
	        response.put("recogido", true);
	        response.put("contenedorId", contRecogido.get().getId());
	        response.put("tiempoEsperaMs", tiempoEsperaMs);

	        return ResponseEntity.ok(response);
	    }

	    // No se recogió ningún contenedor
	    Map<String, Object> response = new HashMap<>();
	    response.put("recogido", false);
	    response.put("contenedorId", null);
	    response.put("tiempoEsperaMs", 0);

	    return ResponseEntity.ok(response);
	}

	@PostMapping("/{id}/progreso")
	public ResponseEntity<?> actualizarProgreso(
	        @PathVariable long id,
	        @RequestBody Map<String, Object> body) {

	    Camion camion = camionServicio.findCamion(id);
	    if (camion == null) {
	        return ResponseEntity.notFound().build();
	    }

	    double lat = ((Number) body.get("lat")).doubleValue();
	    double lon = ((Number) body.get("lon")).doubleValue();
	    double distanciaKm = ((Number) body.get("distanciaKm")).doubleValue();
	    double tiempoMs = ((Number) body.get("tiempoMs")).doubleValue();

	    camionServicio.actualizarProgreso(camion, new Coordenada(lat, lon), distanciaKm, tiempoMs);

	    return ResponseEntity.ok().build();
	}

	@PostMapping("/{id}/completar")
	public ResponseEntity<?> completarRuta(@PathVariable long id) {
	    Camion camion = camionServicio.findCamion(id);
	    if (camion == null) {
	        return ResponseEntity.notFound().build();
	    }
	    camionServicio.marcarCompletado(camion);
	    return ResponseEntity.ok().build();
	}

	
	
	@GetMapping("/estadisticas")
	public ResponseEntity<ResumenGeneralDTO> obtenerEstadisticasCamiones() {
	    List<Camion> camiones = camionServicio.getListaCamiones();
	    List<CamionEstadisticasDTO> estadisticas = camiones.stream()
	        .map(CamionEstadisticasDTO::new)
	        .toList();
	    return ResponseEntity.ok(new ResumenGeneralDTO(estadisticas));
	}
	
}
