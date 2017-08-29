//@koala-prepend "../bower_components/jquery/dist/jquery.js"
//@koala-prepend "timeline-chart.js"

$(document).ready(function() {
	var chart = timeline_chart()
		.spreadsheet_key('1mlBaEqnzZYvDVLefRa6LqQpN2Y3Q14HVSa_dq2-lZBI')
	    .config_sheet('48832348')
	    .points_sheet('0')
	    .timeline_sheet('37073144');

	d3.select('.container').call(chart);
});