var data = [];
$.getJSON("json/collage.json", function (jsondata) {

  data = jsondata;
  var links = data["pictures"];

  for (var key in links) {
    var toadd =  "<img src='"
   +links[key].src
   + "' alt= '"
   +links[key].alt
   +"'>"
    $('#photos').append(toadd);
  }

}

);
