
export function UTMToLatLon_Fix(east, north, zone, isNorthernHemisphere) {
    const a = 6378137;
    const e = 0.081819191;
    const k0 = 0.9996;
    const pi = Math.PI;

    if (!isNorthernHemisphere) {
        north -= 10000000;
    }

    let longOrigin = (zone - 1) * 6 - 180 + 3;
    let M = north / k0;
    let e1 = (1 - Math.sqrt(1 - e ** 2)) / (1 + Math.sqrt(1 - e ** 2));
    let mu = M / (a * (1 - e ** 2 / 4 - 3 * (e ** 4) / 64 - 5 * (e ** 6) / 256));

    let phi1Rad = mu + (3 * e1 / 2 - 27 * (e1 ** 3) / 32) * Math.sin(2 * mu)
                + (21 * (e1 ** 2) / 16 - 55 * (e1 ** 4) / 32) * Math.sin(4 * mu)
                + (151 * (e1 ** 3) / 96) * Math.sin(6 * mu);

    let N1 = a / Math.sqrt(1 - e ** 2 * Math.sin(phi1Rad) ** 2);
    let T1 = Math.tan(phi1Rad) ** 2;
    let C1 = (e ** 2) * Math.cos(phi1Rad) ** 2 / (1 - e ** 2);
    let R1 = a * (1 - e ** 2) / Math.pow(1 - e ** 2 * Math.sin(phi1Rad) ** 2, 1.5);
    let D = (east - 500000) / (N1 * k0);

    let lat = (phi1Rad - (N1 * Math.tan(phi1Rad) / R1) * (D ** 2 / 2
        - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * e ** 2) * (D ** 4) / 24
        + (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * e ** 2 - 3 * C1 ** 2) * (D ** 6) / 720)) * 180 / pi;

    let lon = longOrigin + ((D - (1 + 2 * T1 + C1) * (D ** 3) / 6
        + (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * e ** 2 + 24 * T1 ** 2) * (D ** 5) / 120) / Math.cos(phi1Rad)) * 180 / pi;

    return `${lat.toFixed(6)},${lon.toFixed(6)}`;
}

export function myFuncInfoDiv(features, layers, map, popup, content, selectInteraction) {

  const resultsContainer = document.getElementById('search-results-container');
  const resultsList = document.getElementById('search-results');
  resultsList.innerHTML = '';
  resultsContainer.style.display = 'block';

  for (let i = 0; i < features.length; i++) {
    const feature = features[i];
    const layer = layers[i];
    const layerTitle = layer.get('title') || layer.get('name') || 'Unbekannter Layer';
    const name = feature.get('name') || feature.get('beschreibung') || 'Unbenanntes Objekt';
    const bwId = feature.get('bw_id') || '—';

    if (feature) {
      const coordinates = feature.getGeometry().getCoordinates();
      popup.setPosition(coordinates);
      content.innerHTML = generatePopupHTML(feature, coordinates);
    }

    const listItem = createResultListItem(layerTitle, name, bwId, feature, map, popup, content, selectInteraction);

    resultsList.appendChild(listItem);
  }
}

function createFotoLink(url, label) {
  if (url && url.trim() !== '') {
    return `<a href="${url}" onclick="window.open('${url}', '_blank'); return false;">${label}</a>`;
  }
  return label;
}

function getBeschreibLangHTML(value) {
  if (value && value.trim() !== '') {
    return `<br><u>Beschreib (lang): </u>${value}`;
  }
  return '';
}


export function generatePopupHTML(feature, coordinates, popup) {
  const rwert = feature.get('rwert');
  const hwert = feature.get('hwert');
  const result = UTMToLatLon_Fix(rwert, hwert, 32, true);

  return `
    <div style="max-height: 200px; overflow-y: auto;">
      <p style="font-weight: bold; text-decoration: underline;">${feature.get('name')}</p>
      <p>Id = ${feature.get('bw_id')} (${feature.get('KTR') || 'k.A.'})</p>
      <p>U-Pflicht = ${feature.get('upflicht')}</p>
      <p>Bemerk = ${feature.get('bemerk') || 'k.A.'}</p>
      <p>Bauj. = ${feature.get('baujahr') || 'k.A.'}</p>
      <p><a href="https://www.google.com/maps?q=${result}" target="_blank" rel="noopener noreferrer">Google Maps link</a></p>
      <p><a href="https://www.google.com/maps?q=&layer=c&cbll=${result}&cbp=12,90,0,0,1" target="_blank" rel="noopener noreferrer">streetview</a></p>
      <p>
        ${createFotoLink(feature.get('foto1'), 'Foto 1')} 
        ${createFotoLink(feature.get('foto2'), 'Foto 2')} 
        ${createFotoLink(feature.get('foto3'), 'Foto 3')} 
        ${createFotoLink(feature.get('foto4'), 'Foto 4')}
        <br><u>Beschreibung (kurz): </u>${feature.get('beschreib')}
        ${getBeschreibLangHTML(feature.get('beschreib_lang'))}
      </p>
    </div>
  `;
}


function createResultListItem(layerTitle, name, bwId, feature, map, popup, content, selectInteraction) {

  const listItem = document.createElement('li');
  listItem.innerHTML = `
    <strong>${layerTitle}</strong><br>
    <em>Name:</em> ${name}<br>
    <em>BW-ID:</em> ${bwId}
  `;
  
  listItem.style.cursor = 'pointer';
  // Einfacher Klick → Popup anzeigen

 listItem.addEventListener('click', () => {
  const coordinates = feature.getGeometry().getCoordinates();
  popup.setPosition(coordinates);
  content.innerHTML = generatePopupHTML(feature, coordinates);

  // 🔴 Feature visuell markieren
  selectInteraction.getFeatures().clear();
  selectInteraction.getFeatures().push(feature);
});


  
  listItem.addEventListener('dblclick', () => zoomToFeature(feature, map));
  return listItem;
}





import { Style, Stroke, Fill } from 'ol/style';
export function zoomToFeature(feature, map) {
  const geometry = feature.getGeometry();
  const extent = geometry.getExtent();

  // Zoomen auf das Feature
  map.getView().fit(extent, {
    duration: 1000,
    padding: [50, 50, 50, 50],
    maxZoom: 20
  });

  // Temporärer Highlight-Stil
  const highlightStyle = new Style({
    stroke: new Stroke({
      color: 'yellow',
      width: 4,
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 0, 0.3)',
    }),
  });

  const originalStyle = feature.getStyle?.(); // Falls vorhanden

  feature.setStyle(highlightStyle);

  // Nach 1,5 Sekunden wieder auf den ursprünglichen Stil zurück
  setTimeout(() => {
    feature.setStyle(originalStyle || null); // null verwendet den Layer-Stil
  }, 1500);
}




  