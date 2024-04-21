//Random part of the world
const land = [
	[43.8, 36, -9.5, 0.2],
	[50, 43.5, -4.8, 6.2],
	[59, 50, -10.5, 1.8],
	[53.5, 50, 1.4, 7.1],
	[57.7, 55, 8, 12],
	[48, 43, 6, 14],
	[43, 39, 8, 10],
	[38, 36.5, 12, 15.5],
	[43, 40.5, 10, 15],
	[42, 38, 15, 18],
	[54.5, 45, 12, 23],
	[59.5, 54.5, 21, 28],
	[48, 40.5, 23, 28, 5],
	[40.5, 35, 19.5, 27],
	[70, 60, 21, 28.5],
	[66.6, 61, 28.5, 30.5],
	[65, 55.5, 10.5, 19],
	[70, 65, 11.5, 21],
	[63.5, 58, 4.5, 10.5],
];
const zone = land[Math.floor(Math.random() * land.length)];

let sv;
let panorama;
let lat;
let lng;
let startLoc;
let answer;

function initialize() {
	//Random coordinates
	startLoc = {
		lat: Number((Math.random() * (zone[0] - zone[1]) + zone[1]).toFixed(15)),
		lng: Number((Math.random() * (zone[2] - zone[3]) + zone[3]).toFixed(15)),
	};
	//Panorama settings
	sv = new google.maps.StreetViewService();
	panorama = new google.maps.StreetViewPanorama(
		document.getElementById('pano'),
		{
			addressControl: false,
			panControlOptions: { position: google.maps.ControlPosition.TOP_LEFT },
			zoomControl: false,
			fullscreenControl: false,
			showRoadLabels: false,
		}
	);
	//New panorama
	function getPanorama(coord) {
		sv.getPanorama(
			{
				location: coord,
				radius: 1000,
				source: 'outdoor',
				preference: 'nearest',
			},
			function processSVData(data, status) {
				if (status === google.maps.StreetViewStatus.ZERO_RESULTS) {
					//If there is no panorama, try again
					getPanorama({
						lat: Number(
							(Math.random() * (zone[0] - zone[1]) + zone[1]).toFixed(15)
						),
						lng: Number(
							(Math.random() * (zone[2] - zone[3]) + zone[3]).toFixed(15)
						),
					});
				} else {
					//Else show panorama
					panorama.setPano(data.location.pano);
					panorama.setPov({
						heading: 0,
						pitch: 0,
					});
					panorama.setVisible(true);
				}
			}
		);
	}
	getPanorama(startLoc);
	//New map
	const map = new google.maps.Map(document.getElementById('map'), {
		center: { lat: 48.8627563, lng: 31.0643735 },
		zoom: 6,
		disableDefaultUI: true,
	});
	//New marker
	const marker = new google.maps.Marker({
		position: null,
		map,
		icon: 'marker.png',
	});
	//Getting marker coordinates and showing guess button
	map.addListener('click', (mapsMouseEvent) => {
		answer = mapsMouseEvent.latLng.toJSON();
		marker.setPosition(mapsMouseEvent.latLng);
		document.getElementById('guess').style.display = 'block';
	});
}
//Calculate distance
function distance(lat1, lat2, lon1, lon2) {
	//Convert from degrees to radians
	lon1 = (lon1 * Math.PI) / 180;
	lon2 = (lon2 * Math.PI) / 180;
	lat1 = (lat1 * Math.PI) / 180;
	lat2 = (lat2 * Math.PI) / 180;
	//Haversine formula
	let dlon = lon2 - lon1;
	let dlat = lat2 - lat1;
	let a =
		Math.pow(Math.sin(dlat / 2), 2) +
		Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);
	let c = 2 * Math.asin(Math.sqrt(a));
	//Radius of earth in kilometers
	let r = 6371;
	//Calculate the result
	return c * r;
}
//Calculate and show finale score
const guess = document.getElementById('guess');
guess.addEventListener('click', () => {
	document.getElementById('result').style.display = 'block';
	document.getElementById('mapres').style.display = 'block';
	document.getElementById('playagain').style.display = 'block';

	const currentPosition = panorama.position.toJSON();
	const dis = distance(
		currentPosition.lat,
		answer.lat,
		currentPosition.lng,
		answer.lng
	);
	document.getElementById('text').textContent = `Your score: ${Math.round(
		1000 * Math.E ** (-dis / 2000)
	)}/1000. You were this close: ${dis.toFixed(0)} km`;

	const mapres = new google.maps.Map(document.getElementById('mapres'), {
		center: currentPosition,
		zoom: 3,
		disableDefaultUI: true,
	});

	const mark = new google.maps.Marker({
		position: currentPosition,
		mapres,
	});
	mark.setMap(mapres);
	const markans = new google.maps.Marker({
		position: answer,
		mapres,
		icon: 'marker.png',
	});
	markans.setMap(mapres);
});
//Button to play again
const playagain = document.getElementById('playagain');
playagain.addEventListener('click', () => {
	window.location.reload();
});
window.initialize = initialize;
