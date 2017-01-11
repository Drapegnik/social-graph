'use strict';

/**
 * Created by Drapegnik on 06.01.17.
 */

var neo4j = require('neo4j-driver').v1;
var _ = require('lodash');

var utils = require('./utils');

var driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', '1'));
var session = driver.session();

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

exports._createDB = function(req, res, next) {
    var friendsIds = [];

    session.run('MATCH (n) DETACH DELETE n')
        .then(function(result) {
            console.log('-- clean up db:', _getOutputObject(result, ['nodesDeleted', 'relationshipsDeleted']));
            return utils._get(req.body.userId, req.body.token, 'users.get', 'GET');
        })
        .then(function(response) {
            return session.run(
                'CREATE (:Person {id: {id}, name: {name}, sex: {sex}, bdate: {bdate}, photo: {photo_50}})', _parseUserData(response[0])
            );
        })
        .then(function(result) {
            console.log('-- add you:', _getOutputObject(result, ['nodesCreated', 'propertiesSet']));
            return utils._get(req.body.userId, req.body.token, 'friends.get', 'POST');
        })
        .then(function(response) {
            var friends = _.map(response.items, _parseUserData);
            friendsIds = _.map(response.items, function(friend) {
                if (!friend.deactivated) {
                    return friend.id;
                }
            });
            return session.run(
                'MATCH (you:Person {id:{yourId}}) ' +
                'FOREACH (f in {friendsList} | ' +
                'CREATE UNIQUE (you)-[:FRIEND]-(:Person {id: f.id, name: f.name, sex: f.sex, bdate: f.bdate, photo: f.photo_50}))',
                {yourId: req.body.userId, friendsList: friends}
            );
        })
        .then(function(result) {
            console.log('-- add your friends:', _getOutputObject(result, ['nodesCreated', 'relationshipsCreated']));
            return utils._getMutual(req.body.token, friendsIds);
        })
        .then(function(response) {
            return session.run(
                'FOREACH (fData in {friendsData} | ' +
                '   FOREACH (commFriendId in fData.common_friends | ' +
                '       MERGE (a:Person {id:fData.id}) ' +
                '       MERGE (b:Person {id:commFriendId}) ' +
                '       CREATE UNIQUE (a)-[:FRIEND]-(b)' +
                '   )' +
                ')', {friendsData: response}
            );
        })
        .then(function(result) {
            console.log('-- add friends relationships:', _getOutputObject(result, ['relationshipsCreated']));
        })
        .catch(function(error) {
            console.log(error);
            next(error);
        });

    res.sendStatus(200);
};

exports._getRecommendation = function(req, res, next) {
    session.run(
        'MATCH (user:Person {id: {userId}})-[:FRIEND]-(userFriends)-[:FRIEND]-(userFriendsFriends)' +
        'WHERE NOT (user)-[:FRIEND]-(userFriendsFriends)' +
        'RETURN userFriendsFriends.id, userFriendsFriends.name, count(*) AS CommonFriends ORDER BY CommonFriends DESC LIMIT 5',
        {userId: neo4j.int(req.params.userId)}
    ).then(function(results) {
        var response = results.records.map(function(record) {
            return {
                id: record._fields[0],
                name: record._fields[1],
                common: record._fields[2].low
            };
        });
        if (!response[0] || response[0].common < 2) {
            response = [];
        }
        res.send(response);
    }).catch(function(error) {
        console.log(error);
        next(error);
    });
};