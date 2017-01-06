'use strict';

/**
 * Created by Drapegnik on 22.12.16.
 */

var url = require('url');

var utils = require('./utils');
var db = require('./db');

exports.auth = function(req, res) {
    res.redirect(url.format({
        host: utils.VK_AUTH_URL,
        protocol: 'https:',
        query: {
            client_id: utils.APP_ID,  // jshint ignore:line
            redirect_uri: utils.REDIRECT_URL, // jshint ignore:line
            scope: 'friends',
            display: 'page',
            response_type: 'token', // jshint ignore:line
            v: utils.API_VERSION
        }
    }));
};

exports.getUser = function(req, res, next) {
    utils._get(req.body.userId, req.body.token, 'users.get', 'GET')
        .then(function(response) {
            res.json(response[0]);
        })
        .catch(function(error) {
            return next(error);
        });
};

exports.getFriends = function(req, res, next) {
    utils._get(req.body.userId, req.body.token, 'friends.get', 'POST')
        .then(function(response) {
            res.json(response);
        })
        .catch(function(error) {
            return next(error);
        });
};

exports.getMutual = function(req, res, next) {
    utils._getMutual(req.body.token, req.body.friendsIds)
        .then(function(response) {
            res.json(response);
        })
        .catch(function(error) {
            return next(error);
        });
};

exports.login = function(req, res) {
    res.render('index.ejs', {
        view: '"app/views/login.view.html"'
    });
};

exports.home = function(req, res) {
    res.render('index.ejs', {
        view: '"app/views/home.view.html"'
    });
};

exports.createDB = db._createDB;