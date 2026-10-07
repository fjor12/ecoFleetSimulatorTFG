package com.urjc.containers.simulador;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import com.urjc.containers.simulador.model.Camion;
import com.urjc.containers.simulador.model.Contenedor;
import com.urjc.containers.simulador.model.Ruta;
import com.urjc.containers.simulador.repository.CamionRepository;
import com.urjc.containers.simulador.repository.RutaRepository;
import com.urjc.containers.simulador.services.CamionServicio;
import com.urjc.containers.simulador.services.ContenedorServicio;
import com.urjc.containers.simulador.services.RutaServicio;

import java.awt.Color;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class InicializadorMemoria {

	@Autowired
	private ContenedorServicio contenedorServicio;

	@Autowired
	private RutaServicio rutaServicio;

	@Autowired
	private CamionServicio camionServicio;

	@Autowired
	private CamionRepository camionRepo;

	@Autowired
	private RutaRepository rutaRepo;

	@PostConstruct
	public void init() {

	    try {

	        List<Camion> camiones = Optional.ofNullable(camionRepo.findAll())
	                .orElse(Collections.emptyList());

	        List<Object[]> listaRutasInicial = Optional.ofNullable(rutaRepo.findAll())
	                .orElse(Collections.emptyList());

	        List<Contenedor> contenedores = Optional.ofNullable(contenedorServicio.obtenerContenedores())
	                .orElse(Collections.emptyList());

	        if (camiones.isEmpty() || listaRutasInicial.isEmpty() || contenedores.isEmpty()) {
	            return; 
	        }

	        Map<Long, Contenedor> contenedorPorId = contenedores.stream()
	                .filter(Objects::nonNull)
	                .collect(Collectors.toMap(
	                        Contenedor::getId,
	                        Function.identity(),
	                        (a, b) -> a
	                ));

	        Map<String, Ruta> rutasPorNombre = new HashMap<>();

	        for (Object[] fila : listaRutasInicial) {

	            try {
	                if (fila == null || fila.length < 3) {
	                    continue;
	                }

	                String idsRawContenedores = fila[1] instanceof String ? (String) fila[1] : null;
         	                String idRuta = String.valueOf(fila[0]);

	                if (idsRawContenedores == null || idRuta == null || idRuta.isBlank()) {
	                    continue;
	                }

	                List<Contenedor> rutaContenedores = parseIds(idsRawContenedores).stream()
	                        .map(contenedorPorId::get)
	                        .filter(Objects::nonNull)
	                        .toList();

	                if (rutaContenedores.isEmpty()) {
	                    continue;
	                }

	                Ruta ruta = rutaServicio.obtenerRuta(
	                        Color.DARK_GRAY,
	                        new ArrayList<>(rutaContenedores)
	                );
	                ruta.setNombre(idRuta);

	                rutasPorNombre.put(idRuta, ruta);

	            } catch (Exception e) {
	                System.out.println("Error en la ruta: Se ignora e intenta procesar la siguiente");
	            }
	        }

	        for (Camion camion : camiones) {

	            try {
	                if (camion == null || camion.getNombreRuta() == null) {
	                    continue;
	                }

	                Ruta rutaAsignada = rutasPorNombre.get(camion.getNombreRuta());

	                if (rutaAsignada != null) {
	                    camion.setRuta(rutaAsignada);
	                    camionServicio.guardarCamion(camion);
	                }

	            } catch (Exception e) {
	               System.out.println("Error al procesar el camion con id: " + camion.getId());
	            }
	        }

	    } catch (Exception e) {
	    	System.out.println("Error interno global");
	    }
	}

	private List<Long> parseIds(String ids) {
		if (ids == null || ids.isBlank()) {
			return List.of();
		}

		return Arrays.stream(ids.split(",")).map(String::trim).map(Long::valueOf).toList();
	}

}
