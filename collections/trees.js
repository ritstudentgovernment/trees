Trees = new Mongo.Collection('trees');

Trees.attachSchema( new SimpleSchema({
  lat: {
    label: "Latitude",
    type: String,
    optional: false
  },
  lng: {
    label: "Longitude",
    type: String,
    optional: false
  },
  diameter: {
    label: "Diameter",
    type: String,
    optional: true,
  },
  height: {
    label: "Estimated Height",
    type: String,
    optional: true,
  },
  species: {
    label: "Species",
    type: String,
    optional: false,
  },
  notes: {
    label: "Notes",
    type: String,
    optional: true,
  },
  picture:{
    type: String,
    optional: true
  },
  approved:{
    type: Boolean,
    optional: false,
    autoValue: function(){
      if(Roles.userIsInRole(Meteor.userId(), ['admin','reviewer'])){

        return true;

      }
      else{
        return false;
      }
    }
  },
  creatorId: {
    type: String,
    max: 50
  }
}));

Trees.allow({
  insert: function () { return Meteor.user(); },
  update: function (userId) { return Roles.userIsInRole(userId, ['admin','reviewer']); },
  remove: function (userId, doc) { return Roles.userIsInRole(userId, ['admin','reviewer']); },
});

TreesFS = new FS.Collection('treesFS', {
  stores: [new FS.Store.FileSystem('treesFS', {
    transformWrite: function(fileObj, readStream, writeStream) {
      // Depends on GraphicsMagick.
      gm(readStream, fileObj.name).resize(300, 300).autoOrient().stream().pipe(writeStream);
    }
  })]
});

TreesFS.allow({
  insert:   function (userId, file) { return true; },
  update:   function (userId, file) { return true; },
  download: function () {return true; }
});

if (Meteor.isServer) {
  Meteor.methods({
    insertCSVData: function(parses) {
      //Precheck data for entries without required data
      //DOn't insert in one is found
      for(var i = 0; i < parses.length; i++){
        var tree = parses[i];
        if(!(tree.Species && tree.Latitude && tree.Longitude)){
          //Return true for the error and with error message
          throw new Meteor.Error( 500, 'Trees not added. All Entries must have a Species, Latitude, Longitude attribute.' );
          return;
        }
      }

      for(var i = 0; i < parses.length; i++){
        var tree = parses[i];
        var payload = {
          lat: tree.Latitude,
          lng: tree.Longitude,
          diameter: tree.Diameter,
          height: tree.Height,
          species: tree.Species,
          notes: tree.Notes
        }
        Trees.insert(payload);
      }
    }
  });
}
