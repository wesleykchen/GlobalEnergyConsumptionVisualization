d3.select(window).on("resize", throttle);

// setup zoom - how much zoom to allow
var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", move);

// scale width to browser window
var width = document.getElementById('container').offsetWidth;
var height = width / 2;

// variables needed in various functions
var topo, projection, path, svg, g;

// setup graticule
var graticule = d3.geo.graticule();

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
      .on("click", click)
      .append("g");

  g = svg.append("g");

}

// load country data
d3.json("data/globalenergyuse-cleaned.json", function(error, energydata) {

  console.log(energydata);
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

// draw function
function draw(topo) {

  // path for graticule
  svg.append("path")
     .datum(graticule)
     .attr("class", "graticule")
     .attr("d", path);

  // create equator 
  g.append("path")
   .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
   .attr("class", "equator")
   .attr("d", path);


  var country = g.selectAll(".country").data(topo);

  // outline countries and style as appropriate
  country.enter().insert("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("id", function(d,i) { return d.id; })
      .attr("title", function(d,i) { return d.properties.name; })
      .style("fill", "white")
      .style("stroke", "black")
      .style("stroke-width", 0.2);
      //.style("fill", function(d, i) { return d.properties.color; });

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

// on click, log the country data
function click() {
  var latlon = projection.invert(d3.mouse(this));
  console.log(latlon);
}
