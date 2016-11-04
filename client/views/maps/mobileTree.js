Template.mobileTree.helpers({
  'treeCount':function(s){
    return Trees.find({species:s}).count();
  },
  'ownPending':function(approved){
    return !approved && Meteor.user()._id;
  }
})

Template.mobileTree.events({
  'click #previewImg':function(e){
    var id = e.target.getAttribute('treeid');
    var tree = Trees.findOne(id);
    var img = TreesFS.findOne(tree.picture);
    $('#map').hide();
    Session.set('previewImg', img.url());
  },
  'click #deny':function(e){
    var id = e.target.getAttribute('treeid');
    var tree = Trees.findOne(id);
    var treeLink = Meteor.absoluteUrl() + 'tree/' + id;

    //Create the email data.
    var emailData = {
      species: tree.species,
      lat: tree.lat,
      lng: tree.lng,
      height: tree.height,
      diameter: tree.diameter,
      notes: tree.notes,
      treeLink: treeLink,
      staticKey: Meteor.settings.public.STATICKEY,
      creatorId: tree.creatorId,
      logoLink: Meteor.absoluteUrl() + 'sglogo.png'
    };

    Meteor.call('emailUser', null, emailData, "treeDenied");

    Trees.remove(id);

    Session.set("selectedTree", false);
    $('#closePanel').removeClass('toggled');
    $('#sidebar-wrapper').removeClass('toggled');
    $('#bottombar-wrapper').removeClass('toggle-bottom');
    $('#map').removeClass('map-toggle');
    
    throwError("Tree was succesfully denied.");
  },
  'click #approve':function(e){
    var id = e.target.getAttribute('treeid');
    Trees.update({ _id: id}, {$set: {approved: true}});
    var tree = Trees.findOne(id);
    var treeLink = Meteor.absoluteUrl() + 'tree/' + id;

    //Create the email data.
    var emailData = {
      species: tree.species,
      lat: tree.lat,
      lng: tree.lng,
      height: tree.height,
      diameter: tree.diameter,
      notes: tree.notes,
      treeLink: treeLink,
      staticKey: Meteor.settings.public.STATICKEY,
      creatorId: tree.creatorId,
      logoLink: Meteor.absoluteUrl() + 'sglogo.png'
    };

    Meteor.call('emailUser', null, emailData, "treeApproved");

    Session.set("selectedTree", false);
    $('#closePanel').removeClass('toggled');
    $('#sidebar-wrapper').removeClass('toggled');
    $('#bottombar-wrapper').removeClass('toggle-bottom');
    $('#map').removeClass('map-toggle');

    throwError("Tree was succesfully approved.");
  },
  'click #remove': function(e){

    var id = e.target.getAttribute('treeid');
    Trees.remove(id);
    
    Session.set("selectedTree", false);
    $('#closePanel').removeClass('toggled');
    $('#sidebar-wrapper').removeClass('toggled');
    $('#bottombar-wrapper').removeClass('toggle-bottom');
    $('#map').removeClass('map-toggle');

    throwError("Tree was succesfully removed.");
  }
});