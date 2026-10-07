package com.urjc.containers.simulador.model;

import java.util.UUID;

public class CamionDTO {
	
	private double capacidadDisponible;
	private double velocidad;
	private String color;
	private UUID id;  // ID de la ruta seleccionada desde el frontend
		public double getCapacidadDisponible() {
			return capacidadDisponible;
		}
		public void setCapacidadDisponible(double capacidadDisponible) {
			this.capacidadDisponible = capacidadDisponible;
		}
		public double getVelocidad() {
			return velocidad;
		}
		public void setVelocidad(double velocidad) {
			this.velocidad = velocidad;
		}
		public String getColor() {
			return color;
		}
		public void setColor(String color) {
			this.color = color;
		}
		public UUID getId() {
			return id;
		}
		public void setId(UUID rutaId) {
			this.id = rutaId;
		}
	

}
