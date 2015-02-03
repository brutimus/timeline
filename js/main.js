//@codekit-prepend "../bower_components/jquery/dist/jquery.js"
//@codekit-prepend "../bower_components/d3/d3.js"


$(document).ready(function() {

	var svg = d3.select('.canvas');
	var canvas_width = svg.node().getBoundingClientRect().width;
	var toolbar_height = 35;
	var	content_height = svg.node().getBoundingClientRect().height - toolbar_height;
	var button_width = 80;

	var data = [{
		title: '2000',
		description: 'Lorem Ipsum',
		image: 'http://dummyimage.com/' + canvas_width + 'x' + content_height + '/eeeeee/000000.png'
	},
	{
		title: '2001',
		description: 'Lorem Ipsum',
		image: 'http://dummyimage.com/' + canvas_width + 'x' + content_height + '/eeeeee/000000.png'
	},
	{
		title: '2002',
		description: 'Lorem Ipsum',
		image: 'http://dummyimage.com/' + canvas_width + 'x' + content_height + '/eeeeee/000000.png'
	},
	{
		title: '2003',
		description: 'Lorem Ipsum',
		image: 'http://dummyimage.com/' + canvas_width + 'x' + content_height + '/eeeeee/000000.png'
	}];


	svg.append('rect')
		.attr('id', 'timeline-background')
		.attr('width', '100%')
		.attr('height', toolbar_height);

	var timeline_marker = svg.append('rect')
		.attr('id', 'timeline-marker')
		.attr('width', button_width)
		.attr('height', toolbar_height)
		.attr('x', '0');

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
		.text(function(d){return d['title']})
		.attr('x', 20)
		.attr('y', 22);

	timeline_buttons.on('click', function(d){
		d3.selectAll('.content g')
			.style('display', 'none');
		d3.select('.content g#year-' + d['title'])
			.style('display', 'block');
		d3.select('#timeline-marker')
			.transition()
			.attr('x', d3.select(this).node().getBoundingClientRect()['left'])
	});

	var content = svg.append('g')
		.attr('class', 'content')
		.attr('transform', "translate(0,35)");

	var images = content.selectAll('g')
		.data(data)
		.enter().append('g')
		.attr('id', function(d){return 'year-' + d['title']});

	images.append('svg:image')
		.attr('xlink:href', function(d){return d['image'] + '&text=' + d['title']})
		.attr('width', canvas_width)
		.attr('height', content_height);
	
});