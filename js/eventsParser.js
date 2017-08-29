 var data = [{
  "events": [
    {
      "src": "img/check.svg",
      "title": "Competed in the 'Innovación con TIC' contest",
      "desc":  "A bianual competition where teams take a semester to design and implement a product<br>Runner up CAM team wit IoT project based on Arduino",
      "date": "Apr 2015"
    },
    {
      "src": "img/cpu.svg",
      "title": "Attended TEDx Las Aguas 2015",
      "desc":  "",
      "date": "Apr 2015"
    },
    {
      "src": "img/cpu.svg",
      "title": "Attended TEDx Bogotá 2014",
      "desc":  "",
      "date": "Dec 2014"
    },
    {
      "src": "img/cpu.svg",
      "title": "Participated in Startup Weekend Uniandes",
      "desc":  "First time in a hackathon, this helped me make sure I loved code",
      "date": "Sep 2014"
    },
    {
      "src": "img/layers.svg",
      "title": "Left Chemical Engineering and began Systems and Computer Engineering",
      "desc":  "Figured out that Chemical Engineering was not appropriate for me<br>Got accepted into Systems and Computer Engineering without switching universities",
      "date": "Jul 2014"
    },
    {
      "src": "img/cpu.svg",
      "title": "Attended Mark Zuckerberg's conference",
      "desc":  "Launch of Internet.org in Colombia",
      "date": "Jan 2014"
    },
    {
      "src": "img/layers.svg",
      "title": "Got accepted into Universidad de los Andes",
      "desc": "<a href='http://uniandes.edu.co/'>Universidad de los Andes</a> is the top University in Colombia <br>I began my studies in Chemical Engineering",
      "date": "Jul 2012"
    },
    {
      "src": "img/check.svg",
      "title": "Took the Tofl",
      "desc": "Scored 104/120, no prior training",
      "date": "Jul 2012"
    },
    {
      "src": "img/check.svg",
      "title": "Took the SATs",
      "desc": "Scored 1830/2400, no prior training",
      "date": "Jul 2012"
    },
    {
      "src": "img/check.svg",
      "title": "Got second place of my group in ICFES state exam",
      "desc": "In a group of 1000, no prior training <br> Took the Maths extra questions",
      "date": "Jun 2012"
    },
    {
      "src": "img/layers.svg",
      "title": "Graduated from Colegio San Carlos",
      "desc": "After some rough patches, I graduated",
      "date": "Jun 2012"
    },
    {
      "src": "img/file.svg",
      "title": "Played in the Senior Ultimate Team",
      "desc": "",
      "date": "2011-2012"
    },
    {
      "src": "img/file.svg",
      "title": "Participated in several Model UN events",
      "desc": "Was a delegate several times, press a few and logistics just a couple",
      "date": "2005-2009"
    },
    {
      "src": "img/layers.svg",
      "title": "Got accepted into Colegio San Carlos",
      "desc": "<a href='http://www.sancarlos.edu.co/'>Colegio San Carlos</a> is one of the top 10 schools in Colombia",
      "date": "Jun 2005"
    },
    {
      "src": "img/compass.svg",
      "title": "Left my hometown",
      "desc": "To get a better education, my mom took us to Bogota",
      "date": "2005"
    },
    {
      "src": "img/play.svg",
      "title": "My sister was born",
      "desc": "",
      "date": "1996"
    },
    {
      "src": "img/play.svg",
      "title": "I was born",
      "desc": "Welcome to the game of life in a small town called Yopal",
      "date": "jul 1994"
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

   $('#cd-timeline').append(toadd);
 }
