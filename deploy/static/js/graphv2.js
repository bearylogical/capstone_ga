//Set margins and sizes
var margin = {
    top: 20,
    bottom: 50,
    right: 30,
    left: 50
};
var width = 960 - margin.left - margin.right;
var height = 700 - margin.top - margin.bottom;
//Load Color Scale
var c10 = d3.scale.category10();
//Create an SVG element and append it to the DOM
var svgElement = d3.select("#force")
    .append("svg").attr({"width": width + margin.left + margin.right, "height": height + margin.top + margin.bottom})
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//Load External Data
d3.json("../assets/node_export_influence.json", function (dataset) {
    //Extract data from dataset
    var nodes = dataset.nodes,
        links = dataset.links;
    //Create Force Layout
    var force = d3.layout.force()
        .size([width, height])
        .nodes(nodes)
        .links(links)
        .gravity(0.05)
        .charge(-200)
        .linkDistance(200);
    //Add links to SVG
    var link = svgElement.selectAll(".link")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke-width", function (d) {
            return d.value / 10;
        })
        .attr("class", "link");
    //Add nodes to SVG
    var node = svgElement.selectAll(".node")
        .data(nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(force.drag);
    //Add labels to each node
    var label = node.append("text")
        .attr("dx", 12)
        .attr("dy", "0.35em")
        .attr("font-size", function (d) {
            return d.influence * 1.5 > 9 ? d.influence * 1.5 : 9;
        })
        .text(function (d) {
            return d.name;
        });
    //Add circles to each node
    var circle = node.append("circle")
        .attr("r", function (d) {
            return d.influence / 2 > 5 ? d.influence / 2 : 5;
        })
        .attr("fill", 'white');
    //This function will be executed for every tick of force layout
    force.on("tick", function () {
        //Set X and Y of node
        node.attr("r", function (d) {
            return d.influence;
        })
            .attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });
        //Set X, Y of link
        link.attr("x1", function (d) {
            return d.source.x;
        });
        link.attr("y1", function (d) {
            return d.source.y;
        });
        link.attr("x2", function (d) {
            return d.target.x;
        });
        link.attr("y2", function (d) {
            return d.target.y;
        });
        //Shift node a little
        node.attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
    });
    //Start the force layout calculation
    force.start();
});