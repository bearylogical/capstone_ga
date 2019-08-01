// $( "#get-speech").on('click',function (e) {
//    $.get("/get_random_debate", function( data ) {
//   $( "#speech-left" )
//     .append(data.cleaned_join ) // John
// }, "json" );
// });
var temp;

$('body').scrollspy({target: "#mainNav", offset: 10});


window.onscroll = function() {myFunction()};

// Get the navbar
var navbar = document.getElementById("mainNav");

// Get the offset position of the navbar
var sticky = navbar.offsetTop;

// Add the sticky class to the navbar when you reach its scroll position. Remove "sticky" when you leave the scroll position
function myFunction() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
}

$("#mainNav a").on('click', function(event) {

  // Make sure this.hash has a value before overriding default behavior
  if (this.hash !== "") {

    // Prevent default anchor click behavior
    event.preventDefault();
    // Store hash
    var hash = this.hash;
    // Using jQuery's animate() method to add smooth page scroll
    // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
    $('html, body').animate({
      scrollTop: $(hash).offset().top
    }, 800, function(){
    // Add hash (#) to URL when done scrolling (default click behavior)
      window.location.hash = hash;
    });


  } // End if

});


$(document).ready(function(){
    summarize_1_min();
    get_random_article();
    summarize_speaker();
    summarize_party();
});

function summarize_1_min(){
    $("#btn-1-min-sum").click(function(){
        $.ajax({
        type: 'POST',
        url: '/summarize_all',
        data: JSON.stringify(temp),
        success: function(data) {
            console.log(data);
            $(".speech-right")
                .html('</br><b><span class="question">' +
                    'Question' + '</b></span>'
                    + data.question + '</br><b><span class="response">' +
                    'Responses' + '</b></span>'
                    + data.result);
        },
        contentType: "application/json",
        dataType: 'json'
    }).done(function (data) { });
    });
}

function summarize_speaker(){
    $("#btn-speaker-sum").click(function(){
        $.ajax({
        type: 'POST',
        url: '/summarize_speaker',
        data: JSON.stringify(temp),
        success: function(data) {
            $(".speech-right").empty();
            reply = data.result;
            console.log(reply);
            $.each(reply, function(key,value){
                if (value.entity === 'NA'){
                    $(".speech-right")
                .append('</br><b><span class="question">' +
                    'Question' + '</b></span>'
                    + value.summary);
                } else {
                    $(".speech-right")
                .append('</br><b><span class="person">' +
                    value.entity + '</b></span>'
                    + value.summary);
                }

            });
        },
        contentType: "application/json",
        dataType: 'json'
    }).done(function (data) { });
    });
}


function summarize_party() {
    $("#btn-party-sum").click(function () {
        $.ajax({
            type: 'POST',
            url: '/summarize_party',
            data: JSON.stringify(temp),
            success: function (data) {
                $(".speech-right").empty();
                reply = data.result;
                console.log(reply);
                $(".speech-right")
                    .append('</br><b><span class="question">' +
                        'Question' + '</b> </span>'
                        + reply.question);
                $.each(reply, function (key, value) {
                    if (key !== 'question' && value.length > 5) {
                        $(".speech-right")
                            .append('</br><b><span class="person">' +
                                key + ' </b></span>'
                                + value);
                    }
                });
            },
            contentType: "application/json",
            dataType: 'json'
        }).done(function (data) {
        });
    });
}

function get_random_article(){
    $("#btn-get-speech").click(function(){
        // $(this).css({
        //     'margin-top': '10%',
        // });
        window.location.href = '#summary';
        $(".options-btn").removeClass('d-none');


        // $(this).addClass('align-right');
        // $(".summary-section").css({
        //
        // });
        $.getJSON("/get_random_debate", function(data){
            $("#random-speech-src")
                .html("<b>Original URL: </b> <a href='" + data.src_url + "'" + "target='_blank' >" + 'Here' + '</a>');
            $("#random-speech-title")
                .html("<b>Document Title: </b>" + data.title +
                "</br><b>Sitting Date : </b>" + data.sitting_date);
            $("#random-speech")
                .html(data.article_text);

            $("#readingtime")
                .html("<b>" + data.read_time + " min read</b>");
            temp = data;
        }).done(function () {
                $.ajax({
                    type: 'POST',
                    url: '/get_recommendations',
                    data: JSON.stringify(temp),
                    success: function (data) {
                        $(".speech-right").empty();
                        $("#recommends")
                            .empty();
                        $("#recommends").removeClass('d-none');
                        $.each(data.result, function (key, value) {
                            $("#recommends").append(
                                '<div class ="card"><div class="card-body" id="' + value._id + '" ><p class="card-title">' + value.title + '</p><p class="card-text">'
                                + value.session_type + '</p><p class="card-text"><small class="text-muted">' + value.sitting_date + '</small></p><a href="/article/' + value._id + '" onclick="get_article(this.href);return false;" class="stretched-link">Go to Article</a></div></div>'
                            )
                        });
                    },
                    contentType: "application/json",
                    dataType: 'json'
                }).done(function (data) {
                });
            }
        );
    });
}

function get_article(url) {
    $.getJSON(url, function (data) {
        $("#random-speech-src")
            .html("<b>Original URL: </b> <a href='" + data.src_url + "'" + "target='_blank' >" + 'Here' + '</a>');
        $("#random-speech-title")
            .html("<b>Document Title: </b>" + data.title +
                "</br><b>Sitting Date : </b>" + data.sitting_date);
        $("#random-speech")
            .html(data.article_text);

            $("#readingtime")
                .html("<b>" + data.read_time + " min read</b>");
            temp = data;
    }).done(function () {
            $.ajax({
                type: 'POST',
                url: '/get_recommendations',
                data: JSON.stringify(temp),
                success: function (data) {
                    $(".speech-right").empty();
                    $("#recommends")
                        .empty();
                    $("#recommends").removeClass('d-none');
                    $.each(data.result, function (key, value) {
                        $("#recommends").append(
                            '<div class ="card"><div class="card-body" id="' + value._id + '" ><p id="recommender-title" class="card-title">' + value.title + '</p><p id="recommender-sessiontype" class="card-text">'
                            + value.session_type + '</p><p id="recommender-date" class="card-text"><small class="text-muted">' + value.sitting_date + '</small></p><a href="/article/' + value._id + '" onclick="get_article(this.href);return false;" class="stretched-link">Go to Article</a></div></div>'
                        )
                    });
                },
                contentType: "application/json",
                dataType: 'json'
            }).done(function (data) {
            });
        }
    );
}