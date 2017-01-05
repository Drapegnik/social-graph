'use strict';

/**
 * Created by Drapegnik on 22.12.16.
 */

var request = require('request');
var url = require('url');

var API_VERSION = '5.60';
var VK_AUTH_URL = 'oauth.vk.com/authorize/';
var APP_ID = '5790001';
var REDIRECT_URL = 'http://local.host:3000/home';
var VK_API_URL = 'https://api.vk.com/method/';

var _get = function(userId, token, url, method, callback) {
    request({
        user_ids: userId,  // jshint ignore:line
        url: VK_API_URL + url,
        qs: {
            access_token: token,   // jshint ignore:line
            v: API_VERSION,
            fields: 'photo_50, sex, bdate'
        },
        method: method
    }, callback);
};

var _getMutual = function(token, friendsIds, callback) {
    request({
        url: VK_API_URL + 'friends.getMutual',
        qs: {
            access_token: token,   // jshint ignore:line
            v: API_VERSION,
            target_uids: friendsIds    // jshint ignore:line
        },
        method: 'POST'
    }, callback);
};

var _send = function(res, next, error, body) {
    if (error) {
        return next(error);
    }

    res.json(JSON.parse(body).response);
};

exports.auth = function(req, res) {
    res.redirect(url.format({
        host: VK_AUTH_URL,
        protocol: 'https:',
        query: {
            client_id: APP_ID,  // jshint ignore:line
            redirect_uri: REDIRECT_URL, // jshint ignore:line
            scope: 'friends',
            display: 'page',
            response_type: 'token', // jshint ignore:line
            v: API_VERSION
        }
    }));
};

exports.getUser = function(req, res, next) {
    _get(req.body.userId, req.body.token, 'users.get', 'GET', function(e, r, b) {_send(res, next, e, b);});
};

exports.getFriends = function(req, res, next) {
    _get(req.body.userId, req.body.token, 'friends.get', 'POST', function(e, r, b) {_send(res, next, e, b);});
};

exports.getMutual = function(req, res, next) {
    _getMutual(req.body.token, req.body.friendsIds, function(error, response, body) {
        if (error) {
            return next(error);
        }

        body = JSON.parse(body);

        if (body.error) {
            return next({
                status: 500,
                message: body.error.error_msg   // jshint ignore:line
            });
        }

        res.json(body.response);
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