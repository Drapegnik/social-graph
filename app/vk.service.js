'use strict';

/**
 * Created by Drapegnik on 29.12.16.
 */

vkGraphApp.service('Vk', ['$http', '$q', function($http, $q) {
    var Vk = this;
    Vk.maxRequestsInSecond = 7;

    var graph = {
        directed: false,
        graph: [],
        nodes: [],
        links: [],
        multigraph: false
    };

    var parseUserInfo = function(user) {
        return {
            id: user.id,
            name: user.first_name + ' ' + user.last_name,   // jshint ignore:line
            sex: user.sex,
            photo: user.photo_50    // jshint ignore:line
        };
    };

    var addFriendToGraph = function(userIndex, friend) {
        graph.nodes.push(parseUserInfo(friend));

        graph.links.push({
            source: userIndex,
            target: friend.id
        });
    };

    Vk.getGraphData = function(token, userId, callback) {
        var me;

        $http.post('/api/getUser', {token: token, userId: userId})
            .then(function(response) {
                me = parseUserInfo(response.data[0]);
                graph.nodes.push(me);
                return $http.post('/api/getFriends', {token: token, userId: userId});
            })
            .then(function(response) {
                var friends = response.data.items;

                console.log('Successfully get ' + friends.length + ' friends for ' + me.name);

                friends.forEach(function(friend) {
                    addFriendToGraph(userId, friend);
                });

                var friendsChunks = _.chunk(friends.map(function(friend) {
                    if (!friend.deactivated) {
                        return friend.id;
                    }
                }), Math.round(friends.length / Vk.maxRequestsInSecond));

                var urlCalls = [];
                friendsChunks.forEach(function(chunk) {
                    urlCalls.push($http.post('/api/getMutual', {token: token, userId: userId, friendsIds: chunk}));
                });

                return $q.all(urlCalls);
            })
            .then(function(responses) {
                var linksCounter = 0;

                responses.forEach(function(response) {
                    if (!response.data || typeof response.data[Symbol.iterator] !== 'function') {
                        return;
                    }
                    response.data.forEach(function(friend) {
                        friend.common_friends.forEach(function(target) {    // jshint ignore:line
                            graph.links.push({
                                source: friend.id,
                                target: target
                            });
                            linksCounter += 1;
                        });


                    });
                });

                console.log('Successfully get ' + linksCounter + ' links');
                return callback(graph, userId);
            })
            .catch(function(err) {
                console.error(err);
            });
    };
}]);