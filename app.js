'use strict';

/**
 * Created by Drapegnik on 22.12.16.
 */

const tokenRegEx = /#access_token=(.*)&expires_in/;
const userIdRegEx = /&user_id=(.*)/;

var token = window.location.hash.match(tokenRegEx)[1];
var userId = parseInt(window.location.hash.match(userIdRegEx)[1]);

var graph = {
    directed: false,
    graph: [],
    nodes: [],
    links: [],
    multigraph: false
};

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
    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) { return d.id; }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter());

    var canvas = document.querySelector("canvas"),
        context = canvas.getContext("2d"),
        width = canvas.width,
        height = canvas.height;

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
        context.clearRect(0, 0, width, height);
        context.save();
        context.translate(width / 2, height / 2);

        context.beginPath();
        graph.links.forEach(drawLink);
        context.strokeStyle = "#aaa";
        context.stroke();

        context.beginPath();
        graph.nodes.forEach(drawNode);
        context.fill();
        context.strokeStyle = "#fff";
        context.stroke();

        context.restore();
    }

    function drawLink(d) {
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
    }

    function drawNode(d) {
        context.moveTo(d.x + 3, d.y);
        context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
    }
};

if (token && userId) {
    console.log('Successfully login into vk!');
    $('#message').text('Hello!');

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
