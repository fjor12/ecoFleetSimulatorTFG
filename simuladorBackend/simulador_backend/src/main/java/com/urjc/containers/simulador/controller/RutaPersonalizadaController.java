package com.urjc.containers.simulador.controller;

import java.awt.Color;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urjc.containers.simulador.model.Contenedor;
import com.urjc.containers.simulador.model.ContenedorDTO;

import com.urjc.containers.simulador.model.Ruta;
import com.urjc.containers.simulador.model.RutaPersonalizadaDTO;
import com.urjc.containers.simulador.services.ContenedorServicio;

import com.urjc.containers.simulador.services.RutaServicio;

@RestController
@RequestMapping("/api/ruta")
@CrossOrigin(origins = "http://localhost:3000")
public class RutaPersonalizadaController {

	private final ContenedorServicio contenedorServicio;
	private final RutaServicio rutaServicio;

	public RutaPersonalizadaController(ContenedorServicio contenedorServicio, RutaServicio rutaServicio) {
		this.contenedorServicio = contenedorServicio;
		this.rutaServicio = rutaServicio;
	}

	@PostMapping("/personalizada")
	public ResponseEntity<Ruta> recibirRutaPersonalizada(@RequestBody RutaPersonalizadaDTO dto) {
		System.out.println("Nombre de la ruta: " + dto.getNombre());
		System.out.println("Contenedores recibidos:");
		for (ContenedorDTO contenedor : dto.getContenedores()) {
			System.out.println(" - ID: " + contenedor.getId() + ", Dirección: " + contenedor.getAddress());
		}

		List<Long> ids = dto.getContenedores().stream().map(ContenedorDTO::getId).toList();

		List<Contenedor> listaContenedores = contenedorServicio.obtenerContenedores();
		List<Contenedor> contenedoresFiltrados = listaContenedores.stream().filter(c -> ids.contains(c.getId()))
				.toList();

		Ruta rutaGenerada = rutaServicio.obtenerRuta(Color.BLACK, new ArrayList<>(contenedoresFiltrados));
		rutaGenerada.setNombre(dto.getNombre()); 

		return ResponseEntity.ok(rutaGenerada);
	}

	@GetMapping("/temporal")
	public ResponseEntity<List<UUID>> obtenerTodasLasRutas() {
		List<UUID> ids = rutaServicio.getIdsRutasTemporales();
		return ResponseEntity.ok(ids);
	}

	@GetMapping("/list")
	public ResponseEntity<List<Ruta>> obtenerTodasLasRutasCompletas() {
		List<Ruta> listado = new ArrayList<Ruta>(rutaServicio.getRutasTemporales());
		return ResponseEntity.ok(listado);
	}

	@GetMapping("/temporal/{id}")
	public ResponseEntity<Ruta> obtenerRutaPorId(@PathVariable UUID id) {
		Ruta ruta = rutaServicio.getRutaPorId(id);
		if (ruta == null)
			return ResponseEntity.notFound().build();
		return ResponseEntity.ok(ruta);
	}

}
