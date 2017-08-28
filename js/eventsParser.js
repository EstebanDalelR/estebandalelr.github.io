 var data = [{
  "events": [
    {
      "alt": "coding event",
      "src": "img/cd-icon-picture.svg",
      "title": "Other event",
      "desc": "some other thing happened",
      "date": "jul 2014"
    },
    {
      "alt": "love event",
      "src": "img/cd-icon-picture.svg",
      "title": "love event",
      "desc": "some other thing happened",
      "date": "jan 2014"
    }
  ]
}];


 var links = data[0].events;

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
  console.log(toadd);
   $('#cd-timeline').append(toadd);
 }
