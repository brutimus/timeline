//@codekit-prepend "../bower_components/jquery/dist/jquery.js"
//@codekit-prepend "../bower_components/d3/d3.js"
//@codekit-prepend "../bower_components/d3-tip/index.js"
//@codekit-prepend "../bower_components/queue-async/queue.js"

// var svg, content, points, stops;

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

$(document).ready(function() {

	/* ========== VARIABLES & FUNCTIONS ========== */

	var spreadsheet_url = 'https://spreadsheets.google.com/tq?key={0}&gid={1}&tqx=out:csv',
		spreadsheet_key = '1CkXFDv-JURnD6xmqSFHQz3xBiuvmuw9Mjh3foLtKwK8',
		points_sheet = '0',
		timeline_sheet = '37073144',
		svg,
		points = [],
		stops = [];

	function proc_points(d){
		return {
			id: d.id,
			x: +d.x,
			y: +d.y,
			description: d.description,
			sprite: d.sprite
		}
	}
	function proc_stops(d){
		return {
			title: d.title,
			description: d.description,
			points: d.points.split(',')
		}
	}

	function data_ready(error, ps, ss) {
		points = ps;
		stops = ss;
	    var timeline_buttons = timeline_bar.selectAll('g')
			.data(stops).enter()
		.append('g');
		timeline_buttons.attr('class', 'timeline-point')
			.attr("transform", function(d, i) { return "translate(0, 0)"; })
			.transition()
			.attr("transform", function(d, i) { return "translate(" + i * button_width + ", 0)"; });
		timeline_buttons.on('click', changeSelection);

		timeline_buttons.append('rect')
			.attr('width', button_width)
			.attr('height', toolbar_height)

		timeline_buttons.append('text')
			.attr('x', button_width / 2)
			.attr('y', toolbar_height / 2)
			.text(function(d){return d['title']});
	}

	function zoomed() {
	    content.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}

	function changeSelection(d, i){
		hide_details_panel();
		setTimeout(function(){
			details_panel.html(d.description)
		}, 300) // 50ms longer than the panel hide transition
		timeline_marker.select('#marker-details-button')
			.attr('transform', 'translate(0,' + (toolbar_height - (toolbar_height * .5)) + ')');
		t0 = timeline_marker.transition();
		t0.attr('transform', 'translate(' + button_width * i + ',0)');
		t0.transition().select('#marker-details-button')
			.attr('transform', 'translate(0,' + toolbar_height + ')');
		selected_points = $(points).filter(function() {
				return $.inArray(this.id, d.points) > -1
			});
		var sprites = content.selectAll('.sprite')
			.data(selected_points, function(p) { return p.id; });

		sprites.enter().append('g')
			.attr('class', 'sprite')
			.attr('transform', function(d){return 'translate(' + (d.x * width) + ',' + -75 + ')'})
		.append('svg:image')
			.attr('xlink:href', function(d){return d['sprite'] + '&text=id' + d['id'].toString()})
			.attr('width', 75)
			.attr('height', 75)
			.attr('class', 'marker');
		
		sprites.transition()
			.attr('transform', function(d){return 'translate(' + (d.x * width) + ',' + d.y * height + ')'});

		sprites.exit()
			.transition()
			.attr('transform', function(d){return 'translate(' + (d.x * width) + ',' + -75 + ')'})
			.remove();

		sprites.on('mouseover', tip.show)
	        .on('mouseout', tip.hide);
	}
	function toggle_details_panel() {
		if (details_panel.node().getBoundingClientRect().left < width) {
			hide_details_panel();
		} else {
			show_details_panel();
		}
	}
	function show_details_panel(){
		timeline_marker.select('#marker-details-button').transition()
			.attr('transform', 'translate(0,' + (toolbar_height - (toolbar_height * .5)) + ')');
		details_panel.transition()
			.style('right', '0px');
		details_panel_close.transition().delay(50).duration(300)
			.attr('transform', 'translate(' + ((width * .33) - (toolbar_height / 2)) + ',' + ((height / 2) - (button_width / 2)) + ')')
	}
	function hide_details_panel(){
		details_panel.transition()
			.style('right', -(width * .66) + 'px');
		details_panel_close.transition()
			.attr('transform', 'translate(' + width + ',' + ((height / 2) - (button_width / 2)) + ')')
	}


	/* ========== SETUP SVG ========== */

	var svg = d3.select('.canvas'),
		width = svg.node().getBoundingClientRect().width,
		height = svg.node().getBoundingClientRect().height,
		toolbar_height = 35,
		button_width = 80,
		zoom = d3.behavior.zoom()
	    	.scaleExtent([1, 3])
	    	.on("zoom", zoomed),
		tip = d3.tip()
			.attr('class', 'd3-tip')
			.offset([-10, 0])
			.html(function(d) {
				return "<span>" + d.description + "</span>";
			});


	/* ========== SETUP UI ========== */
	
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


	// DETAILS PANEL

	details_panel = d3.select('.details-panel')
		.style('top', toolbar_height + 'px')
		.style('right', -(width * .66) + 'px')
		.style('width', (width * .66) + 'px')
		.style('height', (height - toolbar_height) + 'px')
		.style('display', 'block');

	details_panel_close = svg.append('g')
		.attr('class', 'details-panel-close')
		.attr('transform', 'translate(' + width + ',' + ((height / 2) - (button_width / 2)) + ')')
		.on('click', function(){
			hide_details_panel();
			timeline_marker.select('#marker-details-button').transition()
			.attr('transform', 'translate(0,' + toolbar_height + ')');
		});
	details_panel_close.append('rect')
		.attr('width', toolbar_height)
		.attr('height', button_width);
	details_panel_close.append('text')
		.attr('x', -button_width / 2)
		.attr('y', toolbar_height / 2)
		.attr('transform', 'rotate(-90)')
		.text('CLOSE');


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


	// TOOLBAR BUTTON CONTAINER

	timeline_bar = svg.append('g')
		.attr('class', 'timeline-controls');


	/* ============================= */
	/* ========== RUNTIME ========== */
	/* ============================= */

	queue()
	    .defer(d3.csv, spreadsheet_url.format(spreadsheet_key, points_sheet), proc_points)
	    .defer(d3.csv, spreadsheet_url.format(spreadsheet_key, timeline_sheet), proc_stops)
	    .await(data_ready);


	/* ========== DEBUG ========== */

	if (document.URL.indexOf('timelinedebug') > 0) {
		// ECHO MOUSE POSITION
		svg.on('mousemove.position', function(){
			var coord = d3.mouse(this);
			console.log((coord[0]/width).toFixed(2), (coord[1]/height).toFixed(2));
		});
	}
});