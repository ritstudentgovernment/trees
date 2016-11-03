Template.sidenav.helpers({
  'treeCount':function(s){
    return Trees.find({species:s}).count();
  },
  'ownPending':function(approved){
    return !approved && Meteor.user()._id;
  }
})

Template.sidenav.events({
  'click #edit':function(e){
    var id = e.target.getAttribute('treeid');
    Session.set('selectedTree', false);
    Session.set('editingTree', Trees.findOne(id));
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

    $('#closePanel').removeClass('toggled');
    $('#sidebar-wrapper').removeClass('toggled');
    $('#bottombar-wrapper').removeClass('toggle-bottom');
    $('#map').removeClass('map-toggle');

    throwError("Tree was succesfully approved.");
  },
  'click #remove':function(e){
    var id = e.target.getAttribute('treeid');
    Trees.remove(id);
    $('#closePanel').removeClass('toggled');
    $('#sidebar-wrapper').removeClass('toggled');
    $('#bottombar-wrapper').removeClass('toggle-bottom');
    $('#map').removeClass('map-toggle');

    throwError("Tree was succesfully removed.");
  }
});
