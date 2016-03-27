Meteor.users.attachSchema(new SimpleSchema({
  "identity.name": {
    type: String,
    optional: true
  },
  "identity.firstName": {
    type: String,
    optional: true
  },
  "identity.lastName": {
    type: String,
    optional: true
  },
  // from meteor packages
  username: {
    type: String
  },
  createdAt: {
    type: Date,
    optional: true
  },
  roles: {
    type: [String],
    optional: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  }}
));

Meteor.methods({
  editUserRole: function(username, role, actionType) {

    var loggedInUser = Meteor.user();
    var action;

    if (!loggedInUser || !Roles.userIsInRole(loggedInUser, ['admin']))
      throw new Meteor.Error(403, "Access Denied.");

    if (actionType == 'add')
      action = {$addToSet: {roles: role}};
    else
      action = {$pull: {roles: role}};

    Meteor.users.update({username: username}, action);

  },
});
