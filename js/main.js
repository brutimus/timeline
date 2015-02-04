//@codekit-prepend "../bower_components/jquery/dist/jquery.js"
//@codekit-prepend "../bower_components/d3/d3.js"

var svg, content, points;
$(document).ready(function() {

	svg = d3.select('.canvas');
	var width = svg.node().getBoundingClientRect().width;
	var	height = svg.node().getBoundingClientRect().height;
	var toolbar_height = 35;
	var button_width = 80;

	var x = d3.scale.linear()
	    .domain([-width / 2, width / 2])
	    .range([0, width]);

	var y = d3.scale.linear()
	    .domain([-height / 2, height / 2])
	    .range([height, 0]);

	// var xAxis = d3.svg.axis()
	//     .scale(x)
	//     .orient("bottom")
	//     .tickSize(-height);

	// var yAxis = d3.svg.axis()
	//     .scale(y)
	//     .orient("left")
	//     .ticks(5)
	//     .tickSize(-width);

	var zoom = d3.behavior.zoom()
	    // .x(x)
	    // .y(y)
	    .scaleExtent([1, 32])
	    .on("zoom", zoomed);

	function zoomed() {
	    // content.select(".x.axis").call(xAxis);
	    // content.select(".y.axis").call(yAxis);
	    content.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}


	points = [{
			id: 0,
			x: .25,
			y: .4
		},{
			id: 1,
			x: .35,
			y: .45
		},{
			id: 2,
			x: .5,
			y: .6
		},{
			id: 3,
			x: .3,
			y: .48
		},{
			id: 4,
			x: .9,
			y: .55
		},{
			id: 5,
			x: .75,
			y: .5
		},{
			id: 6,
			x: .35,
			y: .44
		},{
			id: 7,
			x: .55,
			y: .35
		}];

	data = [{
		title: '2000',
		description: 'Lorem Ipsum',
		points: [0]
	},
	{
		title: '2001',
		description: 'Lorem Ipsum',
		points: [0,1]
	},
	{
		title: '2002',
		description: 'Lorem Ipsum',
		points: [0,1,2]
	},
	{
		title: '2003',
		description: 'Lorem Ipsum',
		points: [1,2,3,4]
	},
	{
		title: '2004',
		description: 'Lorem Ipsum',
		points: [2,3,4,5,6]
	},
	{
		title: '2005',
		description: 'Lorem Ipsum',
		points: [2,4,5,6]
	},
	{
		title: '2006',
		description: 'Lorem Ipsum',
		points: [4,5,6,7]
	}];

	// CONTENT AREA BACKGROUND
	svg.append('rect')
		.attr('id', 'content-background')
		.attr('width', '100%')
		.attr('height', height)
		.call(zoom);
	

	// CONTENT AREA
	content = svg.append('g')
		.attr('class', 'content')
		.attr('transform', "translate(0," + toolbar_height + ")")
		.append('g');
	// content.append("g")
	//     .attr("class", "x axis")
	//     .attr("transform", "translate(0," + height + ")")
	//     .call(xAxis);
	// content.append("g")
	//     .attr("class", "y axis")
	//     .call(yAxis);

	// TOOLBAR BACKGROUND
	svg.append('rect')
		.attr('id', 'timeline-background')
		.attr('width', '100%')
		.attr('height', toolbar_height);

	// TOOLBAR SELECTION MARKER
	var timeline_marker = svg.append('rect')
		.attr('id', 'timeline-marker')
		.attr('width', button_width)
		.attr('height', toolbar_height)
		.attr('x', -button_width);

	// TOOLBAR
	var timeline_bar = svg.append('g')
		.attr('class', 'timeline-controls');

	var timeline_buttons = timeline_bar.selectAll('g')
		.data(data)
		.enter().append('g')
		.attr('class', 'timeline-point')
		.attr("transform", function(d, i) { return "translate(" + i * button_width + ", 0)"; });

	timeline_buttons.append('rect')
		.attr('width', button_width)
		.attr('height', toolbar_height)

	timeline_buttons.append('text')
		.attr('x', 20)
		.attr('y', 22)
		.text(function(d){return d['title']});

	timeline_buttons.on('click', function(d){
		d3.select('#timeline-marker')
			.transition()
			.attr('x', d3.select(this).node().getBoundingClientRect()['left']);
		selected_points = $(points).filter(function() {
				return $.inArray(this.id, d.points) > -1
			});
		var circles = content.selectAll('circle')
			.data(selected_points, function(point) { return point.id; });

		circles.enter()
			.append('circle')
			.attr('r', 10)
			.attr('cx', function(d){return d.x * width})
			.attr('cy', -toolbar_height)
			.transition()
			.attr('cy', function(d){return d.y * height});
		circles.exit()
			.transition()
			.attr('cy', -toolbar_height)
			.remove();

	});

});