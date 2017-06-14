
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

function fetchJsonPromise(url) {
  const response = fetch(url);
  const json = response.then(
    function (response) {
      return response.json();
    });
  return json;
}


// Did not work as expected, could not return an JSON object, only got Promises back??
// function fetchJson(url) {
//   let response = fetch(url);
//   return response
//    .then(response => response.json())
//    .then(json => (
//       {
//         data: json,
//         status: response.status
//       }
//     ))
//    .then(obj => obj.data)
// }


// Retrieve boroughs outline data and add it as a geojson layer on the map.
var boroughStyle = {'color': 'black',
                    'weight': 1};
var boroughUrl = 'https://rawcdn.githack.com/Smelly-London/Smelly-London/master/visualisation/leaflet/data/london_districts_latlong_with_centroids.json';
// boroughLayer is still a promise?!
//var boroughJsonPromise = fetchJsonPromise(boroughUrl);
let boroughJsonPromise = fetchJsonPromise(boroughUrl);
var boroughLayers = L.layerGroup().addTo(myMap);

let boroughLayer = boroughJsonPromise
                    .then(function (json) {
                      for(let borough_outline of json.features) {
                        let thisLayer = L.geoJSON();
                        thisLayer.addData(borough_outline,
                        {style: boroughStyle});
                        thisLayer.name = borough_outline.properties.name;
                        thisLayer.addTo(boroughLayers);
                      }
                    })
                    .catch(function(err) {
                       console.log('Failed to retrieve json.')
                    });


// Retrieve smell by borough and year
let smellBoroughUrl = 'https://rawcdn.githack.com/Smelly-London/Smelly-London/master/visualisation/leaflet/data/moh_smell_category_borough_json.json';
let smellBoroughJson = fetch(smellBoroughUrl).
                        then(function (response) {
                          return response.json();
                        })
                        .then(function(json) {
                          //console.log(json);
                          let boroughDataThisYear = {};
                          for (let boroughYearKey in json) {
                            if (boroughYearKey.endsWith(yearToPlot)) {
                              let boroughKey = boroughYearKey.split(' ')[0];
                              boroughDataThisYear[boroughKey] = [];
                              //console.log(boroughYearKey);
                              let boroughData = json[boroughYearKey];
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
                          console.log('1', boroughDataThisYear);
                          boroughLayers.eachLayer(function(layer) {
                            // layer.bindPopup('Smells this year: ');
                            smellsThisLayer = boroughDataThisYear[layer.name];
                            layer.popup = 'Layer ID: 1';
                          })
                          // return boroughDataThisYear;
                        })
                        // .then(function(boroughDataThisYear) {
                        //   //console.log('1');
                        //   boroughLayers.eachLayer(function(layer) {
                        //     //layer.bindPopup('Smells this year: ', boroughDataThisYear[layer.name]);
                        //     layer.bindPopup('Layer ID: 1');
                        //   });
                        //   return boroughLayers;
                        // })
                        // .catch(function(err) {
                        //   console.log('Failed to retrieve json.')
                        // });
console.log(boroughLayers);
/*
boroughLayer.bindPopup(function (layer) {
    	       return layer.feature.properties.description;
	       })

// Get smells per borough per year
for (var borough of smellBoroughJson) {
      for(var s of borough.smells) {

	    s.style = {
                fillStyle: smell_colors(s.name),
                strokeStyle: "black",
                lineWidth: 0
            }
	    
        }
*/
