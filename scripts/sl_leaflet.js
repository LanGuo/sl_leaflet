
const yearToPlot = '1964';
//var renderDiv = document.getElementById('mapid');
const centerLat = 51.5;
const centerLon = -0.12;
const initialZoom = 12;
//var smell_colors = d3.scale.category20();

var myMap = L.map('londonMap')
              .setView([centerLat, centerLon], initialZoom);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
 attribution: 'Map data &copy;<a href="http://openstreetmap.org">OpenStreetMap</a> contributors,<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
 maxZoom: 18,
}).addTo(myMap);


// Retrieve boroughs outline data and add it as a geojson layer on the map.
const boroughStyle = {'color': 'black',
                      'weight': 1};
const boroughFilePath = 'https://rawcdn.githack.com/Smelly-London/Smelly-London/master/visualisation/leaflet/data/london_districts_latlong_with_centroids.json' 
// '../data/london_districts_latlong_with_centroids.json';


function getJSON(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.onload = function () { 
    callback(this.responseText) 
  };
  xhr.open('GET', url, true);
  xhr.send();
}

function renderGeoJsonLayerGroup(geoJson) {
  let layerGroup = L.layerGroup();
  for(let feature of geoJson.features) {
    let thisLayer = L.geoJSON();
    thisLayer.addData(feature,
                      {style: boroughStyle});
    thisLayer.name = feature.properties.name;
    thisLayer.addTo(layerGroup);
  }
  return layerGroup;
}

function loadGeoJsonLayers(url) {
  getJSON(url, data => renderGeoJsonLayerGroup(JSON.parse(data)));
}

let boroughLayers = loadGeoJsonLayers(boroughFilePath);
boroughLayers.addTo(myMap);
console.log(boroughLayers);

// Retrieve smell by borough and year
const smellFilePath = '../data/moh_smell_category_borough_json.json';
const smellJson = getJSON(smellFilePath, data => JSON.parse(data));
console.log('smellJson', smellJson);

function getSmellDataThisYear(year, smellJson) {
  let boroughDataThisYear = {};
  for (let boroughYearKey in smellJson) {
    if (boroughYearKey.endsWith(year)) {
      let boroughKey = boroughYearKey.split(' ')[0];
      boroughDataThisYear[boroughKey] = [];
      //console.log(boroughYearKey);
      let boroughData = smellJson[boroughYearKey];
      //console.log(boroughData); 
      for (let key in boroughData) {
        let boroughSmells = boroughData[key].smells || [];
        //console.log(boroughSmells);
        if (boroughSmells) {
          boroughDataThisYear[boroughKey] = boroughDataThisYear[boroughKey].concat(boroughSmells);
        }
      }
    }
  }
}




// console.log('1', boroughDataThisYear);




/*
boroughLayers.eachLayer(function(layer) {
  popUpMessage = 'layer.name' + yearToPlot + ':\n'
  smellsThisLayer = boroughDataThisYear[layer.name];
  if (smellsThisLayer) {
    for (let smell of smellsThisLayer) {
      popUpMessage += (smell['cat'] + ':' + smell['count'] + '\n')
    }
  }
  layer.bindPopup(popUpMessage);
})




let smellJson = require(smellFilePath);

                     
const boroughJson = require(['json!data/london_districts_latlong_with_centroids.json']);
console.log(boroughJson);

require([boroughFilePath], function(boroughJson) {
  for(let borough_outline of boroughJson.features) {
    let thisLayer = L.geoJSON();
    thisLayer.addData(borough_outline,
                      {style: boroughStyle});
    thisLayer.name = borough_outline.properties.name;
    thisLayer.addTo(boroughLayers);
  }
});

var boroughGeoJson = getJSON(boroughFilePath, data => {console.log(typeof(data)); return JSON.parse(data)});
*/
