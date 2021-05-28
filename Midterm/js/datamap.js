document.addEventListener('DOMContentLoaded', function(){
    drawChart();
  });
  
  function drawChart() {
    const svg = d3.select(" #timelineChart").append("svg").attr('id','Chart').attr("width", '100%').attr("height", "200");
    d3.json("data/timeline.json").then(function(data) {
      svg.append('line').attr('class', 'timeline-base')
        .attr("x1", 0)
        .attr("y1", 100)
        .attr("x2", '95%')
        .attr("y2", 100);
      // Get the value of the svg to for scaleLinear
      function getLineVal(val) {
        if(val === 'max') {
          let el = document.getElementById('Chart');
          return el.getBoundingClientRect().width;
        }
        else {
          return 0;
        }
      }
      // Convert to UNIX timestamp
      function convertToTimeStamp(date) {
        let parts = date.match(/(\d{4})-(\d{2})-(\d{2})/);
        return new Date(parts[1]+ '-'+parts[2]+'-'+parts[3]).getTime();
      }
  
      let scaleLine = d3.scaleLinear()
        .domain([-4102373222, Date.now()])
        .range([getLineVal('min') + 900 , getLineVal('max') - 200]); // OFFSET = 20
  
      let scaleCircle = d3.scaleLinear()
        .domain([moment.duration(3,'d').asMilliseconds(), moment.duration(10,'y').asMilliseconds()])
        .range([10, 200]);
  
      let allGroups = svg.selectAll('g').data(data);
      let group = allGroups.enter().append('g').attr('id', function(data){return 'group-' + data.id});
  
      group.append('circle')
        .attr('cx', function(data) {return scaleLine(convertToTimeStamp(data.date));})
        .attr('cy', 100)
        .attr('r', function(data) {return scaleCircle(convertToTimeStamp(data.date) - convertToTimeStamp(data.date));})
        .attr('fill-opacity', 0.5)
        .attr('class', function(data) { return('circle-category circle-' + data.category.toLowerCase())})
        .attr('id', function(data) {
          return 'circle-' + data.id
        })
        // When hover a circle
        .on('mouseover', function(d, i) {
          d3.select(this).attr('r', function(data) {return scaleCircle(convertToTimeStamp(data.date) - convertToTimeStamp(data.date)) + 20;});
          d3.select(this).classed('circle-hovered', true);
          d3.select(this.parentNode).selectAll('text').style('opacity', 1);
          d3.select(this.parentNode).selectAll('.text-place').classed('hovered', true).style('opacity', 0);
          d3.select(this.parentNode).selectAll('.text-desc').classed('hovered', true).style('opacity', 0);
          
        })
        // When click a circle
        .on('click', function(d, i){
          d3.select(this).attr('r', 2000);
          d3.selectAll('line').style('opacity', 0);
          d3.selectAll('circle').filter(function() {
            return !this.classList.contains('circle-hovered');
          }).style('opacity', 0);
          d3.select(this).classed('circle-clicked', true);
          d3.select(this.parentNode).selectAll('.text-position').style('opacity', 0);
          d3.select(this.parentNode).selectAll('.text-date').style('opacity', 0);
          d3.selectAll('.details').style('display', 'none');
          setTimeout(function() {
            svg.attr('height', 0);
          }, 450)
          let currId = this.getAttribute('id').split('-')[1];
          let details = d3.select('#details-' + currId);
          details.style('display', 'block');
          details.style('opacity', 1);
          $.getScript('js/map.js',function(){panToMarker(d.id);
          });
        })

        // When un-hover a circle
        .on('mouseout', function(d, i){
          d3.select(this).attr('r', function(data) {return scaleCircle(convertToTimeStamp(data.date) - convertToTimeStamp(data.date));});
          d3.select(this).classed('circle-hovered', false);
          d3.select(this.parentNode).selectAll('text').style('opacity', 0);
        });
  
      group.append('text')
        .style('opacity', 0)
        .text(function(data) { return(data.title);})
        .attr('x', function(data) {
          let elementWitdh = this.getBoundingClientRect().width;
          // Avoid overflow
          if(scaleLine(convertToTimeStamp(data.date)) + elementWitdh >= getLineVal('max')) {
            return scaleLine(convertToTimeStamp(data.date)) - elementWitdh;
          }
          else {
            return scaleLine(convertToTimeStamp(data.date));
          }
        })
        .attr('y', 150)
        .attr('class', 'text-position');
  
      group.append('text')
        .text(function(data) {
        // Get only YYYY-MM
        if(data.date.length > 7) {
          return (data.date.slice(0,7))
        }
        else {
          return(data.date)
        }
      })
      .attr('x', function(data) {
        // Get sibling to have the len and align the date
        let elementWitdh= this.getBoundingClientRect().width;
        let positionWidth = this.parentNode.querySelector('text.text-position').getBoundingClientRect().width;
        if(scaleLine(convertToTimeStamp(data.date)) + positionWidth >= getLineVal('max')) {
          return scaleLine(convertToTimeStamp(data.date)) - elementWitdh;
        }
        else {
          return scaleLine(convertToTimeStamp(data.date));
        }
      })
      .attr('y', 130)
      .attr('class', 'text-date')
      .style('opacity', 0);
  
      data.map(d => {
        let details = d3.select('#timelineChart').append('div').classed('details', true).classed('details-' + d.category.toLowerCase(), true).attr('id', 'details-' + d.id);
        details.append('i').classed('material-icons close-icon', true).text('close');
        details.append('div').classed('title', true).append('span').classed('date text-date date-title', true).text(d.date + '-' + d.date);
        details.select(' .title').append('span').classed('position-title text-position', true).text(d.title);
        details.append('div').classed('place-name text-place hovered', true).text(d.location);
        details.append('div')
          .attr('class', 'text-desc')
          .attr('id', 'descriptionId-'+ d.id)
          .text(function(){
            if(typeof(d.description) === 'string') {
              return d.description;
            }
            else {
              return d.description.toString()
            }
          });
        details.style('opacity', 0);
      });
  
      // Hide the details div (once opened by clicking on circle)
      d3.selectAll('.close-icon').on('click', function() {
        map.fitBounds(recent.getBounds());
        map.closePopup();
        d3.select(this.parentNode).style('opacity', 0);
        setTimeout(function() {
          svg.attr('height', 200);
          d3.select('.timeline-base').style('opacity', 1)
          d3.selectAll('circle').classed('circle-clicked', false);
          d3.selectAll('circle').style('opacity', 1);
          d3.selectAll('.details').style('display', 'block');
        }, 1000)
      })
    });
  }
  document.addEventListener('DOMContentLoaded', function(){
    drawChart();
  });
  
  function drawChart() {
    const svg = d3.select(" #timelineChart").append("svg").attr('id','Chart').attr("width", '100%').attr("height", "200");
    d3.json("data/timeline.json").then(function(data) {
      svg.append('line').attr('class', 'timeline-base')
        .attr("x1", 0)
        .attr("y1", 100)
        .attr("x2", '95%')
        .attr("y2", 100);
      // Get the value of the svg to for scaleLinear
      function getLineVal(val) {
        if(val === 'max') {
          let el = document.getElementById('Chart');
          return el.getBoundingClientRect().width;
        }
        else {
          return 0;
        }
      }
      // Convert to UNIX timestamp
      function convertToTimeStamp(date) {
        let parts = date.match(/(\d{4})-(\d{2})-(\d{2})/);
        return new Date(parts[1]+ '-'+parts[2]+'-'+parts[3]).getTime();
      }
  
      let scaleLine = d3.scaleLinear()
        .domain([-4102373222, Date.now()])
        .range([getLineVal('min') + 900 , getLineVal('max') - 200]); // OFFSET = 20
  
      let scaleCircle = d3.scaleLinear()
        .domain([moment.duration(3,'d').asMilliseconds(), moment.duration(10,'y').asMilliseconds()])
        .range([10, 200]);
  
      let allGroups = svg.selectAll('g').data(data);
      let group = allGroups.enter().append('g').attr('id', function(data){return 'group-' + data.id});
  
      group.append('circle')
        .attr('cx', function(data) {return scaleLine(convertToTimeStamp(data.date));})
        .attr('cy', 100)
        .attr('r', function(data) {return scaleCircle(convertToTimeStamp(data.date) - convertToTimeStamp(data.date));})
        .attr('fill-opacity', 0.5)
        .attr('class', function(data) { return('circle-category circle-' + data.category.toLowerCase())})
        .attr('id', function(data) {
          return 'circle-' + data.id
        })
        // When hover a circle
        .on('mouseover', function(d, i) {
          d3.select(this).attr('r', function(data) {return scaleCircle(convertToTimeStamp(data.date) - convertToTimeStamp(data.date)) + 20;});
          d3.select(this).classed('circle-hovered', true);
          d3.select(this.parentNode).selectAll('text').style('opacity', 1);
          d3.select(this.parentNode).selectAll('.text-place').classed('hovered', true).style('opacity', 0);
          d3.select(this.parentNode).selectAll('.text-desc').classed('hovered', true).style('opacity', 0);
          
        })
        // When click a circle
        .on('click', function(d, i){
          d3.select(this).attr('r', 2000);
          d3.selectAll('line').style('opacity', 0);
          d3.selectAll('circle').filter(function() {
            return !this.classList.contains('circle-hovered');
          }).style('opacity', 0);
          d3.select(this).classed('circle-clicked', true);
          d3.select(this.parentNode).selectAll('.text-position').style('opacity', 0);
          d3.select(this.parentNode).selectAll('.text-date').style('opacity', 0);
          d3.selectAll('.details').style('display', 'none');
          setTimeout(function() {
            svg.attr('height', 0);
          }, 450)
          let currId = this.getAttribute('id').split('-')[1];
          let details = d3.select('#details-' + currId);
          details.style('display', 'block');
          details.style('opacity', 1);
          $.getScript('js/map.js',function(){panToMarker(d.id);
          });
        })

        // When un-hover a circle
        .on('mouseout', function(d, i){
          d3.select(this).attr('r', function(data) {return scaleCircle(convertToTimeStamp(data.date) - convertToTimeStamp(data.date));});
          d3.select(this).classed('circle-hovered', false);
          d3.select(this.parentNode).selectAll('text').style('opacity', 0);
        });
  
      group.append('text')
        .style('opacity', 0)
        .text(function(data) { return(data.title);})
        .attr('x', function(data) {
          let elementWitdh = this.getBoundingClientRect().width;
          // Avoid overflow
          if(scaleLine(convertToTimeStamp(data.date)) + elementWitdh >= getLineVal('max')) {
            return scaleLine(convertToTimeStamp(data.date)) - elementWitdh;
          }
          else {
            return scaleLine(convertToTimeStamp(data.date));
          }
        })
        .attr('y', 150)
        .attr('class', 'text-position');
  
      group.append('text')
        .text(function(data) {
        // Get only YYYY-MM
        if(data.date.length > 7) {
          return (data.date.slice(0,7))
        }
        else {
          return(data.date)
        }
      })
      .attr('x', function(data) {
        // Get sibling to have the len and align the date
        let elementWitdh= this.getBoundingClientRect().width;
        let positionWidth = this.parentNode.querySelector('text.text-position').getBoundingClientRect().width;
        if(scaleLine(convertToTimeStamp(data.date)) + positionWidth >= getLineVal('max')) {
          return scaleLine(convertToTimeStamp(data.date)) - elementWitdh;
        }
        else {
          return scaleLine(convertToTimeStamp(data.date));
        }
      })
      .attr('y', 130)
      .attr('class', 'text-date')
      .style('opacity', 0);
  
      data.map(d => {
        let details = d3.select('#timelineChart').append('div').classed('details', true).classed('details-' + d.category.toLowerCase(), true).attr('id', 'details-' + d.id);
        details.append('i').classed('material-icons close-icon', true).text('close');
        details.append('div').classed('title', true).append('span').classed('date text-date date-title', true).text(d.date + '-' + d.date);
        details.select(' .title').append('span').classed('position-title text-position', true).text(d.title);
        details.append('div').classed('place-name text-place hovered', true).text(d.location);
        details.append('div')
          .attr('class', 'text-desc')
          .attr('id', 'descriptionId-'+ d.id)
          .text(function(){
            if(typeof(d.description) === 'string') {
              return d.description;
            }
            else {
              return d.description.toString()
            }
          });
        details.style('opacity', 0);
      });
  
      // Hide the details div (once opened by clicking on circle)
      d3.selectAll('.close-icon').on('click', function() {
        map.fitBounds(recent.getBounds());
        map.closePopup();
        d3.select(this.parentNode).style('opacity', 0);
        setTimeout(function() {
          svg.attr('height', 200);
          d3.select('.timeline-base').style('opacity', 1)
          d3.selectAll('circle').classed('circle-clicked', false);
          d3.selectAll('circle').style('opacity', 1);
          d3.selectAll('.details').style('display', 'block');
        }, 1000)
      })
    });
  }
  // Global variables
let map;
let lat = 0;
let lon = 0;
let zl = 3;
let path1 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnVOK4HkRT25vJ0OSiibELheQHSsQKf7CYy4TZ2r0N_AO_4UKcmHZIxQMa16sBxeNfqkyh80Dm0Drd/pub?gid=0&single=true&output=csv"; // path to csv data
let path2 = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ9rkI1x6LST8qoxYSMvaqH_1mdRvhzDkfyroO4jNeh2O4YaexTSdJ0EhaEKTCJu3WeA3Z-H3yKTSgF/pub?gid=1470389687&single=true&output=csv";
let markers = L.featureGroup();
let recent = L.markerClusterGroup();
let history = L.featureGroup();
let csvdata;


// initialize
$( document ).ready(function() {
    createMap(lat,lon,zl);
    getGeoJSON();
    readCSV(path1);
    readCSV(path2);
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
    }
    console.log(data.meta.fields.length)
    if (data.meta.fields.length === 15) { //create map for the recent anti-Asian attacks data
        let circleOptions2 = {
            radius: 8,
            weight: 1,
            color: 'white',
            fillColor: '#f55e61',
            fillOpacity: 1,
        }
        // loop through each entry
        data.data.forEach(function(item,index){
            console.log('here')
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
		"Recent anti-Asian attacks": recent
	}
    L.control.layers(null,toggle).addTo(map);
}

let path = '';

// put this in your global variables
let geojsonPath = 'data/us.geojson';
let geojson_data;
let geojson_layer;

let brew = new classyBrew();
let fieldtomap; 

let legend = L.control({position: 'bottomright'});
let info_panel = L.control();



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