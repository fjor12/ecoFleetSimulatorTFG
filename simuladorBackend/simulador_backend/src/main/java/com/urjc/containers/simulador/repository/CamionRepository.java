package com.urjc.containers.simulador.repository;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.urjc.containers.simulador.model.Camion;

@Repository
public class CamionRepository {
	   private final JdbcTemplate jdbcTemplate;

	    // Inyección automática de JdbcTemplate
	    public CamionRepository(JdbcTemplate jdbcTemplate) {
	        this.jdbcTemplate = jdbcTemplate;
	    }

	    public List<Camion> findAll() {
	        String sql = "SELECT * FROM `urjc.turjccmn`";

	        return jdbcTemplate.query(sql, (rs, rowNum) -> {
	            

	            int id = rs.getInt("id");
	            double capacidad = Double.parseDouble(rs.getString("capacidad"));
	            double velocidad = Double.parseDouble(rs.getString("velocidad"));
	            String nombreRuta = rs.getString("ruta");
	            Camion camion = new Camion(id,null, capacidad, velocidad, nombreRuta);

	           return camion;
	        });
	    }
}
