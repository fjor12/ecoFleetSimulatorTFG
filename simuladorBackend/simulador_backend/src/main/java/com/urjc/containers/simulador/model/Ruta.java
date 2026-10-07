package com.urjc.containers.simulador.model;

import java.awt.Color;
import java.util.ArrayList;
import java.util.UUID;

public class Ruta {
	private UUID id;
	private ArrayList<Coordenada> path;
	private String nombre;
	private Color color;
	public Ruta(Color color) {
		this.path = new ArrayList<>();
		this.color = color;
	}

	public String getNombre() {
		return nombre;
	}

	public void setNombre(String nombre) {
		this.nombre = nombre;
	}

	public ArrayList<Coordenada> getPath() {
		return path;
	}

	public void setPath(ArrayList<Coordenada> path) {
		this.path = path;
	}
	
	public void addCoordenada(Coordenada c) {
		path.add(c);
	}

	public UUID getId() {
		return id;
	}

	public void setId(UUID id) {
		this.id = id;
	}
	
	public double getDistanciaTotal() {
		if (path.size() < 2) return 0.0;

		double distanciaTotal = 0.0;
		for (int i = 1; i < path.size(); i++) {
			Coordenada c1 = path.get(i - 1);
			Coordenada c2 = path.get(i);
			distanciaTotal += calcularDistancia(c1, c2);
		}
		return distanciaTotal/1000;
	}

	private double calcularDistancia(Coordenada c1, Coordenada c2) {
		final int R = 6371000; // Radio de la Tierra en metros
		double lat1 = Math.toRadians(c1.getLat());
		double lat2 = Math.toRadians(c2.getLat());
		double deltaLat = Math.toRadians(c2.getLat() - c1.getLat());
		double deltaLon = Math.toRadians(c2.getLon() - c1.getLon());

		double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2)
				+ Math.cos(lat1) * Math.cos(lat2)
				* Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

		double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c;
	}
}
