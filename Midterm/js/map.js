// Global variables
let map;
let lat = 0;
let lon = 0;
let zl = 2; //zoom level 
let path = "data/asian.csv";
let markers = L.featureGroup();


// initialize
$( document ).ready(function() {
    createMap(lat,lon,zl);
    readCSV(path);
});

// create the map
function createMap(lat,lon,zl){
	map = L.map('map').setView([lat,lon], zl);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
}

// function to read csv data
function readCSV(path){
	Papa.parse(path, {
		header: true, //has header row
		download: true, 
		complete: function(data) {
			console.log(data); //dump data into the console
			
			// map the data
			mapCSV(data);

		}
	});
}


function mapCSV(data){
	let circleOptions = {
        radius:5,
        weight:1,
        color:'white',
        fillColor:"dodgerblue",
        fillOpacity:1,
    }
    var month = "March 2020";
    $('.sidebar').append(`<div class="note"><b>Move cursor over event to see location on map!</b></div><div class="month"><b>March 2020</b></div>`);
	// loop through each entry
	data.data.forEach(function(item,index){
		// create marker
		let marker = L.circleMarker([item.lat,item.lon],circleOptions)
        .on('mouseover',function(){
			this.bindPopup(`${item.Description}<br><a href=${item.Link} target="_blank">Link to article</a>`).openPopup()
		}) //binds popup to marker, adds a title and an image to the popup

        // add entry to sidebar
        if (item.Month!==month) {
            $('.sidebar').append(`<div class="month"><b>${item.Month}</b><br></div>`);
            month = item.Month;
        }
		$('.sidebar').append(`<div onmousemove="panToImage(${index})"><br>${item.Description}<br><br></div>`)
        

		// add marker to featuregroup
		markers.addLayer(marker)
	})

	// add featuregroup to map
	markers.addTo(map)

	// fit markers to map
	map.fitBounds(markers.getBounds())
}

function panToImage(index){
	// zoom to level 17 first
	map.setZoom(12);
	// pan to the marker
	map.panTo(markers.getLayers()[index]._latlng);
    //how to open the popup????
}
