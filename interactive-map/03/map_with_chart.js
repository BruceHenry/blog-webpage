var relation_data;//relation data among cities
var location_data;//location data of cities

//Get width and height of the outer <div> to set projection
var map_div = d3.select('#map').node().getBoundingClientRect();
var width = map_div.width, height = map_div.height;

//This values means the initial scale of map, also how much you want the map to zoom in: d3.geo.scale = projection_scale * mouse_event_zoom
var projection_scale = 500;

//Projection is a property to set the center and scale of map. Also, we can use it to get position in the map from real world geo coordinates.
var projection = d3.geo.equirectangular()
    .center([-98, 38])//[longitude, latitude]
    .scale(projection_scale)//Initial scale
    .translate([width / 2, height / 2]);

//Pop up a box when mouse is over a city
var popup = d3.select('body')
    .append('div')
    .attr('class', 'popup')
    .style('opacity', 0);//Invisible


function renderMap(projection) {
    //Remove the previous map elements
    const mapNode = document.getElementById("map");
    while (mapNode.firstChild) {
        mapNode.removeChild(mapNode.firstChild);
    }

    //Render new map
    new Datamaps({
        element: document.getElementById('map'),
        projection: 'mercator',
        setProjection: function (element) {
            const path = d3.geo.path().projection(projection);
            return {path: path, projection: projection};
        },
        fills: {
            defaultFill: '#8ebdee'
        },
        geographyConfig: {
            popupOnHover: false, //disable the popup while hovering
            highlightOnHover: false
        }
    });
}

//Function to draw circles(cities) on the map.
function drawCity(location_data, projection) {
    //Remove previous circles
    d3.select('#circles').remove();

    //Put the data into an array. The parameter of d3.(Select_Function).data() must be iterable.
    var data = [];
    for (var city in location_data) {
        data.push({
            city: city,
            location: location_data[city]
        });
    }

    //Append all circles into a <g> tag in order to manipulate them easily.
    var circles = d3.select('svg')
        .append('g')
        .attr('id', 'circles')
        .selectAll('circle');

    //Set attributes and styles of circles based on the data
    circles.data(data)
        .enter()
        .append('circle')
        .attr('fill', '#ff919f')
        .attr('r', 4)
        .attr('cx', function (d) {
            return projection(d.location)[0];
        })
        .attr('cy', function (d) {
            return projection(d.location)[1];
        })
        .on('click', function (d) {
            if (d3.select("#city").property("value") === d.city)
                return;
            d3.select('#city').property('value', d.city);
            drawLine(relation_data, location_data, projection, 300);
            renderPieChart(relation_data);
            renderLineChart(relation_data);
        })
        .on('mouseover', function (d) {
            d3.select(this).attr('r', 7).style('cursor', "pointer");
            popup.style('opacity', .8)
                .style('left', (d3.event.pageX) + 'px')
                .style('top', (d3.event.pageY - 20) + 'px')
                .text(d.city);
        })
        .on('mouseout', function () {
            d3.select(this).attr('r', 4);
            popup.transition()
                .style('opacity', 0);
        });
}

//Function to draw lines(relations) on the map.
function drawLine(relation_data, location_data, projection, animation_length) {
    //Remove previous circles
    d3.select("#lines").remove();

    //Get values from the input
    var year = d3.select("#year").property("value");
    var city = d3.select("#city").property("value");

    var data = relation_data[city][year];

    var colorScale = d3.scale.category20();

    //Append all lines into a <g> tag in order to manipulate them easily.
    var lines = d3.select('svg')
        .append('g')
        .attr('id', 'lines')
        .selectAll('line');

    //Set attributes and styles of lines based on the data
    lines.data(data)
        .enter()
        .append('line')
        .attr('x1', projection(location_data[city])[0])
        .attr('y1', projection(location_data[city])[1])
        .attr('x2', projection(location_data[city])[0])
        .attr('y2', projection(location_data[city])[1])
        .style('stroke-width', '3px')
        .style('stroke', function () {
            return colorScale(Math.random());
        })
        .style('stroke-linecap', 'round')
        .transition()
        .duration(animation_length)
        .attr('x2', function (d) {
            return projection(location_data[d])[0];
        })
        .attr('y2', function (d) {
            return projection(location_data[d])[1];
        })
}

function renderPieChart(relation_data) {
    //Get values from the input
    var year = d3.select("#year").property("value");
    var city = d3.select("#city").property("value");

    var legend_array = [];
    var data = [];

    var data_array = relation_data[city][year];
    for (var i in data_array) {
        var city_name = data_array[i];
        legend_array.push(city_name);
        data.push({
            name: city_name,
            value: 1
        });
    }
    var pieChart = echarts.init(document.getElementById('pie'), null, {renderer: 'svg'});
    var pieOption = {
        title: {
            text: city + ' in ' + year,
            top: '3%',
            left: '50%'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{b} : {c} ({d}%)"
        },
        legend: {
            orient: 'vertical',
            top: '5%',
            left: 'left',
            data: legend_array
        },
        series: [{
            type: 'pie',
            radius: '60%',
            center: ['65%', '60%'],
            animation: false,
            data: data,
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };
    pieChart.setOption(pieOption);
}

function renderLineChart(relation_data) {
    var city = d3.select("#city").property("value");
    var city_data = relation_data[city];

    var data = [];
    for (var i = 2000; i <= 2018; i++) {
        data.push(city_data[i.toString()].length)
    }

    var lineChart = echarts.init(document.getElementById('line'), null, {renderer: 'svg'});
    var lineOption = {
        title: {
            text: city + ' from 2000 to 2018',
            top: '4%'
        },
        tooltip: {
            trigger: 'axis'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            axisLabel: {
                margin: 15
            },
            data: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018]
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            type: 'line',
            data: data
        }]
    };
    lineChart.setOption(lineOption);
}


//Asynchronously load the data files
d3.json("./city_location.json", function (city_location) {
    d3.json("./data.json", function (data) {
        location_data = city_location;
        relation_data = data;

        //Append cities into the city selection list
        var city_selector = d3.select('#city');
        for (var city in location_data) {
            city_selector.append('option').text(city);
        }
        d3.select('#city').property('value', 'Los Angeles');
        renderMap(projection);//Render the map after loading the data
        drawCity(location_data, projection);//Draw cities after loading the data
        drawLine(relation_data, location_data, projection, 0);
        renderPieChart(relation_data);
        renderLineChart(relation_data);
    });
});

//Handle zoom (including drag) event
d3.select('#map').call(
    d3.behavior.zoom()
        .scaleExtent([0.5, 5])
        .on('zoom', function () {
            var scale = d3.event.scale;
            //Update projection (projection will be changed after zooming or dragging)
            projection = d3.geo.equirectangular()
                .center([-98, 38])
                .scale(projection_scale * scale)
                .translate([width / 2 * scale + d3.event.translate[0], height / 2 * scale + d3.event.translate[1]]);

            renderMap(projection);
            drawCity(location_data, projection);
            drawLine(relation_data, location_data, projection, 0);
        })
);

//Handle city selector change
d3.select("#city").on('change', function () {
    drawLine(relation_data, location_data, projection, 300);
    renderPieChart(relation_data);
    renderLineChart(relation_data);
});

//Handle year input change
d3.select("#year").on('input', function () {
    renderMap(projection);
    drawCity(location_data, projection);
    drawLine(relation_data, location_data, projection, 0);
    renderPieChart(relation_data);
});