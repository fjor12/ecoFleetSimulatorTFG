package com.urjc.containers.simulador.model;

public class CamionEstadisticasDTO {
	private int id;
	private String nombreRuta;
	private double capacidadDisponible;
	private double capacidadInicial;
	private int contenedoresRecogidos;
	private double vidrioRecogido;
	private double papelRecogido;
	private double restoRecogido;
	private double porcentajeCargaUsado;
	private double tiempoTotal;
	private double distanciaRecorrida;
	private double distanciaTotalRuta;
	private boolean lleno;
	private double velocidad;
	private double totalResiduosRecogidos;
	private double eficienciaKgPorKm;
	private int totalContenedoresRuta;
	private String estado;
	private double progresoRuta;

	public CamionEstadisticasDTO(Camion camion) {
		this.id = camion.getId();
		this.nombreRuta = camion.getNombreRuta();
		this.capacidadDisponible = Math.round(camion.getCapacidadDisponible() * 100.0) / 100.0;
		this.capacidadInicial = camion.getCapacidadInicial();
		this.contenedoresRecogidos = camion.getContenedoresRecogidos();
		this.vidrioRecogido = camion.getVidrioRecogido();
		this.papelRecogido = camion.getPapelRecogido();
		this.restoRecogido = camion.getRestoRecogido();
		this.velocidad = camion.getVelocidad();
		this.lleno = camion.isLleno();
		this.estado = camion.getEstado().name();

		// Use actual tracked distance/time from the Camion (reported by frontend)
		this.distanciaRecorrida = camion.getDistanciaRecorrida();
		this.tiempoTotal = camion.getTiempoTotal();

		this.distanciaTotalRuta = camion.getRuta() != null
				? Math.round(camion.getRuta().getDistanciaTotal() * 100.0) / 100.0
				: 0.0;

		this.progresoRuta = this.distanciaTotalRuta > 0
				? Math.min(100.0, Math.round((this.distanciaRecorrida / this.distanciaTotalRuta) * 100.0 * 100.0) / 100.0)
				: 0.0;

		this.totalResiduosRecogidos = Math.round(
				(this.vidrioRecogido + this.papelRecogido + this.restoRecogido) * 100.0) / 100.0;

		this.porcentajeCargaUsado = this.capacidadInicial > 0
				? Math.round((this.totalResiduosRecogidos / this.capacidadInicial) * 100.0 * 100.0) / 100.0
				: 0.0;

		this.eficienciaKgPorKm = this.distanciaRecorrida > 0
				? Math.round((this.totalResiduosRecogidos / this.distanciaRecorrida) * 100.0) / 100.0
				: 0.0;

		this.totalContenedoresRuta = (camion.getRuta() != null && camion.getRuta().getPath() != null)
				? camion.getRuta().getPath().size()
				: 0;
	}

	public double getVelocidad() { return velocidad; }
	public int getId() { return id; }
	public String getNombreRuta() { return nombreRuta; }
	public double getCapacidadDisponible() { return capacidadDisponible; }
	public double getCapacidadInicial() { return capacidadInicial; }
	public int getContenedoresRecogidos() { return contenedoresRecogidos; }
	public double getVidrioRecogido() { return vidrioRecogido; }
	public double getPapelRecogido() { return papelRecogido; }
	public double getRestoRecogido() { return restoRecogido; }
	public double getPorcentajeCargaUsado() { return porcentajeCargaUsado; }
	public double getTiempoTotal() { return tiempoTotal; }
	public double getDistanciaRecorrida() { return distanciaRecorrida; }
	public double getDistanciaTotalRuta() { return distanciaTotalRuta; }
	public boolean isLleno() { return lleno; }
	public double getTotalResiduosRecogidos() { return totalResiduosRecogidos; }
	public double getEficienciaKgPorKm() { return eficienciaKgPorKm; }
	public int getTotalContenedoresRuta() { return totalContenedoresRuta; }
	public String getEstado() { return estado; }
	public double getProgresoRuta() { return progresoRuta; }
}
