var chart;
function CreateGraph(index, name1, name2) {

  d3.select('#chart1 svg').empty()

  name2 = "United States";
if (showing){

  var template = [
  {
    "key" : name1 + " Energy Production" ,
    "bar": true,
    "values" : []
  },
  {
    "key" : name2 + " Energy Production" ,
    "values" : []
  }

  ].map(function(series) {
    series.values = series.values.map(function(d) { return {x: d[0], y: d[1] } });
    return series;
  });

  var firstserieskeys = d3.keys(energydata[0].countries[name1]);
  var firstseriesvalues = d3.values(energydata[0].countries[name1])
  template[0].values = [];
  for (var i = 0; i < firstserieskeys.length; ++i)
  {
     template[0].values[i] = {}
     template[0].values[i]["x"] = firstserieskeys[i];
     template[0].values[i]["y"] = firstseriesvalues[i];
  }

  var secondserieskeys = d3.keys(energydata[index].countries[name2]);
  var secondseriesvalues = d3.values(energydata[index].countries[name2])
  template[1].values = [];
  for (var i = 0; i < secondserieskeys.length; ++i)
  {
     template[1].values[i] = {}
     template[1].values[i]["x"] = secondserieskeys[i];
     template[1].values[i]["y"] = secondseriesvalues[i];
  }

  d3.select('#chart1 svg')
    .datum(template)
   .transition().duration(1000).call(chart);

  nv.utils.windowResize(chart.update);
}
else{
  var template = [
  {
    "key" : name1 + " Energy Production" ,
    "bar": true,
    "values" : []
  },
  {
    "key" : name2 + " Energy Production" ,
    "values" : []
  }

  ].map(function(series) {
    series.values = series.values.map(function(d) { return {x: d[0], y: d[1] } });
    return series;
  });

  var firstserieskeys = d3.keys(energydata[index].countries[name1]);
  var firstseriesvalues = d3.values(energydata[index].countries[name1])
  template[0].values = [];
  for (var i = 0; i < firstserieskeys.length; ++i)
  {
     template[0].values[i] = {}
     template[0].values[i]["x"] = firstserieskeys[i];
     template[0].values[i]["y"] = firstseriesvalues[i];
  }

  var secondserieskeys = d3.keys(energydata[0].countries[name2]);
  var secondseriesvalues = d3.values(energydata[0].countries[name2])
  template[1].values = [];
  for (var i = 0; i < secondserieskeys.length; ++i)
  {
     template[1].values[i] = {}
     template[1].values[i]["x"] = secondserieskeys[i];
     template[1].values[i]["y"] = secondseriesvalues[i];
  }


  nv.addGraph(function() {
      chart = nv.models.linePlusBarChart()
          .margin({top: 40, right: 60, bottom: 100, left: 70})
          .x(function(d,i) { return d.x })
          //.y(function(d,i) { return d.y})
          .color(d3.scale.category10().range());

      // chart.xAxis.tickFormat(function(d) {
      //   var dx = template[0].values[d] && template[0].values[d].x || 0;
      //   dx = (parseInt(dx) + 1).toString();
      //   return dx ? d3.time.format('%Y')(new Date(dx)) : '';
      //   })
      //   .showMaxMin(true);

      chart.y1Axis
          .tickFormat(d3.format(',f'));

      chart.y2Axis
          .tickFormat(d3.format(',f'));
          //.tickFormat(function(d) { return '%' + d3.format(',.2f')(d) });

      chart.bars.forceY([0]).padData(false);
      //chart.lines.forceY([0]);

      d3.select('#chart1 svg')
          .datum(template)
        .transition().duration(1000).call(chart);

      nv.utils.windowResize(chart.update);

      chart.dispatch.on('stateChange', function(e) { nv.log('New State:', JSON.stringify(e)); });

      return chart;
    });

    // flag for update instead of adding graph
    showing = true;
  }
}

function updateGraph(name1){
    
    d3.select('#chart1 svg')
        .datum(template)
      .transition().duration(1000).call(chart);

    nv.utils.windowResize(chart.update);
}
