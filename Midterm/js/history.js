// Global variables
let map;
let lat = 0;
let lon = 0;
let zl = 3;
let path1 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnVOK4HkRT25vJ0OSiibELheQHSsQKf7CYy4TZ2r0N_AO_4UKcmHZIxQMa16sBxeNfqkyh80Dm0Drd/pub?gid=0&single=true&output=csv"; // path to csv data
let history = L.featureGroup();
let csvdata;
let path = '';

let geojsonPath = 'data/merged_population.geojson';
let geojson_data;
let geojson_layer;

let brew = new classyBrew();
let fieldtomap; 

let legend = L.control({position: 'bottomright'});
let info_panel = L.control();


// initialize
$( document ).ready(function() {
    createMap(lat,lon,zl);
    readCSV(path1);
	getGeoJSON();
    createLayerControl();
});
// create the map
function createMap(lat,lon,zl){
    map = L.map('map').setView([lat,lon], zl);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    L.esri.basemapLayer('Gray').addTo(map);
}
// function to read csv data
function readCSV(path){
    Papa.parse(path, {
        header: true,
        download: true,
        complete: function(data) {
            console.log(data);
            csvdata = data;
            mapCSV(csvdata); // map the data
        }
    });
}
function mapCSV(data){
    if (data.meta.fields.length === 10) { //create map for the history data
        // circle options
        let circleOptions1 = {
            radius: 10,
            weight: 1,
            color: 'white',
            fillColor: 'dodgerblue',
            fillOpacity: 1,
            iconAnchor:   [23.5, 47], // point of the icon which will correspond to marker's location
            popupAnchor:  [200, 100] // point from which the popup should open relative to the iconAnchor
        }

        // loop through each entry
        data.data.forEach(function(item,index){
            let marker = L.circleMarker([item.latitude,item.longitude],circleOptions1).bindPopup("<h3>" + item.title + "</h3>" + "<center><img src ='" + item.reference_url + "'height=250px'/></center>",{
				maxWidth: "auto"
			})
            .on('click',function(){
                this.openPopup()
				
            })
            // add marker to featuregroup
            history.addLayer(marker)
        })
        history.addTo(map); // add featuregroup to map
		map.fitBounds(history.getBounds());
    }
}

function panToMarker(index){
	map.setZoom(10);
	// pan to the marker
	map.panTo(history.getLayers()[index]._latlng);
    //how to open the popup????    
    history.getLayers()[index].openPopup()
}

function createLayerControl(){
    let toggle = {
        "Asian American History": history,
		"Asian Population per State": geojson_layer,
	}
    L.control.layers(null,toggle).addTo(map);
}


// function to get the geojson data
function getGeoJSON(){

	$.getJSON(geojsonPath,function(data){
		console.log(data)

		// put the data in a global variable
		geojson_data = data;

		// call the map function
		mapGeoJSON('AsianTotal',5,'Reds','quantiles') // add a field to be used
	})
}

function mapGeoJSON(field,num_classes,color,scheme){

	// clear layers in case it has been mapped already
	if (geojson_layer){
		geojson_layer.clearLayers()
	}
	
	// globalize the field to map
	fieldtomap = field;

	// create an empty array
	let values = [];

	// based on the provided field, enter each value into the array
	geojson_data.features.forEach(function(item,index){
		if((item.properties[field] != undefined ) ){
			values.push(item.properties[field])
		}
	})

	// set up the "brew" options
	brew.setSeries(values);
	brew.setNumClasses(num_classes);
	brew.setColorCode(color);
	brew.classify(scheme);

	// create the layer and add to map
	geojson_layer = L.geoJson(geojson_data, {
		style: getStyle, //call a function to style each feature
		onEachFeature: onEachFeature, // actions on each feature
		onEachFeature: function (feature,layer){
			layer.bindTooltip(feature.properties.NAME + '<' + 'br' + '>' + +feature.properties.AsianTotal) //change count to population
		}
	}).addTo(map);
	createLayerControl();

	// create the legend
	createLegend();
}


function getStyle(feature){
	return {
		stroke: true,
		color: 'white',
		weight: 1,
		fill: true,
		fillColor: brew.getColorInRange(feature.properties[fieldtomap]),
		fillOpacity: 0.7
	}
}

function createLegend(){
	
	legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend');
		colors = brew.getBreaks();
		labels = [];
		
		/* Add min & max*/
		div.innerHTML = '<div><h4 style="font-size:larger;">Asian Population</h4></div><div class="labels"><div class="min">Low</div> \
	  <div class="max">High</div></div>';
	
	  for (i = 1; i < colors.length; i++) {
		  labels.push('<li style="background-color: ' + brew.getColorInRange(colors[i]) + '"></li>')
		}
	
		div.innerHTML += '<ul style="list-style-type:none;display:flex">' + labels.join('') + '</ul>';
		return div
	  }
	
	  legend.addTo(map);
}

// Function that defines what will happen on user interactions with each feature
function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
}

// on mouse over, highlight the feature
function highlightFeature(e) {
	var layer = e.target;

	// style to use on mouse over
	layer.setStyle({
		weight: 2,
		color: '#666',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}

	//info_panel.update(layer.feature.properties)
}

// on mouse out, reset the style, otherwise, it will remain highlighted
function resetHighlight(e) {
	geojson_layer.resetStyle(e.target);
	//info_panel.update() // resets infopanel
}

// on mouse click on a feature, zoom in to it
function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}