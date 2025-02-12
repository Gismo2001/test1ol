import './style.css';

import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';

import {Vector as VectorSource} from 'ol/source.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import * as LoadingStrategy from 'ol/loadingstrategy';

import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';

import { add } from './myFunc'; // 
import { UTMToLatLon_Fix } from './myFunc'; // 
import { sleStyle, wehStyle } from './extStyle';

import * as proj from 'ol/proj';
import {getArea, getLength} from 'ol/sphere.js';
import {unByKey} from 'ol/Observable.js';
import { FullScreen, Attribution, defaults as defaultControls, ZoomToExtent, Control } from 'ol/control.js';
import { DragRotateAndZoom } from 'ol/interaction.js';
import { defaults as defaultInteractions } from 'ol/interaction.js';
import { singleClick } from 'ol/events/condition';

import LayerSwitcher from 'ol-ext/control/LayerSwitcher';

const mapView = new View({
  center: proj.fromLonLat([7.35, 52.7]),
  zoom: 9
});

const attribution = new Attribution({
  collapsible: false,
  html: '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>'
});

const map = new Map({
  target: "map",
  view: mapView,
  controls: defaultControls().extend([
    new FullScreen(),
    new ZoomToExtent({
       extent: [727361, 6839277, 858148, 6990951] // Geben Sie hier das Ausdehnungsintervall an
     }),
    attribution // Fügen Sie hier Ihre benutzerdefinierte Attribution-Steuerung hinzu
  ]),
  interactions: defaultInteractions().extend([new DragRotateAndZoom()])
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
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/gew.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'gew', // Titel für den Layer-Switcher
  name: 'gew',
  style: new Style({
    fill: new Fill({ color: 'rgba(0,28, 240, 0.4)' }),
    stroke: new Stroke({ color: 'blue', width: 2 })
  })
})
map.addLayer(gew_layer_layer);

const exp_bw_sle_layer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
      return './myLayers/exp_bw_sle.geojson' + '?bbox=' + extent.join(',');
    },
    strategy: LoadingStrategy.bbox
  }),
  title: 'Schleuse', // Titel für den Layer-Switcher
  name: 'sle', // Titel für den Layer-Switcher
  style: sleStyle,
  visible: true,
  trash: false,
});
map.addLayer(exp_bw_sle_layer);

const exp_bw_weh_layer = new VectorLayer({
  source: new VectorSource({
    format: new GeoJSON(),
    url: function (extent) {
      return './myLayers/exp_bw_weh.geojson' + '?bbox=' + extent.join(',');
    },
    strategy: LoadingStrategy.bbox
  }),
  title: 'Wehr', // Titel für den Layer-Switcher
  name: 'weh', // Titel für den Layer-Switcher
  style: wehStyle,
  visible: true,
});
map.addLayer(exp_bw_weh_layer);


const layerSwitcher = new LayerSwitcher({ 
  activationMode: 'click', 
  reverse: true, 
  trash: true, 
  tipLabel: 'Legende', 
 });
map.addControl(layerSwitcher);

const result1 = add(5, 10);
console.log('Das Ergebnis Addition ist:', result1); // Ausgabe: Das Ergebnis der Addition ist: 15
let result2 = UTMToLatLon_Fix(369450, 5829520, 32, true);
console.log('Das Ergebnis Umrechung ist:', result2); // Ausgabe: Das Ergebnis der Addition ist: 15