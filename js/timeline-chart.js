//@codekit-prepend "../bower_components/d3/d3.js"
//@codekit-prepend "../bower_components/d3-tip/index.js"
//@codekit-prepend "../bower_components/queue-async/queue.js"

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

function timeline_chart() {
  var spreadsheet_key = '',
      config_sheet = '',
      points_sheet = '',
      timeline_sheet = '';

  function my(selection) {
    
    /* ========== VARIABLES & FUNCTIONS ========== */

    var spreadsheet_url = 'https://spreadsheets.google.com/tq?key={0}&gid={1}&tqx=out:csv',
        svg,
        points = [],
        stops = [];

    function proc_config(rows){
        var config = {};
        rows.map(function(elem) {
            config[elem.key] = elem.value
        })
        return config
    }

    function proc_points(d){
        return {
            id: d.id,
            x: +d.x,
            y: +d.y,
            off_x: 0,
            off_y: 0,
            obj: null,
            width: +d.width,
            height: +d.height,
            description: d.description,
            sprite: d.sprite,
            svg_id: d.svg_id
        }
    }
    function proc_stops(d){
        return {
            title: d.title,
            description: d.description,
            points: d.points.split(',')
        }
    }

    function load_image(config, points, data){
        var svgNode = data.getElementsByTagName("svg")[0];
        content.node().appendChild(svgNode);
        d3.select(svgNode)
            .attr('x', config.offset_x)
            .attr('y', config.offset_y)

        // Process all the points here. If we have svg_id values, pull sprites
        // from the primary image. Otherwise load the sprites from URLs.
        $.each(points, function(index, el) {
            if (el.svg_id) {
                // If you pull objects out of an existing SVG, the coordinate system
                // remains relative to the parent SVG. So we change the x/y to 0
                // and off_x/off_y will become our offscreen coordinates.
                var obj = d3.select(svgNode).select('#' + el.svg_id);
                var bb = obj.node().getBBox();
                el.off_x = 0;
                el.off_y = -(bb.y + bb.height + 50);
                el.x = 0;
                el.y = 0;
                el.obj = obj;
                content_group.node().appendChild(obj.node());
                obj.attr('transform', 'translate(' + el.off_x + ',' + el.off_y + ')')
                    .attr('class', 'sprite');
            } else {
                // With newly created objects, the coordinate system is 0,0 relative to
                // the containing element. Thus our x/y positions will come from the sheet.
                el.off_x = el.x;
                el.off_y = -(el.height + 50)
                el.obj = content_group.append('g')
                    .attr('class', 'sprite')
                    .attr('transform', 'translate(' + el.x + ',' + el.off_y + ')');
                el.obj.append('svg:image')
                    .attr('xlink:href', el.sprite)
                    .attr('width', el.width)
                    .attr('height', el.height)
                    .attr('class', 'marker');  
            };
        });
    }

    function data_ready(error, cs, ps, ss) {
        points = ps;
        stops = ss;
        config = proc_config(cs);

        d3.xml(config.image, load_image.bind(null, config, points));

        var timeline_buttons = timeline_bar.selectAll('g')
            .data(stops).enter()
        .append('g');
        timeline_buttons.attr('class', 'timeline-point')
            .attr("transform", function(d, i) { return "translate(0, 0)"; })
            .transition()
            .attr("transform", function(d, i) { return "translate(" + i * button_width + ", 0)"; })
            .transition()
            .style('fill', 'none');
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
            .attr('transform', 'translate(0,' + ((toolbar_height - (toolbar_height * .5)) - 2) + ')');
        t0 = timeline_marker.transition();
        t0.attr('transform', 'translate(' + button_width * i + ',2)');
        t0.transition().select('#marker-details-button')
            .attr('transform', 'translate(0,' + (toolbar_height - 2) + ')');
        selected_points = $(points).filter(function() {
                return $.inArray(this.id, d.points) > -1
            });
        var sprites = content.selectAll('.sprite')
            .data(selected_points, function(p) { return p.id; });

        sprites.enter().append(function(d){return d.obj.node()})
        
        sprites.transition()
            .attr('transform', function(d){return 'translate(' + d.x + ',' + d.y + ')'});

        sprites.exit()
            .transition()
            .attr('transform', function(d){return 'translate(' + d.off_x + ',' + d.off_y + ')'})
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
            .attr('transform', 'translate(0,' + ((toolbar_height - (toolbar_height * .5)) - 2) + ')');
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

    var svg = selection.select('.canvas'),
        width = svg.node().getBoundingClientRect().width,
        height = svg.node().getBoundingClientRect().height,
        toolbar_height = 35,
        button_width = 80,
        // xScale = d3.scale.linear()
        //  .domain([0, 900])
        //  .range([0, svg.node().getBoundingClientRect().width]),
        // yScale = d3.scale.linear()
        //  .domain([0, 600])
        //  .range([0, svg.node().getBoundingClientRect().height - toolbar_height]),
        zoom = d3.behavior.zoom()
            .scaleExtent([1, 3])
            .size([width, height - toolbar_height])
            .on("zoom", zoomed),
        tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<span>" + d.description + "</span>";
            });


    /* ========== SETUP UI ========== */

    // CONTENT AREA

    content_group = svg.append('g')
        .attr('class', 'content')
        .attr('transform', "translate(0," + toolbar_height + ")")
        .call(zoom)
        .call(tip);
    content_group.append('rect')
        .attr('id', 'content-background')
        .attr('width', '100%')
        .attr('height', height - toolbar_height);

    content = content_group.append('g');


    // DETAILS PANEL

    details_panel = selection.select('.details-panel')
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
            .attr('transform', 'translate(0,' + (toolbar_height - 2) + ')');
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
        .attr('transform', 'translate(' + -button_width + ',2)');
    marker_details = timeline_marker.append('g')
        .attr('id', 'marker-details-button')
        .attr('transform', 'translate(0,' + ((toolbar_height - (toolbar_height * .5)) - 2) + ')')
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
        .attr('height', toolbar_height - 2);


    // TOOLBAR BUTTON CONTAINER

    timeline_bar = svg.append('g')
        .attr('class', 'timeline-controls');


    /* ============================= */
    /* ========== RUNTIME ========== */
    /* ============================= */

    queue()
        .defer(d3.csv, spreadsheet_url.format(spreadsheet_key, config_sheet))
        .defer(d3.csv, spreadsheet_url.format(spreadsheet_key, points_sheet), proc_points)
        .defer(d3.csv, spreadsheet_url.format(spreadsheet_key, timeline_sheet), proc_stops)
        .await(data_ready);


    /* ========== DEBUG ========== */

    if (document.URL.indexOf('timelinedebug') > 0) {
        // ECHO MOUSE POSITION
        svg.on('mousemove.position', function(){
            var coord = d3.mouse(this);
            console.log(coord[0], coord[1]);
        });
    }

  }

  my.spreadsheet_key = function(value) {
    if (!arguments.length) return spreadsheet_key;
    spreadsheet_key = value;
    return my;
  }
  my.config_sheet = function(value) {
    if (!arguments.length) return config_sheet;
    config_sheet = value;
    return my;
  }
  my.points_sheet = function(value) {
    if (!arguments.length) return points_sheet;
    points_sheet = value;
    return my;
  }
  my.timeline_sheet = function(value) {
    if (!arguments.length) return timeline_sheet;
    timeline_sheet = value;
    return my;
  }

  return my;
}