Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function () {
    return Meteor.subscribe('singleton');
  },
  onRun: function () {
    GAnalytics.pageview(Router.current().url);
    this.next();
  },
  onAfterAction: function () {
    if (Errors.find().fetch().length > 0) {
      $('#errorModal').modal('show');
    }
  }
});

Router.map(function() {

  //  Triggered when logo button is clicked.
  this.route('index', {
    path: '/',
    template: 'mapMain',
    waitOn: function () {
      return Meteor.subscribe('trees');
    },
    onBeforeAction:function(){

      // Hide sidebar if any.
      Session.set('addingTree', undefined);
      $('#closePanel').removeClass('toggled');
      $('#sidebar-wrapper').removeClass('toggled');
      $('#bottombar-wrapper').removeClass('toggle-bottom');
      $('#map').removeClass('map-toggle');

      this.next();
    }
  });


  //  Triggered when 'Add Entry' is pressed.
  this.route('addingTree', {
    template: 'mapMain',

    waitOn: function () {
      return Meteor.subscribe('trees');
    },
    onRun:function(){

        // Set addingNap to true (non-reactive).
        Session.set("addingTree", true);
    },
    onAfterAction:function(){

      // Show side panel to add entry.
      setTimeout(function(){
        $('#sidebar-wrapper').addClass('toggled').one();
        $('#closePanel').addClass('toggled');
      }, 0);
    }
  });


  this.route('addTree', {
      path: '/addTree',
      template: 'addTreePage',
      waitOn: function(){
          return Meteor.subscribe('trees');
      }
  });

  this.route('editTree/:treeId', {
    path: '/editTree/:treeId',
    template: 'editTree',
    waitOn: function(){
      return Meteor.subscribe('trees');
    },
    data: function(){
      return Trees.findOne(this.params.treeId);
    }
  });

  //static routes
  this.route('about', {
    path: '/about',
    template: 'aboutTemplate',
    data: function () {
      return {
        subtemplate: 'about'
      };
    }
  });

  this.route('policies', {
    path: '/about/policies',
    template: 'aboutTemplate',
    data: function () {
      return {
        subtemplate: 'policies'
      };
    }
  });

  this.route('privacy', {
    path: '/about/privacy',
    template: 'aboutTemplate',
    data: function () {
      return {
        subtemplate: 'privacy'
      };
    }
  });

  this.route('technology', {
    path: '/about/technology',
    template: 'aboutTemplate',
    data: function () {
      return {
        subtemplate: 'technology'
      };
    }
  });

  this.route('admin',{
    path: '/admin',
    template: 'admin',
    waitOn: function() {
      return [Meteor.subscribe('revUsers')];
    },
    data: function() {
      return {admins: Meteor.users.find({roles: {$in: ['admin']}}).fetch(),
              revs: Meteor.users.find({roles: {$in: ['reviewer']}}).fetch()};
    }
  });

  this.route('uploadCSV',{
    path: '/uploadCSV',
    template: 'uploadCSV'
  })

  this.route('/tree/:treeId',{
    template: 'focusTree',
    path: '/tree/:treeId',
    waitOn: function(){

      return Meteor.subscribe('trees');

    },
    data: function(){
      Session.set('selectedTree', Naps.findOne(this.params.treeId));
    }
  });

  this.route('unsubscribe/:id',{
    template: 'unsubEmail',
    waitOn: function(){
      return Meteor.subscribe('unsubUser', this.params.id), Meteor.subscribe('trees');
    },
    onRun: function(){
      Meteor.call('unsubscribe', this.params.id);
    }
  });

});
