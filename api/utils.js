'use strict';

/**
 * Created by Drapegnik on 06.01.17.
 */

var request = require('request');

var VK_API_URL = 'https://api.vk.com/method/';
var API_VERSION = '5.60';
var VK_AUTH_URL = 'oauth.vk.com/authorize/';
var APP_ID = '5790001';
var REDIRECT_URL = 'http://local.host:3000/home';

exports._get = function(userId, token, url, method) {
    return new Promise(function(resolve, reject) {
        request({
            user_ids: userId,  // jshint ignore:line
            url: VK_API_URL + url,
            qs: {
                access_token: token,   // jshint ignore:line
                v: API_VERSION,
                fields: 'photo_50, sex, bdate'
            },
            method: method
        }, function(error, response, body) {
            if (error) {
                reject(error);
            }

            resolve(JSON.parse(body).response);
        });
    });
};

exports._getMutual = function(token, friendsIds) {
    return new Promise(function(resolve, reject) {
        request({
            url: VK_API_URL + 'friends.getMutual',
            qs: {
                access_token: token,   // jshint ignore:line
                v: API_VERSION,
                target_uids: friendsIds    // jshint ignore:line
            },
            method: 'POST'
        }, function(error, response, body) {
            if (error) {
                reject(error);
            }

            resolve(JSON.parse(body));
        });
    });
};

exports.VK_API_URL = VK_API_URL;
exports.API_VERSION = API_VERSION;
exports.VK_AUTH_URL = VK_AUTH_URL;
exports.APP_ID = APP_ID;
exports.REDIRECT_URL = REDIRECT_URL;