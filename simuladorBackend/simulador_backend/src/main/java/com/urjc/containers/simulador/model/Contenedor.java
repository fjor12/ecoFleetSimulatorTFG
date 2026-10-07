package com.urjc.containers.simulador.model;

public class Contenedor {
	private long id;
	private String type;
	private String district;
	private String address;
	private int rest;
	private int packaging;
	private int glass;
	private int paper;
	private Coordenada coordenada;
	private boolean procesado;
	private double capacidadUsada;

	public Contenedor() {
		this.procesado = false;
	}


	/**
	 * @return the id
	 */
	public long getId() {
		return id;
	}


	/**
	 * @param id the id to set
	 */
	public void setId(long id) {
		this.id = id;
	}


	/**
	 * @return the type
	 */
	public String getType() {
		return type;
	}


	/**
	 * @param type the type to set
	 */
	public void setType(String type) {
		this.type = type;
	}


	/**
	 * @return the district
	 */
	public String getDistrict() {
		return district;
	}


	/**
	 * @param district the district to set
	 */
	public void setDistrict(String district) {
		this.district = district;
	}


	/**
	 * @return the address
	 */
	public String getAddress() {
		return address;
	}


	/**
	 * @param address the address to set
	 */
	public void setAddress(String address) {
		this.address = address;
	}


	/**
	 * @return the rest
	 */
	public int getRest() {
		return rest;
	}


	/**
	 * @param rest the rest to set
	 */
	public void setRest(int rest) {
		this.rest = rest;
	}


	/**
	 * @return the packaging
	 */
	public int getPackaging() {
		return packaging;
	}


	/**
	 * @param packaging the packaging to set
	 */
	public void setPackaging(int packaging) {
		this.packaging = packaging;
	}


	/**
	 * @return the glass
	 */
	public int getGlass() {
		return glass;
	}


	/**
	 * @param glass the glass to set
	 */
	public void setGlass(int glass) {
		this.glass = glass;
	}


	/**
	 * @return the paper
	 */
	public int getPaper() {
		return paper;
	}

	
	/**
	 * @return the procesado
	 */
	public boolean isProcesado() {
		return procesado;
	}


	/**
	 * @param procesado the procesado to set
	 */
	public void setProcesado(boolean procesado) {
		this.procesado = procesado;
	}


	/**
	 * @param paper the paper to set
	 */
	public void setPaper(int paper) {
		this.paper = paper;
	}

	/**
	 * @return the capacidadUsada
	 */
	public double getCapacidadUsada() {
		return capacidadUsada;
	}


	/**
	 * @param capacidadUsada the capacidadUsada to set
	 */
	public void setCapacidadUsada(double capacidadUsada) {
		this.capacidadUsada = capacidadUsada;
	}


	public Coordenada getCoordenada() {
		return coordenada;
	}


	public void setCoordenada(Coordenada coordenada) {
		this.coordenada = coordenada;
	}

	
	
	
}