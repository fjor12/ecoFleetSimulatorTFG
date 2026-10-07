package com.urjc.containers.simulador.utils;

import com.urjc.containers.simulador.model.Coordenada;
import org.locationtech.proj4j.CRSFactory;
import org.locationtech.proj4j.CoordinateReferenceSystem;
import org.locationtech.proj4j.ProjCoordinate;
import org.locationtech.proj4j.BasicCoordinateTransform;

public class CordenadasConvertidor {
    private static final CRSFactory crsFactory = new CRSFactory();
    private static final CoordinateReferenceSystem epsg25830 = crsFactory.createFromName("EPSG:25830");
    private static final CoordinateReferenceSystem wgs84 = crsFactory.createFromName("EPSG:4326");
    private static final BasicCoordinateTransform transform = new BasicCoordinateTransform(epsg25830, wgs84);

    public static Coordenada convertirUnaPosicion(double x, double y) {
        ProjCoordinate srcCoord = new ProjCoordinate(x, y);
        ProjCoordinate destCoord = new ProjCoordinate();

        transform.transform(srcCoord, destCoord);

        return new Coordenada(destCoord.y, destCoord.x);
    }


}
