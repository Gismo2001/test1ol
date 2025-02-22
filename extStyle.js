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

export function test (c, d) {
    return c * d;
} 

const bru_nlwknStyle = new Style({
    image: new Icon({
    src: './data/bru_nlwkn.svg',
    scale: .9 
    })
});

export { bru_nlwknStyle };


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
  //export { searchFeaturesByText };

