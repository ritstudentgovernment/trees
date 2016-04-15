Template.header.helpers({
  privilegedRoles: function () {
    return Roles.getRolesForUser(Meteor.user());
  }
});
