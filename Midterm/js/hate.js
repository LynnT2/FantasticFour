// Global variables
let map;
let lat = 0;
let lon = 0;
let zl = 3;
let path2 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9rkI1x6LST8qoxYSMvaqH_1mdRvhzDkfyroO4jNeh2O4YaexTSdJ0EhaEKTCJu3WeA3Z-H3yKTSgF/pub?gid=1470389687&single=true&output=csv";
let markers = L.featureGroup();
let recent = L.markerClusterGroup();
let csvdata;
let path = '';

let geojsonPath = 'data/merged_population.geojson';
let geojson_data;
let geojson_layer;

let brew = new classyBrew();
let fieldtomap; 

let legend = L.control({position: 'bottomright'});
let info_panel = L.control();
let info = L.control({position:'bottomleft'});
let filtered_data;

// initialize
$( document ).ready(function() {
    createMap(lat,lon,zl);
    readCSV(path2);
	getGeoJSON();
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
       
		if (data.meta.fields.lenth === 15) { //create map for the recent anti-Asian attacks data
			let circleOptions2 = {
				radius: 8,
				weight: 1,
				color: 'white',
				fillColor: '#f55e61',
				fillOpacity: 1,
			}
		
		// loop through each entry
        data.data.forEach(function(item,index){
            let marker = L.circleMarker([item.latitude,item.longitude],circleOptions2).bindPopup(`<h3>Incident</h3><a href=${item.Link} target="_blank">${item.Description}</a><br>Date: ${item.Month}`)
            .on('mouseover',function(){
                this.openPopup()
            })
            // add marker to featuregroup
            recent.addLayer(marker)
        })
        recent.addTo(map); // add featuregroup to map
        map.fitBounds(recent.getBounds()); // fit markers to map
    }
}

function mapFilterd(data,color){
  let circleOptions2 = {
    radius: 8,
    weight: 1,
    color: color,
    fillColor: color,
    fillOpacity: 1,
  }
	data.forEach(function(item,index){
    let marker = L.circleMarker([item.latitude,item.longitude],circleOptions2).bindPopup(`<h3>Incident</h3><a href=${item.Link} target="_blank">${item.Description}</a><br>Date: ${item.Month}`)
    .on('mouseover',function(){
        this.openPopup()
    })
    // add marker to featuregroup
    recent.addLayer(marker)
  })
  recent.addTo(map); // add featuregroup to map
  map.fitBounds(recent.getBounds()); // fit markers to map
}

function createLayerControl(){
    let toggle = {
		"Recent anti-Asian attacks": recent,
		"choropleth": geojson_layer,
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
		mapGeoJSON('AsianTotal',4,'Reds','quantiles') // add a field to be used
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


	// turning off fit bounds so that we stay in mainland USA
	//map.fitBounds(geojson_layer.getBounds());

	// create the legend
	createLegend();

	// create the infopanel
	//createInfoPanel();

  	createGenderChart();
	createEthnicityChart();
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
		var div = L.DomUtil.create('div', 'info legend'),
		breaks = brew.getBreaks(),
		labels = [],
		from, to;
		labels.push('Asian Population')
		
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

/*function createInfoPanel(){

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
}*/

function createGenderChart(){

	// chart title
	let title = 'Gender';

	// data values
	let data = [
        42,49,10
    ];

	// data fields
	let fields = [
        'male','female','unknown'
    ];

	// set chart options
    let options = {
		chart: {
			type: 'pie',
			height: 300,
			width: 300,			
			animations: {
				enabled: true,
			},
      events: {
        dataPointSelection: function (event, chartContext, config){
          if (config.dataPointIndex === 0){
            filtered_data = csvdata.data.filter(item => item.victim_gender === 'male');
            recent.clearLayers();
            mapFilterd(filtered_data,'blue')
          }
          if (config.dataPointIndex === 1){
            filtered_data = csvdata.data.filter(item => item.victim_gender === 'female');
            recent.clearLayers();
            mapFilterd(filtered_data,'green')
          }
          if (config.dataPointIndex === 2){
            filtered_data = csvdata.data.filter(item => item.victim_gender === 'unknown');
            recent.clearLayers();
            mapFilterd(filtered_data,'yellow')
          }
        }
      }
		},
		title: {
			text: title,
		},
		series: data,
		labels: fields,
		legend: {
			position: 'right',
			offsetY: 0,
			height: 230,
		  },
		theme: {
			palette: 'palette3' 
		}
	};

	// create the chart
	info.onAdd = function(map){
		this._div = L.DomUtil.create('div', 'info');
		return this._div;
	};
	info.addTo(map);
	gender = new ApexCharts(document.querySelector('.info'), options);
	gender.render();

}

function createEthnicityChart(){

	// chart title
	let title = 'Ethnicity';

	// data values
	let data = [
        20,12,4,1
    ];

	// data fields
	let fields = [
        'Chinese','Korean','Japanese','Unknown'
    ];

	// set chart options
    let options = {
		chart: {
			type: 'pie',
			height: 300,
			width: 300,			
			animations: {
				enabled: true,
			},
      /*events: {
        dataPointSelection: function (event, chartContext, config){
          if (config.dataPointIndex === 0){
            filtered_data = csvdata.data.filter(item => item.victim_gender === 'male');
            recent.clearLayers();
            mapFilterd(filtered_data,'blue')
          }
          if (config.dataPointIndex === 1){
            filtered_data = csvdata.data.filter(item => item.victim_gender === 'female');
            recent.clearLayers();
            mapFilterd(filtered_data,'green')
          }
          if (config.dataPointIndex === 2){
            filtered_data = csvdata.data.filter(item => item.victim_gender === 'unknown');
            recent.clearLayers();
            mapFilterd(filtered_data,'yellow')
          }
        }
      }*/
		},
		title: {
			text: title,
		},
		series: data,
		labels: fields,
		legend: {
			position: 'right',
			offsetY: 0,
			height: 230,
		  },
		theme: {
			palette: 'palette3' 
		}
	};

	// create the chart

	ethnicity = new ApexCharts(document.querySelector('.info'),options);
	ethnicity.render();

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

