package com.urjc.containers.simulador.model;

import com.urjc.containers.simulador.utils.Constantes;

public class Camion {

	public enum Estado {
		ESPERANDO, EN_RUTA, RECOGIENDO, COMPLETADO
	}

	private int id;
	private Ruta ruta;
	private Coordenada posicion;
	private double capacidadInicial;
	private double capacidadDisponible;
	private double velocidad;
	private int contenedoresRecogidos;
	private String color;
	private String nombreRuta;
	private double vidrioRecogido;
	private double papelRecogido;
	private double restoRecogido;
	private double porcentajeCargaUsado;
	private double tiempoTotal;
	private double distanciaRecorrida;
	private boolean lleno;
	private Estado estado;
	private long inicioRutaMs;

	public Camion(int id, Ruta ruta, double capacidadDisponible, double velocidad, String nombreRuta) {
		this.ruta = ruta;
		this.id = id;
		this.posicion = new Coordenada(Constantes.CONST_GEOPOS_MAD_X, Constantes.CONST_GEOPOS_MAD_Y);
		this.capacidadInicial = capacidadDisponible;
		this.capacidadDisponible = capacidadDisponible;
		this.velocidad = velocidad;
		this.contenedoresRecogidos = 0;
		this.nombreRuta = nombreRuta;
		this.vidrioRecogido = 0;
		this.papelRecogido = 0;
		this.restoRecogido = 0;
		this.porcentajeCargaUsado = 0;
		this.tiempoTotal = 0;
		this.distanciaRecorrida = 0;
		this.lleno = false;
		this.estado = Estado.ESPERANDO;
		this.inicioRutaMs = 0;
	}


	public String getColor() {
		return color;
	}


	public void setColor(String color) {
		this.color = color;
	}


	public String getNombreRuta() {
		return nombreRuta;
	}


	public void setNombreRuta(String nombreRuta) {
		this.nombreRuta = nombreRuta;
	}


	public double getVidrioRecogido() {
		return vidrioRecogido;
	}


	public void setVidrioRecogido(double vidrioRecogido) {
		this.vidrioRecogido = vidrioRecogido;
	}


	public double getPapelRecogido() {
		return papelRecogido;
	}


	public void setPapelRecogido(double papelRecogido) {
		this.papelRecogido = papelRecogido;
	}


	public double getRestoRecogido() {
		return restoRecogido;
	}


	public void setRestoRecogido(double restoRecogido) {
		this.restoRecogido = restoRecogido;
	}


	public double getPorcentajeCargaUsado() {
		return porcentajeCargaUsado;
	}


	public void setPorcentajeCargaUsado(double porcentajeCargaUsado) {
		this.porcentajeCargaUsado = porcentajeCargaUsado;
	}


	public double getTiempoTotal() {
		return tiempoTotal;
	}


	public void setTiempoTotal(double tiempoTotal) {
		this.tiempoTotal = tiempoTotal;
	}


	public double getDistanciaRecorrida() {
		return distanciaRecorrida;
	}


	public void setDistanciaRecorrida(double distanciaRecorrida) {
		this.distanciaRecorrida = distanciaRecorrida;
	}


	public boolean isLleno() {
		return lleno;
	}


	public void setLleno(boolean lleno) {
		this.lleno = lleno;
	}


	public double getVelocidad() {
		return velocidad;
	}


	public void setVelocidad(double velocidad) {
		this.velocidad = velocidad;
	}


	public int getContenedoresRecogidos() {
		return contenedoresRecogidos;
	}


	public void setContenedoresRecogidos(int contenedoresRecogidos) {
		this.contenedoresRecogidos = contenedoresRecogidos;
	}


	/**
	 * @return the id
	 */
	public int getId() {
		return id;
	}

	/**
	 * @param id the id to set
	 */
	public void setId(int id) {
		this.id = id;
	}
	
	


	public Ruta getRuta() {
		return ruta;
	}


	public void setRuta(Ruta ruta) {
		this.ruta = ruta;
	}


	public Coordenada getPosicion() {
		return posicion;
	}


	public void setPosicion(Coordenada posicion) {
		this.posicion = posicion;
	}


	/**
	 * @return the capacidadDisponible
	 */
	public double getCapacidadDisponible() {
		return capacidadDisponible;
	}

	/**
	 * @param capacidadDisponible the capacidadDisponible to set
	 */
	public void setCapacidadDisponible(double capacidadDisponible) {
		this.capacidadDisponible = capacidadDisponible;
	}

	public double getCapacidadInicial() {
		return capacidadInicial;
	}

	public Estado getEstado() {
		return estado;
	}

	public void setEstado(Estado estado) {
		this.estado = estado;
	}

	public long getInicioRutaMs() {
		return inicioRutaMs;
	}

	public void setInicioRutaMs(long inicioRutaMs) {
		this.inicioRutaMs = inicioRutaMs;
	}

}
