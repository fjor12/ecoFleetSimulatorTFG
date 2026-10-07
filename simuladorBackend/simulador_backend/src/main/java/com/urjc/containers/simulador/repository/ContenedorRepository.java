package com.urjc.containers.simulador.repository;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.urjc.containers.simulador.model.Contenedor;
import com.urjc.containers.simulador.model.Coordenada;
import com.urjc.containers.simulador.utils.CordenadasConvertidor;

@Repository
public class ContenedorRepository {

    private final JdbcTemplate jdbcTemplate;

    // Inyección automática de JdbcTemplate
    public ContenedorRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Contenedor> findAll() {
        String sql = "SELECT * FROM `urjc.turjccnt`";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Contenedor container = new Contenedor();

            int container_id = rs.getInt("container_id");
            String type = rs.getString("des_type");
            String district = rs.getString("des_district");
            String adress = rs.getString("des_address");
            int rest = rs.getInt("cod_rest");
            int packaging = rs.getInt("cod_packaging");
            int glass = rs.getInt("cod_glass");
            int paper = rs.getInt("cod_paper");

            // Convertir coordenadas con la utilidad
            double coordinate_x = Double.parseDouble(rs.getString("des_coordinate_x").replace(",", "."));
            double coordinate_y = Double.parseDouble(rs.getString("des_coordinate_y").replace(",", "."));
            Coordenada coordsWGS84 = CordenadasConvertidor.convertirUnaPosicion(coordinate_x, coordinate_y);

            container.setId(container_id);
            container.setType(type);
            container.setDistrict(district);
            container.setAddress(adress);
            container.setRest(rest);
            container.setPackaging(packaging);
            container.setGlass(glass);
            container.setPaper(paper);
            container.setCoordenada(coordsWGS84);
            container.setCapacidadUsada(100);

            return container;
        });
    }
}
