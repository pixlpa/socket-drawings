var outcan = document.getElementById("outcanvas");
var outc = outcan.getContext('2d');
var ocw = outcan.width;
var och = outcan.height;

var time = window.setInterval(animate,60);
var video = document.createElement('video');
var name_flash = 0;

var friendfo = {
    x: 0, y: 0, name: 'Basic', active: false
};

var friends = {};


//function to provide gestural feedback
function animate(){
    friender();
    if (friendfo.active == true){
        outc.beginPath();
        outc.arc(friendfo.x*640,friendfo.y*640, 3, 0, Math.PI*2.);
        outc.fill();
    }

    name_flash++;
    if (name_flash>3){
        $('#incoming_scrop').html("…");
    }
}

//----friend management
function sendfriend(){
	socket.emit('friend-data', friendfo);
}

function friendfilter(masterlist){
    for (var prop in friends){
        if ( friends.hasOwnProperty(prop) ) {
            if (masterlist.indexOf(prop) === -1 ){
                delete friends[prop];
            }
        }
    }
}

var update_friend = function(name,msg){
    friends[name] = msg;
}

//render friends onto canvas
function friender() {
    outc.fillStyle = '#888';
    for (var ff in friends){
        if ( friends.hasOwnProperty(ff) ){ 
            if(friends[ff].active) {
                outc.beginPath();
                outc.arc(friends[ff].x*640,friends[ff].y*640, 3, 0, Math.PI*2.);
                outc.fill();
            }
        }
    }
    outc.fillStyle = '#00A';
}

//------------socket stuff
var sockImage = new Image();
var socket = io();

function sendit(){
    if (friendfo.name != 'Basic'){
	    socket.emit('friend-data',friendfo);
    }
}

socket.on('friend-data', function(msg){
    update_friend(msg.name, msg);
    $('#incoming_scrop').html("Receiving "+msg.name);
    name_flash = 0;
});

socket.on('connect',function(){
  console.log("connection: "+socket.connected);
});

socket.on('name assignment',function(msg){
	friendfo.name = msg;
	console.log('OK, my name is '+msg);
	$('#my_name').html("We shall call you "+msg);
});

socket.on('online_users',function(count){
	//$('#active_users').html("");
	$('#active_users').html(count.toString()+" friends online");
});

socket.on('friend-list', (msg)=>{
	friendfilter(msg);
});

//----------bind the touch/click events
$(document).ready(function(){
$('#outcanvas').on("mousedown", function(e) {
    e.originalEvent.preventDefault();
    ocw = outcan.scrollWidth;
    och = outcan.scrollHeight;
    friendfo.active = true;
    friendfo.x = e.pageX/ocw;
    friendfo.y = e.pageY/och;
    sendit();
  $(document).on("mousemove",function(e){
    friendfo.x = e.pageX/ocw;
    friendfo.y = e.pageY/och;
    sendit();
  });
  $(document).on("mouseup", function(e){
	$(document).unbind("mousemove");
	$(document).unbind("mouseup");
    friendfo.active = false;
    sendit();
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
  sendit();
  $(document).on("touchmove",function(e){
  	e.preventDefault();
  	e.originalEvent.preventDefault();
    var ev = e.originalEvent.touches[0]|| e.originalEvent.changedTouches[0];
    friendfo.x = ev.pageX/ocw;
    friendfo.y = ev.pageY/och;
    sendit();
  });
  $(document).on("touchend", function(e){
	$(document).unbind("touchmove");
	$(document).unbind("touchend");
    friendfo.active = false;
    sendit();
  });
});
});