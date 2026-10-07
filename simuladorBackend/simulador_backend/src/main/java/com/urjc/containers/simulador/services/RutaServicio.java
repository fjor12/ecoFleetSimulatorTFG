package com.urjc.containers.simulador.services;

import java.awt.Color;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.urjc.containers.simulador.model.Contenedor;
import com.urjc.containers.simulador.model.Coordenada;
import com.urjc.containers.simulador.model.Ruta;


@Service
public class RutaServicio {

    @Value("${ors.api.key}")
    private String orsApiKey;


    // Rutas almacenadas temporalmente en memoria
    private final ConcurrentHashMap<UUID, Ruta> rutasTemporales = new ConcurrentHashMap<>();

    public Ruta obtenerRuta(Color color, ArrayList<Contenedor> rutaContenedores) {
        Ruta ruta = new Ruta(color);

        if (rutaContenedores.size() < 2) return ruta;

        List<Coordenada> coordenadas = rutaContenedores.stream()
                .map(Contenedor::getCoordenada)
                .collect(Collectors.toList());

        try {
            ruta = obtenerRutaCompleta(coordenadas, color);

           
            UUID rutaId = UUID.randomUUID();
            ruta.setId(rutaId);
            rutasTemporales.put(rutaId, ruta);
          

        } catch (IOException e) {
            e.printStackTrace();
        }

        return ruta;
    }

    public List<UUID> getIdsRutasTemporales() {
        return new ArrayList<>(rutasTemporales.keySet());
    }
    
    public List<Ruta> getRutasTemporales() {
        return new ArrayList<>(rutasTemporales.values());
    }

    public Ruta getRutaPorId(UUID id) {
        return rutasTemporales.get(id);
    }
    public void guardarRutaTemporal(UUID id, Ruta ruta) {
        rutasTemporales.put(id, ruta);
    }
	
	private Ruta obtenerRutaCompleta(List<Coordenada> coordenadas, Color color) throws IOException {
	    if (coordenadas.size() < 2) {
	        throw new IllegalArgumentException("Se requieren al menos dos coordenadas.");
	    }

	    OkHttpClient client = new OkHttpClient();
	    ObjectMapper mapper = new ObjectMapper();

	    // Cadena de coordenadas JSON
	    String coordsArray = coordenadas.stream()
	        .map(c -> "[" + c.getLon() + "," + c.getLat() + "]")
	        .collect(Collectors.joining(",", "[", "]"));

	    String bodyJson = "{ \"coordinates\": " + coordsArray + " }";

	    RequestBody body = RequestBody.create(
	            bodyJson,
	            MediaType.parse("application/json")
	    );

	    Request request = new Request.Builder()
	            .url("https://api.openrouteservice.org/v2/directions/driving-car/geojson")
	            .addHeader("Authorization", orsApiKey)
	            .post(body)
	            .build();

	    Ruta ruta = new Ruta(color);

	    try (Response response = client.newCall(request).execute()) {
	        if (response.isSuccessful() && response.body() != null) {
	            JsonNode root = mapper.readTree(response.body().string());
	            JsonNode coordinates = root.path("features").get(0).path("geometry").path("coordinates");

	            for (JsonNode coordinate : coordinates) {
	                double lon = coordinate.get(0).asDouble();
	                double lat = coordinate.get(1).asDouble();
	                ruta.addCoordenada(new Coordenada(lat, lon));
	            }
	        } else {
	            System.err.println("Error API: " + response.code() + " - " + response.message());
	        }
	    }

	    return ruta;
	}


}
