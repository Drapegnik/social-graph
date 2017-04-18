'use strict';

/**
 * Created by Drapegnik on 06.01.17.
 */

var async = require('async');
var request = require('request');
var _ = require('lodash');

var VK_API_URL = 'https://api.vk.com/method/';
var API_VERSION = '5.60';
var VK_AUTH_URL = 'oauth.vk.com/authorize/';
var APP_ID = '5790001';
var REDIRECT_URL = 'http://local.host:3000/home';
var VK_MAX_REQUESTS_PER_SECOND = 7;
var FRIENDS_IN_REQUEST = 50;

exports._get = function (userId, token, url, method) {
    return new Promise(function (resolve, reject) {
        request({
            user_ids: userId,  // jshint ignore:line
            url: VK_API_URL + url,
            qs: {
                access_token: token,   // jshint ignore:line
                v: API_VERSION,
                fields: 'photo_50, sex, bdate'
            },
            method: method
        }, function (error, response, body) {
            if (error) {
                return reject(error);
            }

            return resolve(JSON.parse(body).response);
        });
    });
};

exports._getMutual = function (token, friendsIds) {

    var friendsChunks = _.chunk(friendsIds, FRIENDS_IN_REQUEST);
    var tasks = [];
    friendsChunks.forEach(function (chunk) {
        tasks.push(function (callback) {
            request({
                url: VK_API_URL + 'friends.getMutual',
                qs: {
                    access_token: token,   // jshint ignore:line
                    v: API_VERSION,
                    target_uids: chunk    // jshint ignore:line
                },
                method: 'POST'
            }, function (error, response, body) {
                if (error) {
                    return callback(error);
                }

                body = JSON.parse(body);

                if (body.error) {
                    return callback(new Error(body.error.error_msg));
                }

                return callback(null, body.response);
            });
        });
    });

    return new Promise(function (resolve, reject) {
        async.parallelLimit(tasks, VK_MAX_REQUESTS_PER_SECOND, function (error, results) {
            if (error) {
                return reject(error);
            }

            return resolve([].concat.apply([], results));
        });
    });
};

exports.VK_API_URL = VK_API_URL;
exports.API_VERSION = API_VERSION;
exports.VK_AUTH_URL = VK_AUTH_URL;
exports.APP_ID = APP_ID;
exports.REDIRECT_URL = REDIRECT_URL;
exports.VK_MAX_REQUESTS_PER_SECOND = VK_MAX_REQUESTS_PER_SECOND;
exports.FRIENDS_IN_REQUEST = FRIENDS_IN_REQUEST;