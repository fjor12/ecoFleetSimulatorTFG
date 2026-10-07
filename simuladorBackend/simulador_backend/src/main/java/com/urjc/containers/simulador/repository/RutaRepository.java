package com.urjc.containers.simulador.repository;

import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;


@Repository
public class RutaRepository {
	private final JdbcTemplate jdbcTemplate;

    // Inyección automática de JdbcTemplate
    public RutaRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Object[]> findAll() {
        String sql = "SELECT * FROM `urjc.turjcrut`";
       
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            return new Object[] {
                    rs.getInt("id"),
                    rs.getString("id_contenedores"),
                    rs.getString("aud_user")
                };
        });
    }
}
