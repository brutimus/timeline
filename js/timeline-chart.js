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
            name: d.name,
            description: d.description,
            sprite: d.sprite,
            svg_id: d.svg_id,
            svg_bb: null
        }
    }
    function proc_stops(d){
        return {
            title: d.title,
            description: d.description,
            points: d.points.split(',')
        }
    }

    function draw_ui(config){
        /* ========== SETUP UI ========== */

        // CONTENT AREA

        content_group = svg.append('g')
            .attr('class', 'content')
            .attr('transform', "translate(0," + toolbar_height + ")");
        content_group.append('rect')
            .attr('id', 'content-background')
            .attr('width', '100%')
            .attr('height', height - toolbar_height);

        content = content_group.append('g');


        // DETAILS PANEL
        details_panel = selection.select('.details-panel')
            .style('top', toolbar_height + details_panel_margin + 'px')
            .style('right', -(width * details_panel_width) + 'px')
            .style('width', (width * details_panel_width - details_panel_margin) + 'px')
            .style('height', (height - toolbar_height - (details_panel_margin * 2)) + 'px')
            .style('display', 'block');

        details_panel_close = svg.append('g')
            .attr('class', 'details-panel-close')
            .attr('transform', 'translate(' + width + ',' + ((height / 2) - (button_width / 2)) + ')')
            .on('click', function(){
                hide_details_panel();
                d3.select('.sprite.selected').classed('selected', false);
                zoomToPoints(selected_points);
                if (timeline_bar.select('g.selected').datum().description) {
                    timeline_marker.select('#marker-details-button').transition()
                       .attr('transform', 'translate(0,' + (toolbar_height - 2) + ')');
                }
            });
        details_panel_close.append('rect')
            .attr('width', toolbar_height)
            .attr('height', toolbar_height * 3);
        details_panel_close.append('text')
            .attr('x', -(toolbar_height * 3) / 2)
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
            .on('click', function(d){
                toggle_details_panel(timeline_bar.select('g.selected').datum().description)});
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


        // EFFECTS

        zoom = d3.behavior.zoom()
            .scaleExtent([1, 3])
            .size([width, height - toolbar_height])
            .on("zoom", zoomed);

        tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
                return "<span>" + d.name + "</span>";
            });

        content_group
            .call(zoom)
            .call(zoom.event)
            .call(tip);
    }

    function load_image(config, points, data){
        var svgNode = data.getElementsByTagName("svg")[0];
        content.node().appendChild(svgNode);
        d3.select(svgNode)
            .attr('x', config.offset_x)
            .attr('y', config.offset_y);
        zoom.translate([config.offset_x * -1, config.offset_y * -1]).event(content);

        // Process all the points here. If we have svg_id values, pull sprites
        // from the primary image. Otherwise load the sprites from URLs.
        $.each(points, function(index, el) {
            if (el.svg_id) {
                // If you pull objects out of an existing SVG, the coordinate system
                // remains relative to the parent SVG. So we change the x/y to 0
                // and off_x/off_y will become our offscreen coordinates.
                var obj = d3.select(svgNode).select('#' + el.svg_id);
                var bb = obj.node().getBBox();
                el.svg_bb = bb;
                obj.remove();
                el.off_x = 0;
                el.off_y = -(bb.y + bb.height + 50);
                el.x = 0;
                el.y = 0;
                el.obj = obj;
                obj.attr('transform', 'translate(' + el.off_x + ',' + el.off_y + ')')
                    .attr('class', 'sprite');
            } else {
                // With newly created objects, the coordinate system is 0,0 relative to
                // the containing element. Thus our x/y positions will come from the sheet.
                el.off_x = el.x;
                el.off_y = -(el.height + 50)
                el.obj = content_group.append('g').remove()
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

        button_width = parseInt(config.button_width);
        toolbar_height = parseInt(config.toolbar_height);
        details_panel_margin = parseInt(config.details_panel_margin);
        details_panel_width = parseFloat(config.details_panel_width);

        draw_ui(config);

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

    function zoomToPoint(point){
        zoom_state = 'point',
        scale = 3,
        translate = [(width * .25) - scale * point.svg_bb.x, (height - toolbar_height) / 2 - scale * point.svg_bb.y];

        return content
            .transition()
            .duration(750)
            .call(zoom.translate(translate).scale(scale).event);
    }

    function zoomToPoints(points){
        zoom_state = 'group';
        var bbx1 = Math.min.apply(Math, $.map(points, function(d) {return d.svg_bb.x;})),
            bby1 = Math.min.apply(Math, $.map(points, function(d) {return d.svg_bb.y;})),
            bbx2 = Math.max.apply(Math, $.map(points, function(d) {return d.svg_bb.x;})),
            bby2 = Math.max.apply(Math, $.map(points, function(d) {return d.svg_bb.y;})),
            dx = bbx2 - bbx1,
            dy = bby2 - bby1,
            x = (bbx1 + bbx2) / 2,
            y = (bby1 + bby2) / 2,
            scale = Math.min(.9 / Math.max(dx / width, dy / (height - toolbar_height)), 3),
            translate = [width / 2 - scale * x, (height - toolbar_height) / 2 - scale * y];

        return content
            .transition()
            .duration(750)
            .call(zoom.translate(translate).scale(scale).event);
    }

    function changeSelection(d, i){
        // If the click is on the already selected element, don't do anything
        if (timeline_bar.select('g.selected').node() == timeline_bar.selectAll('g')[0][i]) return;
        
        timeline_bar.select('g.selected').classed('selected', false);
        d3.select(timeline_bar.selectAll('g')[0][i]).classed('selected', true);
        hide_details_panel();
        timeline_marker.select('#marker-details-button')
            .attr('transform', 'translate(0,' + ((toolbar_height - (toolbar_height * .5)) - 2) + ')');
            t0 = timeline_marker.transition();
            t0.attr('transform', 'translate(' + button_width * i + ',2)');
        if (d.description) {
            t0.transition().select('#marker-details-button')
                .attr('transform', 'translate(0,' + (toolbar_height - 2) + ')');
        };
        selected_points = $(points).filter(function() {
                return $.inArray(this.id, d.points) > -1
            });
        var sprites = content.selectAll('.sprite')
            .data(selected_points, function(p) { return p.id; });

        sprites.enter().append(function(d){return d.obj.node()})
        
        sprites.transition().duration(750)
            .attr('transform', function(d){return 'translate(' + d.x + ',' + d.y + ')'});

        sprites.exit()
            .transition().duration(750)
            .attr('transform', function(d){return 'translate(' + d.off_x + ',' + d.off_y + ')'})
            .remove();

        zoomToPoints(selected_points);

        sprites.on('mouseover', tip.show)
            .on('mouseout', tip.hide)
            .on('click', function(d){
                var sprite = d3.select(this);
                if (sprite.classed('selected')) {
                    sprite.classed('selected', false);
                    hide_details_panel();
                    zoomToPoints(selected_points);
                } else {
                    if (zoom_state == 'point' && d.description) {
                        details_panel.html(d.description);
                    } else if (zoom_state == 'group' && d.description) {
                        show_details_panel(d.description);
                    } else {
                        hide_details_panel();
                    };
                    d3.select('.sprite.selected').classed('selected', false);
                    sprite.classed('selected', true);
                    tip.hide();
                    zoomToPoint(d);
                }
            });
    }
    function toggle_details_panel(html) {
        if (details_panel.node().getBoundingClientRect().left < width) {
            hide_details_panel();
        } else {
            show_details_panel(html);
        }
    }
    function show_details_panel(html){
        details_panel.html(html);
        timeline_marker.select('#marker-details-button').transition()
            .attr('transform', 'translate(0,' + ((toolbar_height - (toolbar_height * .5)) - 2) + ')');
        details_panel.transition()
            .style('right', details_panel_margin + 'px');
        details_panel_close.transition().delay(50).duration(300)
            .attr('transform',
                'translate(' + ((width * (1 - details_panel_width)) - toolbar_height) + ',' + ((height / 2) - ((toolbar_height * 3) / 2)) + ')')
    }
    function hide_details_panel(){
        details_panel.transition()
            .style('right', -(width * details_panel_width) + 'px');
        details_panel_close.transition()
            .attr('transform', 'translate(' + width + ',' + ((height / 2) - (button_width / 2)) + ')')
    }


    /* ========== SETUP SVG ========== */

    var svg = selection.select('.canvas'),
        content_group,
        width = svg.node().getBoundingClientRect().width,
        height = svg.node().getBoundingClientRect().height,
        toolbar_height,
        button_width,
        details_panel_margin,
        details_panel_width,
        selected_points,
        zoom,
        tip,
        zoom_state = null;

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