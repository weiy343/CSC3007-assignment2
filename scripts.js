async function fetchAllData(url) {
    let response = await fetch(url);
    let data = await response.json();
    latest = drawSelect(data.result.records);
    drawChart(data.result.records, latest);
}

function drawSelect(data) {
    years = Array.from(new Set(data.map(function (d) { return d.year; })));
    $.each(years.reverse(), function (i, v) {
        $("#yearSelector")
            .append($("<option></option>")
                .attr("value", v)
                .text(v));
    });
    return Math.max(...years);
}

function drawChart(data, year) {

    let filteredData = data.filter(function (d) { return +d.year == +year });

    var margin = { top: 20, right: 40, bottom: 100, left: 40 },
        width = $("#main").width() - margin.right - margin.left;
    height = 600 - margin.top - margin.bottom;

    var chart = d3.select("#chart")
        .append("svg")
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr(
          'viewBox',
          '0 0 ' +
            (width + margin.left + margin.right) +
            ' ' +
            (height + margin.top + margin.bottom)
        )
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Add scales
    var xScale = d3.scaleBand()
        .domain(filteredData.map(function (d) { return d.level_2; }))
        .range([0, width])
        .padding(0.1);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(filteredData, function (d) { return +d.value; })])
        .range([height, 0]);

    // Add x-axis
    chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate(-38)");

    // Add y-axis
    chart.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)
            .ticks(10));

    // create tooltip element  
    const tooltip = d3.select("body")
        .append("div")
        .attr("class", "d3-tooltip")
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .style("padding", "15px")
        .style("background", "rgba(0,0,0,0.6)")
        .style("border-radius", "5px")
        .style("color", "#fff")
        .text("a simple tooltip");

    // Draw
    chart.selectAll(".bar")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr('class', 'bar')
        .attr("x", function (d) { return xScale(d.level_2); })
        .attr("y", function (d) { return yScale(d.value); })
        .attr("width", function (d) { return xScale.bandwidth(); })
        .attr("height", function (d) { return height - yScale(d.value); })
        .on("mouseover", function (e, d) {
            console.log(d)
            tooltip.html(`${d.value}`).style("visibility", "visible");
            d3.select(this)
                .attr("fill", "orange");
        })
        .on("mousemove", function () {
            tooltip
                .style("top", (event.pageY - 10) + "px")
                .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function () {
            tooltip.html(``).style("visibility", "hidden");
            d3.select(this).attr("fill", "black");
        });

    $('#yearSelector').on('change', function () { update(this.value); });

    function update(year) {

        let filteredData = data.filter(function (d) { return +d.year == +year });

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(filteredData, function (d) { return +d.value; })])
            .range([height, 0]);

        // update the bars
        d3.selectAll(".bar")
            .data(filteredData)
            .transition().duration(1000)
            .attr("x", function (d) { return xScale(d.level_2); })
            .attr("y", function (d) { return yScale(d.value); })
            .attr("width", function (d) { return xScale.bandwidth(); })
            .attr("height", function (d) { return height - yScale(d.value); })

        // update y axis
        chart.select('.y.axis')
            .transition()
            .duration(1000)
            .call(d3.axisLeft(yScale)
                .ticks(10));
    }
}

var data_url = 'https://data.gov.sg/api/action/datastore_search?resource_id=83c21090-bd19-4b54-ab6b-d999c251edcf'
fetchAllData(data_url);