var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 50
};

var width = 1060 - margin.left - margin.right;
var height = 800 - margin.bottom - margin.top;

// constant for tooltip display

var tooltipHeight = -5;

// create flag variable for zooming
var centered;

var bbVis = {
    x: 100,
    y: 10,
    w: width - 100,
    h: 300
};

var detailVis = d3.select("#detailVis").append("svg").attr({
    width: 450,
    height:250
})

// bbDetail constants

var bbDetail = {
    w: 440,
    h: 240,
    x: 85,
    y: 40
} 

var canvas = d3.select("#vis").append("svg").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
    })

var svg = canvas.append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    })


// set albers USA projection
var projection = d3.geo.albersUsa().translate([width / 2, height / 2]).precision(.1);
var path = d3.geo.path().projection(projection);

// get data for tooltip info
var tooltip = d3.tip()
    .attr('class', 'tooltip')
    .offset([tooltipHeight, 0])
    .html(function(d) {
        // only tooltip data for existing data
        if (completeDataSet[d.USAF] != undefined ) {
            return "<div id = \"boxheader\"> Station: </div><div id = \"boxfont\">" + d.STATION + "</div><div id = \"boxheader\"> Sum: </div><div id = \"boxfont\">" + completeDataSet[d.USAF].sum + "</div>";
        }
        // else generic
        else {
            return "<div id = \"boxfont\"> Data Unavailable </div>";
        }
    });

svg.call(tooltip);

// graph variables
var xAxis, xScale, yAxis, yScale;

function loadStations() {
    d3.csv("../data/NSRDB_StationsMeta.csv", function(error,data){

        // manual processing to take an average - I come from a C background... d3/javascript too fancy
        var dataMean = 0;
        var counter = 0;
        for (var element in completeDataSet) {
            if (completeDataSet[element] != 0 ) {
                dataMean = counter / (counter + 1) * dataMean + completeDataSet[element].sum / (counter + 1);
                ++counter;
            }
        }

        // add stations as circles
        svg.selectAll("circle")
        .data(data).enter()
            .append("circle")
            .attr("cx", function(d) {
                return projection([d.NSRDB_LON, d.NSRDB_LAT])[0];
            })
            .attr("cy", function(d) {
                return projection([d.NSRDB_LON, d.NSRDB_LAT])[1];
             })
            // circle radius proportional to the mean (mean set at radius 2, double mean points get radius 4, etc)
            .attr("r", function(d){
                if(completeDataSet[d.USAF] != undefined && completeDataSet[d.USAF] != 0) {
                    return 2 * completeDataSet[d.USAF]["sum"] / dataMean;
                }
                // default size for stations with no data is set to 2
                else {
                    return 2;
                }
            })
            // show the stations with and without data in different classes
            .attr("class", function(d){
                if(completeDataSet[d.USAF] != undefined && completeDataSet[d.USAF] != 0) {
                    return "station"; 
                }
                else {
                    return "stationNoData";
                }
            })
            // call multiple event handlers packaged as a function
            .call(addEvents)
    });
    createDetailVis();
}


// function to organize events that are added to both show tooltip and highlight circle
function addEvents(selection) {
    selection.on("mouseover.color", function() {
        d3.select(this).classed("active", true)
    })
    selection.on("mouseover.tip", tooltip.show)
    selection.on("mouseout.color",  function() {
        d3.select(this).classed("active", false)
    })
    selection.on("mouseout.tip",  tooltip.hide)
    selection.on('click', updateDetailVis);
}

// functino to load the aggergated data
function loadStats() {

    d3.json("../data/reducedMonthStationHour2003_2004.json", function(error,data){

        // save data to variable name for loadStations to call
        completeDataSet = data;
		
        // call loadStations data
        loadStations();
    })

}

// from the click-to-zoom example
var g;

// create map

d3.json("../data/us-named.json", function(error, data) {

    var usMap = topojson.feature(data,data.objects.states).features

    g = svg.selectAll(".country")
    .data(usMap).enter()
      .append("path")
      .attr("d", path)
      .attr("class", "country")
      .on("click", zoomToBB);;

    loadStats();
});

var createDetailVis = function(){

  // cool and useful formatting method courtesy of http://bl.ocks.org/mbostock/3048166

  // formatting for ticks
  var formatTime = d3.time.format("%M:%H"),
    // set epoch to arbitrary 2012 as long as we can get time
    formatMinutes = function(d) { return formatTime(new Date(2012, 0, 1, 0, d)); };

  xScale = d3.scale.linear().domain([0, 23])
                            .range([bbDetail.x, bbDetail.w]);
  yScale = d3.scale.linear().domain([0,15000000])
                            .range([bbDetail.h, bbDetail.y]);

  yAxisScale = d3.scale.linear().domain([0,15000000])
                            .range([bbDetail.y, bbDetail.h]);

  // create axes with these scales - on top and left
  xAxis = d3.svg.axis()
              .scale(xScale)
              .orient("top")
              .tickFormat(formatMinutes);
  yAxis = d3.svg.axis()
              .scale(yAxisScale)
              .orient("left");

  // add x-axis to overview
  detailVis.append("g")
    .call(xAxis)
    .attr("class", "x axis")
    // shift to proper location
    .attr("transform", "translate(" + 0 + "," + bbDetail.y + ")")
    // modify axis label
    .append("text")
      .text("Hour of the Day")
      .attr("dx", "27em")
      .attr("dy", "-3em")
      .style("text-anchor", "middle");

  // add y-axis to overview
  detailVis.append("g")
    .call(yAxis)
    .attr("class", "y axis")
    // shift to proper location
    .attr("transform", "translate(" + bbDetail.x + "," + 0 + ")")
    // modify axis label including rotation
    .append("text")
      .text("Sum of Lux Readings")
      .attr("dx", "-7em")
      .attr("dy", "-7em")
      .attr("transform", "rotate(-90)")
      .style("text-anchor" , "end")

  // add title to looo nice
  detailVis.append("text")   
    .attr("x", bbDetail.w / 2 + bbDetail.x / 1.5)
    .attr("y", bbDetail.h)
    .attr("text-anchor", "middle")  
    .style("font-size", "14px") 
    .style("text-decoration", "underline")  
    .text("Aggregate Hourly Data");

  // time formater for data
  var formatTime = d3.time.format("%H:%M:%S")

  // default settings on bargraph
  detailVis.selectAll(".bar")
    .data(d3.entries(completeDataSet[690150].hourly))
    .enter().append("rect")
      .attr("class", "hourLine")
      .attr("x", function(d) { 
        return xScale(formatTime.parse(d.key).getHours());
      })
      .attr("y", bbDetail.y)
      .attr("height", function(d) {
        return bbDetail.h - yScale(d.value);
      })
      .attr("width", 8);
}

// function to update vis graph on click, adjusting the already made rectangles
var updateDetailVis = function(data, name) {

  // only if the clicked station has data
  if(data.USAF != undefined) {
    // time formater for data
    var formatTime = d3.time.format("%H:%M:%S")
    // update bar detail graph
    detailVis.selectAll("rect")
      .data(d3.entries(completeDataSet[data.USAF].hourly))
      .transition()
        .duration(1000)
        .attr("y", bbDetail.y)
        .attr("height", function(d) {
          return bbDetail.h - yScale(d.value);
        })
  }
}

// ZOOMING -- from the click to zoom example with centroids
function zoomToBB(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0]
    y = centroid[1] - margin.top;
    k = 4;
    centered = d;
  }
  // zoom out scaling with bbVis parameters
  else {
    x = bbVis.w / 2;
    y = bbVis.h / 2;
    k = 1;
    centered = null;
  }

  // gemoetric zooming with svg instead of g.transition
  svg.transition()
    .duration(750)
    .attr("transform", "translate(" + bbVis.w / 2 + "," + bbVis.h / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
    .style("stroke-width", 1.5 / k + "px");
}

