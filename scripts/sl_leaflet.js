
//var renderDiv = document.getElementById('mapid');
const centerLat = 51.5;
const centerLon = -0.12;
const initialZoom = 10;
//var smell_colors = d3.scale.category20();

// function updateSelectedYear(year) {
//  document.querySelector('#yearOutput').value = `Year shown on map: ${year}`;
//}

//const yearToPlot = document.querySelector('#yearSlider').value;

var myMap = L.map('londonMap')
              .setView([centerLat, centerLon], initialZoom);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
{
 attribution: 'Map data &copy;<a href="http://openstreetmap.org">OpenStreetMap</a> contributors,<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
 maxZoom: 18,
}).addTo(myMap);

// Retrieve boroughs outline data and add it as a geojson layer on the map.
const boroughStyle = {'color': 'black',
                      'weight': 1, 
		     };
const boroughFilePath = 'https://rawcdn.githack.com/Smelly-London/Smelly-London/master/visualisation/leaflet/data/london_districts_latlong_with_centroids.json' 

function getJSONCallBack(url, callback) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      let resultJson = JSON.parse(this.responseText);
      callback(resultJson);
    }
  };
  xhr.open('GET', url, true);
  xhr.send();
}

function renderGeoJsonLayerGroup(geoJson, map) {
  let layerGroup = L.layerGroup();
  for(let feature of geoJson.features) {
    let thisLayer = L.geoJSON();
    thisLayer.addData(feature,
                      {style: boroughStyle});
    thisLayer.name = feature.properties.name;
    thisLayer.addTo(layerGroup);
  }
  layerGroup.addTo(map);
  // return layerGroup; // cannot return value from async callback func!
}

function loadGeoJsonLayers(url, map) {
  getJSONCallBack(url, data => renderGeoJsonLayerGroup(data, myMap));
}

loadGeoJsonLayers(boroughFilePath, myMap);
// boroughLayers.addTo(myMap); //Cannot get ref to this returned by async callback func!
// console.log(boroughLayers);


function updateMap(yearToPlot) {

document.querySelector('#yearOutput').value = `Year shown on map: ${yearToPlot}`;
// Retrieve smell by borough and year
const smellFilePath = 'https://rawcdn.githack.com/Smelly-London/Smelly-London/master/visualisation/leaflet/data/moh_smell_category_borough_json.json';

function renderSmellDataThisYear(map, smellJson, year) {
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
  let layers = [];
  map.eachLayer(function(layer) {
    if( layer instanceof L.GeoJSON )
      layers.push(layer);
  });
  layers.forEach(function(layer) {
    popUpMessage = `${layer.name} ${year}: `; 
    smellsThisLayer = boroughDataThisYear[layer.name];
    if (smellsThisLayer) {
      for (let smell of smellsThisLayer) {
	popUpMessage += `${smell['count']} ${smell['cat']} smell. \n`;
      }
    }
    else {
      popUpMessage += `No smells found`;
    }
    layer.bindPopup(popUpMessage);
  })
}

function loadLayerSmells(map, url, year) {
  getJSONCallBack(url, data => renderSmellDataThisYear(map, data, year));
}

loadLayerSmells(myMap, smellFilePath, yearToPlot);
}

