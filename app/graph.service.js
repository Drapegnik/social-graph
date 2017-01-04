'use strict';

/**
 * Created by Drapegnik on 29.12.16.
 */

vkGraphApp.service('Graph', [function() {
    var Graph = this;

    Graph.width = 900;
    Graph.height = 900;
    Graph.center = {
        x: 450,
        y: 250
    };
    Graph.charge = {
        strength: -150,
        maxDist: 250
    };
    Graph.nodeRadius = 12;

    Graph.draw = function(data) {
        var svg = d3.select('#graph').append('svg')
            .attr('viewBox', '0 0 ' + Graph.width + ' ' + Graph.height)
            .attr('class', 'svg-content');

        var simulation = d3.forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.links).id(function(d) { return d.id; }))
            .force('charge', d3.forceManyBody().strength(Graph.charge.strength).distanceMax(Graph.charge.maxDist))
            .force('center', d3.forceCenter().x(Graph.center.x).y(Graph.center.y))
            .on('tick', tick);


        var links = svg.selectAll('line')
            .data(data.links)
            .enter().append('line')
            .style('stroke', '#ccc')
            .style('stroke-width', 0.5);

        var nodes = svg.selectAll('g.node')
            .data(data.nodes)
            .enter().append('g')
            .attr("class", "node");

        nodes.call(d3.drag()
            .on("start", dragstart)
            .on("drag", dragmove)
            .on("end", dragend));

        nodes.append('circle')
            .attr('r', Graph.nodeRadius);

        var clipPath = nodes.append('clipPath').attr('id', 'clipCircle');
        clipPath.append('circle')
            .attr('r', Graph.nodeRadius);

        nodes.append('svg:image')
            .attr('xlink:href', function(d) { return d.photo;})
            .attr('x', function() { return -Graph.nodeRadius;})
            .attr('y', function() { return -Graph.nodeRadius;})
            .attr('height', 2 * Graph.nodeRadius)
            .attr('width', 2 * Graph.nodeRadius)
            .attr('clip-path', 'url(#clipCircle)');


        function dragstart(d) {
            simulation.stop(); // stops the force auto positioning before you start dragging
        }

        function dragmove(d) {
            d.px += d3.event.dx;
            d.py += d3.event.dy;
            d.x += d3.event.dx;
            d.y += d3.event.dy;
            tick(); // this is the key to make it work together with updating both px,py,x,y on d !
        }

        function dragend(d) {
            d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
            tick();
            simulation.restart();
        }

        function tick() {
            links
                .attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });

            nodes.attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')';});

            nodes.attr("x", function(d) {return d.x = Math.max(16, Math.min(Graph.width - 16, d.x));})
                .attr("y", function(d) {return d.y = Math.max(16, Math.min(Graph.height - 16, d.y));});
        }
    };
}]);