package com.urjc.containers.simulador.model;

import java.util.List;

public class ResumenGeneralDTO {
	private int totalCamiones;
	private int totalContenedoresRecogidos;
	private double totalDistanciaKm;
	private double totalVidrioKg;
	private double totalPapelKg;
	private double totalRestoKg;
	private double totalResiduosKg;
	private double tiempoPromedioMin;
	private double eficienciaPromedio;
	private double porcentajeCargaPromedio;
	private int camionesLlenos;
	private int camionesEnRuta;
	private int camionesCompletados;
	private int camionesEsperando;
	private double progresoFlotaPromedio;
	private long timestamp;
	private List<CamionEstadisticasDTO> camiones;

	public ResumenGeneralDTO(List<CamionEstadisticasDTO> estadisticas) {
		this.camiones = estadisticas;
		this.totalCamiones = estadisticas.size();
		this.timestamp = System.currentTimeMillis();

		this.totalContenedoresRecogidos = estadisticas.stream()
				.mapToInt(CamionEstadisticasDTO::getContenedoresRecogidos).sum();

		this.totalDistanciaKm = Math.round(
				estadisticas.stream().mapToDouble(CamionEstadisticasDTO::getDistanciaRecorrida).sum() * 100.0) / 100.0;

		this.totalVidrioKg = Math.round(
				estadisticas.stream().mapToDouble(CamionEstadisticasDTO::getVidrioRecogido).sum() * 100.0) / 100.0;
		this.totalPapelKg = Math.round(
				estadisticas.stream().mapToDouble(CamionEstadisticasDTO::getPapelRecogido).sum() * 100.0) / 100.0;
		this.totalRestoKg = Math.round(
				estadisticas.stream().mapToDouble(CamionEstadisticasDTO::getRestoRecogido).sum() * 100.0) / 100.0;
		this.totalResiduosKg = Math.round((this.totalVidrioKg + this.totalPapelKg + this.totalRestoKg) * 100.0) / 100.0;

		this.tiempoPromedioMin = totalCamiones > 0
				? Math.round(estadisticas.stream().mapToDouble(CamionEstadisticasDTO::getTiempoTotal)
						.average().orElse(0.0) * 100.0) / 100.0
				: 0.0;

		this.eficienciaPromedio = totalCamiones > 0
				? Math.round(estadisticas.stream().mapToDouble(CamionEstadisticasDTO::getEficienciaKgPorKm)
						.average().orElse(0.0) * 100.0) / 100.0
				: 0.0;

		this.porcentajeCargaPromedio = totalCamiones > 0
				? Math.round(estadisticas.stream().mapToDouble(CamionEstadisticasDTO::getPorcentajeCargaUsado)
						.average().orElse(0.0) * 100.0) / 100.0
				: 0.0;

		this.camionesLlenos = (int) estadisticas.stream().filter(CamionEstadisticasDTO::isLleno).count();

		this.camionesEnRuta = (int) estadisticas.stream()
				.filter(c -> "EN_RUTA".equals(c.getEstado()) || "RECOGIENDO".equals(c.getEstado())).count();
		this.camionesCompletados = (int) estadisticas.stream()
				.filter(c -> "COMPLETADO".equals(c.getEstado())).count();
		this.camionesEsperando = (int) estadisticas.stream()
				.filter(c -> "ESPERANDO".equals(c.getEstado())).count();

		this.progresoFlotaPromedio = totalCamiones > 0
				? Math.round(estadisticas.stream().mapToDouble(CamionEstadisticasDTO::getProgresoRuta)
						.average().orElse(0.0) * 100.0) / 100.0
				: 0.0;
	}

	public int getTotalCamiones() { return totalCamiones; }
	public int getTotalContenedoresRecogidos() { return totalContenedoresRecogidos; }
	public double getTotalDistanciaKm() { return totalDistanciaKm; }
	public double getTotalVidrioKg() { return totalVidrioKg; }
	public double getTotalPapelKg() { return totalPapelKg; }
	public double getTotalRestoKg() { return totalRestoKg; }
	public double getTotalResiduosKg() { return totalResiduosKg; }
	public double getTiempoPromedioMin() { return tiempoPromedioMin; }
	public double getEficienciaPromedio() { return eficienciaPromedio; }
	public double getPorcentajeCargaPromedio() { return porcentajeCargaPromedio; }
	public int getCamionesLlenos() { return camionesLlenos; }
	public int getCamionesEnRuta() { return camionesEnRuta; }
	public int getCamionesCompletados() { return camionesCompletados; }
	public int getCamionesEsperando() { return camionesEsperando; }
	public double getProgresoFlotaPromedio() { return progresoFlotaPromedio; }
	public long getTimestamp() { return timestamp; }
	public List<CamionEstadisticasDTO> getCamiones() { return camiones; }
}
