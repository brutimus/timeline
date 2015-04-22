//@codekit-prepend "../bower_components/jquery/dist/jquery.js"
//@codekit-prepend "timeline-chart.js"

$(document).ready(function() {
	var chart = timeline_chart()
		.spreadsheet_key('1usz0um8pRGh43wUXWqITCOSMz50kpqfW3L9JKUxLq7E')
	    .config_sheet('48832348')
	    .points_sheet('0')
	    .timeline_sheet('37073144');

	d3.select('.container').call(chart);
});