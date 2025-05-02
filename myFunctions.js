
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

export function myFuncInfoDiv(results, map, popup, content, selectInteraction) {
  const resultsContainer = document.getElementById('search-results-container');
  const resultsList = document.getElementById('search-results');
  resultsList.innerHTML = '';
  resultsContainer.style.display = 'block';

  for (let i = 0; i < results.length; i++) {
    const { feature, layer } = results[i];
    console.log('durchlauf Nr: ' + i + '; Mit Layer: ' + layer?.get?.('name'));

    const layerTitle = layer?.get?.('title') || layer?.get?.('name') || 'Unbekannter Layer';
    const name = feature.get('name') || feature.get('beschreibung') || 'Unbenanntes Objekt';
    const bwId = feature.get('bw_id') || '—';

    const coordinates = feature.getGeometry().getCoordinates();
    popup.setPosition(coordinates);

    content.innerHTML = generatePopupHTML(feature, layer, coordinates, popup);


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

export function generatePopupHTML(feature, layer, coordinates, popup) {
  const layerName = layer?.get?.('name') || 'unbekannt';
  let latLonResult;
  const rwert = feature.get('rwert');
  const hwert = feature.get('hwert');
  if (rwert && hwert) {
    latLonResult = UTMToLatLon_Fix(rwert, hwert, 32, true);
  } else {
    const geom = feature.getGeometry();
    const center = geom.getType() === 'Point'
      ? geom.getCoordinates()
      : ol.extent.getCenter(geom.getExtent());
    const [lon, lat] = ol.proj.toLonLat(center);
    latLonResult = `${lat.toFixed(5)},${lon.toFixed(5)}`;
  }
 // Spezialfall FSK, editbar, geojson und kml: Nur spezieller Inhalt, kein allgemeiner Block
 if (layerName === 'fsk') {
  const eigenschaft = (feature.get('Art') === 'o' || feature.get('Art') === 'l') ? 'öffentl.' : 'privat';
  return `
    <div style="max-height: 300px; overflow-y: auto;">
      <p><strong>gemark Flur Flurstück:</strong><br>${feature.get('Suche')}</p>
      <p>FSK: ${feature.get('fsk')}</p>
      <p>FSK(ASL): ${feature.get('FSK_ASL')}</p>
      <p>Eig.(${eigenschaft}): ${feature.get('Eig1')}</p>
    </div>
  `;
} else if (layerName.toLowerCase().startsWith('geojson')) {
  const geom = feature.getGeometry();
  const type = geom.getType();
  let html = `<p><strong>Geometrie-Typ:</strong> ${type}</p>`;

  if (type === 'Point') {
    const coords = ol.proj.toLonLat(geom.getCoordinates());
    html += `<p><strong>Koordinaten:</strong> ${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}</p>`;
  } else if (type === 'LineString') {
    const length = ol.sphere.getLength(geom);
    html += `<p><strong>Länge:</strong> ${length.toFixed(2)} m</p>`;
  } else if (type === 'Polygon') {
    const area = ol.sphere.getArea(geom);
    html += `<p><strong>Fläche:</strong> ${area.toFixed(2)} m²</p>`;
  }
  // Attributliste erzeugen
  const att = feature.getProperties();
  html += `<strong>Attributwerte:</strong><br><ul>`;
  for (let key in att) {
    if (key !== 'geometry') {
      html += `<li><strong>${key}:</strong> ${att[key]}</li>`;
    }
  }
  html += `</ul>`;

  return `
    <div style="max-height: 300px; overflow-y: auto;">
      ${html}
    </div>
  `;
} else if (layerName.toLowerCase().startsWith('kml')) {
  const geom = feature.getGeometry();
  const type = geom.getType();
  let html = `<p><strong>Geometrie-Typ:</strong> ${type}</p>`;

  if (type === 'Point') {
    const coords = ol.proj.toLonLat(geom.getCoordinates());
    html += `<p><strong>Koordinaten:</strong> ${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}</p>`;
  } else if (type === 'LineString') {
    const length = ol.sphere.getLength(geom); // in Metern
    html += `<p><strong>Länge:</strong> ${length.toFixed(2)} m</p>`;
  } else if (type === 'Polygon') {
    const area = ol.sphere.getArea(geom); // in m²
    html += `<p><strong>Fläche:</strong> ${area.toFixed(2)} m²</p>`;
  }

  // Attributwerte ausgeben
  const att = feature.getProperties();
  html += `<strong>Attributwerte:</strong><br><ul>`;
  for (let key in att) {
    if (key !== 'geometry') {
      html += `<li><strong>${key}:</strong> ${att[key]}</li>`;
    }
  }
  html += `</ul>`;

  return `
    <div style="max-height: 300px; overflow-y: auto;">
      ${html}
    </div>
  `;
} else if (layerName === 'editbar') {  
  const geom = feature.getGeometry();
  const type = geom.getType();
  let content = `<p><strong>Geometrie-Typ:</strong> ${type}</p>`;

  if (type === 'Point') {
    const coords = ol.proj.toLonLat(geom.getCoordinates());
    content += `<p><strong>Koordinaten:</strong> ${coords[1].toFixed(5)}, ${coords[0].toFixed(5)}</p>`;
  } else if (type === 'LineString') {
    const length = ol.sphere.getLength(geom); // in Metern
    content += `<p><strong>Länge:</strong> ${length.toFixed(2)} m</p>`;
  } else if (type === 'Polygon') {
    const area = ol.sphere.getArea(geom); // in m²
    content += `<p><strong>Fläche:</strong> ${area.toFixed(2)} m²</p>`;
  }

  return `
    <div style="max-height: 300px; overflow-y: auto;">
      ${content}
    </div>
  `;
}





  // Erster allgemeiner Block
  let html = `
    <div style="max-height:200px;overflow-y:auto;">
      <p style="font-weight:bold;text-decoration:underline;">
        ${feature.get('name')}
      </p>
      <p>Id = ${feature.get('bw_id')} (${feature.get('KTR') || 'k.A.'})</p>
      <p>U-Pflicht = ${feature.get('upflicht')}</p>
      <p>Bemerk = ${feature.get('bemerk') || 'k.A.'}</p>
      <p>Bauj. = ${feature.get('baujahr') || 'k.A.'}</p>
      <p>
        <a href="https://www.google.com/maps?q=${latLonResult}"
          target="_blank" rel="noopener noreferrer">
          Google Maps link
        </a>
      </p>
      <p>
        <a href="https://www.google.com/maps?q=&layer=c&cbll=${latLonResult}&cbp=12,90,0,0,1"
          target="_blank" rel="noopener noreferrer">
          Streetview
        </a>
      </p>
      <p>
        ${createFotoLink(feature.get('foto1'), 'Foto 1')}
        ${createFotoLink(feature.get('foto2'), 'Foto 2')}
        ${createFotoLink(feature.get('foto3'), 'Foto 3')}
        ${createFotoLink(feature.get('foto4'), 'Foto 4')}
        
      </p>
  `;

  // Layer-spezifischer Zusatz
  switch (layerName) {
    case 'weh':
      html += `
         <br><p>WSP1 (OW)=  ${feature.get('Ziel_OW1')} m; WSP2 (OW)= ${feature.get('Ziel_OW2')} m</p>
         
      `;
      break;
    case 'bru_nlwkn':
      html += `
        <p style="color:blue;">NLWKN-Brücke: Diese Brücke wird vom NLWKN betreut.</p>
      `;
      break;
    case 'bru_andere':
      html += `
        <p style="color:orange;">Andere Brücke: Nicht dem NLWKN zugeordnet.</p>
      `;
      break;
    case 'sle':
      html += `
        <br><p>WSP (OW)=  ${feature.get('WSP_OW')}; WSP (UW)= ${feature.get('WSP_UW')}</p>
      `;
      break;
    case 'ein':
      html += `
        <p style="color:purple;">Einlassbauwerk: Infos zu Einlassanlagen.</p>
      `;
      break;
    case 'que':
      html += `
        <p style="color:teal;">Querbauwerk: Technische Details und Nutzung.</p>
      `;
      break;
    case 'due':
      html += `
        <p style="color:brown;">Düker: Informationen zum unterirdischen Durchfluss.</p>
      `;
      break;
    case 'son_lin':
      html += `
        <p style="color:gray;">Sonstiges linienförmiges Objekt.</p>
      `;
      break;
    case 'son_pun':
      html += `
        <p style="color:gray;">Sonstiges punktförmiges Objekt.</p>
      `;
      break;
    case 'gew_info':
      html += `
        <p style="color:gray;">Sonstiges gew-info Objekt.</p>
      `;
      break;
    default:
      html += `
        <p style="font-style:italic;">Kein spezifischer Zusatzinhalt für diesen Layer.</p>
      `;
  }

  // Zweiter allgemeiner Block
  html += `
      <br><u>Beschreibung (kurz):</u> ${feature.get('beschreib')}
      <p>${getBeschreibLangHTML(feature.get('beschreib_lang'))}</p>
    </div>
  `;

  return html;
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
    const geometry = feature.getGeometry();
    let coordinates;
  
    // 🔍 Geometrie-Typ prüfen
    const type = geometry.getType();
    if (type === 'Point') {
      coordinates = geometry.getCoordinates();
    } else {
      // 📍 Bei Linien oder Flächen: Schwerpunkt verwenden
      const extent = geometry.getExtent();
      coordinates = [
        (extent[0] + extent[2]) / 2, // Mittelpunkt X
        (extent[1] + extent[3]) / 2  // Mittelpunkt Y
      ];
    }
  
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




  