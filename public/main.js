var outcan = document.getElementById("outcanvas");
var outc = outcan.getContext('2d');
var ocw = outcan.width;
var och = outcan.height;

var time = window.setInterval(animate,60);
var friends = [];

var video = document.createElement('video');
var friendfo = {
    x: 0, y: 0, name: 'Basic', active: false
};

//function to update a friend
function update_friend(name,msg){
    var friendex = friends.findIndex(function(element) {return element.name == name;});
    if (friendex>=0) {
        friends[friendex] = msg;
    }
    else friends.push(msg);
}

//function to render friends

function friender() {
    for (ff = 0;ff < friends.length; ff++){
        if(friends[ff].active) outc.fillRect(friends[ff].x*640-3,friends[ff].y*640-3,6,6);
    }
}

//function to provide gestural feedback
function animate(){
    friender();
    if (friendfo.active == true){
        outc.fillRect(friendfo.x*640-3,friendfo.y*640-3,6,6);
    }
    sendit();
}

var sockImage = new Image();
var socket = io();

//socket stuff

function sendit(){
    if (friendfo.name != 'Basic'){
	    socket.emit('friend-data',friendfo);
    }
}

socket.on('friend-data', function(msg){
    update_friend(msg.name, msg);
	$('#incoming_scrop').html("Geolocating "+msg.name);
});

socket.on('connect',function(){
  console.log("connection: "+socket.connected);
});

socket.on('name assignment',function(msg){
	friendfo.name = msg;
	console.log('OK, my name is '+msg);
	$('#my_name').html("Your friend name is "+msg);
});

socket.on('online_users',function(count){
	//$('#active_users').html("");
	$('#active_users').html(count.toString()+" friends online");
});

//bind all the touch/click events
$(document).ready(function(){
$('#outcanvas').on("mousedown", function(e) {
    e.originalEvent.preventDefault();
    ocw = outcan.scrollWidth;
    och = outcan.scrollHeight;
    friendfo.active = true;
    friendfo.x = e.pageX/ocw;
    friendfo.y = e.pageY/och;
  $(document).on("mousemove",function(e){
    friendfo.x = e.pageX/ocw;
    friendfo.y = e.pageY/och;
  });
  $(document).on("mouseup", function(e){
	$(document).unbind("mousemove");
	$(document).unbind("mouseup");
	friendfo.active = false;
  });
});

$('#outcanvas').on("touchstart", function(e) {
  e.preventDefault();
  e.originalEvent.preventDefault();
  var ev = e.originalEvent.touches[0]|| e.originalEvent.changedTouches[0];
  ocw = outcan.scrollWidth;
  och = outcan.scrollHeight;
  friendfo.active = true;
  friendfo.x = ev.pageX/ocw;
  friendfo.y = ev.pageY/och;
  $(document).on("touchmove",function(e){
  	e.preventDefault();
  	e.originalEvent.preventDefault();
    var ev = e.originalEvent.touches[0]|| e.originalEvent.changedTouches[0];
    friendfo.x = ev.pageX/ocw;
    friendfo.y = ev.pageY/och;
  });
  $(document).on("touchend", function(e){
	$(document).unbind("touchmove");
	$(document).unbind("touchend");
	friendfo.active = false;
  });
});
});