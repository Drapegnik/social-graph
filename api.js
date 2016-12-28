'use strict';

/**
 * Created by Drapegnik on 22.12.16.
 */

var request = require('request');
var url = require('url');
var fs = require('fs');

var API_VERSION = '5.60';
var VK_AUTH_URL = 'oauth.vk.com/authorize/';
var APP_ID = '5790001';
var REDIRECT_URL = 'http://local.host:3000/home';
var VK_API_URL = 'https://api.vk.com/method/';


exports.auth = function(req, res, next) {
    res.redirect(url.format({
        host: VK_AUTH_URL,
        protocol: 'https:',
        query: {
            client_id: APP_ID,
            redirect_uri: REDIRECT_URL,
            scope: 'friends',
            display: 'page',
            response_type: 'token',
            v: API_VERSION
        }
    }));
};

exports.getUser = function(req, res, next) {
    request({
        user_ids: req.body.userId,
        url: VK_API_URL + 'users.get',
        qs: {
            access_token: req.body.token,
            v: API_VERSION,
            fields: 'photo_50, sex, bdate'
        },
        method: 'GET'
    }, function(error, response, body) {
        if (error)
            return next(error);

        res.json(JSON.parse(body).response);
    });
};

exports.getFriends = function(req, res, next) {
    request({
        user_id: req.body.userId,
        url: VK_API_URL + 'friends.get',
        qs: {
            access_token: req.body.token,
            v: API_VERSION,
            fields: 'photo_50, sex, bdate'
        },
        method: 'POST'
    }, function(error, response, body) {
        if (error)
            return next(error);

        res.json(JSON.parse(body).response);
    });
};

exports.getMutual = function(req, res, next) {
    request({
        url: VK_API_URL + 'friends.getMutual',
        qs: {
            access_token: req.body.token,
            v: API_VERSION,
            target_uids: req.body.friendsIds
        },
        method: 'POST'
    }, function(error, response, body) {
        if (error)
            return next(error);

        body = JSON.parse(body);

        if (body.error) {
            // return next({
            //     status: 500,
            //     message: body.error.error_msg
            // });
            console.error(body.error);
            res.json({});
        }

        res.json(body.response);
    });
};

exports.login = function(req, res, next) {
    res.render('index.ejs', {
        view: "'app/login.html'"
    });
};

exports.home = function(req, res, next) {
    res.render('index.ejs', {
        view: "'app/home.html'"
    });
};