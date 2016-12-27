'use strict';

/**
 * Created by Drapegnik on 22.12.16.
 */

vkGraphApp.controller('HomeCtrl', [function() {
    const tokenRegEx = /#access_token=(.*)&expires_in/;
    const userIdRegEx = /&user_id=(.*)/;

    if (window.location.hash.match(tokenRegEx)) {
        var token = window.location.hash.match(tokenRegEx)[1];
        var userId = parseInt(window.location.hash.match(userIdRegEx)[1]);
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

    var getFriends = function(id, callback) {
        console.log('Loading friends for ' + id + '...');

        $.ajax('/getFriends', {
            type: 'POST',
            success: callback,
            error: function(err) {
                console.error(err);
            },
            data: {
                token: token,
                userId: id
            }
        });
    };

    var addFriendToGraph = function(userIndex, friend) {
        graph.nodes.push({
            id: friend.id,
            name: friend.first_name + ' ' + friend.last_name,
            sex: friend.sex,
            photo: friend.photo_50
        });

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
        
        graph.nodes.push({
            id: userId,
            name: 'You'
        });

        getFriends(userId, function(response) {

            var friends = response.items;

            friends.forEach(function(friend) {
                addFriendToGraph(userId, friend);
            });

            draw(graph);
        });
    }
}]);
