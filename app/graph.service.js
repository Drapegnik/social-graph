'use strict';

/**
 * Created by Drapegnik on 29.12.16.
 */

vkGraphApp.service('Graph', ['$window', '$document', function($window, $document) {
    var Graph = this;

    var navbar = $document.find('.navbar');

    Graph.width = $window.innerWidth;
    Graph.height = $window.innerHeight - navbar.height() - 10;

    Graph.center = {
        x: Graph.width / 2,
        y: Graph.height / 2
    };

    var minDem = Math.min(Graph.width, Graph.height);
    var female = 1;
    var male = 2;

    Graph.charge = {
        strength: -minDem / 2,
        maxDist: minDem / 3
    };
    Graph.nodeRadius = minDem / 50;

    Graph.draw = function(data, myId) {
        var svg = d3.select('#graph').append('svg')
            .attr('viewBox', '0 0 ' + Graph.width + ' ' + Graph.height)
            .attr('class', 'svg-content');

        d3.forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.links).id(function(d) { return d.id; }))
            .force('charge', d3.forceManyBody().strength(Graph.charge.strength).distanceMax(Graph.charge.maxDist))
            .force('center', d3.forceCenter().x(Graph.center.x).y(Graph.center.y))
            .on('tick', tick);

        var getNodeRadius = function(d) {
            if (d.id === myId) {
                return Graph.nodeRadius * 1.5;
            } else {
                return Graph.nodeRadius;
            }
        };

        var links = svg.selectAll('line')
            .data(data.links)
            .enter().append('line')
            .style('stroke', '#ccc')
            .style('stroke-width', 0.5);

        var nodes = svg.selectAll('g.node')
            .data(data.nodes)
            .enter().append('g')
            .attr('class', 'node')
            .style('stroke', function(d) {
                if (d.sex === female) {
                    return 'ffcce5';
                } else if (d.sex === male) {
                    return 'cce5ff';
                } else {
                    return 'white';
                }
            })
            .style('stroke-width', function(d) {
                return getNodeRadius(d) / 4;
            });

        nodes.append('circle')
            .attr('r', getNodeRadius);

        var clipPath = nodes.append('clipPath').attr('id', 'clipCircle');
        clipPath.append('circle')
            .attr('r', getNodeRadius);


        nodes.append('svg:image')
            .attr('xlink:href', function(d) { return d.photo;})
            .attr('x', function(d) {return -getNodeRadius(d);})
            .attr('y', function(d) {return -getNodeRadius(d);})
            .attr('height', function(d) {return 2 * getNodeRadius(d);})
            .attr('width', function(d) {return 2 * getNodeRadius(d);})
            .attr('clip-path', 'url(#clipCircle)');

        function tick() {
            links
                .attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });

            nodes.attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')';});
        }
    };
}]);