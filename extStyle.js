//extStyle.js
import { Style, Icon } from 'ol/style.js';
const sleStyle = new Style
({
    image: new Icon
    (
        {
        src: './data/sle.svg',
        scale: .9 
        }
    )
});
export { sleStyle };

const wehStyle = new Style({
    image: new Icon({
        src: './data/weh.svg',
        scale: .9 
    })
});
export { wehStyle };

const bru_nlwknStyle = new Style({
    image: new Icon({
    src: './data/bru_nlwkn.svg',
    scale: .9 
    })
});

export { bru_nlwknStyle };

const dueStyle = new Style({
    image: new Icon({
        src: './data/due.svg',
        scale: .9
    })
});
export { dueStyle };


export function test (c, d) {
    return c * d;
} 

export function geojsonStyle(feature) {
    const geometryType = feature.getGeometry().getType();

    if (geometryType === 'Point' || geometryType === 'MultiPoint') {
        return new Style({
            image: new CircleStyle({
                radius: 7,
                fill: new Fill({ color: 'red' }),
                stroke: new Stroke({ color: 'black', width: 2 })
            })
        });
    }

    if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
        return new Style({
            stroke: new Stroke({
                color: 'red', // Blaue Linienfarbe
                width: 4 // Linienbreite
            })
        });
    }

    if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
        return new Style({
            fill: new Fill({ color: 'red' }), // Halbdurchsichtiges Grün
            stroke: new Stroke({ color: 'black', width: 3 }),
            opacity: 0.5
        });
    }

    return new Style(); // Fallback-Stil
}


export function searchFeaturesByText(searchText, layer1,layer2, layer3) {
    let layers = [layer1, layer2, layer3]; // Layer für die Suche
   // let layers = [exp_bw_sle_layer, exp_bw_weh_layer, exp_bw_bru_nlwkn_layer]; // Layer für die Suche
    let matchingFeatures = [];
    
    layers.forEach(layer => {
        if (!layer) {
        console.warn('WARNUNG: Ein Layer ist nicht definiert!');
        return;
        }
        let source = layer.getSource();
        if (!source) {
          console.warn(`WARNUNG: Layer ${layer.get('title') || 'Unbekannt'} hat keine gültige Quelle.`);
          return;
        } 
  
  
        let features = source.getFeatures();
       
        features.forEach(feature => {
            let name = feature.get('name') || '';
            
            let beschreib = feature.get('beschreib') || '';
  
            if (name.includes(searchText) || beschreib.includes(searchText)) {
                let bw_id = feature.get('bw_id') || 'Unbekannt'; // Falls bw_id fehlt, "Unbekannt" setzen
                console.log(`Gefundenes Feature: Name="${name}", Beschreibung="${beschreib}", BW_ID="${bw_id}"`);
                matchingFeatures.push(feature);
            }
        });
       
    });
  
    return matchingFeatures;
  }

 export function getStyleForArtSonPun(feature) {
    const artValue = feature.get('bauart');
    let iconSrc;

    if (/boots/i.test(artValue)) {
        iconSrc = './data/bwSonPun_Anleger.svg';
    
    }else if (/betriebs/i.test(artValue)) {
        iconSrc = './data/sonPunBetrieb.svg';
    
    }else if (/steg/i.test(artValue)) {
        iconSrc = './data/bwSonPun_Anleger.svg';   
        
    } else if (artValue === 'Infotafel') {
        iconSrc = './data/sonPunInfo.svg';
    } else if (artValue === 'Auskolkung') {
        iconSrc = './data/sonPunKolk.svg';
    } else if (artValue === 'Furt') {
        iconSrc = './data/bwSonPun_Furt.svg';
    } else if (artValue === 'Tor') {
        iconSrc = './data/bwSonPun_Tor.svg';
    } else if (artValue === 'Überfahrt') {
        iconSrc = './data/bwSonPun_Ueberfahrt.svg';
    } else if (artValue === 'Betriebspegel') {
        iconSrc = './data/bwSonPun_Betriebspegel.svg';
    } else {
        iconSrc = './data/sonPunSonstige.svg';
    }

    return new Style({
        image: new Icon({
            src: iconSrc,
            scale: 0.9
        })
    });
}
  //export { searchFeaturesByText };

