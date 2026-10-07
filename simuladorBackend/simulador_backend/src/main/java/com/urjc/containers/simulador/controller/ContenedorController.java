package com.urjc.containers.simulador.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.urjc.containers.simulador.model.Contenedor;

import com.urjc.containers.simulador.services.ContenedorServicio;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/contenedores")
public class ContenedorController {
	private final ContenedorServicio contenedorServicio;
	public ContenedorController(ContenedorServicio contenedorServicio) {
		this.contenedorServicio = contenedorServicio;
	}
	
	@GetMapping
    public List<Contenedor> getContenedores() {
        return contenedorServicio.obtenerContenedores();
    }
}
