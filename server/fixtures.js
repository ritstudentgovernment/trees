Meteor.startup(function() {
  // Initialize admin user
  if (Meteor.users.find().count() === 0) {
    var adminUser = Meteor.users.insert({
      username: "sgsvcs",
      identity: {
        name: "James Reilly",
        firstName: "James",
        lastName: "Reilly",
      }
    });
    Roles.addUsersToRoles(adminUser, ['admin']);
  }
});
