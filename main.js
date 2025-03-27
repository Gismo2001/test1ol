import './style.css';

import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

import Permalink from 'ol-ext/control/Permalink';
import getLayerByLink from 'ol-ext/control/Permalink';

import {Vector as VectorSource} from 'ol/source.js';
import {Group, Vector as VectorLayer} from 'ol/layer.js';
import GeoJSON from 'ol/format/GeoJSON.js';
//import * as LoadingStrategy from 'ol/loadingstrategy';
import {bbox as bboxStrategy} from 'ol/loadingstrategy.js';

import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';


import Draw from 'ol/interaction/Draw.js';
import {LineString, Polygon, Point, Circle} from 'ol/geom.js';
import Overlay from 'ol/Overlay.js';


import { add } from './myFunc'; // 
import { UTMToLatLon_Fix  } from './myFunc'; // 

import { bru_nlwknStyle, sleStyle, test, wehStyle, dueStyle  } from './extStyle';

import * as proj from 'ol/proj';
import {getArea, getLength} from 'ol/sphere.js';
import {unByKey} from 'ol/Observable.js';
import { FullScreen, Attribution, defaults as defaultControls, ZoomToExtent, Control } from 'ol/control.js';
import { DragRotateAndZoom } from 'ol/interaction.js';
import { DragAndDrop } from 'ol/interaction.js';
import { defaults as defaultInteractions } from 'ol/interaction.js';
import { singleClick } from 'ol/events/condition';

import Bar from 'ol-ext/control/Bar';
import TextButton from 'ol-ext/control/TextButton';
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';

import CanvasAttribution from 'ol-ext/control/CanvasAttribution';
import CanvasTitle from 'ol-ext/control/CanvasTitle';
import CanvasScaleLine from 'ol-ext/control/CanvasScaleLine';
import PrintDialog from 'ol-ext/control/PrintDialog';



import { Text } from 'ol/style';
import { Icon } from 'ol/style';
import Legend from 'ol-ext/control/Legend';
//import saveAs from 'file-saver';

import { getStyleForArtSonPun } from './extStyle';
import { geojsonStyle } from './extStyle';

const attribution = new Attribution({
  collapsible: false,
  html: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
});

const mapView = new View({
  center: proj.fromLonLat([7.35, 52.7]),
  zoom: 9
});

const map = new Map({
  target: "map",
  view: mapView,
   controls: defaultControls().extend([
    new FullScreen(),
    new ZoomToExtent({
       extent: [727361, 6839277, 858148, 6990951] 
     }),
    attribution 
  ]),
  interactions: defaultInteractions().extend([new DragRotateAndZoom()])
});

// Canvas-Kontrollen hinzufügen
map.addControl(new CanvasAttribution());
map.addControl(new CanvasTitle({ 
  title: 'Map', 
  visible: false,
  style: new Style({ 
    text: new Text({ font: 'bold 12pt "Arial",Verdana,Geneva,Lucida,Lucida Grande,Helvetica,sans-serif' }) 
  })
}));

// Maßstabsleiste hinzufügen
map.addControl(new CanvasScaleLine());
// Print control
var printControl = new PrintDialog({ 
  openWindow: true,
  // target: document.querySelector('.info'),
  // targetDialog: map.getTargetElement() 
  // save: false,
  // copy: false,
  // pdf: false
});
printControl.setSize('A4');
map.addControl(printControl);



/* On print > save image file */
printControl.on(['print', 'error'], function(e) {
  document.body.style.overflow = 'hidden'; 
  document.body.style.overflow = '';
  if (e.image) {
    if (e.pdf) {
      // Export pdf using the print info
      var pdf = new jsPDF({
        orientation: e.print.orientation,
        unit: e.print.unit,
        format: e.print.size
      });
      pdf.addImage(e.image, 'JPEG', e.print.position[0], e.print.position[1], e.print.imageWidth, e.print.imageHeight);
      pdf.save(e.print.legend ? 'legend.pdf' : 'map.pdf');
    } else  {
      // Save image as file
      if (e.canvas.toBlob) {
        e.canvas.toBlob(function(blob) {
          var name = (e.print.legend ? 'legend.' : 'map.') + e.imageType.replace('image/', '');
          saveAs(blob, name);
        }, e.imageType, e.quality);
      } else {
        var dataURL = e.canvas.toDataURL(e.imageType, e.quality);
        var link = document.createElement('a');
        link.href = dataURL;
        link.download = (e.print.legend ? 'legend.' : 'map.') + e.imageType.replace('image/', '');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }    }
  } else {
    console.warn('No canvas to export');
  }
});

let dragAndDropInteraction;
function setInteraction() {
  if (dragAndDropInteraction) {
    map.removeInteraction(dragAndDropInteraction);
  } else {
  dragAndDropInteraction = new DragAndDrop({
    formatConstructors: [
      //GPX,
      GeoJSON,
      //IGC,
      // use constructed format to set options
      //new KML({extractStyles: extractStyles.checked}),
      //TopoJSON,
    ],
  });
  dragAndDropInteraction.on('addfeatures', function (event) {
    const vectorSource = new VectorSource({features: event.features, });
    map.addLayer(new VectorLayer({source: vectorSource, }),);
    map.getView().fit(vectorSource.getExtent());
    }
  );
  map.addInteraction(dragAndDropInteraction);
  }
}

const displayFeatureInfo = function (pixel) {
  const features = [];
  map.forEachFeatureAtPixel(pixel, function (feature) {
    features.push(feature);
  });

  if (features.length > 0) {
    const info = [];
    features.forEach((feature) => {
      const properties = feature.getProperties(); // Alle Eigenschaften holen
      let featureInfo = Object.entries(properties)
        .map(([key, value]) => `<b>${key}</b>: ${value}`)
        .join('<br>'); // Formatieren als HTML

      info.push(featureInfo);
    });

    document.getElementById('info').innerHTML = info.join('<hr>'); // Trennung mehrerer Features
    document.getElementById('info').style.display = "block"; // Zeige das div an
    document.getElementById('info').style.visibility = "visible"; // Zeige das div an
  } else {
    document.getElementById('info').innerHTML = '&nbsp;';
  }
};

map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
});

map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
});



const osmTileCr = new TileLayer({
  title: "osm-color",
  name: "osm-color",
  type: 'base',
  source: new OSM({
    
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
  visible: true,
  //opacity: 0.75
});
map.addLayer(osmTileCr);

const gew_layer_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/gew.geojson' + '?bbox=' + extent.join(','); }, strategy: bboxStrategy }),
  title: 'gew', // Titel für den Layer-Switcher
  Permalink: 'gew',
  name: 'gew',
  style: new Style({
    fill: new Fill({ color: 'rgba(0,28, 240, 0.4)' }),
    stroke: new Stroke({ color: 'blue', width: 2 })
  })
});
map.addLayer(gew_layer_layer);


const exp_bw_son_pun_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_son_pun.geojson' + '?bbox=' + extent.join(','); },strategy: bboxStrategy}),
  title: 'Sonstige, Punkte', 
  Permalink:"son_pun", 
  name: 'son_pun', 
  style: getStyleForArtSonPun,
  visible: false
});
map.addLayer(exp_bw_son_pun_layer);

const exp_bw_weh_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_weh.geojson' + '?bbox=' + extent.join(',');},strategy: bboxStrategy}),
  title: 'Wehr', // Titel für den Layer-Switcher
  //permalink:"weh", 
  name: 'weh', // Titel für den Layer-Switcher
  style: wehStyle,
  visible: false
});
map.addLayer(exp_bw_weh_layer);


const layerSwitcher = new LayerSwitcher({ 
  activationMode: 'click', 
  reverse: true, 
  trash: true, 
  tipLabel: 'Legende', 
 });
map.addControl(layerSwitcher);

// Control
var ctrl = new Permalink({    
  geohash: /gh=/.test(document.location.href),
  localStorage: true,    // Save permalink in localStorage if no url provided
  urlReplace: false,
  fixed: 2,
  visible: true,
  onclick: function(url) {
    console.log("Aktuelle URL-Parameter: ", ctrl.getUrlParam());
    console.log("Permalink: ", ctrl.getLink());

    // Layer-Namen sammeln
    let activeLayers = map.getLayers().getArray()
      .filter(layer => layer.get('visible')) // Nur sichtbare Layer
      .map(layer => layer.get('name'))
      .filter(name => name); // Entferne leere Namen

    console.log("Aktive Layer:", activeLayers);

    // Layer-Namen zum Permalink hinzufügen
    let newUrl = new URL(url);
    if (activeLayers.length > 0) {
      newUrl.searchParams.set('layers', activeLayers.join(','));
    }

    let finalUrl = newUrl.toString();
    console.log("Neuer Permalink mit Layern:", finalUrl);

    copyToClipboard(finalUrl);
  }
});
map.addControl(ctrl);

// Funktion zum Abrufen der Layer basierend auf dem Permalink
function getLayersFromPermalink(layers) {
  var permalinkLayers = layers.filter(layer => layer.get('Permalink')); // Nur Layer mit "Permalink"
  console.log("Layer mit Permalink-Attribut:", permalinkLayers);
}

map.addControl(ctrl);


function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(function() {
    console.log('Permalink wurde in die Zwischenablage kopiert: ' + text);
  }).catch(function(err) {
    console.error('Fehler beim Kopieren des Permalinks: ', err);
  });
}


/* Nested subbar */
var sub1 = new Bar({
  toggleOne: true,
  controls: [
  new TextButton({
    html: '<i class="fa fa-map" ></i>',
    handleClick: function () {
      
    }
  }),
  
  new TextButton({
    html: "1",
    title: "Suche",
    handleClick: function () {
    
    }
  }),
  
  new TextButton({
    html: "2",
    title: "json",
    handleClick: function () {
      setInteraction();
    }
  }),
 ]
});

map.addControl(sub1);
sub1.setPosition('left');

// Beim Laden der Seite die URL-Parameter auslesen
window.onload = function() {
  console.log("URL-Parameter beim Laden der Seite:", window.location.search);
  const urlParams = new URLSearchParams(window.location.search);
  const layersParam = urlParams.get('layers');

  if (layersParam) {
    const layersToShow = layersParam.split(',');

    // Alle Layer durchlaufen und sichtbar schalten, wenn sie im URL-Parameter enthalten sind
    map.getLayers().getArray().forEach(layer => {
      const layerName = layer.get('name');
      if (layersToShow.includes(layerName)) {
        layer.setVisible(true); // Setze den Layer sichtbar
      } else {
        layer.setVisible(false); // Setze den Layer unsichtbar
      }
    });
  }
};
