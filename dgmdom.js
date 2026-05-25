export function createDgmKachelLayerSource() {
  const dgmKachelSource = new VectorSource({    
    url: '/data/dgm_kacheln_neu.geojson',  // relativer Pfad im Projekt
    format: new GeoJSON()
  });
  return dgmKachelLayerSource;
}

export function createDgmKachelLayer(dgmKachelLayerSource) {
  const dgmKachelLayer = new VectorLayer({
    source: dgmKachelSource,
    style: new Style({
      stroke: new Stroke({
        color: 'rgba(255, 0, 0, 0.5)', // rote Linien mit Transparenz
        width: 2
        }),
        fill: new Fill({    
            color: 'rgba(255, 0, 0, 0.1)' // rote Füllung mit höherer Transparenz
        })
    })
  });
  return dgmKachelLayer;
}           