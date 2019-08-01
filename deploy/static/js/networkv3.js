var radius = 5;
var canvas = document.querySelector("canvas"),
    context = canvas.getContext("2d"),
    width = canvas.width,
    height = canvas.height;
const forceX = d3.forceX(width / 2).strength(0.1);
const forceY = d3.forceY(height / 2).strength(0.1);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function (d) {
        return d.id;
    }).distance(120))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force('x', forceX)
    .force('y', forceY);

var transform = d3.zoomIdentity;

d3.json("../static/assets/node_export_party_influence.json", function (error, graph) {
    if (error) throw error;

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function zoomed() {
        console.log("zooming");
        transform = d3.event.transform;
        ticked();
    }


    d3.select(canvas)
        .call(d3.drag()
            .container(canvas)
            .subject(dragsubject)
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .call(d3.zoom().scaleExtent([1 / 10, 8]).on("zoom", zoomed));

    function ticked() {
        context.save();
        context.clearRect(0, 0, width, height);
        context.translate(transform.x, transform.y);
        context.scale(transform.k, transform.k);

        context.beginPath();
        context.strokeStyle = "grey";
        graph.links.forEach(drawLink);
        context.stroke();


        graph.nodes.forEach(drawNode);

        // {#context.strokeStyle = "#fff";#}
        // {#context.stroke();#}
        context.restore();
    }

    function dragsubject() {
        var i,
            x = transform.invertX(d3.event.x),
            y = transform.invertY(d3.event.y),
            dx,
            dy;
        for (i = graph.nodes.length - 1; i >= 0; --i) {
            node = graph.nodes[i];
            dx = x - node.x;
            dy = y - node.y;

            if (dx * dx + dy * dy < radius * radius) {

                node.x = transform.applyX(node.x);
                node.y = transform.applyY(node.y);

                return node;
            }
        }
    }
});

function dragstarted() {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);
}

function dragged() {
    d3.event.subject.fx = transform.invertX(d3.event.x);
    d3.event.subject.fy = transform.invertY(d3.event.y);
}

function dragended() {
    if (!d3.event.active) simulation.alphaTarget(0);
    d3.event.subject.fx = null;
    d3.event.subject.fy = null;
}

function drawLink(d) {
    context.moveTo(d.source.x, d.source.y);
    context.lineTo(d.target.x, d.target.y);
    context.lineWidth = d.value / 15;

}

function drawNode(d) {
    context.beginPath();
    let radius = function (d) {
        return d.influence / 2 > 10 ? d.influence / 10 : 5;
    }
    let fill_color = function (d) {
        if (d.party_key === 2 || d.party_key === 3 || d.party_key === 6) {
            return "black"
        } else if (d.party_key === 1) {
            return "yellow"
        } else if (d.party_key === 0) {
            return "blue"
        } else if (d.party_key === 4) {
            return "green"
        } else
            return "red"
    };
    context.fillStyle = fill_color(d);
    // {# reference : #}
    // {# {"Workers' Party": 0,#}
    //     {#"Singapore People's Party": 1,#}
    //     {#'Presidential Office': 2,#}
    //     {#'NA': 3,#}
    //     {#'Barisan Sosialis': 4,#}
    //     {#"People's Action Party": 5,#}
    //     {#'Nominated Member of Parliament': 6}#}
    // {# #}

    context.moveTo(d.x + 15, d.y);
    context.arc(d.x, d.y, radius(d), 0, 2 * Math.PI);
    context.fill();
    context.fillText(d.name, d.x + radius(d) + 5, d.y);
    context.font = "12px Roboto";

}

function clicked() {
    var point = d3.mouse(this);
    var node;
    var minDistance = Infinity;
    var start = new Date();
    data.forEach(function (d) {
        var dx = d.x - point[0];
        var dy = d.y - point[1];
        var distance = Math.sqrt((dx * dx) + (dy * dy));
        // if (distance < d.r) {
        // if (distance < minDistance) {
        if (distance < minDistance && distance < d.r + 10) {
            // drawCircles(d);
            minDistance = distance;
            node = d;
        }
    });
    var end = new Date();
    console.log('Calc Time:', end - start);
    drawCircles(node);
}