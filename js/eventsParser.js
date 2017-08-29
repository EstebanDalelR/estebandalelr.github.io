var data = [];
$.getJSON("../json/eventosTimeline.json", function (jsondata) {

  data = jsondata;
  var links = data["events"];

  for (var key in links) {
    var toadd =  "<div class='cd-timeline-block'> <div class='cd-timeline-img'> <img src='"
   +links[key].src
   +"'"
   + " alt= '"
   +links[key].title
   +"'></div> <div class='cd-timeline-content'><h2>"
   +links[key].title
   +"</h2> <p>"
   +links[key].desc
   +"</p> <span class='cd-date'>"
   +links[key].date
   +"</span> </div>"

    $('#cd-timeline').append(toadd);
  }

}

);
