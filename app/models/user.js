var mongoose = require('mongoose');
var hash = require('../util/hash');
var DatasetSchema = require('mongoose').model('Dataset').schema;
var Dataset = require('./dataset');

UserSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    salt: String,
    hash: String,
    facebook: {
        id: String,
        email: String,
        name: String
    },
    soton: {
        id: String,
        email: String,
        name: String
    },
    twitter: {
        id: String,
        email: String,
        name: String
    },
    visible: [ //list of datasets that are visible to this user
        DatasetSchema
    ],
    readable: [ //list of datasets that the current user can query
        DatasetSchema
    ],
    owned: [ //list of datasets that are published by the current user
        DatasetSchema
    ],
    ownedVis: [DatasetSchema],
    requested: [DatasetSchema],
    msg: {
        requests: [{
                sender: String,
                dataset: [DatasetSchema],
                read: Boolean
            }
        ],
        general: [{
                sender: String,
                content: String,
                read: Boolean
            }
        ]
    }
});

//user control
UserSchema.statics.signup = function(email, password, done) {
    var User = this;
    hash(password, function(err, salt, hash) {
        if (err) throw err;
        // if (err) return done(err);
        User.create({
            email: email,
            salt: salt,
            hash: hash
        }, function(err, user) {
            if (err) throw err;
            // if (err) return done(err);
            done(null, user);
        });
    });
};


UserSchema.statics.isValidUserPassword = function(email, password, done) {
    this.findOne({
        email: email
    }, function(err, user) {
        // if(err) throw err;
        if (err) return done(err);
        if (!user) return done(null, false, {
                message: 'Incorrect email.'
            });
        hash(password, user.salt, function(err, hash) {
            if (err) return done(err);
            if (hash == user.hash) return done(null, user);
            done(null, false, {
                message: 'Incorrect password'
            });
        });
    });
};



UserSchema.statics.findOrCreateFaceBookUser = function(profile, done) {
    var User = this;
    User.findOne({
        'facebook.id': profile.id
    }, function(err, user) {
        if (err) throw err;
        // if (err) return done(err);
        if (user) {
            done(null, user);
        } else {
            User.create({
                email: profile.emails[0].value,
                facebook: {
                    id: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName
                }
            }, function(err, user) {
                if (err) throw err;
                // if (err) return done(err);
                done(null, user);
            });
        }
    });
};



UserSchema.statics.findOrCreateSotonUser = function(profile, done) {
    var User = this;
    User.findOne({
        'soton.id': profile.cn
    }, function(err, user) {
        //if (err) throw err;
        if (err) return done(err);
        if (user) {
            done(null, user);
        } else {
            User.create({
                email: profile.mail,
                soton: {
                    id: profile.cn,
                    email: profile.mail,
                    name: profile.displayName
                }
            }, function(err, user) {
                //if (err) throw err;
                if (err) return done(err);
                done(null, user);
            });
        }
    });
};

//dataset access control
UserSchema.statics.grantAccess = function(user, dataset, done) {
    var User = this;
    var query = {
        email: user,
        readable: {
            $ne: dataset
        }
    }; //grant access only if the user cannot access to the given dataset

    var update = {
        $push: {
            readable: dataset
        }
    };

    User.update(query, update, function(err, user) {
        done(err, user);
    });
};

UserSchema.statics.addOwn = function(creator, dataset, done) {

    var query = {
        email: creator,
        owned: {
            $ne: dataset
        }
    };

    var update = {
        $push: {
            owned: dataset
        }
    };

    this.update(query, update, function(err, user) {
        done(err);
    });

};

UserSchema.statics.addOwnVis = function(creator, vis, done) {

    var query = {
        email: creator,
        ownedVis: {
            $ne: vis
        }
    };

    var update = {
        $push: {
            ownedVis: vis
        }
    };

    this.update(query, update, function(err, user) {
        done(err);
    });

};



UserSchema.statics.hasAccessTo = function(email, dataset_url, done) {

    var User = this;
    var query = {
        email: email,
        readable: {
            url: dataset_url
        }
    };

    this.findOne(query, function(err, user) {

        if (err) return done(err);

        if (!user) return done(null, false, {
                message: 'Access is not allowed'
            });

        done(null, user);
    });

};

UserSchema.statics.listDatasets = function(email, cb) {

    var query = {
        email: email
    };

    this.findOne(query, function(err, user) {
        if (err)
            return cb(err);
        cb(err, user.visible, user.readable, user.owned);
    });
};
UserSchema.statics.listVisualisations = function(email, cb) {

    var query = {
        email: email
    };

    this.findOne(query, function(err, user) {
        if (err)
            return cb(err);
        cb(err, user.ownedVis);
    });
};

//message handling
UserSchema.statics.addReq = function(sender, dataset, done) {
    var query = {
        email: dataset.publisher
    };
    var update = {
        $push: {
            'msg.requests': {
                'sender': sender,
                'dataset': [dataset],
                read: false
            }
        }
    };

    this.update(query, update, function(err, user) {
        done(err, dataset);
    });
};

var User = mongoose.model("User", UserSchema);
module.exports = User;
