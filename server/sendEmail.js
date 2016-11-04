////////////////////////////////////////////////////////////////////////////////
///                   sendEmail.js
///
///Author:       Omar De La Hoz
///Description:  Send email to users and moderators.
///Date Created: 10/11/16 
///updated:      10/28/16
////////////////////////////////////////////////////////////////////////////////

Meteor.methods({
emailUser: function(email, emailData, actionType){

  //Compile the HTML tmeplates.
  SSR.compileTemplate('newTree', Assets.getText('newTree.html'));
  SSR.compileTemplate('approveTree', Assets.getText('approveTree.html'));
  SSR.compileTemplate('denyTree', Assets.getText('denyTree.html'));
  SSR.compileTemplate('reviewTree', Assets.getText('reviewTree.html'));

  //Get the Tree creator.
  var creator = Meteor.users.findOne({"_id": emailData.creatorId});

  //Generate email creator unsub link.
  email = creator.username + "@rit.edu";
  emailData.name = creator.username;
  emailData.likesEmail = creator.likesEmail;
  emailData.unsubLink = Meteor.absoluteUrl() + 'unsubscribe/' + creator._id;

  // Send email depending on action type.
  if(actionType == "treeAdded"){

    if(emailData.likesEmail){

      Email.send({
        to: email,
        from: "sgnoreply@rit.edu",
        subject: "New Tree Created",
        html: SSR.render('newTree', emailData),
      });

    }

    var reviewers = Meteor.users.find({roles: {$in: ['admin','reviewer']}, likesEmail: true}, {fields: {'username':1}}).fetch()
    for(var i = 0; i < reviewers.length; i++){

      //Construct link for reviewer unsubscribe.
      var link = emailData.unsubLink;
      link = link.substring(0, link.lastIndexOf('/') + 1);
      link += reviewers[i]._id;

      emailData.unsubLink = link;

      Email.send({
        to: reviewers[i].username += "@rit.edu",
        from: "sgnoreply@rit.edu",
        subject: "New Tree Created",
        html: SSR.render('reviewTree', emailData),
      });
    }
  }
  else if(actionType == "treeApproved" && emailData.likesEmail){

    Email.send({
      to: email,
      from: "sgnoreply@rit.edu",
      subject: "Tree approved.",
      html: SSR.render('approveTree', emailData),
    });
  }
  else if(actionType == "treeDenied" && emailData.likesEmail){

    Email.send({
      to: email,
      from: "sgnoreply@rit.edu",
      subject: "Tree denied.",
      html: SSR.render('denyTree', emailData),
    });
  }
},
unsubscribe: function(id){
  Meteor.users.update({_id: String(id)}, {$set : {likesEmail: false}});
}
});