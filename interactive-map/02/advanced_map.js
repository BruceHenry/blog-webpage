var relation_data;//To store the data from JSON file loaded by d3.json()
var location_data;

//Get width and height of the outer div to set projection
var map_div = d3.select('#map').node().getBoundingClientRect();
var width = map_div.width, height = map_div.height;

var projection_scale = 500;

//Projection is to set the center and scale of map
var projection = d3.geo.equirectangular()
    .center([-98, 38])//[longitude, latitude]
    .scale(projection_scale)
    .translate([width / 2, height / 2]);

var popup = d3.select('body')
    .append('div')
    .attr('class', 'popup')
    .style('opacity', 0);


function renderMap(projection) {
    const mapNode = document.getElementById("map");
    while (mapNode.firstChild) {
        mapNode.removeChild(mapNode.firstChild);
    }
    new Datamaps({
        element: document.getElementById('map'),
        projection: 'mercator',
        setProjection: function (element) {
            const path = d3.geo.path().projection(projection);
            return {path: path, projection: projection};
        },
        fills: {
            defaultFill: '#8ebdee' //the keys in this object map to the 'fillKey' of [loc_data_dict] or [bubbles]
        },
        geographyConfig: {
            popupOnHover: false, //disable the popup while hovering
            highlightOnHover: false
        }
    });
}

function drawCity(location_data, projection) {
    d3.select('#circles').remove();

    var data = [];
    for (var city in location_data) {
        data.push({
            city: city,
            location: location_data[city]
        });
    }
    var circles = d3.select('svg')
        .append('g')
        .attr('id', 'circles')
        .selectAll('circle');

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
                .duration(500)
                .style('opacity', 0);
        })
}

function drawLine(relation_data, location_data, projection, animation_length) {
    d3.select("#lines").remove();

    var year = d3.select("#year").property("value");
    var city = d3.select("#city").property("value");

    if (!city)
        return;

    var data = relation_data[city][year];

    var colorScale = d3.scale.category20();

    var lines = d3.select('svg')
        .append('g')
        .attr('id', 'lines')
        .selectAll('line');

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


//Asynchronously load the data files
d3.json("./city_location.json", function (city_location) {
    d3.json("./data.json", function (data) {
        location_data = city_location;
        relation_data = data;

        var city_selector = d3.select('#city');
        for (var city in location_data) {
            city_selector.append('option').text(city);
        }
        renderMap(projection);//Render the map after loading the data
        drawCity(location_data, projection);
    });
});

d3.select('#map').call(
    d3.behavior.zoom().scaleExtent([0.5, 5]).on('zoom', function () {
        projection = d3.geo.equirectangular()
            .center([-98, 38])
            .scale(projection_scale * d3.event.scale)
            .translate([width / 2 + d3.event.translate[0], height / 2 + d3.event.translate[1]]);
        renderMap(projection);
        drawCity(location_data, projection);
        drawLine(relation_data, location_data, projection, 0);
    })
);

d3.select("#city").on('change', function () {
    drawLine(relation_data, location_data, projection, 300);
});

///Remove the old map and render a new map when the user change input
d3.select("#year").on('input', function () {
    //Remove the old map
    var mapNode = document.getElementById("map");
    while (mapNode.firstChild) {
        mapNode.removeChild(mapNode.firstChild);
    }
    renderMap(projection);//Render a new map when the year is changed
    drawCity(location_data, projection);
    drawLine(relation_data, location_data, projection, 0);
});

