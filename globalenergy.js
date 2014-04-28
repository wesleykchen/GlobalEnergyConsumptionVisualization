d3.select(window).on("resize", throttle);
var showing = false;
// setup zoom - how much zoom to allow
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", move);

// scale width to browser window
var width = document.getElementById('container').offsetWidth;
var height = width / 2;

// variables needed in various functions
var topo, projection, path, svg, g;

// setup graticule if we want
// var graticule = d3.geo.graticule();

// make slider
  $(function() {
    $( "#slider" ).slider({
      value:1971,
      min: 1971,
      max: 2007,
      step: 1,
      animate: true,
      slide: function( event, ui ) {
        $( "#year" ).val( ui.value );
        var newValue = ui.value;

        // console.log(countriesSelection)

        countriesSelection
        .style("fill", function(d, i)
      {
        // temporary basic choropleth scale - energy production
        index = 25;
        var countryName = d.properties.name;

        // get the value from the slider
        var year = ui.value;

        // console.log(energydata)
        // search for data
        if (energydata[index].countries[countryName] != undefined)
        {
          var countryData = energydata[index].countries[countryName][year];
          //var min = d3.min(d3.values(energydata[index].countries), function(d) {if(d[year] != 0 && d[year] != undefined) {return d[year]}})
          var max = d3.max(d3.values(energydata[index].countries), function(d) {if(d[year] != 0 && d[year] != undefined) {return d[year]}})
          var median = d3.median(d3.values(energydata[index].countries), function(d) {if(d[year] != 0 && d[year] != undefined) {return d[year]}})
        }
        if(countryData != undefined)
        {
          // set named function for color gradient
          var choropleth = d3.scale.linear()
            .domain([0, median, max])    
            .interpolate(d3.interpolateRgb)
            .range(["green", "white", "red"]);
          return choropleth(countryData);
        }
        else
        {
          return "#CACACA";
        }
      });
        
      }
      
    });


  });

// tooltip 
var tooltip = d3.select("#container").append("div").attr("class", "tooltip hidden");

// create basic mercator map
setup(width,height);

function setup(width,height){
  projection = d3.geo.mercator()
    .translate([(width/2), (height/2)])
    .scale( width / 2 / Math.PI);

  path = d3.geo.path().projection(projection);

  svg = d3.select("#container").append("svg")
      .attr("width", width)
      .attr("height", height)
      .call(zoom)
      .append("g");

  g = svg.append("g");

}

// load country data
d3.json("data/globalenergyuse-cleaned.json", function(error, data) {
  energydata = data;
  loadMapData();

});

// load map data
function loadMapData() {
  d3.json("data/world_data.json", function(error, world) {

    var countries = topojson.feature(world, world.objects.countries).features;

    topo = countries;
    draw(topo);
  });
}
var countriesSelection;
// draw function
function draw(topo) {

  // path for graticule if we wanted it
  // svg.append("path")
  //    .datum(graticule)
  //    .attr("class", "graticule")
  //    .attr("d", path);

  // create equator 
  g.append("path")
   .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
   .attr("class", "equator")
   .attr("d", path);


  country = g.selectAll(".country").data(topo);

  // outline countries and style as appropriate
  countriesSelection = country.enter().insert("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("id", function(d,i) { return d.id; })
      .attr("title", function(d,i) { return d.properties.name; })
      .style("stroke", "black")
      .style("stroke-width", 0.2)
      //.style("fill", "white")
      .style("fill", function(d, i)
      {
        // temporary basic choropleth scale - energy production
        index = 25;
        var countryName = d.properties.name;

        // TODO here is where we initially set the color, we'll also need a color update which can be done with a selectA;;
        var year = "1985";

        // search for data
        if (energydata[index].countries[countryName] != undefined)
        {
          var countryData = energydata[index].countries[countryName][year];
          //var min = d3.min(d3.values(energydata[index].countries), function(d) {if(d[year] != 0 && d[year] != undefined) {return d[year]}})
          var max = d3.max(d3.values(energydata[index].countries), function(d) {if(d[year] != 0 && d[year] != undefined) {return d[year]}})
        }
        if(countryData != undefined)
        {
          // set named function for color gradient
          var choropleth = d3.scale.linear()
            .domain([0, max])    
            .interpolate(d3.interpolateRgb)
            .range(["green", "red"]);
          return choropleth(countryData);
        }
        else
        {
          return "#CACACA";
        }
      });

  // offsets for tooltips
  var offsetL = document.getElementById('container').offsetLeft+20;
  var offsetT = document.getElementById('container').offsetTop+10;

  // handle mousemove events
  country
    .on("mousemove", function(d,i) {

      var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );

      tooltip.classed("hidden", false)
             .attr("style", "left:"+(mouse[0]+offsetL)+"px;top:"+(mouse[1]+offsetT)+"px")
             .html(d.properties.name);

      })
      .on("mouseout",  function(d,i) {
        tooltip.classed("hidden", true);
      })
      .on("click", function(d,i) {
        CreateGraph(d.properties.name, d.properties.name);
      });

  // Here to add more labels/overlays like station points
}


// update visual
function redraw() {
  width = document.getElementById('container').offsetWidth;
  height = width / 2;
  d3.select('svg').remove();
  setup(width,height);
  draw(topo);
}

// pan function
function move() {

  // zoom in 400% per tick
  var t = d3.event.translate;
  var s = d3.event.scale; 
  zscale = s;
  var h = height/4;

  // computer boarders for the zoomed pan
  t[0] = Math.min(
    (width/height)  * (s - 1), 
    Math.max( width * (1 - s), t[0] )
  );

  t[1] = Math.min(
    h * (s - 1) + h * s, 
    Math.max(height  * (1 - s) - h * s, t[1])
  );

  zoom.translate(t);
  g.attr("transform", "translate(" + t + ")scale(" + s + ")");

  //adjust the country hover stroke width based on zoom level
  d3.selectAll(".country").style("stroke-width", 0.2 / s);

}

// set zoom speed
var throttleTimer;
function throttle() {
  window.clearTimeout(throttleTimer);
    throttleTimer = window.setTimeout(function() {
      redraw();
    }, 200);
}

//tutorial 
jQuery(document).ready(function($) {
    CreateGraph('#chart1 svg');
    bootstro.start();
  })
// // on click, log the country data
// function click() {

//   CreateGraph("hi", "hit");
//   //var latlon = projection.invert(d3.mouse(this));
//   //console.log(latlon);
// }
