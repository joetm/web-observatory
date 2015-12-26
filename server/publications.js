/*SearchSource publication*/
publish({dataset: Datasets, app: Apps}, SearchSource.defineSource, function (collection) {
    return function (searchText, options) {
        if (!options) {
            options = {
                options: {sort: {vote: -1}, limit: 12},
                selector: {},
                userId: null
            };
        }

        var selector = options.selector;

        if (searchText) {
            var regExp = buildRegExp(searchText);
            extendOr(selector, {$or: [{name: regExp}, {description: regExp}]});
        }

        var userId = options.userId || this.userId;
        extendOr(selector, visibleDocumentPublish(userId));

        return collection.find(selector, options.options).fetch();
    };
});

//any position
function buildRegExp(searchText) {
    var parts = searchText.trim().split(/[ \-\:]+/);
    return new RegExp("(" + parts.join('|') + ")", "ig");
}

//type ahead
//function buildRegExp(searchText) {
//    var words = searchText.trim().split(/[ \-\:]+/);
//    var exps = _.map(words, function (word) {
//        return "(?=.*" + word + ")";
//    });
//    var fullExp = exps.join('') + ".+";
//    return new RegExp(fullExp, "i");
//}

/*collection publication*/
publish({datasets: Datasets, apps: Apps, userNames: Meteor.users}, Meteor.publish, function (collection) {
    return function (options, selector = {}) {
        check(options, {
            fields: Match.Optional(Object),
            skip: Match.Optional(Object),
            sort: Match.Optional(Object),
            limit: Match.Optional(Number)
        });

        check(selector, Object);

        if (collection !== Meteor.users) {
            var userId = options.userId || this.userId;
            extendOr(selector, visibleDocumentPublish(userId));
        }

        return collection.find(selector, options);
    };
});

publish({singleDataset: Datasets, singleApp: Apps}, Meteor.publish, function (collection) {
    return function (id) {
        check(id, String);

        var selector = {_id: id},
            userId = this.userId;

        extendOr(selector, visibleDocumentPublish(userId));

        return collection.find(selector);
    }
});

Meteor.publish('comments', function (entryId) {
    check(entryId, String);
    return Comments.find({entryId: entryId});
});

Meteor.publish('notifications', function () {
    return Notifications.find({publisher: this.publisher, read: false});
});

Meteor.publish('images', function () {
    return Images.find();
});