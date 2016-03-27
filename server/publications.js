Meteor.publish('markers', function (courseParentNum) {
  return Markers.find();
});

Meteor.publish('trees', function (courseParentNum) {
  return [Trees.find(), TreesFS.find()];
});

Meteor.publish('privilegedUsers', function () {
  if (Roles.userIsInRole(this.userId, ['admin'])) {
    return Meteor.users.find({roles: {$in: ['admin']}}, {
      fields: {
        username: 1,
        roles: 1,
        "profile.name": 1
      }
    });
  } else {
    this.stop();
    return;
  }
});

Meteor.publish('singleton', function () {
  return Singleton.find();
});

// Expose individual users' objects
Meteor.publish(null, function() {
  return Meteor.users.find(this.userId, {fields: {
    identity: 1
  }});
});
