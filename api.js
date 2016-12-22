'use strict';

/**
 * Created by Drapegnik on 22.12.16.
 */

var request = require('request');
var url = require("url");

var API_VERSION = '5.60';
var VK_AUTH_URL = 'oauth.vk.com/authorize/';
var APP_ID = '5790001';
var REDIRECT_URL = 'http://local.host:3000';
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

exports.getFriends = function(req, res, next) {
    request({
        url: VK_API_URL + 'friends.get',
        qs: {
            access_token: req.body.token,
            v: API_VERSION
        },
        method: 'POST'
    }, function(error, response, body) {
        if (error)
            return next(error);
        res.json(JSON.parse(body).response);
    });
};