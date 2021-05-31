// Global variables
let map;
let lat = 0;
let lon = 0;
let zl = 3;
let path1 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnVOK4HkRT25vJ0OSiibELheQHSsQKf7CYy4TZ2r0N_AO_4UKcmHZIxQMa16sBxeNfqkyh80Dm0Drd/pub?gid=0&single=true&output=csv"; // path to csv data
let history = L.featureGroup();
let csvdata;

let geojsonPath = 'data/us.geojson';
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
            let marker = L.circleMarker([item.latitude,item.longitude],circleOptions1).bindPopup("<h3>" + item.title + " (" + item.date + ")" + "</h3>" + "<center><img src ='" + item.reference_url + "'width=100%'/></center>" +
                item.description)
            .on('mouseover',function(){
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
	}
    L.control.layers(null,toggle).addTo(map);
}
let path = '';

// function to get the geojson data
function getGeoJSON(){

	$.getJSON(geojsonPath,function(data){
		console.log(data)

		// put the data in a global variable
		geojson_data = data;

		// call the map function
		mapGeoJSON('count') // add a field to be used
	})
}

function mapGeoJSON(field){

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
		if(item.properties[field] != undefined){
			values.push(item.properties[field])
		}
	})

	// set up the "brew" options
	brew.setSeries(values);
	brew.setNumClasses(4);
	brew.setColorCode('Reds');
	brew.classify('quantiles');

	// create the layer and add to map
	geojson_layer = L.geoJson(geojson_data, {
		style: getStyle, //call a function to style each feature
		onEachFeature: onEachFeature //actions on eac feature
	}).addTo(map);

	map.fitBounds(geojson_layer.getBounds())

	// create the legend
	createLegend();
	createInfoPanel();
}

function getStyle(feature){
	return {
		stroke: true,
		color: 'white',
		weight: 1,
		fill: true,
		fillColor: brew.getColorInRange(feature.properties[fieldtomap]),
		fillOpacity: 0.8
	}
}

function createLegend(){
	legend.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'info legend'),
		breaks = brew.getBreaks(),
		labels = [],
		from, to;
		labels.push('Number of Hate Crimes')
		
		for (var i = 0; i < breaks.length; i++) {
			from = breaks[i];
			to = breaks[i + 1];
			if(to) {
				labels.push(
					'<i style="background:' + brew.getColorInRange(to) + '"></i> ' +
					from + ' &ndash; ' + to);
				}
			}
			
			div.innerHTML = labels.join('<br>');
			return div;
		};
		
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

	info_panel.update(layer.feature.properties)
}

// on mouse out, reset the style, otherwise, it will remain highlighted
function resetHighlight(e) {
	geojson_layer.resetStyle(e.target);
	info_panel.update() // resets infopanel
}

// on mouse click on a feature, zoom in to it
function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function createInfoPanel(){

	info_panel.onAdd = function (map) {
		this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
		this.update();
		return this._div;
	};

	// method that we will use to update the control based on feature properties passed
	info_panel.update = function (properties) {
		// if feature is highlighted
		if(properties){
			this._div.innerHTML = `<b>${properties.NAME}</b><br>${fieldtomap}: ${properties[fieldtomap]}`;
		}
		// if feature is not highlighted
		else
		{
			this._div.innerHTML = 'Hover over a state to see the number of its anti-Asian hate incidents from March 2020 to March 2021.';
		}
	};

	info_panel.addTo(map);
}