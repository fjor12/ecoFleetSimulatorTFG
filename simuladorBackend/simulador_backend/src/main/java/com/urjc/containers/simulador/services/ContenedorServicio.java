package com.urjc.containers.simulador.services;


import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;


import com.urjc.containers.simulador.model.Contenedor;
import com.urjc.containers.simulador.model.Coordenada;
import com.urjc.containers.simulador.repository.ContenedorRepository;

@Service
public class ContenedorServicio {
	private final ContenedorRepository contenedorRepository;
	private List<Contenedor> cacheContenedores;

	public ContenedorServicio(ContenedorRepository contenedorRepository) {
		this.contenedorRepository = contenedorRepository;
	}

	public List<Contenedor> obtenerContenedores() {
		if (cacheContenedores == null) {
			cacheContenedores = contenedorRepository.findAll();
		}
		return cacheContenedores;
	}

	public List<Contenedor> buscarCercanos(Coordenada posicionActual, double d) {
		
		return cacheContenedores.stream().filter(c -> 
		distancia(posicionActual, c.getCoordenada()) <= d).collect(Collectors.toList());
	}

	private double distancia(Coordenada a, Coordenada b) {
	    double R = 6371000; // Radio de la tierra en metros
	    double dLat = Math.toRadians(b.getLat() - a.getLat());
	    double dLon = Math.toRadians(b.getLon() - a.getLon());
	    double lat1 = Math.toRadians(a.getLat());
	    double lat2 = Math.toRadians(b.getLat());

	    double aHav = Math.sin(dLat/2) * Math.sin(dLat/2) +
	                  Math.cos(lat1) * Math.cos(lat2) *
	                  Math.sin(dLon/2) * Math.sin(dLon/2);
	    double c = 2 * Math.atan2(Math.sqrt(aHav), Math.sqrt(1-aHav));
	    return R * c;
	}

}
