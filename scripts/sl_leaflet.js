
var yearToPlot = '1964';
//var renderDiv = document.getElementById('mapid');
var centerLat = 51.5;
var centerLon = -0.12;
var initialZoom = 12;
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
const boroughFilePath = '../data/london_districts_latlong_with_centroids.json';

// const boroughJson = require(['json!data/london_districts_latlong_with_centroids.json']);
// console.log(boroughJson);
let boroughLayers = L.layerGroup().addTo(myMap);

require([boroughFilePath], function(boroughJson) {
  for(let borough_outline of boroughJson.features) {
    let thisLayer = L.geoJSON();
    thisLayer.addData(borough_outline,
                      {style: boroughStyle});
    thisLayer.name = borough_outline.properties.name;
    thisLayer.addTo(boroughLayers);
  }
});

// Retrieve smell by borough and year
const smellFilePath = '../data/moh_smell_category_borough_json.json';
let smellJson = require(smellFilePath);

let boroughDataThisYear = {};
for (let boroughYearKey in smellJson) {
  if (boroughYearKey.endsWith(yearToPlot)) {
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


// console.log('1', boroughDataThisYear);

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
                         
