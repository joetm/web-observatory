/**
 * Created by xgfd on 01/12/14.
 */

var mongoose = require('mongoose'),
    Entry = mongoose.model('Entry'),
    queries = require('./dataset/queries'),
    lastTest = null,
    tester,
    logger = require('../../app/util/logger');

tester = function () {
    'use strict';
    Entry.find({type: 'visualisation'}, function (err, vises) {
        var tester = queries.tests.visualisation;
        if (err) {
            return logger.error(err);
        }

        vises.forEach(function (vis) {
            tester(vis, function (msg) {

                if (msg) {
                    logger.warn('visualisation connTest ' + vis.url + ' ' + msg.toString());
                }
                var alive = true;
                if (msg) {
                    alive = false;
                }
                vis.alive = alive;
                vis.save();
            });
        });
    });

    Entry.find({type: 'dataset'}, function (err, datasets) {
        if (err) {
            return logger.error(err);
        }
        datasets.forEach(function (ds) {
            var test = queries.tests[ds.querytype.toLowerCase()];
            if (!test) {
                return logger.error('No testers available for ' + ds.querytype);
            }
            test(ds, function (msg) {
                if (msg) {
                    logger.warn('dataset connTest ' + ds.url + ' ' + msg.toString());
                }
                var alive = true;
                if (msg) {
                    alive = false;
                }
                ds.alive = alive;
                ds.save();
            });

        });

        lastTest = Date.now();
    });
};

module.exports = function (req, res, next) {
    'use strict';
    var interval = Math.round((Date.now() - lastTest) / 1000) / 60 / 60;//interval in hours
    if (interval >= 12) {//check connection every 12 hours
        tester();
    }
    next();
};
