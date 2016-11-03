Template.focusTree.onRendered(function(){

	if(Session.get("selectedTree")){

		var lat = parseFloat(Session.get("selectedTree").lat);
		var lng = parseFloat(Session.get("selectedTree").lng);

		GoogleMaps.ready('treeMap', function(map) {

			map.instance.panTo({lat: lat, lng: lng});

		});

		$('#sidebar-wrapper').addClass('toggled');
	    $('#closePanel').addClass('toggled');
	    $('#bottombar-wrapper').addClass('toggle-bottom');
	    $('#map').addClass('map-toggle');

	}
	else{

		throwError("Tree not found.");

	}

});