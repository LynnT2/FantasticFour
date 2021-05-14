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
    readCSV(path1);
    readCSV(path2);
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
        })
        recent.addTo(map); // add featuregroup to map
        map.fitBounds(recent.getBounds()); // fit markers to map
    }
    let toggle = {
        "Asian American History": history,
		"Recent anti-Asian attacks": recent
	}
    L.control.layers(null,toggle).addTo(map);
}

function panToMarker(index){
	map.setZoom(10);
	// pan to the marker
	map.panTo(history.getLayers()[index]._latlng);
    //how to open the popup????    
    history.getLayers()[index].openPopup()
}
