'use strict';

/**
 * Created by Drapegnik on 22.12.16.
 */

var request = require('request');
var url = require('url');
var neo4j = require('neo4j-driver').v1;
var _ = require('lodash');

var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '1'));
var session = driver.session();

var API_VERSION = '5.60';
var VK_AUTH_URL = 'oauth.vk.com/authorize/';
var APP_ID = '5790001';
var REDIRECT_URL = 'http://local.host:3000/home';
var VK_API_URL = 'https://api.vk.com/method/';

var _get = function(userId, token, url, method) {
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

var _getMutual = function(token, friendsIds) {
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

var _parseUserData = function(user) {
    user.name = user.first_name + ' ' + user.last_name;     // jshint ignore:line
    user.sex = user.sex === 1 ? 'female' : 'male';
    return user;
};

var _getOutputObject = function(result, properties) {
    return {
        successfully: _.pick(result.summary.updateStatistics._stats, properties)
    };
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
    _get(req.body.userId, req.body.token, 'users.get', 'GET')
        .then(function(response) {
            res.json(response[0]);
        })
        .catch(function(error) {
            return next(error);
        });
};

exports.getFriends = function(req, res, next) {
    _get(req.body.userId, req.body.token, 'friends.get', 'POST')
        .then(function(response) {
            res.json(response);
        })
        .catch(function(error) {
            return next(error);
        });
};

exports.getMutual = function(req, res, next) {
    _getMutual(req.body.token, req.body.friendsIds)
        .then(function(body) {

            if (body.error) {
                return next({
                    status: 500,
                    message: body.error.error_msg   // jshint ignore:line
                });
            }

            res.json(body.response);
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

exports.createDB = function(req, res, next) {
    session.run('MATCH (n) DETACH DELETE n')
        .then(function(result) {
            console.log('-- clean up db:', _getOutputObject(result, ['nodesDeleted', 'relationshipsDeleted']));
            return _get(req.body.userId, req.body.token, 'users.get', 'GET');
        })
        .then(function(response) {
            return session.run(
                'CREATE (:Person {id: {id}, name: {name}, sex: {sex}, bdate: {bdate}, photo: {photo_50}})', _parseUserData(response[0])
            );
        })
        .then(function(result) {
            console.log('-- add you:', _getOutputObject(result, ['nodesCreated', 'propertiesSet']));
            return _get(req.body.userId, req.body.token, 'friends.get', 'POST');
        })
        .then(function(response) {
            var friends = _.map(response.items, _parseUserData);
            return session.run(
                'MATCH (you:Person {id:{yourId}}) ' +
                'FOREACH (f in {friendsList} | ' +
                'CREATE (you)-[:FRIEND]->(:Person {id: f.id, name: f.name, sex: f.sex, bdate: f.bdate, photo: f.photo_50}))',
                {yourId: req.body.userId, friendsList: friends}
            );
        })
        .then(function(result) {
            console.log('-- add your friends:', _getOutputObject(result, ['nodesCreated', 'relationshipsCreated']));
        })
        .catch(function(error) {
            next(error);
        });

    res.sendStatus(200);
};