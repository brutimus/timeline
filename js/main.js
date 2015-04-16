//@codekit-prepend "../bower_components/jquery/dist/jquery.js"
//@codekit-prepend "timeline-chart.js"

$(document).ready(function() {
	var chart = timeline_chart()
		.spreadsheet_key('1CkXFDv-JURnD6xmqSFHQz3xBiuvmuw9Mjh3foLtKwK8')
	    .config_sheet('48832348')
	    .points_sheet('0')
	    .timeline_sheet('37073144');

	d3.select('.container').call(chart);
});