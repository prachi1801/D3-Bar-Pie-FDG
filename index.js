


var thickness = 40;
var duration = 750;
var padding = 10;
var opacity = .8;
var opacityHover = 1;
var otherOpacityOnHover = .8;

var currentKey = "Wind Speed"
var map = {}
var chart = "bar"

function createMap()
{
  map["Wind Speed"] = {"variable" : "wind", "labelX" : "Wind Speed in km/h", "binCount" : 10, "isRange" : true}
  map["Temperature"] = {"variable" : "temp", "labelX" : "Temperature in celcius", "binCount" : 10, "isRange" : true}
  map["FFMC"] = {"variable" : "FFMC", "labelX" : "FFMC Index", "binCount" : 4, "isRange" : true}
  map["DMC"] = {"variable" : "DMC", "labelX" : "DMC Index", "binCount" : 10, "isRange" : true}
  map["DC"] = {"variable" : "DC", "labelX" : "DC Index", "binCount" : 10, "isRange" : true}
  map["Relative Humidity"] = {"variable" : "RH", "labelX" : "Relative Humidity in percentage", "binCount" : 10, "isRange" : true}
  map["ISI"] = {"variable" : "ISI", "labelX" : "ISI Index", "binCount" : 4, "isRange" : true}
  map["Month"] = {"variable" : "month", "labelX" : "Month, Jan(1) - Dec(12))", "binCount" : 12, "isRange" : false}
  map["Day"] = {"variable" : "day", "labelX" : "Day of the week, Mon(1) - Sun(7)", "binCount" : 7, "isRange" : false}
  map["Burned Area"] = {"variable" : "area", "labelX" : "Burned Area in ha", "binCount" : 4, "isRange" : true}
}

createMap()
var wid = 800;
var ht = 500;
var svg = d3.select("svg"),
    margin = 200,
    width = wid - margin,
    height = ht - margin;

var x;
var y;
var g;




    var csv;

    d3.csv("fires.csv", function(error, datafile) {
      if (error) console.log(error);

      csv = datafile


      if(chart == "bar")
      {
        createBarChart()
      }
      else {
        createPieChart()
      }

    })

    function createBarChart()
    {
      var variable = map[currentKey]["variable"]
      var labelX = map[currentKey]["labelX"]
      var binCount = map[currentKey]["binCount"]
      var isRange = map[currentKey]["isRange"]


      data = binData(variable, binCount, isRange)


      x = d3.scaleBand().range([0, width]).padding(0.4);
      y = d3.scaleLinear().range([height, 0]);

      var color = d3.scaleOrdinal(d3.schemeCategory10);

      g = svg.append("g")
              .attr("transform", "translate(" + 100 + "," + 100 + ")");


      x.domain(data.map(function(d) { return d.key; }));
      y.domain([0, d3.max(data, function(d) { return d.value; })]);

      g.append("g")
       .attr("transform", "translate(0," + height + ")")
       .call(d3.axisBottom(x))
       .append("text")
       .attr("y", height - 250)
       .attr("x", width - 250)
       .attr("text-anchor", "end")
       .attr("stroke", "black")
       .text(labelX);

      g.append("g")
       .call(d3.axisLeft(y).tickFormat(function(d){
           return  d;
       }).ticks(10))
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("x", -100)
       .attr("dy", "-5.1em")
       .attr("text-anchor", "end")
       .attr("stroke", "black")
       .text("No. of occurrences");


       g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .on("mouseover", onMouseOver)
        .on("mouseout", onMouseOut)
        .on("click", reRenderPieChart)
        .attr("fill", function(d, i) { return color(i); })
        .attr("x", function(d) { return x(d.key); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x.bandwidth())
        .transition()
        .ease(d3.easeLinear)
        .duration(400)
        .delay(function (d, i) {
            return i * 50;
        })
        .attr("height", function(d) { return height - y(d.value); });
    }


    function onMouseOver(d, i) {
        d3.select(this).attr('class', 'highlight');
        d3.select(this)
          .transition()
          .duration(400)
          .attr('width', x.bandwidth() + 5)
          .attr("y", function(d) { return y(d.value) - 10; })
          .attr("height", function(d) { return height - y(d.value) + 10; });

        g.append("text")
         .attr('class', 'val')
         .attr('x', function() {
             return x(d.key);
         })
         .attr('y', function() {
             return y(d.value) - 15;
         })
         .text(function() {
             return [+d.value];
         });
    }

    function onMouseOut(d, i) {
        d3.select(this).attr('class', 'bar');
        d3.select(this)
          .transition()
          .duration(400)
          .attr('width', x.bandwidth())
          .attr("y", function(d) { return y(d.value); })
          .attr("height", function(d) { return height - y(d.value); });

        d3.selectAll('.val')
          .remove()
    }


    function createPieChart()
    {
      var variable = map[currentKey]["variable"]
      var labelX = map[currentKey]["labelX"]
      var binCount = map[currentKey]["binCount"]
      var isRange = map[currentKey]["isRange"]

      data = binData(variable, binCount, isRange)

      svg.append("text")
      .attr("transform", "translate(300,0)")
      .attr("x", -300)
      .attr("y", 450)
      .attr("font-size", "15px")
      .attr("stroke", "black")
      .text(labelX)

      g = svg.attr("width", wid)
              .attr("height", ht)
              .append("g")
              .attr("transform", "translate(" + wid / 2 + "," + ht / 2 + ")");

      var radius = (Math.min(wid, ht) / 2) - 40;
      var color = d3.scaleOrdinal(d3.schemeCategory10);

      var arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

      var pie = d3.pie()
      .value(function(d) { return d.value; })
      .sort(null);

      var path = g.selectAll("path")
        .data(pie(data))
          .enter().append("path")
            .attr("fill", function(d, i) { return color(i); })
            .attr("d", arc)
            .style('opacity', opacity)
            .style('stroke', 'white')
            .on("click", reRenderBar)
            .on("mouseout", onPieMouseOut)
            .on("mouseover", onPieMouseOver)
    }

    function onPieMouseOver(d, i)
    {
      d3.selectAll('path')
        .style("opacity", otherOpacityOnHover);
      d3.select(this)
        .style("opacity", opacityHover);

        g.append("text")
          .attr("class", "val")
          .text(`${d.data.key}, ${d.data.value} occurrences`)
          .attr('text-anchor', 'middle');

    }

    function onPieMouseOut(d)
    {
      d3.selectAll('.val')
        .remove()
    }



    d3.select('#filter').on('change', function(a) {

      var newKey = d3.select(this).property('value');
      updateChart(newKey);
    });

    function updateChart(newKey)
    {
      if(currentKey != newKey)
      {
        currentKey = newKey
        d3.select("#binslider").value = map[currentKey]["binCount"]


        if(chart == "bar")
        {
          reRenderBar()
        }
        else {
          reRenderPieChart()
        }

      }
    }

    function reRenderBar()
    {
      chart = "bar"
      svg.selectAll("*").remove();
      createBarChart()
    }

    function reRenderPieChart()
    {
      chart = "pie"
      svg.selectAll("*").remove();
      createPieChart()
    }


    function binData(variable, binCount, isRange)
    {
      var values = new Array(csv.length);

      for( var i = 0; i < csv.length; i++)
      {
        values[i] = +csv[i][variable]

      }

      var arr = new Array(binCount)
      var keys = new Array(binCount);
      var binSize =  (d3.max(values) + 1 - d3.min(values)) / binCount

      for(var i = 0; i < binCount; i++)
      {
        arr[i] = 0;
      }

      for(var i = 0; i < values.length; i++)
      {

        arr[Math.floor((values[i] - d3.min(values))/binSize)]++
      }

      var data = new Array(binCount)

      for(var i = 0; i < binCount; i++)
      {
        var obj = {}
        if(!isRange)
        {
          obj["key"]  = "" + (i+1)
        }
        else {
          var st = i * binSize
          keys[i] = parseFloat(st.toFixed(2)) + "-" + parseFloat((st+binSize).toFixed(2));
          obj["key"]  = keys[i]
        }

        obj["value"] = arr[i]
        data[i] = obj
      }


      return data
    }


    d3.select("#binslider").on("change", function() {

      var binValue = this.value;

      map[currentKey]["binCount"] = binValue;
      if(chart == "bar")
      {
        reRenderBar()
      }
      else {
        reRenderPieChart()
      }

    });
