//@codekit-prepend "../bower_components/jquery/dist/jquery.js"
//@codekit-prepend "../bower_components/d3/d3.js"
//@codekit-prepend "../bower_components/d3-tip/index.js"

var svg, content, points;
$(document).ready(function() {

	svg = d3.select('.canvas');
	var width = svg.node().getBoundingClientRect().width;
	var	height = svg.node().getBoundingClientRect().height;
	toolbar_height = 35;
	button_width = 80;

	var zoom = d3.behavior.zoom()
	    .scaleExtent([1, 3])
	    .on("zoom", zoomed);

	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-10, 0])
		.html(function(d) {
			return "<span>" + d.description + "</span>";
		})

	function zoomed() {
	    content.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}

	function changeSelection(d, i){
		hide_details_panel();
		timeline_marker.select('#marker-details-button')
			.attr('transform', 'translate(0,' + (toolbar_height - (toolbar_height * .5)) + ')');
		t0 = timeline_marker.transition();
		t0.attr('transform', 'translate(' + button_width * i + ',0)');
		t0.transition().select('#marker-details-button')
			.attr('transform', 'translate(0,' + toolbar_height + ')');
		selected_points = $(points).filter(function() {
				return $.inArray(this.id, d.points) > -1
			});
		var circles = content.selectAll('circle')
			.data(selected_points, function(p) { return p.id; });

		circles.enter()
			.append('circle')
			.attr('class', 'marker')
			.attr('r', 10)
			.attr('cx', function(d){return d.x * width})
			.attr('cy', -toolbar_height)
			.transition()
			.attr('cy', function(d){return d.y * height});
		circles.exit()
			.transition()
			.attr('cy', -toolbar_height)
			.remove();
		circles.on('mouseover', tip.show)
	        .on('mouseout', tip.hide);
	}
	function toggle_details_panel () {
		if (details_panel.node().getBoundingClientRect().left < width) {
			hide_details_panel();
		} else {
			show_details_panel();
		}
	}
	function show_details_panel(){
		details_panel.append("foreignObject")
			.attr('class', 'fo')
		    .attr("width", (width * .66) + 'px')
		    .attr("height", (height - toolbar_height) + 'px')
			.append("xhtml:body")
			.attr('xmlns', "http://www.w3.org/1999/xhtml")
			.attr('class', 'details-body')
			.style("height", (height - toolbar_height) + 'px')
			.append('div')
			.style("height", (height - toolbar_height) + 'px')
			.attr('class', 'details-container')
		    .html("<h1>Details for an era</h1><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec eu enim quam. Quisque nisi risus, sagittis quis tempor nec, aliquam eget neque. Nulla bibendum semper lorem non ullamcorper. <img src='http://dummyimage.com/300x200/eeeeee/000000.png' /> Nulla non ligula lorem. Praesent porttitor, tellus nec suscipit aliquam, enim elit posuere lorem, at laoreet enim ligula sed tortor. Ut sodales, urna a aliquam semper, nibh diam gravida sapien, sit amet fermentum purus lacus eget massa. Donec ac arcu vel magna consequat pretium et vel ligula. Donec sit amet erat elit. Vivamus eu metus eget est hendrerit rutrum. Curabitur vitae orci et leo interdum egestas ut sit amet dui. In varius enim ut sem posuere in tristique metus ultrices.<p>Integer mollis massa at orci porta vestibulum. Pellentesque dignissim turpis ut tortor ultricies condimentum et quis nibh. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer euismod lorem vulputate dui pharetra luctus. Sed vulputate, nunc quis porttitor scelerisque, dui est varius ipsum, eu blandit mauris nibh pellentesque tortor. Vivamus ultricies ante eget ipsum pulvinar ac tempor turpis mollis. Morbi tortor orci, euismod vel sagittis ac, lobortis nec est. Quisque euismod venenatis felis at dapibus. Vestibulum dignissim nulla ut nisi tristique porttitor. Proin et nunc id arcu cursus dapibus non quis libero. Nunc ligula mi, bibendum non mattis nec, luctus id neque. Suspendisse ut eros lacus. Praesent eget lacus eget risus congue vestibulum. Morbi tincidunt pulvinar lacus sed faucibus. Phasellus sed vestibulum sapien.");

		details_panel.transition()
			.attr('transform', 'translate(' + (width - (width * .66)) + ',' + toolbar_height + ')');
	}
	function hide_details_panel(){
		details_panel.transition()
			.attr('transform', 'translate(' + width + ',' + toolbar_height + ')')
			.selectAll('.fo')
			.remove();
	}


	points = [{
			id: 0,
			x: .25,
			y: .4,
			description: 'Circle description'
		},{
			id: 1,
			x: .35,
			y: .45,
			description: 'Circle description'
		},{
			id: 2,
			x: .5,
			y: .6,
			description: 'Circle description'
		},{
			id: 3,
			x: .3,
			y: .48,
			description: 'Circle description'
		},{
			id: 4,
			x: .9,
			y: .55,
			description: 'Circle description'
		},{
			id: 5,
			x: .75,
			y: .5,
			description: 'Circle description'
		},{
			id: 6,
			x: .35,
			y: .44,
			description: 'Circle description'
		},{
			id: 7,
			x: .55,
			y: .35,
			description: 'Circle description'
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
		.call(zoom)
		.call(tip);

	// CONTENT AREA
	content = svg.append('g')
		.attr('class', 'content')
		.attr('transform', "translate(0," + toolbar_height + ")")
		.append('g');

	details_panel = svg.append('g')
		.attr('id', 'details-panel')
		.attr('transform', 'translate(' + width + ',' + toolbar_height + ')');
	details_panel.append('rect')
		.attr('width', width * .66)
		.attr('height', height - toolbar_height);

	// TOOLBAR BACKGROUND
	svg.append('rect')
		.attr('id', 'timeline-background')
		.attr('width', '100%')
		.attr('height', toolbar_height);

	// TOOLBAR SELECTION MARKER
	timeline_marker = svg.append('g')
		.attr('transform', 'translate(' + -button_width + ',0)');

	marker_details = timeline_marker.append('g')
		.attr('id', 'marker-details-button')
		.attr('transform', 'translate(0,' + (toolbar_height - (toolbar_height * .5)) + ')')
		.on('click', toggle_details_panel);
	marker_details.append('rect')
		.attr('width', button_width)
		.attr('height', toolbar_height * .5);
	marker_details.append('text')
		.attr('x', button_width / 2)
		.attr('y', (toolbar_height * .5) / 2)
		.text('DETAILS');


	timeline_marker.append('rect')
		.attr('id', 'timeline-marker')
		.attr('width', button_width)
		.attr('height', toolbar_height);


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
		.attr('x', button_width / 2)
		.attr('y', toolbar_height / 2)
		.text(function(d){return d['title']});

	timeline_buttons.on('click', changeSelection);

	if (document.URL.indexOf('timelinedebug') > 0) {
		// ECHO MOUSE POSITION
		svg.on('mousemove.position', function(){
			var coord = d3.mouse(this);
			console.log((coord[0]/width).toFixed(2), (coord[1]/height).toFixed(2));
		});
	}
});