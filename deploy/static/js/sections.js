/**
 * scrollVis - encapsulates
 * all the code for the visualization
 * using reusable charts pattern:
 * http://bost.ocks.org/mike/chart/
 */


var scrollVis = function () {
    // constants to define the size
    // and margins of the vis area.
    var width = 600;
    var height = 520;
    var margin = {
        top: 0,
        left: 100,
        bottom: 80,
        right: 10
    };

    var parseBBTime = d3.timeParse("%e/%m/%y");
    var parseSpeechYear = d3.timeParse("%Y");

    var parlData = [];

    // Keep track of which visualization
    // we are on and which was the last
    // index activated. When user scrolls
    // quickly, we want to call all the
    // activate functions that they pass.
    var lastIndex = -1;
    var activeIndex = 0;

    // main svg used for visualization
    var svg = null;

    // d3 selection that will be used
    // for displaying visualizations
    var g = null;

    // We will set the domain when the
    // data is processed.
    // @v4 using new scale names
    var xBarScale = d3.scaleLinear()
        .range([0, width]);

    // The bar chart display is horizontal
    // so we can use an ordinal scale
    // to get width and y locations.
    // @v4 using new scale type
    var yBarScale = d3.scaleBand()
        .paddingInner(0.08)
        .domain([0, 1, 2])
        .range([0, height - 50], 0.1, 0.1);

    // We will set the domain when the
    // data is processed.
    // @v4 using new scale names
    var xBBTScale = d3.scaleUtc();

    // The bar chart display is horizontal
    // so we can use an ordinal scale
    // to get width and y locations.
    // @v4 using new scale type
    var yBBTScale = d3.scaleLinear();

    // Color is determined just by the index of the bars
    var barColors = {
        0: '#008080',
        1: '#399785',
        2: '#5AAF8C'
    };

    // The histogram display shows the
    // first 30 minutes of data
    // so the range goes from 0 to 30
    // @v4 using new scale name
    var xHistScale = d3.scaleBand()
        .rangeRound([0, width])
        .paddingInner(0.05);

    // @v4 using new scale name
    var yHistScale = d3.scaleLinear()
        .range([height + margin.top, 100]);

    // The color translation uses this
    // scale to convert the progress
    // through the section into a
    // color value.
    // @v4 using new scale name


    // You could probably get fancy and
    // use just one axis, modifying the
    // scale, but I will use two separate
    // ones to keep things easy.
    // @v4 using new axis name
    var xAxisBar = d3.axisBottom()
        .scale(xBarScale);

    // @v4 using new axis name
    var xAxisHist = d3.axisBottom()
        .scale(xHistScale)
        .tickFormat(d3.timeFormat("%Y"));

    var yAxisHist = d3.axisLeft(yHistScale);

    var xAxisBBT = d3.axisBottom(xBBTScale).ticks(width / 50).tickSizeOuter(0);

    var yAxisBBT = d3.axisLeft(yBBTScale);


    // When scrolling to a new section
    // the activation function for that
    // section is called.
    var activateFunctions = [];
    // If a section has an update function
    // then it is called while scrolling
    // through the section with the current
    // progress through the section.
    var updateFunctions = [];

    /**
     * chart
     *
     * @param selection - the current d3 selection(s)
     *  to draw the visualization in. For this
     *  example, we will be drawing it in #vis
     */
    var chart = function (selection) {
        selection.each(function (bbdata) {


            // create svg and give it a width and height
            svg = d3.select(this).selectAll('svg').data([bbdata]);
            var svgE = svg.enter().append('svg');
            // @v4 use merge to combine enter and existing selection
            svg = svg.merge(svgE);

            svg.attr('width', width + margin.left + margin.right);
            svg.attr('height', height + margin.top + margin.bottom);

            svg.append('g');

            // with the separate accessor function
            // console.log('parlData', parlData);

            // this group element will be used to contain all
            // other elements.
            g = svg.select('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

            //set bbtea scale domain
            xBBTScale.domain(d3.extent(bbdata, d => parseBBTime(d.Week)))
                .range([0, width]);

            yBBTScale.domain([0, 100]).nice()
                .range([height + margin.top, 100]);


            // set the bar scale's domain
            // var countMax = d3.max(fillerCounts, function (d) { return d.value;});
            // xBarScale.domain([0, countMax]);

            // get aggregated histogram data

            // var histData = getHistogram(fillerWords);
            // set histogram's domain
            var histMax = d3.max(parlData, function (d) {
                return d.mins;
            });
            // console.log('histmax',histMax);
            yHistScale.domain([0, histMax]);
            xHistScale.domain(parlData.map(function (d) {
                return parseSpeechYear(d.year);
            }));
            setupVis(bbdata, parlData);

            setupSections();
        });
    };


    /**
     * setupVis - creates initial elements for all
     * sections of the visualization.
     *
     * @param wordData - data object for each word.
     * @param fillerCounts - nested data that includes
     *  element for each filler word type.
     * @param histData - binned histogram data
     */
    var setupVis = function (bbdata, parldata) {
        // axis
        g.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxisBBT);
        g.select('.x.axis').style('opacity', 0);

        g.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(margin.left,' + height + ')')
            .call(yAxisBBT);
        g.select('.y.axis').style('opacity', 0);

        // count openvis title
        g.append('text')
            .attr('class', 'title openvis-title')
            .attr('x', width / 2)
            .attr('y', height / 3)
            .text('The Story');

        g.append('text')
            .attr('class', 'sub-title openvis-title')
            .attr('x', width / 2)
            .attr('y', (height / 3) + (height / 7))
            .text('How did we get here?');

        g.selectAll('.openvis-title')
            .attr('opacity', 0);

        // count bbtea title
        var dataNest = d3.nest()
            .key(function (d) {
                return d.category;
            })
            .entries(bbdata);

        var trendKeys = ['Parliamentary Searches',
            'Bubble Tea Searches'
        ];

        console.log(dataNest);
        var bbtcolor = d3.scaleOrdinal(d3.schemeCategory10);
        var legendcolor = d3.scaleOrdinal(d3.schemeCategory10)

        var bbtline = d3.line()
            .x(function (d) {
                return xBBTScale(parseBBTime(d.Week));
            })
            .y(function (d) {
                return yBBTScale(d.value);
            });

        var bbtchart = g.selectAll('.bbt-section').data([bbdata]);

        dataNest.forEach(function (d) {
            bbtchart.enter()
                .append('path')
                .attr('class', 'bbt-section')
                .style("stroke", function () { // Add dynamically
                    return d.color = bbtcolor(d.key);
                })
                .attr("d", bbtline(d.values))
                .style("stroke-width", 2)
                .attr('fill', "none");

        });
        // text label for the x axis
        g.append("text")
            .attr('class', 'bbt-section')
            .attr("transform",
                "translate(" + (width / 2) + " ," +
                (height + 40) + ")")
            .style("text-anchor", "middle")
            .text("Date");
        // text label for the y axis
        g.append("text")
            .attr('class', 'bbt-section')
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - 50)
            .attr("x", 0 - (height / 2) - 40)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Google Trends Index");

        g.append("text")
            .attr('class', 'chart-title bbt-section')
            .attr("x", 30)
            .attr("y", 90)
            .attr("dy", "1em")
            .text("Parliamentary Interest Over Time");

        g.append("text")
            .attr('class', 'chart-subtitle bbt-section')
            .attr("x", 30)
            .attr("y", 120)
            .style("fill", "#767678")
            .attr("dy", "1em")
            .text("Generally speaking, search queries related to parliamentary debates aren't that popular.");

        var size = 20;

        bbtchart.data(trendKeys)
            .enter()
            .append("rect")
            .attr('class', 'bbt-section')
            .attr("x", 30)
            .attr("y", function (d, i) {
                return 150 + i * (size + 5)
            }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", size)
            .attr("height", size)
            .style("fill", function (d) {
                return legendcolor(d)
            });

        bbtchart.data(trendKeys)
            .enter()
            .append("text")
            .attr('class', 'labels bbt-section')
            .attr("x", 30 + size * 1.2)
            .attr("y", function (d, i) {
                return 150 + i * (size + 5) + (size / 2)
            }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("dy", "0.35em")
            .style("font-size", "0.75em")
            .style("fill", "black")
            .text(function (d) {
                return d
            })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");


        g.append("text")
            .attr('class', 'bbt-section')
            .attr("x", 0)
            .attr("y", height + 30)
            .style("fill", "#767678")
            .style("font-size", "0.5em")
            .attr("dy", "1em")
            .text("Source: Google Trends");

        g.selectAll('.bbt-section')
            .attr('opacity', 0);

        // count parley image
        g.append('image')
            .attr('xlink:href', '../static/images/parley.png')
            .attr('class', 'parley-image')
            .attr('x', 50)
            .attr('y', 0)
            .attr('width', 500)
            .attr('height', 500);

        g.selectAll('.parley-image')
            .attr('opacity', 0);


        // meet fp

        // count openvis title
        g.append('text')
            .attr('class', 'title fp-title')
            .style('font-size', '4em')
            .attr('x', width / 2)
            .attr('y', height / 3)
            .text('FastParliament');

        g.append('text')
            .attr('class', 'sub-title fp-title')
            .style('font-size', '2em')
            .attr('x', width / 2)
            .attr('y', (height / 3) + (height / 7))
            .text('Getting information, Faster');

        g.selectAll('.fp-title')
            .attr('opacity', 0);

        // historgram/chart

        var hist = g.selectAll(".hist").data(parldata);
        hist.enter().append("rect")
            .attr("class", "hist")
            .attr("x", function (d) {
                return xHistScale(parseSpeechYear(d.year));
            })
            .attr("y", function (d) {
                return yHistScale(d.mins);
            })
            .attr("height", function (d) {
                return height - yHistScale(d.mins);
            })
            .attr("width", xHistScale.bandwidth())
            .attr("fill", barColors[0])
            .attr("opacity", 0);

        g.append('text')
            .attr('class', 'sub-title hist')
            .attr("transform", "rotate(-90)")
            .attr("x", -100)
            .attr("dy", "1em")
            .style("text-anchor", "end")
            .style("font-size", "0.5em")
            .style("fill", "black")
            .text("Speech Length (mins)")
            .attr("opacity", 0);


        //second problem

        g.append('svg:image')
            .attr('xlink:href', '../static/images/speech.png')
            .attr('class', 'problem-two')
            .attr('x', 50)
            .attr('y', 0)
            .attr('width', 500)
            .attr('height', 500);

        g.append('rect')
            .attr('class', 'problem-two')
            .attr('x', 50)
            .attr('y', 130)
            .attr('width', 300)
            .attr('height', 150)
            .style('stroke-width', 4)
            .style('stroke', '#1F77B4')
            .style('fill', 'none');

        g.append('text')
            .attr('class', 'problem-two')
            .style('font-size', '2em')
            .attr('x', 375)
            .attr('y', 205)
            .text('Meta Data?');


        g.selectAll('.problem-two')
            .attr('opacity', 0);

        //third problem

        g.append('svg:image')
            .attr('xlink:href', '../static/images/networks.png')
            .attr('class', 'problem-three')
            .attr('x', 50)
            .attr('y', 0)
            .attr('width', 500)
            .attr('height', 500);

        g.append('text')
            .attr('class', 'problem-three')
            .style('font-size', '3em')
            .attr('x', 370)
            .attr('y', 90)
            .text('Network');

        g.append('text')
            .attr('class', 'problem-three')
            .style('font-size', '3em')
            .attr('x', 375)
            .attr('y', 140)
            .text('Analysis');

        g.selectAll('.problem-three')
            .attr('opacity', 0);
    };

    /**
     * setupSections - each section is activated
     * by a separate function. Here we associate
     * these functions to the sections based on
     * the section's index.
     *
     */
    var setupSections = function () {
        // activateFunctions are called each
        // time the active section changes
        activateFunctions[0] = showStartTitle;
        activateFunctions[1] = showBBT;
        activateFunctions[2] = showParleyImage;
        activateFunctions[3] = showFPTitle;
        activateFunctions[4] = showProblemOne;
        activateFunctions[5] = showProblemTwo;
        activateFunctions[6] = showProblemThree;
        activateFunctions[7] = hideAll;

        // updateFunctions are called while
        // in a particular section to update
        // the scroll progress in that section.
        // Most sections do not need to be updated
        // for all scrolling and so are set to
        // no-op functions.
        for (var i = 0; i < 8; i++) {
            updateFunctions[i] = function () {
            };
        }
        // updateFunctions[8] = updateCough;
    };

    /**
     * ACTIVATE FUNCTIONS
     *
     * These will be called their
     * section is scrolled to.
     *
     * General pattern is to ensure
     * all content for the current section
     * is transitioned in, while hiding
     * the content for the previous section
     * as well as the next section (as the
     * user may be scrolling up or down).
     *
     */

    /**
     * showTitle - initial title
     *
     * hides: count title
     * (no previous step to hide)
     * shows: intro title
     *
     */
    function showStartTitle() {
        hideYAxis();
        hideXAxis();
        g.selectAll('.bbt-section')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.openvis-title')
            .transition()
            .duration(600)
            .attr('opacity', 1.0);
    }

    /**
     * showTitle - initial title
     *
     * hides: count title
     * (no previous step to hide)
     * shows: intro title
     *
     */
    function showBBT() {

        showXAxis(xAxisBBT);
        showYAxis(yAxisBBT);
        g.selectAll('.openvis-title')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.bbt-section')
            .transition()
            .duration(600)
            .attr('opacity', 1.0);

        g.selectAll('.parley-image')
            .transition()
            .duration(0)
            .attr('opacity', 0);
    }

    /**
     * showFillerTitle - filler counts
     *
     * hides: intro title
     * hides: square grid
     * shows: filler count title
     *
     */
    function showParleyImage() {
        hideYAxis();
        hideXAxis();
        g.selectAll('.bbt-section')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.parley-image')
            .transition()
            .duration(600)
            .attr('opacity', 1.0);

        g.selectAll('.fp-title')
            .transition()
            .duration(0)
            .attr('opacity', 0);
    }

    function showFPTitle() {
        hideXAxis();
        hideYAxis();
        g.selectAll('.parley-image')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.fp-title')
            .transition()
            .duration(600)
            .attr('opacity', 1.0);

        g.selectAll(".hist")
            .transition()
            .duration(600)
            .attr("height", 0)
            .attr("y", height)
            .style("opacity", 0);

        g.selectAll('.problem-one')
            .transition()
            .duration(0)
            .attr('opacity', 0);
    }

    function showProblemOne() {
        showXAxis(xAxisHist);
        showYAxis(yAxisHist);

        g.selectAll('.fp-title')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll(".hist")
            .transition("color")
            .duration(500)
            .style("fill", "#008080");

        g.selectAll(".hist")
            .transition()
            .duration(1200)
            .attr("y", function (d) {
                return yHistScale(d.mins);
            })
            .attr("height", function (d) {
                return height - yHistScale(d.mins);
            })
            .style("opacity", 1);

        g.selectAll('.problem-one')
            .transition()
            .duration(600)
            .attr('opacity', 1.0);

        g.selectAll('.problem-two')
            .transition()
            .duration(0)
            .attr('opacity', 0);
    }

    function showProblemTwo() {
        hideXAxis();
        hideYAxis();

        g.selectAll(".hist")
            .transition()
            .duration(600)
            .attr("height", 0)
            .attr("y", height)
            .style("opacity", 0);


        g.selectAll('.problem-one')
            .transition()
            .duration(0)
            .attr('opacity', 0);


        g.selectAll('.problem-two')
            .transition()
            .duration(1000)
            .attr('opacity', 1.0);

        g.selectAll('.problem-three')
            .transition()
            .duration(0)
            .attr('opacity', 0);
    }

    function showProblemThree() {
        g.selectAll('.problem-two')
            .transition()
            .duration(0)
            .attr('opacity', 0);

        g.selectAll('.problem-three')
            .transition()
            .duration(600)
            .attr('opacity', 1.0);


    }

    function hideAll() {
        g.selectAll('.problem-three')
            .transition()
            .duration(0)
            .attr('opacity', 0);
    }

    /**
     * showAxis - helper function to
     * display particular xAxis
     *
     * @param axis - the axis to show
     *  (xAxisHist or xAxisBar)
     */
    function showXAxis(axis) {
        g.select('.x.axis')
            .call(axis)
            .transition().duration(500)
            .style('opacity', 1);
    }

    /**
     * hideAxis - helper function
     * to hide the axis
     *
     */
    function hideXAxis() {
        g.select('.x.axis')
            .transition().duration(500)
            .style('opacity', 0);
    }

    function showYAxis(axis) {
        g.select('.y.axis')
            .call(axis)
            .transition().duration(500)
            .style('opacity', 1);
    }

    /**
     * hideAxis - helper function
     * to hide the axis
     *
     */
    function hideYAxis() {
        g.select('.y.axis')
            .transition().duration(500)
            .style('opacity', 0);
    }

    /**
     * UPDATE FUNCTIONS
     *
     * These will be called within a section
     * as the user scrolls through it.
     *
     * We use an immediate transition to
     * update visual elements based on
     * how far the user has scrolled
     *
     */

    /**
     * updateCough - increase/decrease
     * cough text and color
     *
     * @param progress - 0.0 - 1.0 -
     *  how far user has scrolled in section
     */
    // function updateCough(progress) {
    //   g.selectAll('.cough')
    //     .transition()
    //     .duration(0)
    //     .attr('opacity', progress);

    //   g.selectAll('.hist')
    //     .transition('cough')
    //     .duration(0)
    //     .style('fill', function (d) {
    //       return (d.x0 >= 14) ? coughColorScale(progress) : '#008080';
    //     });
    // }

    /**
     * DATA FUNCTIONS
     *
     * Used to coerce the data into the
     * formats we need to visualize
     *
     */


    /**
     * getHistogram - use d3's histogram layout
     * to generate histogram bins for our word data
     *
     * @param data - word data. we use filler words
     *  from getFillerWords
     */
    // function getHistogram(data) {
    //   // only get words from the first 30 minutes
    //   var thirtyMins = data.filter(function (d) { return d.min < 30; });
    //   // bin data into 2 minutes chuncks
    //   // from 0 - 31 minutes
    //   // @v4 The d3.histogram() produces a significantly different
    //   // data structure then the old d3.layout.histogram().
    //   // Take a look at this block:
    //   // https://bl.ocks.org/mbostock/3048450
    //   // to inform how you use it. Its different!
    //   return d3.histogram()
    //     .thresholds(xHistScale.ticks(10))
    //     .value(function (d) { return d.min; })(thirtyMins);
    // }


    /**
     * activate -
     *
     * @param index - index of the activated section
     */
    chart.activate = function (index) {
        activeIndex = index;
        var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
        var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
        scrolledSections.forEach(function (i) {
            activateFunctions[i]();
        });
        lastIndex = activeIndex;
    };

    /**
     * setParlData -
     * this setter can be more complicated - and can even take in
     * more then one data set - but we can start with just this
     * to minimize changes in the code.
     * @param other - array of some other data you want to use
     */
    chart.setParlData = function (parl_data) {
        parlData = parl_data;
    };
    /**
     * update
     *
     * @param index
     * @param progress
     */
    chart.update = function (index, progress) {
        updateFunctions[index](progress);
    };

    // return chart function
    return chart;
};

/**
 * DATA FUNCTIONS
 *
 * Used to coerce the data into the
 * formats we need to visualize
 *
 */


/**
 * display - called once data
 * has been loaded.
 * sets up the scroller and
 * displays the visualization.
 *
 * @param data - loaded tsv data
 */
function display(data, parl_data) {
    // create a new plot and
    // display it
    var plot = scrollVis();

    // additional datasets
    plot.setParlData(parl_data);

    d3.select('#vis')
        .datum(data)
        .call(plot);


    // setup scroll functionality
    var scroll = scroller()
        .container(d3.select('#graphic'));

    // pass in .step selection as the steps
    scroll(d3.selectAll('.step'));

    // setup event handling
    scroll.on('active', function (index) {
        // highlight current step text
        d3.selectAll('.step')
            .style('opacity', function (d, i) {
                return i === index ? 1 : 0.1;
            });

        // activate current section
        plot.activate(index);
    });

    scroll.on('progress', function (index, progress) {
        plot.update(index, progress);
    });
}

// load data and display
d3.queue()
    .defer(d3.csv, '../static/assets/bbt.csv')
    .defer(d3.csv, '../static/assets/speech.csv')
    .await(function (error, bbt, speech) {
        if (error) throw error;

        display(bbt, speech);
    });