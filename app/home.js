'use strict';

/**
 * Created by Drapegnik on 22.12.16.
 */

vkGraphApp.controller('HomeCtrl', ['$http', '$location', function($http, $location) {
    const tokenRegEx = /access_token=(.*)&expires_in/;
    const userIdRegEx = /&user_id=(.*)/;

    if ($location.$$hash.match(tokenRegEx)) {
        var token = $location.$$hash.match(tokenRegEx)[1];
        var userId = parseInt($location.$$hash.match(userIdRegEx)[1]);
    }

    var graph = {
        directed: false,
        graph: [],
        nodes: [],
        links: [],
        multigraph: false
    };

    var width = 900;
    var height = 900;

    var parseUserInfo = function(user) {
        return {
            id: user.id,
            name: user.first_name + ' ' + user.last_name,
            sex: user.sex,
            photo: user.photo_50
        }
    };

    var addFriendToGraph = function(userIndex, friend) {
        graph.nodes.push(parseUserInfo(friend));

        graph.links.push({
            source: userIndex,
            target: friend.id
        });
    };

    var draw = function() {
        var svg = d3.select('#graph').append('svg')
            .attr('viewBox', '0 0 ' + width + ' ' + height)
            .attr('class', 'svg-content');

        var simulation = d3.forceSimulation(graph.nodes)
            .force('link', d3.forceLink(graph.links).id(function(d) { return d.id; }))
            .force('charge', d3.forceManyBody().strength(-700).distanceMax(700))
            .force('center', d3.forceCenter().x(450).y(350))
            .on('tick', tick);


        var links = svg.selectAll('line')
            .data(graph.links)
            .enter().append('line')
            .style('stroke', '#ccc')
            .style('stroke-width', 1);

        var nodes = svg.selectAll('g.node')
            .data(graph.nodes)
            .enter().append('g');

        nodes.append('circle')
            .attr('r', 10);

        var clipPath = nodes.append('clipPath').attr('id', 'clipCircle');
        clipPath.append('circle')
            .attr('r', 20);

        var images = nodes.append('svg:image')
            .attr('xlink:href', function(d) { return d.photo;})
            .attr('x', function(d) { return -20;})
            .attr('y', function(d) { return -20;})
            .attr('height', 40)
            .attr('width', 40)
            .attr('clip-path', 'url(#clipCircle)');

        function tick() {
            links.attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });

            nodes.attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });

            nodes.attr('x', function(d) {return d.x = Math.max(16, Math.min(width - 16, d.x));})
                .attr('y', function(d) {return d.y = Math.max(16, Math.min(height - 16, d.y));});

            // simulation.alpha(0.4);
        }
    };

    if (token && userId) {
        console.log('Successfully login into vk!');
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

                draw(graph);
            })
            .catch(function(err) {
                console.error(err);
            })
    }
}]);
