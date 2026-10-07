package com.urjc.containers.simulador.model;

import java.util.List;

public class RutaPersonalizadaDTO {
    private String nombre;
    private List<ContenedorDTO> contenedores;



    public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public List<ContenedorDTO> getContenedores() {
        return contenedores;
    }

    public void setContenedores(List<ContenedorDTO> contenedores) {
        this.contenedores = contenedores;
    }
}
