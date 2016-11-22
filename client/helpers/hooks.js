
var hooksObject = {
  // Called when any submit operation succeeds
  onSuccess: function(formType, result) {

    if(formType == "insert"){

      //Remove Preview Marker
      if(previewMarker.length != 0){

        previewMarker[0].setMap(null);
        google.maps.event.clearInstanceListeners(previewMarker[0]);
        delete previewMarker[0];

      }

      if(Roles.userIsInRole(Meteor.userId(), ['reviewer','admin'])){

        //Throw success message
        throwError("Your Tree was successfully added.");
      }
      else{

        //Throw success message
        throwError("Your Tree was received and will be reviewed soon!");

        var email = Meteor.user().username + "@rit.edu";
        var tree = Trees.findOne(result);
        var treeLink = Meteor.absoluteUrl() + 'tree/' + result;

        var emailData = {
          name: Meteor.user().username,
          species: tree.species,
          lat: tree.lat,
          lng: tree.lng,
          height: tree.height,
          diameter: tree.diameter,
          notes: tree.notes,
          treeLink: treeLink,
          staticKey: Meteor.settings.public.STATICKEY,
          creatorId: tree.creatorId,
          logoLink: Meteor.absoluteUrl() + 'sglogo.png',
          unsubLink: Meteor.absoluteUrl() + 'unsubscribe/' + Meteor.user()._id,
        }

        Meteor.call('emailUser', email, emailData, "treeAdded");
      }

      //Set the adding tree session to false
      Session.set('addingTree', false);

      //Set the selected tree to the added tree
      
      var tree = Trees.findOne(result);
      Session.set('selectedTree', tree);

    }
    else if(formType == "update"){

      //Throw success message
      throwError("Your Tree was successfully updated.");

      //Set the editing tree session to false
      Session.set('editingTree',false);

      //Set the selected tree to the edited tree
      var tree = Trees.findOne(this.docId);
      Session.set('selectedTree', tree);

    }

    //if on mobile edit page go back to map
    if(routeUtils.testRoutes('editTree') || routeUtils.testRoutes('addTree') ){

        Router.go('/');

    }
  },

  // Called when any submit operation fails
  onError: function(formType, error) {
    throwError("Error: " + error);
  }
};

AutoForm.hooks({
  treeForm: hooksObject
});

var routeUtils = {
  context: function() {
    return Router.current();
  },
  regex: function(expression) {
    return new RegExp(expression, 'i');
  },
  testRoutes: function(routeNames) {
    var reg = this.regex(routeNames);
    return this.context() && reg.test(this.context().route.getName());
  }
};
