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
let info2 = L.control({position:'bottomleft'});
let info3 = L.control({position:'bottomleft'});
let filtered_data;

// initialize
$( document ).ready(function() {
    createMap(lat,lon,zl);
    readCSV(path2);
	getGeoJSON();
	createButton();
	showAllMarkers();
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
       
		//if (data.meta.fields.lenth === 15) { //create map for the recent anti-Asian attacks data
		let circleOptions2 = {
			radius: 8,
			weight: 1,
			color: 'white',
			fillColor: '#6B91F4',
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
        map.fitBounds([[72.000,-66.000],[17.000,-179.000]]); // fit markers to map
}

function mapFilterd(data){
  let circleOptions2 = {
    radius: 8,
    weight: 1,
    color: 'white',
    fillColor: '#6B91F4',
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
}

function createLayerControl(){
    let toggle = {
		"Recent anti-Asian attacks": recent,
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


	// turning off fit bounds so that we stay in mainland USA
	//map.fitBounds(geojson_layer.getBounds());

	// create the legend
	createLegend();

	// create the infopanel
	//createInfoPanel();

  	createGenderChart(true);
	createEthnicityChart(true);
	createAgeChart(true);
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


function createGenderChart(anime){

	// chart title
	let title = 'Gender';

	// data values
	let data = [
        42,49,10
    ];

	// data fields
	let fields = [
        'male','female','Unknown'
    ];

	// set chart options
    let options = {
		chart: {
			type: 'pie',
			height: 250,
			width: 250,			
			animations: {
				enabled: anime,
			},
      events: {
        dataPointSelection: function (event, chartContext, config){
          if (config.dataPointIndex === 0){
            filtered_data = csvdata.data.filter(item => item.victim_gender === 'male');
            recent.clearLayers();
            mapFilterd(filtered_data)
          }
          if (config.dataPointIndex === 1){
            filtered_data = csvdata.data.filter(item => item.victim_gender === 'female');
            recent.clearLayers();
            mapFilterd(filtered_data)
          }
          if (config.dataPointIndex === 2){
            filtered_data = csvdata.data.filter(item => item.victim_gender === 'unknown');
            recent.clearLayers();
            mapFilterd(filtered_data)
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
			monochrome: {
			  enabled: true,
			  color: '#C15D5E',
			  shadeTo: 'light',
			  shadeIntensity: 0.65
			}
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

function createEthnicityChart(anime){

	// chart title
	let title = 'Ethnicity';

	// data values
	let data = [
        21,14,5,6,3,62
    ];

	// data fields
	let fields = [
        'Chinese','Korean','Japanese','Filipino','Other','Unknown'
    ];

	// set chart options
    let options = {
		chart: {
			type: 'pie',
			height: 250,
			width: 250,			
			animations: {
				enabled: anime,
			},
      		events: {
				dataPointSelection: function (event, chartContext, config){
				if (config.dataPointIndex === 0){
					filtered_data = csvdata.data.filter(item => item.victim_ethnicity === 'Chinese');
					recent.clearLayers();
					mapFilterd(filtered_data)
				}
				if (config.dataPointIndex === 1){
					filtered_data = csvdata.data.filter(item => item.victim_ethnicity === 'Korean');
					recent.clearLayers();
					mapFilterd(filtered_data)
				}
				if (config.dataPointIndex === 2){
					filtered_data = csvdata.data.filter(item => item.victim_ethnicity === 'Japanese');
					recent.clearLayers();
					mapFilterd(filtered_data)
					}
				if (config.dataPointIndex === 3){
					filtered_data = csvdata.data.filter(item => item.victim_ethnicity === 'Filipino');
					recent.clearLayers();
					mapFilterd(filtered_data)
					}
				if (config.dataPointIndex === 4){
					filtered_data = csvdata.data.filter(item => (item.victim_ethnicity === 'Thai')|(item.victim_ethnicity === 'Hmong')|(item.victim_ethnicity === 'Vietnamese'));
					recent.clearLayers();
					mapFilterd(filtered_data)
					}
				if (config.dataPointIndex === 5){
					filtered_data = csvdata.data.filter(item => item.victim_ethnicity === 'Asian');
					recent.clearLayers();
					mapFilterd(filtered_data)
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
			offsetY: -17,
			height: 200,
		  },
		theme: {
			monochrome: {
			  enabled: true,
			  color: '#E7A41C',
			  shadeTo: 'light',
			  shadeIntensity: 0.64
			}
		  }
	};

	// create the chart
	info2.onAdd = function(map){
		this._div = L.DomUtil.create('div', 'info');
		return this._div;
	};
	info2.addTo(map);
	ethnicity = new ApexCharts(document.querySelector('.info'),options);
	ethnicity.render();

}

function createAgeChart(anime){

	// chart title
	let title = 'Age';

	// data values
	let data = [
        3,40,12,8,47
    ];

	// data fields
	let fields = [
        '0-19','20-39','40-59','60-79','Unknown'
    ];

	// set chart options
    let options = {
		chart: {
			type: 'pie',
			height: 250,
			width: 250,			
			animations: {
				enabled: anime,
			},
      		events: {
				dataPointSelection: function (event, chartContext, config){
				if (config.dataPointIndex === 0){
					filtered_data = csvdata.data.filter(item => (item.victim_age>=0)&&(item.victim_age<=19));
					recent.clearLayers();
					mapFilterd(filtered_data)
				}
				if (config.dataPointIndex === 1){
					filtered_data = csvdata.data.filter(item => (item.victim_age>=20)&&(item.victim_age<=39));
					recent.clearLayers();
					mapFilterd(filtered_data)
				}
				if (config.dataPointIndex === 2){
					filtered_data = csvdata.data.filter(item => (item.victim_age>=40)&&(item.victim_age<=59));
					recent.clearLayers();
					mapFilterd(filtered_data)
					}
				if (config.dataPointIndex === 3){
					filtered_data = csvdata.data.filter(item => (item.victim_age>=60)&&(item.victim_age<=79));
					recent.clearLayers();
					mapFilterd(filtered_data)
					}
				if (config.dataPointIndex === 4){
					filtered_data = csvdata.data.filter(item => item.victim_age=='Unknown');
					recent.clearLayers();
					mapFilterd(filtered_data)
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
			offsetY: -10,
			height: 200,
		  },
		theme: {
			monochrome: {
			  enabled: true,
			  color: '#255aee',
			  shadeTo: 'light',
			  shadeIntensity: 0.65
			}
		  }
	};

	// create the chart
	info3.onAdd = function(map){
		this._div = L.DomUtil.create('div', 'info');
		return this._div;
	};
	info3.addTo(map);
	ethnicity = new ApexCharts(document.querySelector('.info'),options);
	ethnicity.render();

}

function createButton(){
	var stateChangingButton = L.easyButton({
		states: [{
				stateName: 'hide-pie-charts',        // name the state
				icon:      '&equiv;',               // and define its properties
				title:     'Hide pie charts',      // like its title
				onClick: function(btn, map) {       // and its callback
					map.removeControl(info);
					map.removeControl(info2);
					map.removeControl(info3);
					btn.state('show-pie-charts');    // change state on click!
				}
			}, {
				stateName: 'show-pie-charts',
				icon:      '&equiv;',
				title:     'Show pie charts',
				onClick: function(btn, map) {
					createGenderChart(false);
					createEthnicityChart(false);
					createAgeChart(false);
					btn.state('hide-pie-charts');
				}
		}]
	});
	
	stateChangingButton.addTo(map);
}

function showAllMarkers(){
	L.easyButton( 'fa-undo', function(){
		recent.clearLayers();
		mapCSV(csvdata);
	  }).addTo(map);
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

