'use strict';

/**
 * Created by Drapegnik on 29.12.16.
 */

angular.module('vkGraphApp').service('Graph', ['$window', '$document', '$rootScope', function($window, $document, $rootScope) {
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
        strength: -minDem / 1.5,
        maxDist: minDem / 3
    };
    Graph.nodeRadius = minDem / 50;
    Graph.linksColor = '#ccc';
    Graph.linksSize = 0.5;
    Graph.highlightColor = '#ff6666';

    Graph.draw = function(data, myId) {

        var linkedByIndex = {};
        data.links.forEach(function(d) {
            linkedByIndex[d.source + "," + d.target] = true;
        });

        function isConnected(a, b) {
            return linkedByIndex[a.id + "," + b.id] || linkedByIndex[b.id + "," + a.id] || a.id === b.id;
        }

        var svg = d3.select('#graph').append('svg')
            .attr('viewBox', '0 0 ' + Graph.width + ' ' + Graph.height)
            .attr('class', 'svg-content');

        d3.forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.links).id(function(d) { return d.id; }))
            .force('charge', d3.forceManyBody().strength(Graph.charge.strength).distanceMax(Graph.charge.maxDist))
            .force('center', d3.forceCenter().x(Graph.center.x).y(Graph.center.y))
            .on('tick', tick);

        var links = svg.selectAll('line')
            .data(data.links)
            .enter().append('line')
            .style('stroke', Graph.linksColor)
            .style('stroke-width', Graph.linksSize);

        var nodes = svg.selectAll('g.node')
            .data(data.nodes)
            .enter().append('g')
            .attr('class', 'node')
            .style('stroke', getNodeColor)
            .style('stroke-width', function(d) {
                return getNodeRadius(d) / 4;
            });

        var circles = nodes.append('circle')
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

        nodes.on('mouseover', function(d) {
            highlightNode(d);
            $rootScope.$apply(function() {
                $rootScope.currentName = d.name;
            });
        });

        nodes.on('mouseout', function() {
            unHighlightNode();
            $rootScope.$apply(function() {
                $rootScope.currentName = '';
            });
        });

        function tick() {
            links
                .attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });

            nodes.attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')';});
        }

        function getNodeRadius(d) {
            if (d.id === myId) {
                return Graph.nodeRadius * 1.5;
            } else {
                return Graph.nodeRadius;
            }
        }

        function getNodeColor(d) {
            if (d.sex === female) {
                return 'ffcce5';
            } else if (d.sex === male) {
                return 'cce5ff';
            } else {
                return 'white';
            }
        }

        function highlightNode(d) {
            svg.style('cursor', 'pointer');
            circles.style('stroke', function(o) {
                return isConnected(d, o) ? Graph.highlightColor : getNodeColor(o);
            });
            links.style('stroke-width', function(o) {
                return o.source.id == d.id || o.target.id == d.id ? Graph.linksSize * 3 : Graph.linksSize;
            }).style('stroke', function(o) {
                return o.source.id == d.id || o.target.id == d.id ? Graph.highlightColor : Graph.linksColor;
            });
        }

        function unHighlightNode() {
            svg.style('cursor', 'default');
            circles.style('stroke', getNodeColor);
            links
                .style('stroke', Graph.linksColor)
                .style('stroke-width', Graph.linksSize);

        }
    };
}]);