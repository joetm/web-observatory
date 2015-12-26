AutoForm.hooks({
    postEditForm: {
        beginSubmit: function (doc) {
            //console.log('update');
            //console.log(this.updateDoc);
        },
        after: {
            update: function () {
                Router.go(this.collection.singularName + '.page', {_id: this.docId});
            }
        },
    }
});
//Template.entryEdit.onCreated(function() {
//  Session.set('postEditErrors', {});
//});

//Template.entryEdit.helpers({
//  errorMessage: function(field) {
//    return Session.get('postEditErrors')[field];
//  },
//  errorClass: function (field) {
//    return !!Session.get('postEditErrors')[field] ? 'has-error' : '';
//  }
//});

//Template.entryEdit.events({
//  'submit form': function(e) {
//    e.preventDefault();
//
//    var currentPostId = this._id;
//
//    var postProperties = {
//      url: $(e.target).find('[name=url]').val(),
//      title: $(e.target).find('[name=title]').val()
//    }
//
//    var errors = validatePost(postProperties);
//    if (errors.title || errors.url)
//      return Session.set('postEditErrors', errors);
//
//    Datasets.update(currentPostId, {$set: postProperties}, function(error) {
//      if (error) {
//        // display the error to the user
//        throwError(error.reason);
//      } else {
//        Router.go('datasetPage', {_id: currentPostId});
//      }
//    });
//  },
//
//  'click .delete': function(e) {
//    e.preventDefault();
//
//    if (confirm("Delete this post?")) {
//      var currentPostId = this._id;
//      Datasets.remove(currentPostId);
//      Router.go('home');
//    }
//  }
//});
