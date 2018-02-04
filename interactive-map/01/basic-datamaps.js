var json_data;

function renderMap() {
    //A object to store values and colors, i.e. {}
    var data = {};

    //The array to store all the values in order to find min and max
    var values = [];

    var year = document.getElementById('year').value;
    for (var country in json_data) {
        var value = json_data[country]['data'][year];
        data[country] = {numberOfThings: value};
        values.push(value)
    }

    var minValue = Math.min.apply(null, values),
        maxValue = Math.max.apply(null, values);

    //Use d3 to convert number to color
    var colorScale = d3.scale.linear()
        .domain([minValue, maxValue])
        .range(["#afe0ff", "#040066"]);

    //Put color into the data
    for (var country in data) {
        data[country]['fillColor'] = colorScale(data[country]['numberOfThings'])
    }

    //Call DataMaps
    new Datamaps({
        element: document.getElementById('map'),
        projection: 'mercator', // big world map
        fills: {defaultFill: '#F5F5F5'},// countries don't listed in dataset will be painted with this color
        data: data,
        geographyConfig: {
            borderColor: '#d7d7d7',
            highlightBorderWidth: 2,
            highlightBorderColor: '#e66d18',
            popupTemplate: function (geo, data) {// show desired information in tooltip
                if (!data) // don't show tooltip if country don't present in dataset
                    return;
                // tooltip content
                return ['<div class="hoverinfo">',
                    '<strong>', geo.properties.name, '</strong>',
                    '<br>Median Age: <strong>', data.numberOfThings, '</strong>',
                    '</div>'].join('');
            }
        }
    });
}

//Asynchronously load the data file
d3.json("./MedianAge.json", function (data) {
    json_data = data;
    renderMap();
});

///Remove the old map and render a new map when the user change input
document.getElementById('year').oninput = function () {
    //Remove the old map
    var mapNode = document.getElementById("map");
    while (mapNode.firstChild) {
        mapNode.removeChild(mapNode.firstChild);
    }
    //Render a new map
    renderMap();
}

var a = {
    "BDI": {
        "name": "Burundi",
        "data": {
            "2015": 17.6,
            "2020": 17.5,
            "2025": 17.8,
            "2030": 18.6,
            "2035": 19.5,
            "2040": 20.4,
            "2045": 21.2,
            "2050": 22.0,
            "2055": 22.9,
            "2060": 23.8,
            "2065": 24.7,
            "2070": 25.8,
            "2075": 26.8,
            "2080": 27.8,
            "2085": 28.9,
            "2090": 29.8,
            "2095": 30.9,
            "2100": 31.9
        }
    }
}