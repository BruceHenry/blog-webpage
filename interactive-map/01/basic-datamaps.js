var json_data;//To store the data from JSON file loaded by d3.json()

function renderMap() {
    var data = {};//A object to store values and colors, i.e. { USA: { numberOfThings: 37.6, fillColor: "#333e90"} }
    var values = [];//The array to store all the values in order to find min and max

    var year = document.getElementById('year').value;//Get value from input

    //Iterate the data array to retrieve the value of each country in the specific year
    for (var country in json_data) {
        var value = json_data[country]['data'][year];
        data[country] = {numberOfThings: value};
        values.push(value)
    }

    //Get min and max values to set the color scale
    var minValue = Math.min.apply(null, values),
        maxValue = Math.max.apply(null, values);

    //Use d3 to convert number to color
    var colorScale = d3.scale.linear()
        .domain([minValue, maxValue])
        .range(["#afe0ff", "#040066"]);

    //Put color into the data array for each country
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
    renderMap();//Render the map after loading the data
});

///Remove the old map and render a new map when the user change input
document.getElementById('year').oninput = function () {
    //Remove the old map
    var mapNode = document.getElementById("map");
    while (mapNode.firstChild) {
        mapNode.removeChild(mapNode.firstChild);
    }
    renderMap();//Render a new map when the year is changed
};