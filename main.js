import './style.css';
import {Map, View} from 'ol';
import * as LoadingStrategy from 'ol/loadingstrategy';
//import {bbox as bboxStrategy, tile} from 'ol/loadingstrategy.js';
import jsPDF from 'jspdf';
import Feature from 'ol/Feature';
import Overlay from 'ol/Overlay.js';
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
import Permalink from 'ol-ext/control/Permalink';

import {Select} from 'ol/interaction.js';
import {Draw} from 'ol/interaction.js';
import {getLength as getLengthLine, getArea as getAreaPolygon} from 'ol/sphere.js';   
import LayerSwitcher from 'ol-ext/control/LayerSwitcher';


import {FullScreen, Attribution, defaults as defaultControls, ZoomToExtent, Control, Rotate } from 'ol/control.js';
import {Vector as VectorLayer} from 'ol/layer.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import KML from 'ol/format/KML.js';

import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';


import {circular} from 'ol/geom/Polygon';
import {LineString, Polygon, Point, Circle} from 'ol/geom.js';

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
import Legend from 'ol-ext/control/Legend';

import { toLonLat, transform } from 'ol/proj';
import { format } from 'ol/coordinate';


 
import contextFeature from 'ol/Feature';
import ContextMenu from 'ol-contextmenu';
import pinIcon from './data/pin.png';
import centerIcon from 'ol-contextmenu';
import listIcon from 'ol-contextmenu';


import { Text } from 'ol/style';
import { Icon } from 'ol/style';

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
  getStyleForArtGewInfo,
  
} from './extStyle';



import { 
  myFuncInfoDiv,
  UTMToLatLon_Fix,
  generatePopupHTML,
  zoomToFeature,
  makeDivDraggable
} from './myFunctions';

import proj4 from 'proj4';
import { register } from 'ol/proj/proj4';
import SearchPhoton from 'ol-ext/control/SearchPhoton';
import WMSCapabilities from'ol-ext/control/WMSCapabilities';
import { getCenter } from 'ol/extent'; // ❗ WICHTIG: oben importieren

// von EPSG:32632 (UTM 32N) nach EPSG:3857 (WebMercator)
var firstProjection = "EPSG:32632";
var secondProjection = "EPSG:3857";

var resultkoord = proj4(firstProjection, secondProjection, [500000, 5800000]);
console.log(resultkoord);



function isMobileDevice() {
  return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

if (isMobileDevice()) {
  console.log("Mobilgerät erkannt");
} else {
  console.log("Desktopgerät erkannt");
}


proj4.defs("EPSG:32632", "+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs");
proj4.defs('EPSG:25832', '+proj=utm +zone=32 +ellps=GRS80 +units=m +no_defs');
proj4.defs("EPSG:31467", "+proj=tmerc +lat_0=0 +lon_0=9 +k=1.000000 +x_0=3500000 +y_0=0 +datum=potsdam +units=m +no_defs");
proj4.defs("EPSG:31466", "+proj=tmerc +lat_0=0 +lon_0=6 +k=1.000000 +x_0=2500000 +y_0=0 +datum=potsdam +units=m +no_defs");
ol.proj.proj4.register(proj4);


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
    attribution,
  ]),
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
map.addControl(note);



var permalinkControl = new Permalink({
  title: 'Permalink',
  anchor: true,   // setzt ein # in die URL
  layers: true,   // speichert Layer-Status (sichtbar / unsichtbar)
  updateUrl: false,   // wichtig!
  urlreplace: true, // ersetzt den kompletten URL (nützlich bei Nutzung von Routenplanern etc.)
  //geohash: true,
  //fixed: 2,
  groups: true
  // rotation: true // falls du auch Kartenrotation speichern willst
});
map.addControl(permalinkControl);

// Direkt nach dem Laden einmal den Hash löschen
//window.location.hash = '';

permalinkControl.element.addEventListener('click', function() {
  const link = permalinkControl.getLink()
  navigator.clipboard.writeText(link);
  note.show(`Kopiert und in url an-/ausgeschaltet! `, { duration: 2000, className: 'ol-notification' });
  note.element.style.bottom = '50px';
  // toggle CSS-Klasse "active"
  permalinkControl.element.classList.toggle('active');
});



// ===== Automatisch für alle Layers mit permalink: Sichtbarkeit + Opacity speichern =====
map.getLayers().forEach(layer => {
  const key = layer.get('permalink');
  if (key) {
    // Sichtbarkeit wird automatisch von 'layers: true' übernommen
    // Transparenz speichern
    permalink.addParam(key + '_opacity', {
      get: () => layer.getOpacity().toFixed(2),
      set: val => layer.setOpacity(parseFloat(val))
    });
  }
});
const permalinkButton = permalinkControl.element.querySelector('a');


//_____-----------------------------------------------------------------APrint
map.addControl(new CanvasAttribution());
map.addControl(new CanvasTitle({ 
  title: '', 
  visible: false,
  style: new Style({ 
    text: new Text({ font: 'bold 12pt "Arial",Verdana,Geneva,Lucida,Lucida Grande,Helvetica,sans-serif' })
  }),
}));
map.addControl(new CanvasScaleLine());
var printControl = new PrintDialog({title:'Drucken', lang:'de'});
printControl.setSize('A4');
printControl.setOrientation('portrait');

printControl.on(['print', 'error'], function(e) {
  if (e.image) {
    if (e.pdf) {
      var pdf = new jsPDF({
        orientation: e.print.orientation,
        unit: e.print.unit,
        format: e.print.size
      });
      pdf.addImage(e.image, 'JPEG', e.print.position[0], e.print.position[1], e.print.imageWidth, e.print.imageHeight);
      pdf.save(e.print.legend ? 'legend.pdf' : 'map.pdf');
    } else  {
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
      }}
  } else {
    console.warn('No canvas to export');
  }
});

//---------------------------------------------------Marker für Adresssuche
const sourceP = new VectorSource();
let layerP = null; // Initial kein Layer vorhanden
let isFirstZoom = true; // Variable, um den ersten Zoom zu verfolgen
let watchId = null; // Variable, um die Watch-ID der Geolokalisierung zu speichern

//Button für Positionierung
const locateP = document.createElement('div');
let isActive = false; // Variable, um den Aktivierungsstatus der Geolokalisierung zu verfolgen

//die Layer
const exp_gew_fla_vecLayer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_gew_info_fla.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Gewässerflächen', // Titel für den Layer-Switcher
  permalink: 'exp_gew_fla',
  name: 'exp_gew_fla',
  style: exp_gew_fla_vecStyle,
  visible: false
});

const exp_gew_biotope_noh = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_bw_biotope_noh.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Biotope_Noh', // Titel für den Layer-Switcher
  name: 'exp_bw_biotope_noh',
  permalink: 'exp_bw_biotope_noh',
  style: exp_gew_fla_vecStyle,
  visible: false
});

const gehoelz_vecLayer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/gehoelz_vec.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Gehölz(Plan)', // Titel für den Layer-Switcher
  name: 'gehoelz_vec',
  style: gehoelz_vecStyle,
  visible: false
});
const exp_allgm_fsk_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_allgm_fsk.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'fsk',
  name: 'fsk', 
  permalink:'fsk', 
  style: getStyleForArtFSK,
  visible: false,
  minResolution: 0,
  maxResolution: 4
})
const exp_bw_son_lin_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_bw_son_lin.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }), 
  title: 'Sonstig, Linien',
  permalink:'son_lin',  
  name: 'son_lin',
  style: getStyleForArtSonLin,
  visible: false
});

const exp_gew_umn_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_gew_umn.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'U-Maßnahmen', 
  name: 'gew_umn',
  permalink: 'gew_umn',
  style: getStyleForArtUmn,
  visible: false
});
const exp_gew_info_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_gew_info.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Gew, Info', 
  name: 'gew_info',
  permalink: 'gew_info', 
  style: getStyleForArtGewInfo,
  visible: false
});
const gew_layer_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/gew.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'gew', 
  name: 'gew',
  style: new Style({fill: new Fill({ color: 'rgba(0,28, 240, 0.4)' }),stroke: new Stroke({ color: 'blue', width: 2 }) }),
  visible: true
})

const exp_bw_son_pun_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_son_pun.geojson' + '?bbox=' + extent.join(','); },strategy: LoadingStrategy.bbox}),
  title: 'Sonstige, Punkte', 
  name: 'son_pun', 
  permalink:'son_pun', 
  style: getStyleForArtSonPun,
  visible: false
});
const exp_bw_ein_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_ein.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Einläufe', 
  name: 'ein', 
  permalink:'ein',  
  style: getStyleForArtEin,
  visible: false
});
const exp_bw_que_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_que.geojson' + '?bbox=' + extent.join(',');},strategy: LoadingStrategy.bbox}),
  title: 'Querung', 
  name: 'que', 
  permalink:'que',  
  style: queStyle,
  visible: false
});
const exp_bw_due_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_due.geojson' + '?bbox=' + extent.join(',');},strategy: LoadingStrategy.bbox }),
  title: 'Düker', 
  name: 'due', 
  permalink:'due',  
  style: dueStyle,
  visible: false
});
const exp_bw_weh_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url: function (extent) {return './myLayers/exp_bw_weh.geojson' + '?bbox=' + extent.join(',');},strategy: LoadingStrategy.bbox}),
  title: 'Wehr', 
  name: 'weh', 
  permalink:'weh',
  style: wehStyle,
  visible: false
});
const exp_bw_bru_nlwkn_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/exp_bw_bru_nlwkn.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Brücke (NLWKN)', 
  name: 'bru_nlwkn', // Titel für den Layer-Switcher
  permalink:'bru_nlwkn',  // Um Permalink zu setzen
  style: bru_nlwknStyle,
  visible: false
});
const exp_bw_bru_andere_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url:function (extent) {return './myLayers/exp_bw_bru_andere.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'Brücke (andere)',
  name: 'bru_andere', 
  permalink:'bru_andere',  
  style: bruAndereStyle,
  visible: false
});

const exp_bw_sle_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(),url:function (extent) {return './myLayers/exp_bw_sle.geojson' + '?bbox=' + extent.join(',');},strategy: LoadingStrategy.bbox }),
  title: 'Schleuse', 
  name: 'sle', 
  permalink:'sle', 
  style: sleStyle,
  visible: true, 
});

const km10scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_10_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km10scal',
  name: 'km10scal',
  permalink:'km10scal',
  style: km10scalStyle,
  visible: true,
  minResolution: 0,
  maxResolution: 1
});
const km100scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_100_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km100scal',
  name: 'km100scal',
  permalink:'km100scal',
  style: function(feature, resolution) {return km100scalStyle(feature, feature.get('km'), resolution);  },
  visible: true,
  minResolution: 0,
  maxResolution: 3 
});
const km500scal_layer = new VectorLayer({
  source: new VectorSource({format: new GeoJSON(), url: function (extent) {return './myLayers/km_500_scal.geojson' + '?bbox=' + extent.join(','); }, strategy: LoadingStrategy.bbox }),
  title: 'km500scal',
  name: 'km500scal',
  permalink:'km500scal',
  style: function(feature, resolution) {return km500scalStyle(feature, feature.get('km'), resolution);  },
  visible: true  
});

const wmsNsgLayer = new TileLayer({
  title: "NSG",
  name: "NSG",
  permalink:'NSG',  
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
  permalink:'LSG',  
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
  title: 'ÜSG',
  name: 'UESG',
  permalink:'UESG',
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
  title: 'Fließgew.',
  name: 'Fließgew',
  permalink:'Fließgew',
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
  title: 'GewWms',
  name: 'Gewaesser',
  permalink:'Gewaesser',
  source: new TileWMS({
    url:  'https://www.umweltkarten-niedersachsen.de/arcgis/services/Hydro_wms/MapServer/WMSServer',
    params: {
      'LAYERS': 'Gewässernetz',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    },
  }),
  visible: false,
  opacity: 1,
});


const wmsBiotopeEL = new TileLayer({
  title: 'Biotope_EL',
  name: 'Biotope_EL',
  permalink:'Biotope_EL',  
  source: new TileWMS({
  url:  'https://geodaten.emsland.de/core-services/services/lkel_fb67_naturschutz_und_forsten_wms',
  params: {
      'LAYERS': 'lkel_fb67_p30biotope',
      'FORMAT': 'image/png',
      'TRANSPARENT': true,
      'TILED': true,
    }, 
  }),
  visible: false,
  opacity: 1,
});

const gnAtlas2023 = new TileLayer({
  title: '2023_NI',
  name: '2023_NI',
  permalink:'2023_NI',
  source: new TileWMS(({
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/dop_wms",
    attributions: 'Orthophotos Niedersachsen, LGLN',
    params: {"LAYERS": "ni_dop20", "TILED": "true", "VERSION": "1.3.0"},
  })),
  opacity: 1,
  visible: false,
});
const gnAtlas2020 = new TileLayer({
  title: '2020_NI',
  name: '2020_NI',
  permalink:'2020_NI',
  source: new TileWMS(({
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/doph_wms?",
    attributions: ' ',
    params: {"LAYERS": "ni_dop20h_rgb_2020", "TILED": "true", "VERSION": "1.3.0"},
  })),
  opacity: 1,
  visible: false,
});
const gnAtlas2017 = new TileLayer({
  title: '2017_NI',
  name: '2017_NI',
  permalink:'2017_NI',
  source: new TileWMS(({
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/doph_wms?",
    attributions: ' ',
    params: {"LAYERS": "ni_dop20h_rgb_2017", "TILED": "true", "VERSION": "1.3.0"},
  })),
  opacity: 1,
  visible: false,
});
const gnAtlas2014 = new TileLayer({
  title: '2014_NI',
  name: '2014_NI',
  permalink:'2014_NI',
  source: new TileWMS(({
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/doph_wms?",
    attributions: ' ',
    params: {"LAYERS": "ni_dop20h_rgb_2014", "TILED": "true", "VERSION": "1.3.0"},
  })),
  opacity: 1,
  visible: false,
});

const gnAtlas2012 = new TileLayer({
  title: '2012_NOH',
  name: '2012_NOH',
  permalink: '2012_NOH',
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "9", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});
const gnAtlas2011 = new TileLayer({
  title: '2011_NI',
  name: '2011_NI',
  permalink:'2011_NI',
  source: new TileWMS(({
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/doph_wms?",
    attributions: ' ',
    params: {"LAYERS": "ni_dop20h_rgb_2011", "TILED": "true", "VERSION": "1.3.0"},
  })),
  opacity: 1,
  visible: false,
});
const gnAtlas2010 = new TileLayer({
  title: '2010_NOH',
  name: '2010_NOH',
  permalink:'2010_NOH',
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "8", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});
const gnAtlas2009 = new TileLayer({
  title: '2009_NOH',
  name: '2009_NOH',
  permalink:'2009_NOH',
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "7", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});
const gnAtlas2002 = new TileLayer({
  title: '2002_NOH',
  name: '2002_NOH',
  permalink:'2002_NOH',
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "6", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});

const gnAtlas1990 = new TileLayer({
  title: '1990_NOH',
  name: '1990_NOH',
  permalink:'1990_NOH',
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "5", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});

const gnAtlas1980 = new TileLayer({
  title: '1980_NOH',
  name: '1980_NOH',
  permalink:'1980_NOH',
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "4", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});
const gnAtlas1970 = new TileLayer({
  title: '1970_NOH',
  name: '1970_NOH',
  permalink:'1970_NOH',
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "3", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});
const gnAtlas1957 = new TileLayer({
  title: '1957_NOH',
  name: '1957_NOH',
  permalink:'1957_NOH',
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "2", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});
const gnAtlas1937 = new TileLayer({
  title: '1937_NOH',
  name: '1937_NOH',
  permalink:'1937_NOH',
  source: new TileWMS(({
      url: "https://geo.grafschaft.de/arcgis/services/Migratrion_Okt_2020/BAS_Luftbilder_2/MapServer/WMSServer",
      attributions: ' ',
     params: {"LAYERS": "1", "TILED": "true", "VERSION": "1.3.0"},
    })),
  opacity: 1,
  visible: false,
});

var baseDE_layer = new TileLayer({
  title: 'Base-DE',
  name: 'baseDe',
  permalink:'baseDE',
  type: 'base',
  source: new TileWMS({
    url: "https://sgx.geodatenzentrum.de/wms_basemapde",
    attributions: '© GeoBasis-DE / BKG (Jahr des letzten Datenbezugs) CC BY 4.0',
    params: {
      "LAYERS": "de_basemapde_web_raster_farbe",
      "TILED": true,
      "VERSION": "1.3.0"
    },
  }),
  opacity: 1,
  visible: false,
});
var dop20ni_layer = new TileLayer({
  title: 'DOP20 NI',
  name: 'dop20ni',
  permalink:'dop20ni',
  type: 'base',
  source: new TileWMS({
    url: "https://opendata.lgln.niedersachsen.de/doorman/noauth/dop_wms",
    attributions: 'Orthophotos Niedersachsen, LGLN',
    params: {
      "LAYERS": "ni_dop20",
      "TILED": true, 
      "VERSION": "1.3.0"
    },
  }),
  opacity: 1,
  visible: false,  
});
const googleSatLayer = new TileLayer({
  title: 'GoogleSat',
  name: 'googleSat',
  permalink:'googleSat',
  type: 'base',
  baseLayer: false,
  source: new TileImage({url: 'http://mt1.google.com/vt/lyrs=s&hl=pl&&x={x}&y={y}&z={z}' }),
  opacity: 1,
  visible: false,
});
const googleHybLayer = new TileLayer({
  title: 'GoogleHybrid',
  name: 'googleHybrid',
  permalink:'googleHybrid',
  type: 'base',
  baseLayer: false,
  opacity: 1,
  visible: false,
  source: new TileImage({url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}' })
});
const ESRIWorldImagery = new TileLayer({
  title: 'ESRI-Sat',
  name: 'ESRISat',
  permalink:'ESRISat',
  type: 'base',
  source: new XYZ({
    attributions: 'Powered by Esri',
    url: 'https://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
  }),
  opacity: 1,
  visible: false,
});
const ESRIWorldGrey = new TileLayer({
  title: 'ESRI-Grey',
  name: 'ESRIGrey',
  permalink:'ESRIGrey',
  type: 'base',
  source: new XYZ({
      attributions: 'Powered by Esri',
      url: 'http://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
  }),
  opacity: 1,
  visible: false,  
});

const osmTileGr = new TileLayer({
  title: 'osm-grey',
  name: 'osmgrey',
  permalink:'osmgrey',
  className: 'bw',
  type: 'base',
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
  opacity: 1,
  visible: false,
});
const osmTileCr = new TileLayer({
  title: 'osm-color',
  name: 'osmcolor',
  permalink:'osmcolor',
  type: 'base',
  source: new OSM({
      url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      //attributions: ['© OpenStreetMap contributors', 'Tiles courtesy of <a href="https://www.openstreetmap.org/"></a>'],
  }),
  opacity: 0.75,
  visible: true, 
});

var Alkis_layer = new TileLayer({
  title: 'ALKIS',
  name: 'ALKIS',
  permalink:'ALKIS',
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
  opacity: 1,
  visible: false,  
});

const layerSwitcher = new LayerSwitcher({ 
  activationMode: 'click', 
  reverse: true, 
  trash: true, 
  tipLabel: 'Legende',
  onchangeCheck: function(layer, checked) {
     // console.log('Layer:', layer);  // Das gesamte Layer-Objekt
      //console.log('Layer Name:', layer.get('name')); // Den Namen des Layers abrufen

      if (checked) {
      //    console.log('Layer wurde aktiviert:', layer.get('name'));
          // Hier  weitere Aktionen
      } else {
         // console.log('Layer wurde deaktiviert:', layer.get('name'));
          // Hier weitere Aktionen
      }
  }
});
map.addControl(layerSwitcher);

//----------------------------------------------------------------------------------------------------Layergruppen
const BwGroupP = new LayerGroup({
  title: 'Bauw.(P)',
  name: 'BauwP',
  permalink:'BauwP',
  fold: true,
  fold: 'close',
  layers: [ exp_bw_son_pun_layer, exp_bw_ein_layer, exp_bw_que_layer, exp_bw_due_layer, exp_bw_bru_andere_layer, exp_bw_bru_nlwkn_layer, exp_bw_weh_layer, exp_bw_sle_layer],
  
});
const BwGroupL = new LayerGroup({
  title: 'Bauw.(L)',
  name: 'BauwL',
  permalink:'BauwL',
  fold: true,
  fold: 'close',
  visible: true,  
  layers: [ gehoelz_vecLayer, exp_gew_biotope_noh, exp_gew_fla_vecLayer, exp_gew_umn_layer, exp_bw_son_lin_layer, exp_gew_info_layer ]
});
const wmsLayerGroup = new LayerGroup({
  title: 'WMS-Lay',
  name: 'WMS-Lay',
  permalink:'WMS-Lay',
  fold: true,
  fold: 'close',
  visible: true,
  layers: [ Alkis_layer, wmsLsgLayer, wmsNsgLayer, wmsBiotopeEL, wmsUesgLayer, wmsWrrlFgLayer, wmsGewWmsFgLayer ]
});
const GNAtlasGroup = new LayerGroup({
  title: 'Luftbilder',
  name: 'Luftbilder',
  permalink:'Luftbilder',
  fold: true,
  fold: 'close',
  visible: false,
  layers: [gnAtlas1937, gnAtlas1957, gnAtlas1970, gnAtlas1980,  gnAtlas1990, gnAtlas2002, gnAtlas2009, gnAtlas2010,gnAtlas2011, gnAtlas2012, gnAtlas2014, gnAtlas2017, gnAtlas2020, gnAtlas2023]
});
const kmGroup = new LayerGroup({
  title: 'Station',
  name: 'Station',
  permalink:'Station',
  fold: true,
  fold: 'close',
  visible: true,
  layers: [km10scal_layer, km100scal_layer, km500scal_layer]
});
const BaseGroup = new LayerGroup({
  title: 'Base',
  name: 'Base',
  permalink:'Base',
  fold: true,
  fold: 'close',
  visible: true,
  layers: [ESRIWorldImagery, ESRIWorldGrey, googleHybLayer, googleSatLayer, dop20ni_layer, baseDE_layer, osmTileGr, osmTileCr]
});


const source = new VectorSource();
const vector = new VectorLayer({
  displayInLayerSwitcher: false,
  title: "tmp_Layer1",
  name: "tmp_Layer1",
  source: source,
  style: {
    'fill-color': 'rgba(136, 136, 136, 0.526)',
    'stroke-color': 'blue',
    'stroke-width': 2,
    'circle-radius': 7,
    'circle-fill-color': '#ffcc33',
  }, 
 
});


map.addLayer(BaseGroup);
map.addLayer(GNAtlasGroup);
map.addLayer(exp_allgm_fsk_layer);-
map.addLayer(gew_layer_layer);
map.addLayer(wmsLayerGroup);
map.addLayer(kmGroup);
map.addLayer(BwGroupL);
map.addLayer(BwGroupP);
map.addLayer(vector); 

const excludedLayerNames = ['gew', 'km10scal', 'km100scal', 'km500scal'];





const selectInteraction = new Select({
  layers: function(layer) {
    const name = layer.get('name');
    return !excludedLayerNames.includes(name);
  },
  hitTolerance: 5,
  multi: true
});

map.addInteraction(selectInteraction);



//------------------------------------------------------------------------------Info für WMS-Layer
var toggleButtonU = new Toggle({
  html: '<i class="icon fa-fw fa fa-arrow-circle-down" aria-hidden="true"></i>',
  className: "select",
  title: "WMS Info",
  active: true, // Button wird beim Start als aktiv gesetzt
  interaction: selectInteraction,
  onToggle: function(active) {
    alert("Jetzt ist BW-Abfrage " + (active ? "aktiviert" : "deaktiviert (WMS-Abfrage aktiviert)"));
    selectInteraction.setActive(active);
    
    // Auswahl löschen, wenn deaktiviert
    if (!active) selectInteraction.getFeatures().clear();

    // FeaturPopup hinzufügen oder entfernen
    if (active) map.addOverlay(popup);
    else map.removeOverlay(popup);

    // Klasse 'active' je nach Zustand des Buttons setzen
    toggleButtonU.element.classList.toggle('active', active);
    toggleButtonU.element.querySelector('.icon').classList.toggle('active', active);

    // Ein- und Ausschalten der Interaktion
    
    if (active) map.un('singleclick', singleClickHandler);
    else map.on('singleclick', singleClickHandler);
  }
});
// Klasse 'active' zum Button hinzufügen, um sicherzustellen, dass er beim Start als aktiv dargestellt wird
toggleButtonU.element.classList.add('active');
toggleButtonU.element.querySelector('.icon').classList.add('active');

/* 
var selectInteraction = new Select({
  layers: [vector],
  hitTolerance: 5,
});
var selectFeat = new Select({
  hitTolerance: 5,
  multi: true,
  condition: singleClick,
});
 */
//let layer_selected = null; 
/* 
selectFeat.on('select', function (e) {
  if (editBarAnAus===false ){
  e.selected.forEach(function (featureSelected) {
      const layerName = selectFeat.getLayer(featureSelected).get('name');
      if (layerName !== 'gew') {
          // Setze layer_selected nur, wenn das layerName nicht 'gew' ist
          layer_selected = selectFeat.getLayer(featureSelected);
          
      } else {
          selectFeat.getFeatures().clear(); // Hebt die Selektion auf
          layer_selected = null; 
      }
  }
  );
  }
});
map.addInteraction(selectFeat);
 */
//map.addOverlay(popup);

// ---------------------------------------------------------------------------------------WMS
function getLayersInGroup(layerGroup) {
  const layers = [];
  layerGroup.getLayers().forEach(layer => {
      if (layer instanceof LayerGroup) {
          // Wenn der Layer ein LayerGroup ist, rufe die Funktion rekursiv auf
          layers.push(...getLayersInGroup(layer));
      } else {
          // Füge den Layer zur Liste hinzu, wenn e ein TileLayer ist
          layers.push(layer);
      }
  });
  return layers;
}

function singleClickHandler(evt) {
  console.log ('singleClickHandler');
  const visibleLayers = [];
  map.getLayers().forEach(layer => {
    const layerName = layer.get('name');
    if (layer.getVisible()) {
      if (layer instanceof LayerGroup) {
        if (layerName !== 'GN-DOPs' && layerName !== 'Base' && layerName !== 'Station' && layerName !== 'BauwP' && layerName !== 'BauwL' && layerName !== undefined){
          visibleLayers.push(...getLayersInGroup(layer));
        }
      } else if (layerName !== 'fsk')
      {
        visibleLayers.push(layer);
      }
    }
  });
  const viewResolution = map.getView().getResolution();
  const viewProjection = map.getView().getProjection();
  visibleLayers.forEach(layer => {
    if (layer.getVisible()) {
    const source = layer.getSource();
      if (source instanceof TileWMS && typeof source.getFeatureInfoUrl === 'function') {
        const layerName = layer.get('name');
        console.log('Layer Name:', layerName);
        const url = source.getFeatureInfoUrl(evt.coordinate, viewResolution, viewProjection, {'INFO_FORMAT': 'text/html'});
        if (url) {
          fetch(url)
          .then((response) => response.text())
          .then((html) => {
            //console.log(html)
            if (html.trim() !== '') {
              removeExistingInfoDiv();
              var bodyIsEmpty = /<body[^>]*>\s*<\/body>/i.test(html);
              if (bodyIsEmpty === false) {
                var modifiedHTML = checkForLinkInTH(html);
                const infoDiv = createInfoDiv(layerName, modifiedHTML);
                document.body.appendChild(infoDiv);
                // Funktion zum Verschieben des DIVs
                //dragInfo();
              } else {
                console.log('nichts verwertbares gefunden');
                //alert('nichts verwertbares gefunden');
              }
            }
          })
          .catch((error) => {
            console.error('Fehler beim Abrufen der Daten:', error);
            alert('Es ist ein Fehler aufgetreten');
          });
        }
      }
    }   
  }
)};
function createInfoDiv(name, html) {
  const infoDiv = document.createElement('div');
  infoDiv.id = 'info';
  infoDiv.classList.add('Info');

  const header = document.createElement('div');
  header.classList.add('info-header');
  header.textContent = name || 'Info';

  const closeIcon = document.createElement('span');
  closeIcon.innerHTML = '&times;';
  closeIcon.classList.add('close-icon');
  closeIcon.addEventListener('click', function () {
    infoDiv.style.display = 'none';
  });

  header.appendChild(closeIcon);

  const content = document.createElement('div');
  content.innerHTML = html;

  infoDiv.appendChild(header);
  infoDiv.appendChild(content);

  // Drag-Funktion aktivieren
  makeDivDraggable(infoDiv, header);
  

  return infoDiv;
}
function removeExistingInfoDiv() {
  const existingInfoDiv = document.getElementById('info');
  if (existingInfoDiv) { existingInfoDiv.remove(); }
}

//--------------------------------------------------------------------------Funktionen für Popup
var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');
var popup = new Overlay({
  element: container,
  id: '1',
  autoPan: true,
  autoPanAnimation: {
  duration: 250
  }
});
map.addOverlay(popup);
closer.onclick = function()
{
  popup.setPosition(undefined);
  closer.blur();
  return false;
};
var closer = document.getElementById('popup-closer');

let clickCooldown = false;

map.on('click', function (evt) {
  if (clickCooldown) return;
  clickCooldown = true;
  setTimeout(() => clickCooldown = false, 300); // Sperre für 300ms

  if (editBarAnAus === false) {
    var foundResults = [];
    var seenFeatureIds = new Set();
    
    // Liste leeren  
    var ul = document.getElementById('search-results');
    
    if (ul) {
      while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
      }
    }

    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
      if (!layer) return;

      const lyname = layer.get('name') || '';

      if (lyname !== 'gew' && lyname !== 'km10scal' && lyname !== 'km100scal' && lyname !== 'km500scal') {
        feature.set('layerName', lyname);
        let fid = feature.getId() || JSON.stringify(feature.getProperties());
        
        if (!seenFeatureIds.has(fid)) {
          foundResults.push({feature, layer});
          seenFeatureIds.add(fid);
        }
      }
    });

    const coordinates = evt.coordinate;

    const uniqueResults = getUniqueFeatures(foundResults);

    if (uniqueResults.length === 1) {
      
      const { feature, layer } = uniqueResults[0];
      document.getElementById('search-results-container').style.display = 'none';

      popup.setPosition(coordinates);
      
      content.innerHTML = generatePopupHTML(feature, layer);

      selectInteraction.getFeatures().clear();
      selectInteraction.getFeatures().push(feature);

    } else if (uniqueResults.length > 1) {
      myFuncInfoDiv(uniqueResults, popup, content, selectInteraction, coordinates, map);
    } else {
      popup.setPosition(undefined);
    }

  }
});

function getUniqueFeatures(results) {
  const seen = new Set();
  const unique = [];

  results.forEach(({ feature, layer }) => {
    const layerName = layer.get('name') || 'unknown';
    const fid = feature.getId() || JSON.stringify(feature.getProperties());

    // Kombiniere ID und Layername als eindeutigen Schlüssel
    const key = `${fid}__${layerName}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push({ feature, layer });
    }
  });

  return unique;
}


  /* 
  
  // 🔁 Vorherige Ergebnisse ausblenden und leeren
  document.getElementById("search-results-container").style.display = "none";
  document.getElementById("search-results").innerHTML = '';
  
  var matchingFeatures = [];
  if (editBarAnAus === false) {
    var coordinates = evt.coordinate;
    // ❌ Diese Layernamen ausschließen
    const excludedLayers = ['gew', 'km10scal', 'km100scal', 'km500scal'];

    map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {

      if (layer && !excludedLayers.includes(layer.get('name'))) {
        matchingFeatures.push(feature);
      }
    });

    if (matchingFeatures.length > 1) {
      let wrappedFeatures = matchingFeatures.map(f => ({ feature: f }));
      displaySearchResultsBw(wrappedFeatures);
      document.getElementById("search-results-container").style.display = "block";

      document.getElementById("close-search-results").addEventListener("click", function() {
        document.getElementById("search-results-container").style.display = "none";

      });
    }
    var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {
    var layname = layer.get('name');
    var beschreibLangValue = feature.get('beschreib_lang');
    var beschreibLangHtml = '';
    if (layname !== 'gew' && layname !== 'km10scal' && layname !== 'km100scal' && layname !== 'km500scal'  ) {
    if (beschreibLangValue && beschreibLangValue.trim() !== '') {
      beschreibLangHtml = '<br>' + '<u>' + "Beschreib (lang): " + '</u>' + beschreibLangValue + '</p>';
    };
    // Popup soll nur für bestimmte Layernamen angezeigt werden
    if (layname !== 'gew' && layname !== 'km10scal' && layname !== 'km100scal' && layname !== 'km500scal' && layname !== 'fsk' && layname !== 'sle' && layname !== 'weh' && layname !== 'son_lin' && layname !== 'exp_gew_fla' ) {
        if (feature) {
        coordinates = feature.getGeometry().getCoordinates();
        popup.setPosition(coordinates);
        // HTML-Tag Foto1
        var foto1Value = feature.get('foto1');
        var foto1Html = '';
        var foto2Value = feature.get('foto2');
        var foto2Html = '';
        var foto3Value = feature.get('foto3');
        var foto3Html = '';
        var foto4Value = feature.get('foto4');
        var foto4Html = '';
        
        if (foto1Value && foto1Value.trim() !== '') {
          foto1Html = '<a href="' + foto1Value + '" onclick="window.open(\'' + foto1Value + '\', \'_blank\'); return false;">Foto 1</a>';
        } else {
          foto1Html =   " Foto 1 ";
        }
        if (foto2Value && foto2Value.trim() !== '') {
          foto2Html = '<a href="' + foto2Value + '" onclick="window.open(\'' + foto2Value + '\', \'_blank\'); return false;">Foto 2</a>';
        } else {
          foto2Html = " Foto 2 ";
        }
        if (foto3Value && foto3Value.trim() !== '') {
          foto3Html = '<a href="' + foto3Value + '" onclick="window.open(\'' + foto3Value + '\', \'_blank\'); return false;">Foto 3</a>';
        } else {
          foto3Html = " Foto 3 ";
        }
        if (foto4Value && foto4Value.trim() !== '') {
          foto4Html = '<a href="' + foto4Value + '" onclick="window.open(\'' + foto4Value + '\', \'_blank\'); return false;">Foto 4</a>';
        } else {
          foto4Html = " Foto 4 ";
        }
        var rwert = feature.get('rwert');
        var hwert = feature.get('hwert');
        var result = UTMToLatLon_Fix(rwert, hwert, 32, true);

         content.innerHTML =
         '<div style="max-height: 200px; overflow-y: auto;">' +
         '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('name') + '</p>' +
         '<p>' + "Id = " + feature.get('bw_id') +  ' (' + (feature.get('KTR') ? feature.get('KTR') : 'k.A.') + ')' +  '</p>' +
         '<p>' + "U-Pflicht = " + feature.get('upflicht') + '</p>' +
         //'<p>' + "Bemerk = " + feature.get('bemerk') + '</p>' +
         '<p>' + "Bemerk = " + (feature.get('bemerk') ? feature.get('bemerk') : 'k.A.')  +  '</p>' +
         '<p>' + "Bauj. = " + (feature.get('baujahr') ? feature.get('baujahr') : 'k.A.') + '</p>' +
         `<p><a href="https://www.google.com/maps?q=${result}" target="_blank" rel="noopener noreferrer">Google Maps link</a></p>` +
         `<p><a href="https://www.google.com/maps?q=&layer=c&cbll=${result}&cbp=12,90,0,0,1" target="_blank" rel="noopener noreferrer">streetview</a></p>` +
         '<p>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html + 
          '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p>' +
          '<p>' + beschreibLangHtml + '</p>' +
         '</div>';
      } else {
        popup.setPosition(undefined);
      }
    }
    // Führen Sie Aktionen für den Layernamen 'gew_info' durch
    if (layname === 'gew_info') {
      var foto1Value = feature.get('foto1');
      var foto1Html = '';
      var foto2Value = feature.get('foto2');
      var foto2Html = '';
      var foto3Value = feature.get('foto3');
      var foto3Html = '';
      var foto4Value = feature.get('foto4');
      var foto4Html = '';
      var urlWKDB = feature.get('URL_WKDB');
      var urlWKDBHtml = '';
      var url_wk_sb = feature.get('URL_WKSB');
      console.log(url_wk_sb);
      var url_wk_sb_Html = '';

      if (foto1Value && foto1Value.trim() !== '') {
        foto1Html = '<a href="' + foto1Value + '" onclick="window.open(\'' + foto1Value + '\', \'_blank\'); return false;">Foto 1</a>';
      } else {
        foto1Html =   " Foto 1 ";
      }
      if (foto2Value && foto2Value.trim() !== '') {
        foto2Html = '<a href="' + foto2Value + '" onclick="window.open(\'' + foto2Value + '\', \'_blank\'); return false;">Foto 2</a>';
      } else {
        foto2Html = " Foto 2 ";
      }
      if (foto3Value && foto3Value.trim() !== '') {
        foto3Html = '<a href="' + foto3Value + '" onclick="window.open(\'' + foto3Value + '\', \'_blank\'); return false;">Foto 3</a>';
      } else {
        foto3Html = " Foto 3 ";
      }
      if (foto4Value && foto4Value.trim() !== '') {
        foto4Html = '<a href="' + foto4Value + '" onclick="window.open(\'' + foto4Value + '\', \'_blank\'); return false;">Foto 4</a>';
      } else {
        foto4Html = " Foto 4 ";
      }
      if (urlWKDB && urlWKDB.trim() !== '') {
        urlWKDBHtml = '<a href="' + urlWKDB + '" onclick="window.open(\'' + urlWKDB + '\', \'_blank\'); return false;">NLWKN-WK</a>';
      } else {
        urlWKDBHtml = " NLWKN-WK";
      }
      
      if (url_wk_sb && url_wk_sb .trim() !== '') {
        url_wk_sb_Html = '<a href="' + url_wk_sb + '" onclick="window.open(\'' + url_wk_sb + '\', \'_blank\'); return false;">BfG-WK</a>';
      } else {
        url_wk_sb_Html = "BfG-WK";
      }
      
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      content.innerHTML =
      '<div style="max-height: 300px; overflow-y: auto;">' +
      '<p>Name: ' + feature.get('IDUabschn') + '<br>' + "von " + feature.get('Bez_Anfang') + " bis " + feature.get('Bez_Ende')  + '</p>' +
      '<p>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html + 
      '<p><a href="' + feature.get('U_Steckbrief') + '" onclick="window.open(\'' + feature.get('U_Steckbrief') + '\', \'_blank\'); return false;">NLWKN-SB</a> ' + url_wk_sb_Html + " " + urlWKDBHtml + 
      
      //'<a href="' + feature.get('URL_WKDB') + '" onclick="window.open(\'' + feature.get('URL_WKDB') + '\', \'_blank\'); return false;">WK_DB</a> '+
      //'<a href="' + feature.get('foto1') + '" onclick="window.open(\'' + feature.get('foto1') + '\', \'_blank\'); return false;">Karte</a> ' +
      //'<a href="' + feature.get('foto2') + '" onclick="window.open(\'' + feature.get('foto2') + '\', \'_blank\'); return false;">Foto</a><br>' +
      '<p><a href="' + feature.get('BSB') + '" onclick="window.open(\'' + feature.get('BSB') + '\', \'_blank\'); return false;">BSB  </a>' +
      '<p>' + "Bemerk = " + (feature.get('bemerk') ? feature.get('bemerk') : 'k.A.')  +  '</p>' +
      '<a href="' + feature.get('MNB') + '" onclick="window.open(\'' + feature.get('MNB') + '\', \'_blank\'); return false;"> MNB</a><br> ' +
      'Kat: ' + feature.get('Kat') + '</a>' +
      ', KTR: ' + feature.get('KTR') + '</a>' +
      '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p></div>';
  
    }
    // Führen Sie Aktionen für den Layernamen 'gew_umn' durch
    if (layname === 'gew_umn') {
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      content.innerHTML =
      
      '<div style="max-height: 300px; overflow-y: auto;">' +
      '<p>ID: ' + feature.get('Massn_ID') + '<br>' +
      '<p>Bez (Art): ' + feature.get('UMnArtBez') + '<br>' +
      '<p>Bez (Gruppe): ' + feature.get('UMNGrBez') + '<br>' +
      '</div>';
    }
    // Führen Sie Aktionen für den Layernamen 'son_lin' durch
    if (layname === 'son_lin') {
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      var foto1Value = feature.get('foto1');
        var foto1Html = '';
        var foto2Value = feature.get('foto2');
        var foto2Html = '';
        var foto3Value = feature.get('foto3');
        var foto3Html = '';
        var foto4Value = feature.get('foto4');
        var foto4Html = '';
        
        if (foto1Value && foto1Value.trim() !== '') {
          foto1Html = '<a href="' + foto1Value + '" onclick="window.open(\'' + foto1Value + '\', \'_blank\'); return false;">Foto 1</a>';
        } else {
          foto1Html =   " Foto 1 ";
        }
        if (foto2Value && foto2Value.trim() !== '') {
          foto2Html = '<a href="' + foto2Value + '" onclick="window.open(\'' + foto2Value + '\', \'_blank\'); return false;">Foto 2</a>';
        } else {
          foto2Html = " Foto 2 ";
        }
        if (foto3Value && foto3Value.trim() !== '') {
          foto3Html = '<a href="' + foto3Value + '" onclick="window.open(\'' + foto3Value + '\', \'_blank\'); return false;">Foto 3</a>';
        } else {
          foto3Html = " Foto 3 ";
        }
        if (foto4Value && foto4Value.trim() !== '') {
          foto4Html = '<a href="' + foto4Value + '" onclick="window.open(\'' + foto4Value + '\', \'_blank\'); return false;">Foto 4</a>';
        } else {
          foto4Html = " Foto 4 ";
        }
        content.innerHTML =
          '<div style="max-height: 200px; overflow-y: auto;">' +
          '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('name') + '</p>' +
          '<p>' + "Id = " + feature.get('bw_id') +  ' (' + feature.get('KTR') +')' +  '</p>' +
          '<p>' + "U-Pflicht = " + feature.get('upflicht') + '</p>' +
          '<p>' + "Bemerk = " + (feature.get('bemerk') ? feature.get('bemerk') : 'k.A.')  +  '</p>' +
          '<p>' + "Bauj. = " + feature.get('baujahr') + '</p>' +
          '<p>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html + 
           '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p>' +
           '<p>' + beschreibLangHtml + '</p>' +
          '</div>';
      
    }
    // Führen Sie Aktionen für den Layernamen 'exp_gew_fla' durch
    if (layname === 'exp_gew_fla') {
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      var foto1Value = feature.get('foto1');
        var foto1Html = '';
        var foto2Value = feature.get('foto2');
        var foto2Html = '';
        var foto3Value = feature.get('foto3');
        var foto3Html = '';
        var foto4Value = feature.get('foto4');
        var foto4Html = '';
        
        if (foto1Value && foto1Value.trim() !== '') {
          foto1Html = '<a href="' + foto1Value + '" onclick="window.open(\'' + foto1Value + '\', \'_blank\'); return false;">Foto 1</a>';
        } else {
          foto1Html =   " Foto 1 ";
        }
        if (foto2Value && foto2Value.trim() !== '') {
          foto2Html = '<a href="' + foto2Value + '" onclick="window.open(\'' + foto2Value + '\', \'_blank\'); return false;">Foto 2</a>';
        } else {
          foto2Html = " Foto 2 ";
        }
        if (foto3Value && foto3Value.trim() !== '') {
          foto3Html = '<a href="' + foto3Value + '" onclick="window.open(\'' + foto3Value + '\', \'_blank\'); return false;">Foto 3</a>';
        } else {
          foto3Html = " Foto 3 ";
        }
        if (foto4Value && foto4Value.trim() !== '') {
          foto4Html = '<a href="' + foto4Value + '" onclick="window.open(\'' + foto4Value + '\', \'_blank\'); return false;">Foto 4</a>';
        } else {
          foto4Html = " Foto 4 ";
        }
        content.innerHTML =
          '<div style="max-height: 200px; overflow-y: auto;">' +
          '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('name') + '</p>' +
          '<p>' + "Id = " + feature.get('bw_id') +  ' (' + feature.get('KTR') +')' +  '</p>' +
          '<p>' + "U-Pflicht = " + feature.get('upflicht') + '</p>' +
          '<p>' + "Bemerk = " + (feature.get('bemerk') ? feature.get('bemerk') : 'k.A.')  +  '</p>' +
          '<p>' + "Bauj. = " + feature.get('baujahr') + '</p>' +
          '<p>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html + 
           '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p>' +
           '<p>' + beschreibLangHtml + '</p>' +
          '</div>';
      
    }
    // Führen Sie Aktionen für den Layernamen 'exp_bw_sle' durch
    if (layname === 'sle') {
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      var foto1Value = feature.get('foto1');
        var foto1Html = '';
        var foto2Value = feature.get('foto2');
        var foto2Html = '';
        var foto3Value = feature.get('foto3');
        var foto3Html = '';
        var foto4Value = feature.get('foto4');
        var foto4Html = '';
        
        if (foto1Value && foto1Value.trim() !== '') {
          foto1Html = '<a href="' + foto1Value + '" onclick="window.open(\'' + foto1Value + '\', \'_blank\'); return false;">Foto 1</a>';
        } else {
          foto1Html =   " Foto 1 ";
        }
        if (foto2Value && foto2Value.trim() !== '') {
          foto2Html = '<a href="' + foto2Value + '" onclick="window.open(\'' + foto2Value + '\', \'_blank\'); return false;">Foto 2</a>';
        } else {
          foto2Html = " Foto 2 ";
        }
        if (foto3Value && foto3Value.trim() !== '') {
          foto3Html = '<a href="' + foto3Value + '" onclick="window.open(\'' + foto3Value + '\', \'_blank\'); return false;">Foto 3</a>';
        } else {
          foto3Html = " Foto 3 ";
        }
        if (foto4Value && foto4Value.trim() !== '') {
          foto4Html = '<a href="' + foto4Value + '" onclick="window.open(\'' + foto4Value + '\', \'_blank\'); return false;">Foto 4</a>';
        } else {
          foto4Html = " Foto 4 ";
        }
        var rwert = feature.get('rwert');
        var hwert = feature.get('hwert');
        let result = UTMToLatLon_Fix(rwert, hwert, 32, true);
        
        content.innerHTML =
          '<div style="max-height: 200px; overflow-y: auto;">' +
          '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('name') + '</p>' +
          '<p>' + "Id = " + feature.get('bw_id') +  ' (' + feature.get('KTR') +')' +  '</p>' +
          '<p>' + "Bemerk = " + (feature.get('bemerk') ? feature.get('bemerk') : 'k.A.')  +  '</p>' +
          '<p>' + "WSP (OW) = " + feature.get('WSP_OW') + " m" +  "  WSP (UW) = " + feature.get('WSP_UW') + " m" + '</p>' +
          `<p><a href="https://www.google.com/maps?q=${result}" target="_blank" rel="noopener noreferrer">Google Maps link</a></p>` +
          `<p><a href="https://www.google.com/maps?q=&layer=c&cbll=${result}&cbp=12,90,0,0,1" target="_blank" rel="noopener noreferrer">streetview</a></p>` +
          '<p>' + "Bauj. = " + feature.get('baujahr') + '</p>' +
          '<p>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html + 
           '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p>' +
           '<p>' + beschreibLangHtml + '</p>' +
          '</div>';
      
    }
    // Führen Sie Aktionen für den Layernamen 'exp_bw_weh' durch
    if (layname === 'weh') {
          coordinates = evt.coordinate; 
          popup.setPosition(coordinates);
          var foto1Value = feature.get('foto1');
            var foto1Html = '';
            var foto2Value = feature.get('foto2');
            var foto2Html = '';
            var foto3Value = feature.get('foto3');
            var foto3Html = '';
            var foto4Value = feature.get('foto4');
            var foto4Html = '';
            
            if (foto1Value && foto1Value.trim() !== '') {
              foto1Html = '<a href="' + foto1Value + '" onclick="window.open(\'' + foto1Value + '\', \'_blank\'); return false;">Foto 1</a>';
            } else {
              foto1Html =   " Foto 1 ";
            }
            if (foto2Value && foto2Value.trim() !== '') {
              foto2Html = '<a href="' + foto2Value + '" onclick="window.open(\'' + foto2Value + '\', \'_blank\'); return false;">Foto 2</a>';
            } else {
              foto2Html = " Foto 2 ";
            }
            if (foto3Value && foto3Value.trim() !== '') {
              foto3Html = '<a href="' + foto3Value + '" onclick="window.open(\'' + foto3Value + '\', \'_blank\'); return false;">Foto 3</a>';
            } else {
              foto3Html = " Foto 3 ";
            }
            if (foto4Value && foto4Value.trim() !== '') {
              foto4Html = '<a href="' + foto4Value + '" onclick="window.open(\'' + foto4Value + '\', \'_blank\'); return false;">Foto 4</a>';
            } else {
              foto4Html = " Foto 4 ";
            }
            var rwert = feature.get('rwert');
            var hwert = feature.get('hwert');
            let result = UTMToLatLon_Fix(rwert, hwert, 32, true);
            content.innerHTML =
              '<div style="max-height: 200px; overflow-y: auto;">' +
              '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('name') + '</p>' +
              '<p>' + "Id = " + feature.get('bw_id') +  ' (' + feature.get('KTR') +')' +  '</p>' +
              '<p>' + "Bemerk = " + (feature.get('bemerk') ? feature.get('bemerk') : 'k.A.')  +  '</p>' +
              //'<p>' + "WSP1 (OW) = " + feature.get('Ziel_OW1').toFixed(2) + " m" +  "  WSP2 (OW) = " + feature.get('Ziel_OW2').toFixed(2) + " m" + '</p>' +
              `<p><a href="https://www.google.com/maps?q=${result}" target="_blank" rel="noopener noreferrer">Google Maps link</a></p>` +
              `<p><a href="https://www.google.com/maps?q=&layer=c&cbll=${result}&cbp=12,90,0,0,1" target="_blank" rel="noopener noreferrer">streetview</a></p>` +
              '<p>' + "WSP1 (OW) = " + feature.get('Ziel_OW1') + " m" +  "  WSP2 (OW) = " + feature.get('Ziel_OW2') + " m" + '</p>' +
              '<p>' + "Bauj. = " + feature.get('baujahr') + '</p>' +
              '<p>' + foto1Html + " " + foto2Html + " " + foto3Html + " " + foto4Html + 
               '<br>' + '<u>' + "Beschreibung (kurz): " + '</u>' + feature.get('beschreib') + '</p>' +
               '<p>' + beschreibLangHtml + '</p>' +
              '</div>';
          
    }
    if (layname === 'fot') {
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      var foto1Value = feature.get('tmp');
      var foto1Html = '';
      var foto2Value = feature.get('Path');
      var foto2Html = '';
        
        if (foto1Value && foto1Value.trim() !== '') {
          foto1Html = '<a href="' + foto1Value + '" onclick="window.open(\'' + foto1Value + '\', \'_blank\'); return false;">Foto 1</a>';
        } else {
          foto1Html =   " Foto LW 1 ";
        }
        if (foto2Value && foto2Value.trim() !== '') {
          foto2Html = '<a href="' + foto2Value + '" onclick="window.open(\'' + foto2Value + '\', \'_blank\'); return false;">Foto 2</a>';
        } else {
          foto2Html = " Foto LW 2";
        }
      
        var rwert = feature.get('RWert');
        var hwert = feature.get('HWert');
        let result = UTMToLatLon_Fix(rwert, hwert, 32, true);
        content.innerHTML =
          '<div style="max-height: 200px; overflow-y: auto;">' +
          '<p style="font-weight: bold; text-decoration: underline;">' + feature.get('REFOBJ_ID') + '</p>' +
          `<p><a href="https://www.google.com/maps?q=${result}" target="_blank" rel="noopener noreferrer">Google Maps link</a></p>` +
          `<p><a href="https://www.google.com/maps?q=&layer=c&cbll=${result}&cbp=12,90,0,0,1" target="_blank" rel="noopener noreferrer">streetview</a></p>` +
          '<p>' + "Datum Uhrzeit: " + feature.get('DateTime_') + '</p>' +
          '<p>' + foto1Html + " " + foto2Html + 
           '<br>' + '<u>' + "Ordner: " + '</u>' + feature.get('BOrdner') + '</p>' +
           '</div>';
      
    }
    // Führen Sie Aktionen für den Layernamen 'gehoelz_vecLayer' durch
    if (layname === 'gehoelz_vec') {
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      content.innerHTML =
      '<div style="max-height: 300px; overflow-y: auto;">' +
      '<p>Gehölzentwicklung' + '<br>' +
      '<br>' + "Bemerk: " + feature.get('UMn_Bemerk') + '</p>' +
      '</div>';
    }
    // Führen Sie Aktionen für den Layernamen 'fsk' durch
    if (layname === 'fsk') {
      if (feature.get('Art') === 'o' || feature.get('Art') === 'l') {
        coordinates = evt.coordinate; // Define coordinates for 'fsk'
        popup.setPosition(coordinates);
        content.innerHTML =
          '<div style="max-height: 300px; overflow-y: auto;">' +
          '<p><strong>gemark Flur Flurstück:</strong><br>' + feature.get('Suche') + '</p>' +
          'FSK: ' + feature.get('fsk') + '</p>' +
          'FSK(ASL): ' + feature.get('FSK_ASL') + '</p>' +
          '<p>' + 'Eig.(öffentl.): ' + feature.get('Eig1') + '</p>' +
          '</div>';
      } else {
        coordinates = evt.coordinate; // Define coordinates for 'fsk'
        popup.setPosition(coordinates);
        content.innerHTML =
          '<div style="max-height: 300px; overflow-y: auto;">' +
          '<p><strong>gemark Flur Flurstück:</strong><br>' + feature.get('Suche') + '</p>' +
          'FSK: ' + feature.get('fsk') + '</p>' +
          '<p>' + 'Art (p=privat): ' + feature.get('Art') + '</p>' +
           '<p>' + 'Eig.(privat): ' + feature.get('Eig1') + '</p>' +
          '</div>';
      }
    }
        // Führen Sie Aktionen für den Layernamen 'geojson' durch
    if (layname.toLowerCase().startsWith('geojson')) {
      var att = feature.getProperties();
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      
      // Erstelle HTML für alle Attribute außer "geometry"
      let contentHtml = "<strong>Attributwerte:</strong><br><ul>";
      for (let key in att) {
          if (key !== 'geometry') { // Geometrie nicht anzeigen
              contentHtml += `<li><strong>${key}:</strong> ${att[key]}</li>`;
          }
      }
      contentHtml += "</ul>";
      content.innerHTML = contentHtml;
    }
        // Führen Sie Aktionen für den Layernamen 'editbar' durch
    if (layname.toLowerCase().startsWith('editbar')) {
      console.log('angegommen');
      var att = feature.getProperties();
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      
      // Erstelle HTML für alle Attribute außer "geometry"
      let contentHtml = "<strong>Zeichenobjekt:</strong><br><ul>";
      for (let key in att) {
          
              contentHtml += `<li><strong>${key}:</strong> ${att[key]}</li>`;
          
      }
      contentHtml += "</ul>";
      content.innerHTML = contentHtml;
    }
    // Führen Sie Aktionen für den Layernamen 'kml' durch
    if (layname.toLowerCase().startsWith('kml')) {
      var att = feature.getProperties();
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      // Erstelle HTML für alle Attribute außer "geometry"
      let contentHtml = "<strong>Attributwerte:</strong><br><ul>";
      for (let key in att) {
          if (key !== 'geometry') { // Geometrie nicht anzeigen
              contentHtml += `<li><strong>${key}:</strong> ${att[key]}</li>`;
          }
      }
      contentHtml += "</ul>";
      content.innerHTML = contentHtml;
    }
    // Führen Sie Aktionen für den Layernamen "rechtsClick" durch
    if (layname.toLowerCase().startsWith('rechtsclick')) {
      var att = feature.getProperties();
      coordinates = evt.coordinate; 
      popup.setPosition(coordinates);
      // Erstelle HTML für alle Attribute außer "geometry"
      let contentHtml = "<strong>Koordinaten</strong><br><ul>"
      for (let key in att) {
          if (key !== 'geometry') { // Geometrie nicht anzeigen
              contentHtml += `<li><strong>${key}:</strong> ${Number(att[key]).toFixed(3)}</li>`;
          }
      }
      feature.set('type', 'removable');
      contentHtml += "</ul>";
      
      let result = UTMToLatLon_Fix(feature.get('x_32632'), feature.get('y_32632'), 32, true);
      contentHtml += `<p><a href="https://www.google.com/maps?q=${result}" target="_blank" rel="noopener noreferrer">Google Maps link</a></p>`;
      content.innerHTML = contentHtml;
    }
  }
    }
  );
  } else if(editBarAnAus===true) {  
  //alert('EditBar ist '+ editBarAnAus + 'map on');
  //placeMarkerAndShowCoordinates(evt);
  }
});


 */
//--------------------------------------------------------------------------------------------- Photon search control 
var sLayer = new VectorLayer({
  title: "Search_Photon",
  name: "Search_Photon",
  source: new VectorSource(),
  style: new Style({ image: new CircleStyle({radius: 5,stroke: new Stroke ({color: 'rgb(255,165,0)', width: 3 }),fill: new Fill({color: 'rgba(255,165,0,.3)' })      }),
      stroke: new Stroke ({
          color: 'rgb(255,165,0)',
          width: 3
      }),
      fill: new Fill({
          color: 'rgba(255,165,0,.3)'
      })
  }),
  displayInLayerSwitcher : false,
});
map.addLayer(sLayer);

var search = new SearchPhoton({
  //target: $(".options").get(0),
  lang:"de",		// Force preferred language
  polygon: $("#polygon").prop("checked"),
  reverse: true,
  position: true	
});
map.addControl (search);

// Select feature when click on the reference index
search.on('select', function(e){
  sLayer.getSource().clear();
 // Check if we get a geojson to describe the search
  if (e.search.geojson) {
    var format = new GeoJSON();
    var f = format.readFeature(e.search.geojson, { dataProjection: "EPSG:4326", featureProjection: map.getView().getProjection() });
    sLayer.getSource().addFeature(f);
    var view = map.getView();
    var resolution = view.getResolutionForExtent(f.getGeometry().getExtent(), map.getSize());
    var zoom = view.getZoomForResolution(resolution);
    var center = ol.extent.getCenter(f.getGeometry().getExtent());
    // redraw before zoom
    setTimeout(function(){
      view.animate({
        center: center,
        zoom: Math.min (zoom, 16)
      });
    }, 100);
  }
  else 
  {
    map.getView().animate({
    center:e.coordinate,
    zoom: Math.max (map.getView().getZoom(),16)
    });
  }
  // Füge den Marker hinzu
  addMarker(e.coordinate);
});

// Funktion zum Hinzufügen eines Markers
function addMarker(coordinates) {
  var marker = new Feature({
    geometry: new Point(coordinates)
  });
  var markerStyle = new Style({
    image: new Icon({
      src: 'data/marker.svg', // Pfad zur Bilddatei
      //scale: 0.5 // Skalierung des Bildes
    })
  });
  marker.setStyle(markerStyle);
  sLayer.getSource().clear(); // Löscht vorherige Marker
  sLayer.getSource().addFeature(marker);
};

//---------------------------------------------------------------------------------------------Menü mit Submenü
var userInput = ""; // Globale Variable zur Speicherung der Nutzereingabe
var currentlyHighlightedFeature = null; // Variable zur Verfolgung des aktuell markierten Features

// Markierungsstil für das gefundene Feature
const highlightStyle = new Style({
 stroke: new Stroke({
 color: 'red',
 width: 12 
 }),
 fill: new Fill({
 color: 'rgb(234, 255, 0)'
 })
});
//-------------------------------------------------------------Suche BW
function searchFeaturesByTextBw(searchText) {  
  let layers = [exp_bw_bru_nlwkn_layer, exp_bw_due_layer, exp_bw_sle_layer, exp_bw_weh_layer, exp_bw_bru_andere_layer, exp_bw_ein_layer, exp_bw_que_layer, exp_bw_son_pun_layer, exp_bw_son_lin_layer ]; 
  let matchingFeatures = [];
  layers.forEach(layer => {
      if (!layer) return;
      let source = layer.getSource();
      if (!source) return;
      let features = source.getFeatures();
        features.forEach(feature => {
          let properties = feature.getProperties();
          let name = properties.name ? properties.name.toLowerCase() : '';
          let beschreib = properties.beschreib ? properties.beschreib.toLowerCase() : '';
          
          let bauart = properties.bauart ? properties.bauart.toLowerCase() : '';
          let searchTextLower = searchText.toLowerCase(); // Suchtext ebenfalls in Kleinbuchstaben umwandeln
          if (name.includes(searchTextLower) || beschreib.includes(searchTextLower) || bauart.includes(searchTextLower)) 
            {
             matchingFeatures.push({ feature, layer });
            }
        });
  });
  // Ergebnisse anzeigen
  displaySearchResultsBw(matchingFeatures);
  document.getElementById("close-search-results").addEventListener("click", function() {
    document.getElementById("search-results-container").style.display = "none";
    
  });
}
//-----------------------------------------------------------------Suche Eig
function searchFeaturesByTextEig(searchText) {
  let matchingFeatures = [];
  const source = exp_allgm_fsk_layer.getSource();
  if (!source) {
    console.error("Fehler: Die Layer-Quelle ist nicht verfügbar.");
    return;
  }
  let features = source.getFeatures();
  features.forEach(feature => {
    let properties = feature.getProperties();
    let name = properties.Eig1 ? properties.Eig1.toLowerCase() : '';
    let searchTextLower = searchText.toLowerCase(); // Suchtext ebenfalls in Kleinbuchstaben umwandeln
    if (name.includes(searchTextLower)) {
      matchingFeatures.push({ feature }); // Layer explizit hinzugefügt
    }
  });
  
  // Ergebnisse anzeigen
  displaySearchResultsEig(matchingFeatures);
  document.getElementById("close-search-results").addEventListener("click", function() {
    document.getElementById("search-results-container").style.display = "none";
     // Hervorhebung zurücksetzen
    if (currentlyHighlightedFeature) {
      currentlyHighlightedFeature.setStyle(null);
      currentlyHighlightedFeature = null;
    }
  });
}
function displaySearchResultsBw(results) {
  const resultContainer = document.getElementById('search-results');
  resultContainer.innerHTML = ''; // Alte Ergebnisse löschen
  if (!results || results.length === 0) {
    resultContainer.innerHTML = '<li>Layer eingeschaltet??? Keine Treffer</li>';
    return;
  }
  // Duplikate entfernen basierend auf bw_id
  const seen = new Set();
  results = results.filter(item => {
    const id = item.feature?.get?.('bw_id');
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  // Alphanumerische Sortierung nach bw_id
  results.sort((a, b) => {
    const idA = a.feature.get('bw_id') || '';
    const idB = b.feature.get('bw_id') || '';
    return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
  });
  // Ergebnisliste aufbauen
  results.forEach((item) => {
    const feature = item.feature;
    const layer = item.layer; // 👈 Layer kommt jetzt mit
    const props = feature.getProperties();
    const id = props.bw_id;
    const name = props.name || 'Unbekannt';
    if (!id) return;
    const listItem = document.createElement('li');
    listItem.classList.add('search-result-item'); // 👈 Damit du sie bei Bedarf wieder selektieren kannst
    listItem.textContent = `${id}: ${name}`;
    // Klickverhalten inkl. Layername
    listItem.addEventListener('click', () => {
      zoomToFeature(feature, map);
      if (layer) {
        const layname = layer.get('name');
        console.log('Geklickter Layername:', layname);
        // Weitere Aktionen mit layname hier möglich
      } else {
        console.log('Kein Layer für dieses Feature gefunden.');
      }
    });

    resultContainer.appendChild(listItem);
  });
}
//Display Ergebnis Suche Eig
function displaySearchResultsEig(results) {
  let resultContainer = document.getElementById('search-results');
  resultContainer.innerHTML = ''; // Alte Ergebnisse löschen
  if (results.length === 0) {
    resultContainer.innerHTML = '<li>FSK-Layer sichtbar?? Keine Treffer</li>';
    return;
  }
  results.sort((a, b) => {
    let idA = a.feature?.getProperties()?.Eig1?.trim() || '';
    let idB = b.feature?.getProperties()?.Eig1?.trim() || '';
    return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' }); 
  });
  results.forEach((item) => {
    let feature = item.feature;
    let properties = feature.getProperties();
    let name = properties.Eig1 || 'Unbekannt';
    let suche = properties.Suche || 'Unbekannt';
    let listItem = document.createElement('li');
    listItem.textContent = name + "/ FSK: " + suche; // Nur den Namen anzeigen
    listItem.onclick = () => highlightFeatureEig1(feature); // Beim Klicken hervorheben
    resultContainer.appendChild(listItem);
  });
}
//-------------------------------------------------------Hervorhebung Suche FSK
function highlightFeatureFSK(searchText) {
  console.log('angekommen')
  const source = exp_allgm_fsk_layer.getSource();
  const features = source.getFeatures();
  let found = false;
  // Prüfen, ob die erste Stelle eine Zahl oder ein Buchstabe ist
  const firstChar = searchText.charAt(0);
  const isNumber = !isNaN(firstChar) && firstChar.trim() !== "";
  // Wähle das zu durchsuchende Attribut
  const searchAttribute = isNumber ? "fsk" : "Suche";
  features.some(feature => {
    let searchValue = feature.get(searchAttribute);
    if (searchValue === searchText) {
      feature.setStyle(highlightStyle);
      map.getView().fit(feature.getGeometry().getExtent(), { duration: 1000 });
      currentlyHighlightedFeature = feature; // Speichere das aktuell angeklickte Feature
      found = true;
      return true;
    }
    return false;
  });
  if (!found) {
    alert("Kein passendes Feature gefunden!, FSK-Layer sichtbar??");
  }
}
//Highlight ---------------------------------------------Hervorhebung Suche Eig
function highlightFeatureEig1(feature) {
  // Falls ein anderes Feature hervorgehoben ist, Stil zurücksetzen
  if (currentlyHighlightedFeature) {
    currentlyHighlightedFeature.setStyle(null); // Standard-Stil wiederherstellen
  }
  feature.setStyle(highlightStyle);
  currentlyHighlightedFeature = feature; // Speichert das hervorgehobene Feature
  // Karte auf das Feature zoomen
  let geometry = feature.getGeometry();
  let extent = geometry.getExtent();
  map.getView().fit(extent, { 
    duration: 1000, 
    padding: [50, 50, 50, 50], 
    maxZoom: 18 
  });
}
window.closeSearchResults = function () {
  document.getElementById("search-results-container").style.display = "none";
};
let jsonButtonState = false; // Initialer Zustand
let punktButtonState = false;
/* Nested subbar */
var sub2 = new Bar({
  toggleOne: true,
  controls: [
   // Suche nach Flurstück
  new TextButton({
   html: '<i class="fa fa-map" ></i>',
   title: "Flurstückssuche",
   handleClick: function () {
     if (currentlyHighlightedFeature) {
       // Wenn ein Feature bereits markiert wurde, hebe die Markierung auf und setze zurück
       currentlyHighlightedFeature.setStyle(null); 
       currentlyHighlightedFeature = null; 
     } else {
       // Fordere den Nutzer zur Eingabe auf
       userInput = prompt("gem flur zähler/nenner oder fsk-id:", "");
       if (userInput) {
         highlightFeatureFSK(userInput);
       }
     }
   }
  }),
  // Suche nach Bauwerk
  new TextButton({
   html: '<i class="fa fa-snowflake-o" aria-hidden=true></i>',
  
   title: "Suche bw",
   handleClick: function () {
     let searchText = prompt("Geben Sie den Suchtext ein:");
     if (searchText && searchText.trim() !== "") { // Falls der Nutzer etwas eingegeben hat
       let results = searchFeaturesByTextBw(searchText);
       document.getElementById("search-results-container").style.display = "block"; // Zeige das div an
     } else {
       alert("Bitte geben Sie einen gültigen Suchtext ein. Layer sichtbar??");  
     }
   }
  }),
  // Suche nach Eigentümer
  new TextButton({
   html: '<i class="fa fa-file"></i>',
   title: "Suche Eigentümer",
   handleClick: function () {
     let searchText = prompt("Geben Sie den Suchtext ein:");
     if (searchText && searchText.trim() !== "") { // Falls der Nutzer etwas eingegeben hat
       let results = searchFeaturesByTextEig(searchText);
       document.getElementById("search-results-container").style.display = "block"; // Zeige das div an
     } else {
       alert("Bitte geben Sie einen gültigen Suchtext ein. FSK-Layer sichtbar??");  
     }
   }
  })
  ]
 });
//Das Untermenü mit drei buttons
var sub1 = new Bar({
  toggleOne: true,
   //Die Untermenüs
  controls:[
    // Das Untermenü GPS-Position
    new Toggle({
      html: '<i class="fa fa-map-marker" ></i>',
      title: "GPSPosition",
      //autoActivate: true,
      onToggle: 
      // Funktion zur Anzeige der GPS-Position
      function () {
        if (!watchId) {
          // Starte die Geolokalisierung, wenn sie nicht aktiv ist
          isActive = true; // Richtiges Zuweisen von isActive
          watchId = navigator.geolocation.watchPosition(
            function (pos) {
              const coords = [pos.coords.longitude, pos.coords.latitude];
              const accuracy = circular(coords, pos.coords.accuracy);
              sourceP.clear(true);
              sourceP.addFeatures([
                new Feature(accuracy.transform('EPSG:4326', map.getView().getProjection())),
                new Feature(new Point(proj.fromLonLat(coords) ) ),
                
              ]);
      
              // Führe den Zoom nur beim ersten Mal aus
              if (isFirstZoom) {
                map.getView().fit(sourceP.getExtent(), { maxZoom: 13, duration: 500 }); 
                isFirstZoom = false; // Setze isFirstZoom auf false, um zukünftige Zooms zu verhindern
              }
              // Füge den Layer hinzu, um die Position anzuzeigen
              if (!layerP) {
                layerP = new VectorLayer({
                  displayInLayerSwitcher: true,
                  style: new Style({
                    image: new CircleStyle({
                      radius: 8,
                      opacity: 0.5,
                      fill: new Fill({
                        color: 'red'
                      }),
                      stroke: new Stroke({
                        color: 'black',
                        width: 2
                      })
                    })
                  }),
                  source: sourceP,
                  title: 'gps_Layer',
                  name: 'gps_Layer',
                  zIndex: 9999,
                });
                map.addLayer(layerP);
                }
              },
            function (error) {
              alert(`ERROR: ${error.message}`);
            },
            {
              enableHighAccuracy: true,
            }
          );
        } else {
          // Beende die Geolokalisierung, wenn sie bereits aktiv ist
          navigator.geolocation.clearWatch(watchId);
          watchId = null; // Setze die Watch-ID auf null, um anzuzeigen, dass die Geolokalisierung deaktiviert ist
          isActive = false; // Richtiges Zuweisen von isActive
             // Entferne den Layer, um die Position nicht mehr anzuzeigen
          if (layerP) {
            map.removeLayer(layerP);
            layerP = null;
          }
        }
        //updateButtonAppearance(); // Aktualisieren Sie das Erscheinungsbild des Buttons basierend auf dem aktualisierten isActive-Status
        
      } ,
    }),
    // Das Untermenü Suche (ohne eigene Funktion) aber mit einem Untermenü
    new Toggle({
      html:'<i class="fa fa-search"></i>', 
      title: "Suche",
      onToggle: function(b) { 
        
       },
      bar: sub2
      
    }),
    // Das Untermenü GeoJson
    new Toggle({
      html: '<i class="fa fa-file"></i>',
      title: "GeoJson drag and drop",
      onToggle: function () {
      jsonButtonState = !jsonButtonState; // Zustand umschalten
      if (jsonButtonState === true) {
        setInteraction(); // Deine Funktion aufrufen, wenn der Zustand true ist
        } else {
        map.removeInteraction(dragAndDropInteraction);
        isActive = false;
        }
      },
    }),

    new Toggle({
  html: '<i class="fa fa-circle"></i>',
  title: "Punkt setzen",
  onToggle: function () {
    punktButtonState = !punktButtonState;

    const coordInputDiv = document.getElementById('coordinate_selection');
    const selectElement = document.getElementById('coord_select');

    if (punktButtonState) {
      coordInputDiv.style.display = 'block';

      // Eventlistener aktivieren, wenn das Tool eingeschaltet wird
      selectElement.addEventListener('change', handleCRSChange);
    } else {
      coordInputDiv.style.display = 'none';

      // Listener wieder deaktivieren, um doppelte Reaktionen zu vermeiden
      selectElement.removeEventListener('change', handleCRSChange);
    }
  },
}),

  ]

});
var sub2 = new Bar({
  toggleOne: true,
  controls: [
    new Toggle({
      html: '<i class="fa fa-envelope-open" aria-hidden="true"></i>',
      title: "Geojson-Datei laden",
      onToggle: function () {
        geojsonInput.click(); // Öffnet den Dateiauswahldialog
        
      }
    }),
    new Toggle({
      //<i class="fa-solid fa-ruler"></i>
      html: '  <i class="fa fa-font-awesome"></i>  ',
      title: "Messung",
      onToggle: function (b) {
        vectorEdit.set('displayInLayerSwitcher', true);
        vectorEdit.setVisible(true); // Optional: direkt einblenden
        const isEditing = edit.get('edition');
        if (!isEditing) {
          edit.set('edition', true);
          edit.setActive(true);
          if (!edit.getInteraction('ModifySelect')) {
            edit.addInteraction('ModifySelect');
          }
          editBarAnAus = true;
          editBarElement.style.display = ''; 
        } else {
          edit.set('edition', false);
          editBarAnAus = false;
          editBarElement.style.display = 'none';
          edit.setActive(false);
          edit.deactivateControls(); 
          const select = edit.getInteraction('Select');
          if (select) select.getFeatures().clear();
          const interaction = edit.getInteraction('ModifySelect');
          if (interaction) {
            interaction.setActive(false);
          }

        }
      }
    })
  ]
});
let geojsonCounter = 0;


// Input-Feld (versteckt im HTML, z. B. im Body)
//const geojsonInput = document.createElement('input');
//geojsonInput.type = 'file';
//geojsonInput.accept = '.geojson,.json';
//geojsonInput.style.display = 'none';
//document.body.appendChild(geojsonInput);

// Zähler für die geladenen GeoJSON-Dateien


//Event-Handler für Datei-Upload
geojsonInput.addEventListener('change', function (event) {
  
  const files = event.target.files; // Alle ausgewählten Dateien
  if (!files.length) return;

  //console.log(Array.from(files));
  // Iteriere über alle ausgewählten Dateien
  Array.from(files).forEach(file => {
   
    const reader = new FileReader();

    reader.onload = function (e) {
      const geojsonText = e.target.result;
      const geojsonFormat = new GeoJSON();

      try {
        const features = geojsonFormat.readFeatures(geojsonText, {
          featureProjection: 'EPSG:3857'
        });

        const vectorSource = new VectorSource({
          features: features
        });

        const fileName = file.name.replace(/\.[^/.]+$/, "");
        const fileEnd = file.name.split('.').pop().toLowerCase();
        let sourceName;
        if ((fileEnd === 'geojson' || fileEnd === 'json') && fileName !== 'fot') {
          sourceName = "GeoJson: " + zaehlerGeojson + " " + fileName;
        } else if (fileEnd === 'kml') {
          sourceName = "KML: " + zaehlerKML + " " + fileName;
        } else if (fileName === 'fot') {
          sourceName = "fot";
          console.log("Fotodatei erkannt");
        } else {
          sourceName = "Unbekannt: " + fileName;
        }
        const layerStyle = fileName === 'fot' ? arrowStyle : geojsonStyle;
        console.log("LayerStyle: " + layerStyle);
        
        const vectorLayer = new VectorLayer({
          source: vectorSource,
          name: sourceName,
          title: sourceName, 
          //permalink: sourceName,
          style: layerStyle,  
        });
        map.addLayer(vectorLayer);
        zaehlerGeojson++;
        zaehlerKML++;
       
        // Zoom zur geladenen GeoJSON
        /*map.getView().fit(vectorSource.getExtent(), {
          padding: [20, 20, 20, 20],
          maxZoom: 16
        });
        */

        // Zähler erhöhen für die nächste Datei
        geojsonCounter++;
      } catch (err) {
        alert("Fehler beim Laden der GeoJSON-Datei: " + err.message);
      }
    };
    reader.readAsText(file); // Datei einlesen
  });
});

//--------------------------------------------------------------------------Drag and Drop
let dragAndDropInteraction;
let zaehlerGeojson = 0;
let zaehlerKML = 0;
function setInteraction() 
{
  if (dragAndDropInteraction) 
  {
  map.removeInteraction(dragAndDropInteraction);
  }
  dragAndDropInteraction = new DragAndDrop({
    formatConstructors: 
    [
      GeoJSON, // Falls mehr Formate nötig, hier ergänzen
      new KML, 
    ],
    });
  dragAndDropInteraction.on('addfeatures', function (event) {
    if (!event.file) {
      alert("Kein Dateiname verfügbar.");
      return;
    }
    let fileName = event.file.name.replace(/\.[^/.]+$/, ""); // Dateiendung entfernen
    let fileEnd = event.file.name.split('.').pop().toLowerCase(); // Dateiendung extrahieren und in Kleinbuchstaben umwandeln
    if (event.features.length === 0) {
      alert("Keine Features aus der Datei geladen!");
      return;
    }
    // **VectorSource erstellen und Features hinzufügen**
    const vectorSource = new VectorSource();
    vectorSource.addFeatures(event.features);
    // Name der VectorSource abhängig von der Dateiendung setzen
    let sourceName;
    if ((fileEnd === 'geojson' || fileEnd === 'json') && fileName != 'fot') {
      sourceName = "GeoJson: " + zaehlerGeojson + " " + fileName;
    } else if (fileEnd === 'kml') {
      sourceName = "KML: " + zaehlerKML + " " + fileName;
    } else if (fileName === 'fot') {
      sourceName = "fot";
    } else {
      //sourceName = "Unbekannt: " + " " + fileName;
    }
    // Bedingte Zuweisung des Styles
     const layerStyle = fileName === 'fot' ? arrowStyle : geojsonStyle;
    zaehlerGeojson++;
    zaehlerKML++;
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      name: sourceName, // Dynamischer Name basierend auf Dateiendung
      title: sourceName, // Gleicher Titel
      style: layerStyle,
    });
    map.addLayer(vectorLayer);
    // **Direkt nach dem Hinzufügen Features ausgeben**
    vectorSource.once('change', function () {
      console.log("MOIN");
      const features = vectorSource.getFeatures();
      if (features.length > 0) {
        const properties = features[0].getProperties();
        if (properties && typeof properties === 'object') {
        const attributeNames = Object.keys(properties).filter(key => key !== 'geometry');
        } else {
        alert("Keine gültigen Attribute im Feature gefunden.");
        }
        const attributeNames = Object.keys(properties).filter(key => key !== 'geometry');
        } else {
          alert("Keine Features im Layer gefunden.");
        }
    });
    //map.getView().fit(vectorSource.getExtent(), { padding: [20, 20, 20, 20] });
  });
  map.addInteraction(dragAndDropInteraction);
}


// Zwei Toggle-Buttons vorbereiten
var toggle1 = new Toggle({
  html: '<i class="fa fa-info"></i>',
  title: "Infos",
  bar: sub1,
  onToggle: function(active) {
    if (active) {
      toggle2.setActive(false); // anderes Toggle schließen
    }
  }
});

var toggle2 = new Toggle({
  html: 'W',
  title: "Dateien",
  bar: sub2,
  onToggle: function(active) {
    if (active) {
      toggle1.setActive(false); // anderes Toggle schließen
    }
  }
});

// Hauptbar mit den beiden Toggles
var containerBar1 = new Bar({
  controls: [toggle1, toggle2]
});

map.addControl(containerBar1);
containerBar1.setPosition('bottom-left');
containerBar1.element.style.bottom = '60px';


var containerBar2 = new Bar();
map.addControl(containerBar2);

//containerBar2.addControl (search);
containerBar2.addControl (permalinkControl);
containerBar2.addControl (printControl);
containerBar2.addControl(toggleButtonU);

containerBar2.setPosition('bottom-right');
containerBar2.element.style.bottom = '60px';

//var mainbar3 = new Bar();
//map.addControl(mainbar3);
//mainbar3.addControl(new ZoomToExtent({
//   extent: [727361, 6839277, 858148, 6990951] 
// }));
//mainbar3.setPosition('bottom-left');
//mainbar3.element.style.bottom = '120px';

var checkExist = setInterval(() => {
  let barElement = document.querySelector('.ol-control.ol-bar.bottom-left');
  if (barElement) {
    //barElement.style.bottom = '160px';
    clearInterval(checkExist);
  }
}, 100);

document.addEventListener('DOMContentLoaded', function() {
  initializeWMS(WMSCapabilities, map ); // Aufrufen der initializeWMS-Funktion aus myFunc.js
});

//-----------------------------------------------------------------------------------------------------WMS-Control

function initializeWMS(WMSCapabilities,map ) {
  var cap = new WMSCapabilities({
      target: document.body,
      srs: ['EPSG:4326', 'EPSG:3857', 'EPSG:32632'],
      cors: true,
      popupLayer: true,
      placeholder: 'WMS link hier einfügen...',
      title: 'WMS-Dienste',
      name: 'WMS-Dienste',
      searchLabel: 'Suche',
      optional: 'token',
      services: {
  'Verwaltungsgrenzen NI ': 'https://opendata.lgln.niedersachsen.de/doorman/noauth/verwaltungsgrenzen_wms',            
  'Hydro, Umweltkarten NI ': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Hydro_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
  'WRRL, Umweltkarten NI ': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/WRRL_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
  'Natur, Umweltkarten NI': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Natur_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
  'Natur, LK':'https://geodaten.emsland.de:443/core-services/services/lkel_fb67_naturschutz_und_forsten_wms?',
  'HW-Schutz, Umwelkarten NI':'https://www.umweltkarten-niedersachsen.de/arcgis/services/HWSchutz_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
  'schutzgebiete, NL': 'https://service.pdok.nl/provincies/aardkundige-waarden/wms/v1_0?request=GetCapabilities&service=WMS',
  'krw wateren, NL': 'https://service.pdok.nl/ihw/gebiedsbeheer/krw-oppervlaktewaterlichamen/wms/v1_0?SERVICE=WMS&VERSION=1.3.0&request=getcapabilities',
  'EU-Waterbodies 3rd RBMP': 'https://water.discomap.eea.europa.eu/arcgis/services/WISE_WFD/WFD2022_SurfaceWaterBody_WM/MapServer/WMSServer?request=GetCapabilities&service=WMS',
  'Luft u. Lärm': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Luft_Laerm_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
  'Boden, Umweltkarten NI': 'https://www.umweltkarten-niedersachsen.de/arcgis/services/Boden_wms/MapServer/WMSServer?VERSION=1.3.0.&SERVICE=WMS&REQUEST=GetCapabilities',
  'Pegelonline, DE': 'https://www.pegelonline.wsv.de/webservices/gis/wms/aktuell/mnwmhw?request=GetCapabilities&service=WMS&version=1.3.0',
  'Inspire Hydro': 'https://sg.geodatenzentrum.de/wms_dlm250_inspire?Request=GetCapabilities&SERVICE=WMS',
  'TopPlusOpen': 'https://sgx.geodatenzentrum.de/wms_topplus_open?request=GetCapabilities&service=wms',
  'Drenthe Geodata': 'https://services.geodataoverijssel.nl/geoserver/ows?'
      },
      trace: true
  });
  map.addControl(cap);
  cap.on('load', function (e) {
      map.addLayer(e.layer);
      e.layer.set('legend', e.options.data.legend);
 });
};

function checkForLinkInTH(html) {
  const table = document.createElement('table');
  table.innerHTML = html;

  const trs = table.querySelectorAll('tr');
  const secondTr = trs[1];

  if (secondTr) {
      const tds = secondTr.querySelectorAll('td');
      
      // Durchlaufe alle td-Tags im zweiten tr-Tag
      for (const td of tds) {
          // Prüfe, ob der Inhalt des td-Tags "https://" enthält
          if (td.textContent.includes('https://') || td.textContent.includes('http://')) {
              // Wenn ja, erstelle ein a-Element und setze den Link
              const link = td.textContent.trim();
              const aElement = document.createElement('a');
              aElement.href = link;
              aElement.target = '_blank';
              
              const strongElement = document.createElement('strong');
              strongElement.textContent = 'Link';
              
              aElement.appendChild(strongElement);
      
              td.innerHTML = '';
              td.appendChild(aElement);
          }
      }
  }
  return table.outerHTML;
}


//--------------------------------------------------------------------------------------------------------------------ContextMenu
var contextmenuItems = [
  {
    text: 'Karte zentrieren',
    classname: 'bold',
    icon: 'data/center.png',
    callback: center
  },
  {
    text: 'Navigate',
    classname: 'bold',
    icon: 'data/center.png',
    callback: navigate
  },
  {
    text: 'Koordinaten',
    classname: 'bold',
    icon: 'data/center.png',
    callback: logCoordinates32632
  },
  '-', // Separator
  {
    text: 'copy',
    classname: 'bold',
    icon: 'data/center.png',
    callback: copyMarked
  }
];


var contextmenu = new ContextMenu({
  width: 180,
  items: contextmenuItems
});
map.addControl(contextmenu);

// --- Menü dynamisch anpassen ---
contextmenu.on('open', function (evt) {
  var contextFeature = map.forEachFeatureAtPixel(evt.pixel, ft => ft);

  contextmenu.clear();

  if (contextFeature && contextFeature.get('type') === 'removable') {
    // Menü leer oder später eigene Items ergänzen
  } else {
    // Standard-Items wieder hinzufügen
    contextmenu.extend(contextmenuItems);
    contextmenu.extend(contextmenu.getDefaultItems());
  }
});

// --- Cursor ändern, wenn über Feature ---
map.on('pointermove', function (e) {
  if (e.dragging) return;
  var pixel = map.getEventPixel(e.originalEvent);
  var hit = map.hasFeatureAtPixel(pixel);
  map.getTargetElement().style.cursor = hit ? 'pointer' : 'default';
});

// --- Animation für zentrieren ---
function elastic(t) {
  return Math.pow(2, -10 * t) * Math.sin((t - 0.075) * (2 * Math.PI) / 0.3) + 1;
}


function center(obj) {
  mapView.animate({
    duration: 700,
    easing: elastic,
    center: obj.coordinate
  });
}

// --- Google Maps Navigation ---
function navigate(obj) {
  var coord4326 = transform(obj.coordinate, 'EPSG:3857', 'EPSG:4326');
  var lat = coord4326[1];
  var lon = coord4326[0];

  var url = `https://www.google.com/maps?q=${lat},${lon}`;
  window.open(url, '_blank');
}



// --- Koordinaten EPSG:32632 ---
function logCoordinates32632(obj) {
  var coord32632 = transform(obj.coordinate, 'EPSG:3857', 'EPSG:32632');
  var x = coord32632[0].toFixed(3);
  var y = coord32632[1].toFixed(3);
  var message = `Koordinaten in EPSG:32632: ${x}, ${y}`;

  note.show(message, { 
    duration: -1,
    className: 'ol-notification'
  });
  note.element.style.bottom = '50px';
}

function copyMarked(obj) {
  // Aktuelle Textauswahl holen
  var selection = window.getSelection().toString().trim();

  if (selection) {
    // Wenn Text markiert ist → kopieren
    navigator.clipboard.writeText(selection)
      .then(() => {
        note.show(`Kopiert: "${selection}"`, { duration: 2000, className: 'ol-notification' });
      })
      .catch(err => {
        console.error('Fehler beim Kopieren: ', err);
      });
  } else {
    // Falls nichts markiert ist → Hinweis
    note.show("Kein Text markiert", { duration: 2000, className: 'ol-notification' });
  }
}


// Add the editbar
const sourceEdit = new VectorSource();
const vectorEdit = new VectorLayer({
  displayInLayerSwitcher: false,
  title: "editbar",
  name: "editbar",
  source: sourceEdit,
  style: {
    'fill-color': 'rgba(136, 136, 136, 0.526)',
    'stroke-color': 'blue',
    'stroke-width': 2,
    'circle-radius': 7,
    'circle-fill-color': '#ffcc33',
  }, 
});
map.addLayer(vectorEdit);

var select = new Select({ title: 'Auswahl'});
select.set('title', 'Auswahl');
var edit = new EditBar({
  interactions: { 
    Select: select,
    DrawLine: 'Polylinie',
    DrawPolygon: 'Polygon',
    DrawHole: 'Loch',
    DrawPoint: 'Punkt',
    DrawRegular: 'Formen',
    ModifySelect: 'Modify',
    DragRotateAndZoom: false,
    DragAndDrop: 'Verschieben',   
    Split: false,
    Transform: 'Transform',
    Offset: false,
    Resize: false,
    
  },
  source: vectorEdit.getSource() 
  
});
map.addControl(edit);
edit.setPosition('bottom-left');
edit.element.style.bottom = '140px';
edit.element.style.left = '15px';

// Benutzerdefinierter Button für Text hinzufügen
const textButton = new Button({
  html: '✎', // oder ein Icon
  title: 'Text hinzufügen',
  handleClick: function () {
    const clickListener = function (evt) {
      const text = prompt('Text eingeben:');
      if (!text) return;

      const feature = new ol.Feature({
        geometry: new ol.geom.Point(evt.coordinate),
        name: text
      });

      feature.setStyle(new ol.style.Style({
        text: new ol.style.Text({
          text: text,
          font: '14px Calibri,sans-serif',
          fill: new ol.style.Fill({ color: '#000' }),
          stroke: new ol.style.Stroke({ color: '#fff', width: 2 }),
          offsetY: -15
        }),
        image: new ol.style.Circle({
          radius: 4,
          fill: new ol.style.Fill({ color: '#ffcc33' }),
          stroke: new ol.style.Stroke({ color: '#333', width: 1 })
        })
      }));

      vectorEdit.getSource().addFeature(feature);
      map.un('singleclick', clickListener);
    };

    map.once('singleclick', clickListener);
  }
});
// Button zur EditBar hinzufügen
edit.addControl(textButton);

var tooltip = new Tooltip();
map.addOverlay(tooltip);


edit.getInteraction('Select').on('select', function(e) {
  // Nur Features behalten, die **nicht** aus dem Layer 'gew' stammen
  const validFeatures = e.selected.filter(feature => {
    // Layer herausfinden
    let found = false;
    map.forEachFeatureAtPixel(map.getPixelFromCoordinate(feature.getGeometry().getCoordinates()), function(layer) {
      if (layer.getSource && layer.getSource().hasFeature && layer.getSource().hasFeature(feature)) {
        const lname = layer.get('name');
        if (lname === 'gew') {
          found = true;
        }
      }
    });
    return !found;
  });
 // Nur wenn gültige Features ausgewählt sind, was machen
  if (validFeatures.length > 0) {
    // z. B. Tooltip setzen
    // tooltip.setInfo('Punkte ziehen');
  } else {
    // tooltip.setInfo('');
  }
});
edit.getInteraction('Select').on('change:active', function(e){
  tooltip.setInfo('');
 
});
edit.getInteraction('ModifySelect').on('modifystart', function(e){
  
  if (e.features.length===1) tooltip.setFeature(e.features[0]);
});
edit.getInteraction('ModifySelect').on('modifyend', function(e){
  console.log('angekommen modify');
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
edit.on('info', function(e) {
  
  const features = e.features;
  let message = '<i class="fa fa-info-circle"></i> ' + features.getLength() + ' feature(s) selected';

  if (features.getLength() === 1) {
    const feature = features.item(0);
    
    const geometry = feature.getGeometry();
    const type = geometry.getType();

    if (type === 'Point') {
  const coord3857 = geometry.getCoordinates();

  // Zu anderen Koordinatensystemen transformieren
  const coord4326 = toLonLat(coord3857); // EPSG:4326 = Längen-/Breitengrad
  const coord25832 = transform(coord3857, 'EPSG:3857', 'EPSG:25832'); // ETRS89 / UTM Zone 32N
  const coord32632 = transform(coord3857, 'EPSG:3857', 'EPSG:32632'); // WGS84 / UTM Zone 32N

  // HTML für Ausgabe
  message += `
    – <b>Koordinaten:</b><br/>
    <b>EPSG:4326 (WGS84):</b> ${coord4326[1].toFixed(6)}, ${coord4326[0].toFixed(6)}<br/>
    <b>EPSG:3857 (Web Mercator):</b> ${coord3857[1].toFixed(2)}, ${coord3857[0].toFixed(2)}<br/>
    <b>EPSG:25832 u. 32632 (WGS 84, ETRS89 / UTM32):</b> ${coord25832[1].toFixed(2)}, ${coord25832[0].toFixed(2)}<br/>
    
  `;
      
      
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
    className: 'ol-notification'
    });
    note.element.style.bottom = '50px';
    //note.setPosition('bottom');
  
});

const editBarElement = edit.element;
editBarElement.style.display = 'none'; 

var save = new Button({
  html: '<i class="fa fa-download"></i>',
  title: "Save",
  handleClick: function(e) {
    // Features als Objekt exportieren
    var geojsonObject = new GeoJSON().writeFeaturesObject(
      vectorEdit.getSource().getFeatures()
    );

    // Zusätzliche Informationen hinzufügen
    geojsonObject.name = "Zeichnung";
    geojsonObject.crs = {
      type: "name",
      properties: {
        name: "urn:ogc:def:crs:EPSG::3857"
      }
    };

    // Als JSON-String serialisieren
    var json = JSON.stringify(geojsonObject, null, 2);
    console.log(json);
    // Optional: direkt als Datei herunterladen
    var blob = new Blob([json], { type: "application/json;charset=utf-8" });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "zeichnung.geojson";
    link.click();
  }
});
edit.addControl(save);
var editBarAnAus = false;
 
window.onload = function() {
  editBarAnAus = false;
  const select = edit.getInteraction('Select');
  if (select) select.getFeatures().clear();
  const interaction = edit.getInteraction('ModifySelect');
  if (interaction) {
    interaction.setActive(false);
  }

  // Prüfen ob PC oder Mobilgerät
  /* if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    console.log("Mobilgerät erkannt");
  } else {
    console.log("Desktopgerät erkannt");
    alert("Bitte auf einem Mobilgerät öffnen, um die volle Funktionalität zu nutzen.");c
  } */
}



const vectorSource = new ol.source.Vector();
const vectorLayer = new ol.layer.Vector({
  source: vectorSource,
  style: new ol.style.Style({
    image: new ol.style.Circle({
      radius: 6,
      fill: new ol.style.Fill({
        color: 'red',
      }),
      stroke: new ol.style.Stroke({
        color: 'white',
        width: 2,
      }),
    }),
  }),
});

//map.addLayer(vectorLayer);


function handleCRSChange(event) {
  const crs = event.target.value.toUpperCase();
  const systemLabel = crs.replace('_', ':'); // sicherer als replace('EPSG_', ...)

  const input = prompt(
    `Koordinaten im Format "x;y" eingeben (${systemLabel}):\n` +
    `Beispiel (EPSG:4326):  52.564809, 7.068310\n` +
    `Beispiel (EPSG:31467): 3368600,1 ; 5813210,0\n` +
    `Beispiel (EPSG:25832): 3368600,1 ; 5813210,0\n` +
    `Beispiel (EPSG:32632): 369123,92 ; 5826024,92 ; `
  );
  if (!input) return;

  // Split bei Semikolon (egal ob mit Leerzeichen)
  const parts = input.split(';').map(str => str.trim());
  if (parts.length !== 2) {
    alert('❌ Ungültige Eingabe. Bitte verwenden Sie das Format "x;y".');
    return;
  }

  // --- Hilfsfunktion zum Parsen von Gradkoordinaten (EPSG:4326) ---
  const parseCoord = (value, isLat) => {
    let cleaned = value
      .toUpperCase()
      .replace(/[°\s]/g, '') // Gradzeichen und Leerzeichen raus
      .replace(',', '.'); // Komma → Punkt

    let sign = 1;
    if (
      cleaned.includes('S') ||
      cleaned.includes('W') ||
      (cleaned.includes('O') && isLat === false)
    ) {
      sign = -1;
    }

    cleaned = cleaned.replace(/[NOEWS]/g, '');
    const num = parseFloat(cleaned);
    if (isNaN(num)) return NaN;
    return num * sign;
  };

  let x, y;

  // --- Automatische Zuordnung der Eingabereihenfolge ---
  if (systemLabel === 'EPSG:4326') {
    // Geografische Koordinaten → [lat; lon]
    y = parseCoord(parts[0], true);   // Breitengrad
    x = parseCoord(parts[1], false);  // Längengrad
  } else {
    // Metrische Koordinaten → [Rechtswert; Hochwert]
    x = parseFloat(parts[0].replace(',', '.')); // Easting
    y = parseFloat(parts[1].replace(',', '.')); // Northing
  }

  if (isNaN(x) || isNaN(y)) {
    alert('❌ Ungültige Koordinaten. Bitte überprüfen Sie Ihre Eingabe.');
    return;
  }

  let transformed;

  // --- Transformation in WebMercator ---
  if (systemLabel === 'EPSG:4326') {
    transformed = ol.proj.fromLonLat([x, y]); // [lon, lat]
  } else if (systemLabel === 'EPSG:31466' || systemLabel === 'EPSG:31467') {
    transformed = ol.proj.transform([x, y], systemLabel, 'EPSG:3857');
  } else if (systemLabel !== 'EPSG:3857') {
    transformed = ol.proj.transform([x, y], systemLabel, 'EPSG:3857');
  } else if (systemLabel !== 'EPSG:32632') {
    transformed = ol.proj.transform([x, y], systemLabel, 'EPSG:3857');
  } else if (systemLabel !== 'EPSG:25832') {
    transformed = ol.proj.transform([x, y], systemLabel, 'EPSG:3857');
    
  } else {
    transformed = [x, y];
  }

  drawPoint(transformed);
}

// --- Punkt in der Karte darstellen ---
function drawPoint(coords) {
  const pointFeature = new ol.Feature({
    geometry: new ol.geom.Point(coords),
  });

  // ⚠️ Hier muss dein eigener VectorSource-Name eingesetzt werden
  sourceEdit.addFeature(pointFeature);

  // Karte zentrieren
  map.getView().animate({
    center: coords,
    zoom: 13,
    duration: 1000,
  });
}

  //var div_select_epsg = document.getElementById('coordinate_selection').style.display='block';
   //console.log(div_select_epsg);
  //
  //var select_epsg = document.getElementById('coord_select').display='block';
  //console.log(select_epsg);
  /* // Schritt 1: Koordinatensystem auswählen
  const system = prompt(
    'Bitte Koordinatensystem angeben:\n' +
    ' - EPSG:4326   (Längen-/Breitengrade)\n' +
    ' - EPSG:25832  (UTM, ETRS89)\n' +
    ' - EPSG:32632  (UTM, WGS84)\n' +
    ' - EPSG:3857   (Web Mercator)'
  );

  if (!system) return;
  const crs = system.trim().toUpperCase();

  // Schritt 2: Koordinaten eingeben
  const input = prompt(`Koordinaten im Format "x,y" eingeben (${crs}):`);
  if (!input) return;

  const coords = input.split(',').map(str => Number(str.trim()));
  if (coords.length !== 2 || coords.some(isNaN)) {
    alert('❌ Ungültige Eingabe. Bitte verwenden Sie das Format "x,y".');
    return;
  }

  // Schritt 3: Transformation durchführen
  let transformed;
  if (crs === 'EPSG:4326') {
    transformed = fromLonLat(coords);
  } else if (crs !== 'EPSG:3857') {
    transformed = transform(coords, crs, 'EPSG:3857');
  } else {
    transformed = coords;
  }

  drawPoint(transformed);
}

// --- Punkt zeichnen ---
function drawPoint(coords) {
  const pointFeature = new ol.Feature({
    geometry: new ol.geom.Point(coords),
  });

  vectorSource.addFeature(pointFeature);

  map.getView().animate({
    center: coords,
    zoom: 13,
    duration: 1000
  }); */

