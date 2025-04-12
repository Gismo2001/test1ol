import './style.css';
import {Map, View} from 'ol';
import OSM from 'ol/source/OSM';
import TileWMS from 'ol/source/TileWMS.js';
import TileImage from 'ol/source/TileImage.js';
import XYZ from 'ol/source/XYZ.js';
import {Vector as VectorSource} from 'ol/source.js';
import {Tile as TileLayer} from 'ol/layer.js';

import Bar from 'ol-ext/control/Bar';
import EditBar from 'ol-ext/control/EditBar';
import Tooltip from 'ol-ext/overlay/Tooltip';
import Notification from 'ol-ext/control/Notification';
import {ScaleLine} from 'ol/control.js';

import TextButton from 'ol-ext/control/TextButton';
import Button from 'ol-ext/control/Button';
import Toggle from 'ol-ext/control/Toggle';
import {Select} from 'ol/interaction.js';
import {Draw} from 'ol/interaction.js';
import {getLength as getLengthLine, getArea as getAreaPolygon} from 'ol/sphere.js';   
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';


import { FullScreen, Attribution, defaults as defaultControls, ZoomToExtent, Control, Rotate } from 'ol/control.js';

import {Group, Vector as VectorLayer} from 'ol/layer.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import {bbox as bboxStrategy, tile} from 'ol/loadingstrategy.js';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';

import { UTMToLatLon_Fix } from './myNewFunc';

import * as proj from 'ol/proj';
import {getArea, getLength} from 'ol/sphere.js';
import {unByKey} from 'ol/Observable.js';

import { DragRotateAndZoom } from 'ol/interaction.js';
import { DragAndDrop } from 'ol/interaction.js';
import { defaults as defaultInteractions } from 'ol/interaction.js';
import { singleClick } from 'ol/events/condition';

import LayerGroup from 'ol/layer/Group';

import CanvasAttribution from 'ol-ext/control/CanvasAttribution';
import CanvasTitle from 'ol-ext/control/CanvasTitle';
import CanvasScaleLine from 'ol-ext/control/CanvasScaleLine';
import PrintDialog from 'ol-ext/control/PrintDialog';

import { toLonLat, transform } from 'ol/proj';
import { format } from 'ol/coordinate';
import contextFeature from 'ol/Feature';
import {LineString, Polygon, Point, Circle} from 'ol/geom.js';

import ContextMenu from 'ol-contextmenu';
import pinIcon from './data/pin.png';
import centerIcon from 'ol-contextmenu';
import listIcon from 'ol-contextmenu';



import { Text } from 'ol/style';
import { Icon } from 'ol/style';
import Legend from 'ol-ext/control/Legend';
//import saveAs from 'file-saver';



import { 
  getStyleForArtEin,
  getStyleForArtSonPun,
  gehoelz_vecStyle, 
  exp_gew_fla_vecStyle,
  sleStyle, 
  wehStyle, 
  bru_nlwknStyle, 
  bruAndereStyle,
  dueStyle, 
  queStyle, 
  getStyleForArtFSK, 
  getStyleForArtUmn,
  km10scalStyle,
  km100scalStyle,
  km500scalStyle,
  combinedStyle,
  arrowStyle,
  machWasMitFSK,
  geojsonStyle,
  getStyleForArtSonLin,
  getStyleForArtGewInfo
} from './extStyle';


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
    attribution,  
  ]),
  //layers: [baseLayer, vectorLayer],
  interactions: defaultInteractions().extend([new DragRotateAndZoom()])
});

var note = new Notification(
  {
    className: 'ol-notification',
    //autoClose: false,
    closeBox: true,
    closeBoxTitle: 'close',
    //closeBoxCallback: function() {console.log('closeBoxCallback');},
    
  }
);
map.addControl(note)


map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
});


var baselayer = new TileLayer({
  title: "Base-DE",
  name: "Base-DE",
  opacity: 1.000000,
  visible: false,
  type: 'base',
  source: new TileWMS({
    url: "https://sgx.geodatenzentrum.de/wms_basemapde",
    attributions: '© GeoBasis-DE / BKG (Jahr des letzten Datenbezugs) CC BY 4.0',
    params: {
      "LAYERS": "de_basemapde_web_raster_farbe",
      "TILED": true, // "true" sollte ohne Anführungszeichen sein
      "VERSION": "1.3.0"
    },
  }),
});
var dop20ni_layer = new TileLayer({
  title: "DOP20 NI",
  name: "DOP20 NI",
  opacity: 1.000000,
  visible: false,
  type: 'base',
  source: new TileWMS({
    //url: "https://www.geobasisdaten.niedersachsen.de/doorman/noauth/wms_ni_dop",
    //https://opendata.lgln.niedersachsen.de/doorman/noauth/dop_wms
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/dop_wms",
    attributions: 'Orthophotos Niedersachsen, LGLN',
    params: {
      "LAYERS": "ni_dop20",
      "TILED": true, // "true" sollte ohne Anführungszeichen sein
      "VERSION": "1.3.0"
    },
  }),
});
const googleSatLayer = new TileLayer({
  title: "GoogleSat",
  name: "GoogleSat",
  type: 'base',
  baseLayer: false,
  visible: false,
  source: new TileImage({url: 'http://mt1.google.com/vt/lyrs=s&hl=pl&&x={x}&y={y}&z={z}' })
});
const googleHybLayer = new TileLayer({
  title: "GoogleHybrid",
  name: "GooglöeHybrid",
  type: 'base',
  baseLayer: false,
  visible: false,
  source: new TileImage({url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' })
});
const ESRIWorldImagery = new TileLayer({
  title: 'ESRI-Sat',
  name: 'ESRI-Sat',
  type: 'base',
  opacity: 1.000000,
  visible: false,
  source: new XYZ({
      attributions: 'Powered by Esri',
      url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  })
});
const ESRIWorldGrey = new TileLayer({
  title: 'ESRI-Grey',
  name: 'ESRI-Grey',
  type: 'base',
  opacity: 1.000000,
  visible: false,
  source: new XYZ({
      attributions: 'Powered by Esri',
      url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
  })
});
const osmTileGr = new TileLayer({
  title: "osm-grey",
  name: "osm-grey",
  className: 'bw',
  type: 'base',
  visible: false,
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
});
const osmTileCr = new TileLayer({
  title: "osm-color",
  name: "osm-color",
  permalink: "osm-color",
  type: 'base',
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
  visible: true,
  opacity: 0.75
});
var Alkis_layer = new TileLayer({
  title: "ALKIS",
  name: "ALKIS",
  opacity: 1.000000,
  visible: false,
  type: 'base',
  source: new TileWMS({
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/alkis_wms?",
    attributions: '© LGLN',
    params: {
      "LAYERS": "ALKIS",
      "TILED": true, // "true" sollte ohne Anführungszeichen sein
      "VERSION": "1.3.0"
    },
  }),
});

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

const exp_bw_due_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_due.geojson' + '?bbox=' + extent.join(',');},strategy: bboxStrategy }),
  title: 'Düker', // Titel für den Layer-Switcher
  permalink:"due", 
  name: 'due', // Titel für den Layer-Switcher
  style: dueStyle,
  visible: false
});

const exp_bw_weh_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_weh.geojson' + '?bbox=' + extent.join(',');},strategy: bboxStrategy}),
  title: 'weh', // Titel für den Layer-Switcher
  permalink:"weh", 
  name: 'weh', // Titel für den Layer-Switcher
  style: wehStyle,
  visible: true
});
const exp_bw_bru_nlwkn_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_bw_bru_nlwkn.geojson' + '?bbox=' + extent.join(','); }, strategy: bboxStrategy }),
  title: 'bru_nlwkn', 
  permalink:"bru_nlwkn",
  name: 'bru_nlwkn', // Titel für den Layer-Switcher
  style: bru_nlwknStyle,
  visible: false
});
const exp_bw_bru_andere_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url:function (extent) {return './myLayers/exp_bw_bru_andere.geojson' + '?bbox=' + extent.join(','); }, strategy: bboxStrategy }),
  title: 'bru_andere',
  permalink:"bru_andere", 
  name: 'bru_andere', 
  style: bruAndereStyle,
  visible: false
});
const exp_gew_info_layer = new VectorLayer({
  source: new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {return './myLayers/exp_gew_info.geojson' + '?bbox=' + extent.join(','); }, strategy: bboxStrategy }),
  title: 'Gew, Info', 
  permalink:"gew_info", 
  name: 'gew_info',
  style: getStyleForArtGewInfo,
  //style: combinedStyle,
  visible: false
});
const exp_bw_son_lin_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_bw_son_lin.geojson' + '?bbox=' + extent.join(','); }, strategy: bboxStrategy }), 
  title: 'Sonstig, Linien',
  permalink:"son_lin", 
  name: 'son_lin',
  style: getStyleForArtSonLin,
  visible: false
});

const wmsNsgLayer = new TileLayer({
  title: "NSG",
  name: "NSG",
  source: new TileWMS({
    url: 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Naturschutzgebiet',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: false,
  opacity: .5,
});
const wmsLsgLayer = new TileLayer({
  title: "LSG",
  name: "LSG",
  source: new TileWMS({
    url: 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Landschaftsschutzgebiet',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: false,
  opacity: .5,
});
const wmsUesgLayer = new TileLayer({
  title: "ÜSG",
  name: "ÜSG",
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/HWSchutz_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Überschwemmungsgebiete_Verordnungsfläechen_Niedersachsen11182',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: false,
  opacity: .5,
});
const wmsWrrlFgLayer = new TileLayer({
  title: "Fließgew.",
  name: "Fließgew.",
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/WRRL_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Natuerliche_erheblich_veraenderte_und_kuenstliche_Fliessgewaesser',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: false,
  opacity: 1,
});
const wmsGewWmsFgLayer = new TileLayer({
  title: "GewWms",
  name: "GewWms",
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/Hydro_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Gewässernetz',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: true,
  opacity: 1,
});


//---------------------------------------------Layergruppen
const BwGroupP = new LayerGroup({
  title: "BauwP",
  name: "BauwP",
  fold: true,
  fold: 'close',
  layers: [ exp_bw_due_layer, exp_bw_bru_andere_layer, exp_bw_bru_nlwkn_layer, exp_bw_weh_layer ],
  
});

const BwGroupL = new LayerGroup({
  title: "Bauw.(L)",
  name: "BauwL",
  fold: true,
  fold: 'close',  
  layers: [ exp_bw_son_lin_layer, exp_gew_info_layer ]
});

const wmsLayerGroup = new LayerGroup({
  title: "WMS-Lay",
  name: "WMS-Lay",
  fold: true,
  fold: 'close',
  visible: false,
  layers: [ Alkis_layer, wmsLsgLayer, wmsNsgLayer, wmsUesgLayer, wmsWrrlFgLayer, wmsGewWmsFgLayer ]
});

const BaseGroup = new LayerGroup({
  title: "Base",
  name: "Base",
  fold: true,
  fold: 'close',
  layers: [ESRIWorldImagery, ESRIWorldGrey, googleHybLayer, googleSatLayer, dop20ni_layer, baselayer, osmTileGr, osmTileCr]
});



map.addLayer(BaseGroup);
map.addLayer(gew_layer_layer);
map.addLayer(wmsLayerGroup);
map.addLayer(BwGroupL);
map.addLayer(BwGroupP);


const layerSwitcher = new LayerSwitcher({ 
  activationMode: 'click', 
  reverse: true, 
  trash: true, 
  tipLabel: 'Legende', 
 });
map.addControl(layerSwitcher);
layerSwitcher.set('title', 'Layer');

const source = new VectorSource();
const vector = new VectorLayer({
  displayInLayerSwitcher: true,
  title: "Messung",
  name: "Messung",
  source: source,
  style: {
    'fill-color': 'rgba(136, 136, 136, 0.526)',
    'stroke-color': 'blue',
    'stroke-width': 2,
    'circle-radius': 7,
    'circle-fill-color': '#ffcc33',
  }, 
});
map.addLayer(vector);

// Add the editbar
var select = new Select({ title: 'Auswahl'});
select.set('title', 'Auswahl');
var edit = new EditBar({
  interactions: { 
    
    Select: select,
    DrawLine: 'Polylinie',
    DrawPolygon: 'Polygon',
    DrawHole: 'Loch',
    DrawPoint: 'Punkt',
    DrawRegular: false,
    ModifySelect: 'Bearbeiten',
    DragRotateAndZoom: 'Zoom',
    DragAndDrop: 'Drag&Drop',   
    Split: false,
    Offset: false,
  },
  source: vector.getSource() 
  
});
map.addControl(edit);

// Add a tooltip
var tooltip = new Tooltip();
map.addOverlay(tooltip);

edit.getInteraction('Select').on('select', function(e){
  if (this.getFeatures().getLength()) {
    tooltip.setInfo('Punkte ziehen');
  }
  else tooltip.setInfo();
});
edit.getInteraction('Select').on('change:active', function(e){
  tooltip.setInfo('');
});
edit.getInteraction('ModifySelect').on('modifystart', function(e){
  if (e.features.length===1) tooltip.setFeature(e.features[0]);
});
edit.getInteraction('ModifySelect').on('modifyend', function(e){
  tooltip.setFeature();
});
edit.getInteraction('DrawPoint').on('change:active', function(e){
  tooltip.setInfo(e.oldValue ? '' : 'Click map to place a point...');
});
edit.getInteraction('DrawLine').on(['change:active','drawend'], function(e){
  tooltip.setFeature();
  tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing line...');
});
edit.getInteraction('DrawLine').on('drawstart', function(e){
  tooltip.setFeature(e.feature);
  tooltip.setInfo('Click to continue drawing line...');
});
edit.getInteraction('DrawPolygon').on('drawstart', function(e){
  tooltip.setFeature(e.feature);
  tooltip.setInfo('Click to continue drawing shape...');
});
edit.getInteraction('DrawPolygon').on(['change:active','drawend'], function(e){
  tooltip.setFeature();
  tooltip.setInfo(e.oldValue ? '' : 'Click map to start drawing shape...');
});
edit.getInteraction('DrawHole').on('drawstart', function(e){
  tooltip.setFeature(e.feature);
  tooltip.setInfo('Click to continue drawing hole...');
});
edit.getInteraction('DrawHole').on(['change:active','drawend'], function(e){
  tooltip.setFeature();
  tooltip.setInfo(e.oldValue ? '' : 'Click polygon to start drawing hole...');
});

//import { getArea, getLength } from 'ol/sphere';


edit.on('info', function(e) {
  const features = e.features;
  let message = '<i class="fa fa-info-circle"></i> ' + features.getLength() + ' feature(s) selected';

  if (features.getLength() === 1) {
    const feature = features.item(0);
    const geometry = feature.getGeometry();
    const type = geometry.getType();

    if (type === 'Point') {
      const coord3857 = geometry.getCoordinates(); // Originale Koordinate (vermutlich in EPSG:3857)
      const coord4326 = toLonLat(coord3857); // Umwandlung in EPSG:4326

      message += ` – Koordinaten:<br>
        <b>EPSG:4326</b>: ${coord4326[1].toFixed(6)}, ${coord4326[0].toFixed(6)}<br>
        <b>EPSG:3857</b>: ${coord3857[1].toFixed(2)}, ${coord3857[0].toFixed(2)}`;

    } else if (type === 'LineString') {
      const length = getLength(geometry);
      const lengthStr = (length > 1000)
        ? (length / 1000).toFixed(2) + ' km'
        : length.toFixed(2) + ' m';
      message += ' – Länge: ' + lengthStr;

    } else if (type === 'Polygon' || type === 'MultiPolygon') {
      const area = getArea(geometry);
      const areaStr = (area > 1e6)
        ? (area / 1e6).toFixed(2) + ' km²'
        : area.toFixed(2) + ' m²';
      message += ' – Fläche: ' + areaStr;
    }
  }

  note.show(message, { 
    duration: -1,
    //className: 'ol-notification'
  });
  
});

// Zuerst die EditBar unsichtbar machen, bevor sie sichtbar wird
const editBarElement = edit.element;
editBarElement.style.display = 'none'; // EditBar ist initial unsichtbar

// OpenLayers Button erstellen
var toggleEditBarButton = new Button({
  title: 'Toggle EditBar',
  handleClick: function() {
    
    // Überprüfen, ob die EditBar aktiv ist
    const currentEditionState = edit.get('edition');
    console.log('currentEditionState', currentEditionState);

    if (currentEditionState === undefined || currentEditionState === false) {
      // Aktiviert die EditBar und Interaktionen
      edit.set('edition', true);
      editBarElement.style.display = ''; // Zeige die EditBar

      // Interaktionen aktivieren
      const mapInteractions = map.getInteractions();
      mapInteractions.forEach(function(interaction) {
        // Nur relevante Interaktionen aktivieren (z.B. Modify, Select)
        if (interaction instanceof ol.interaction.Select || interaction instanceof ol.interaction.Modify) {
          interaction.setActive(true); // Aktiviert die Interaktionen
        }
      });
    } else {
      // Deaktiviert die EditBar und Interaktionen
      edit.set('edition', false);
      editBarElement.style.display = 'none'; // Verstecke die EditBar

      // Alle Steuerungen in der EditBar deaktivieren
      edit.deactivateControls(); // Deaktiviert alle Interaktionen und Steuerelemente innerhalb der EditBar

      // Interaktionen von der Karte deaktivieren
      const mapInteractions = map.getInteractions();
      mapInteractions.forEach(function(interaction) {
        // Nur relevante Interaktionen deaktivieren (z.B. Modify, Select)
        if (interaction instanceof ol.interaction.Select || interaction instanceof ol.interaction.Modify) {
          interaction.setActive(false); // Deaktiviert die Interaktionen
        }
      });
    }
  }
});

// Der Button wird zur Karte hinzugefügt
map.addControl(toggleEditBarButton);
