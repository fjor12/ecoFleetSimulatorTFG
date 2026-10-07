package com.urjc.containers.simulador.services;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.urjc.containers.simulador.model.Camion;
import com.urjc.containers.simulador.model.Contenedor;
import com.urjc.containers.simulador.model.Coordenada;

@Service
public class CamionServicio {
    private List<Camion> listaCamiones = new ArrayList<>();

    public List<Camion> getListaCamiones() {
        return listaCamiones;
    }

    public void guardarCamion(Camion c) {
        listaCamiones.add(c);
    }

    public void eliminarCamion(long id) {
        Iterator<Camion> iterator = listaCamiones.iterator();
        while (iterator.hasNext()) {
            if (iterator.next().getId() == id) {
                iterator.remove();
                break;
            }
        }
    }

    public Camion findCamion(long id) {
        for (Camion c : listaCamiones) {
            if (c.getId() == id) {
                return c;
            }
        }
        return null;
    }

    public void actualizarProgreso(Camion camion, Coordenada posicion, double distanciaRecorrida, double tiempoMs) {
        camion.setPosicion(posicion);
        camion.setDistanciaRecorrida(Math.round(distanciaRecorrida * 100.0) / 100.0);
        camion.setTiempoTotal(Math.round((tiempoMs / 60000.0) * 100.0) / 100.0);
        
        if (camion.getEstado() == Camion.Estado.ESPERANDO) {
            camion.setEstado(Camion.Estado.EN_RUTA);
            camion.setInicioRutaMs(System.currentTimeMillis());
        }
    }

    public void marcarCompletado(Camion camion) {
        camion.setEstado(Camion.Estado.COMPLETADO);
    }

    public Optional<Contenedor> intentarRecogerContenedores(
            Camion camion,
            List<Contenedor> contenedoresCercanos) {

        for (Contenedor cont : contenedoresCercanos) {

            if (cont.isProcesado()) {
                continue;
            }

            if (cont.getCapacidadUsada() <= 0) {
                continue;
            }

            if (camion.getCapacidadDisponible() < cont.getCapacidadUsada()) {
                camion.setLleno(true);
                continue;
            }

            // === RECOGIDA ===
            camion.setEstado(Camion.Estado.RECOGIENDO);

            double capacidadDespues = camion.getCapacidadDisponible() - cont.getCapacidadUsada();
            camion.setCapacidadDisponible(capacidadDespues);
            camion.setContenedoresRecogidos(camion.getContenedoresRecogidos() + 1);

            camion.setPapelRecogido(camion.getPapelRecogido() + cont.getPaper());
            camion.setRestoRecogido(camion.getRestoRecogido() + cont.getRest());
            camion.setVidrioRecogido(camion.getVidrioRecogido() + cont.getGlass());

            double totalRecogido = camion.getCapacidadInicial() - capacidadDespues;
            camion.setPorcentajeCargaUsado(
                    Math.round((totalRecogido / camion.getCapacidadInicial()) * 100.0 * 100.0) / 100.0);

            cont.setCapacidadUsada(0);
            cont.setProcesado(true);

            return Optional.of(cont);
        }

        return Optional.empty();
    }
}
