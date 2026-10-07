package com.urjc.containers.simulador.model;

public class ContenedorDTO {
    private Long id;
    private String address;
    private String district;
    private double capacidadUsada;
    private boolean procesado;
	public Long getId() {
		return id;
	}
	public void setId(Long id) {
		this.id = id;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getDistrict() {
		return district;
	}
	public void setDistrict(String district) {
		this.district = district;
	}
	public double getCapacidadUsada() {
		return capacidadUsada;
	}
	public void setCapacidadUsada(double capacidadUsada) {
		this.capacidadUsada = capacidadUsada;
	}
	public boolean isProcesado() {
		return procesado;
	}
	public void setProcesado(boolean procesado) {
		this.procesado = procesado;
	}

    // Getters y setters
    
}