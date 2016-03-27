Handlebars.registerHelper('absolutePathFor', function (routeName, id) {
  return Meteor.absoluteUrl([routeName, id].join("/"));
});
