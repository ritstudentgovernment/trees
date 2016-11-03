previewMarker = [];
markers = {};

Template.mapMain.events({
  'click #closeSide':function(){

    //Close navbars
    $('#closePanel').removeClass('toggled');
    $('#sidebar-wrapper').removeClass('toggled');
    $('#bottombar-wrapper').removeClass('toggle-bottom');
    $('#map').removeClass('map-toggle');

    //Remove session variables
    Session.set('addingTree', undefined);
    Session.set('selectedTree', undefined);

    if(Session.get("editingTree")){
      var id = Session.get("editingTree")._id;
      var tree = Trees.findOne(id);

      markers[id].setPosition({lat: parseFloat(tree.lat), lng: parseFloat(tree.lng)});
      Session.set('editingTree', undefined);
    }

    if(previewMarker.length){

      previewMarker[0].setMap(null);
      previewMarker = [];
    }

  },
  'click #closeImg':function(){
    $('#map').show();
    Session.set('previewImg', false);
  }
});


Template.mapMain.helpers({
    selectedTree: function(){
      return Session.get('selectedTree');
    },
    addingTree: function(){
      return Session.get('addingTree');
    },
    editingTree: function(){
      return Session.get('editingTree');
    },
    previewImg: function(){
      return Session.get('previewImg');
    }
});

Meteor.startup(function() {
  GoogleMaps.load({key: Meteor.settings.public.MAPSKEY});
});


/**
 * Creates a marker and adds it to the map.
 * @param  Object document a Tree object.
 */
function createMarker(document){

  if(document.approved || document.creatorId === Meteor.userId() || Roles.userIsInRole(Meteor.user(), ['admin','reviewer'])){

      var marker = new google.maps.Marker({
        animation: google.maps.Animation.DROP,
        position: new google.maps.LatLng(document.lat, document.lng),
        map: GoogleMaps.maps.treeMap.instance,
        icon: Session.get("reviewImage"),
        //Store the document id
        id: document._id
      });

    if(document.approved){
        marker.setIcon(Session.get("Image"));
    }

    var infowindow = new google.maps.InfoWindow({
        content: document.contentString
    });

      google.maps.event.addListener(marker, 'click', function() {

        Session.set('addingTree', undefined);
        Session.set('editingTree', undefined);

          //Set the session variable with the selected tree
          Session.set('selectedTree', document);

          //Focus selected tree.
          GoogleMaps.maps.treeMap.instance.panTo(new google.maps.LatLng(document.lat, document.lng));

        //Get the number of tree spots of this type on campus
        $('#sidebar-wrapper').addClass('toggled');
        $('#closePanel').addClass('toggled');
        $('#bottombar-wrapper').addClass('toggle-bottom');
        $('#map').addClass('map-toggle');

      });

    // Store this marker instance within the markers object.
    markers[document._id] = marker;
  }
}


/**
 * Deletes all markers from map.
 */
function deleteMarkers(){

  for(var id in markers){

    markers[id].setMap(null);
    google.maps.event.clearInstanceListeners(markers[id]);
    delete markers[id];
  }

}


Template.mapMain.onCreated(function() {

  GoogleMaps.ready('treeMap', function(map) {

    var allowedBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(43.076, -77.691),
      new google.maps.LatLng(43.094, -77.651)
    );

    //Check for dragging map outside campus
    google.maps.event.addListener(map.instance, 'dragend', function() {

      if (allowedBounds.contains(map.instance.getCenter())) return;

     // Out of bounds - Move the map back within the bounds
      var c = map.instance.getCenter(),
        x = c.lng(),
        y = c.lat(),
        maxX = allowedBounds.getNorthEast().lng(),
        maxY = allowedBounds.getNorthEast().lat(),
        minX = allowedBounds.getSouthWest().lng(),
        minY = allowedBounds.getSouthWest().lat();

      if (x < minX) x = minX;
      if (x > maxX) x = maxX;
      if (y < minY) y = minY;
      if (y > maxY) y = maxY;
      map.instance.setCenter(new google.maps.LatLng(y, x));
  });


   // Limit the zoom level
  google.maps.event.addListener(map.instance, 'zoom_changed', function() {
    if (map.instance.getZoom() < 15) map.instance.setZoom(15);
  });


  google.maps.event.addListener(map.instance, 'click', function(event) {

    if(Session.get('addingTree')){

      $('input[name=lat]').val(event.latLng.lat());
      $('input[name=lng]').val(event.latLng.lng());

      if(previewMarker[0]){

        previewMarker[0].setPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });

      }else{

        var marker = new google.maps.Marker({
          draggable: true,
          animation: google.maps.Animation.DROP,
          position: event.latLng,
          map: map.instance
        });

        google.maps.event.addListener(marker, 'dragend', function(event){
          $('input[name=lat]').val(event.latLng.lat());
          $('input[name=lng]').val(event.latLng.lng());
        });

        previewMarker[0] = marker;
      }
    }
    else if(Session.get('editingTree')){

      $('input[name=lat]').val(event.latLng.lat());
      $('input[name=lng]').val(event.latLng.lng());

      markers[Session.get('editingTree')._id].setPosition({ lat: event.latLng.lat(), lng: event.latLng.lng() });

    }
  });

  var image = {
    url: '/treemarker.png',
    size: new google.maps.Size(2000, 3000),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 35)
  };

  Session.set("Image", image);

  var previewimage = {
    url: '/previewmarker.png',
    size: new google.maps.Size(2000, 3000),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 35)
  };

  Session.set("previewImage", previewimage);

  var reviewimage = {
    url: '/reviewmarker.png',
    size: new google.maps.Size(2000, 3000),
    origin: new google.maps.Point(0, 0),
    anchor: new google.maps.Point(17, 34),
    scaledSize: new google.maps.Size(25, 35)
  };

  Session.set("reviewImage", reviewimage);
 
  Trees.find().observe({
    added: function(doc) {

      createMarker(doc);

    },
    changed: function(newDocument, oldDocument) {

      if(newDocument.approved){
        markers[newDocument._id].setIcon(image);
      }
      else{
        markers[newDocument._id].setIcon(reviewimage);
      }

      google.maps.event.addListener(markers[newDocument._id], 'click', function() {
        Session.set('addingTree', undefined);
        Session.set('editingTree', undefined);
        //Set the session variable with the selected tree
        Session.set('selectedTree', newDocument);
        //Get the number of tree spots of this type on campus
        $('#sidebar-wrapper').addClass('toggled');
        $('#closePanel').addClass('toggled');
        $('#bottombar-wrapper').addClass('toggle-bottom');
        $('#map').addClass('map-toggle');
      });

      Session.set('selectedTree', newDocument);

      markers[newDocument._id].setPosition({ lat: newDocument.lat, lng: newDocument.lng });
    },
    removed: function(oldDocument) {
      // Remove the marker from the map
      markers[oldDocument._id].setMap(null);

      // Clear the event listener
      google.maps.event.clearInstanceListeners(markers[oldDocument._id]);

      // Remove the reference to this marker instance
      delete markers[oldDocument._id];
    }
  });
  });
});

//Trigger user change.
var oldUser = undefined;

Tracker.autorun(function(){

  var newUser = Meteor.user();

  //Check if user logged in or out.
  if(oldUser === null && newUser || newUser === null && oldUser){

    deleteMarkers();

    var trees = Trees.find().fetch();

    for(var i = 0; i < trees.length; i++){

      var tree = trees[i];

      createMarker(tree);      
    }
  }

  oldUser = Meteor.user();

});
