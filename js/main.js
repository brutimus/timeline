//@codekit-prepend "../bower_components/jquery/dist/jquery.js"
//@codekit-prepend "timeline-chart.js"

$(document).ready(function() {
	var chart = timeline_chart()
		.spreadsheet_key('1myJ_J03KTWvdeUEdADUdXg2aPSNXtqQuEnIz43B4sas')
	    .config_sheet('48832348')
	    .points_sheet('0')
	    .timeline_sheet('37073144');

	d3.select('.container').call(chart);
});