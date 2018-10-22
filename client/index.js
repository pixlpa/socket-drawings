var io = require('socket.io-client');
var socket = io('http://localhost:5000');
const Max = require('max-api');

var friendfo = {
    x: 0, y: 0, name: 'Basic', active: false
};

var friends = [];

var update_friend = function(name,msg){
    var friendex = friends.findIndex(function(element) {return element.name == name;});
    if (friendex>=0) {
        friends[friendex] = msg;
    }
    else friends.push(msg);
}

socket.on('connect', ()=>{
    //print when connection to socket.io is successful
    console.log("connection: "+socket.connected);
});

socket.on('friend-data', (msg)=>{
	update_friend(msg.name, msg);
    Max.outlet("friend-data",friends);
});
socket.on('disconnect', ()=>{});

function sendfriend(){
	socket.emit('friend-data', friendfo);
}

socket.on('name assignment',function(msg){
	unique_name = msg;
	console.log('OK, my name is '+unique_name);
});

socket.on('online_users',function(count){
	//$('#active_users').html("");
	console.log(count.toString()+" friends online");
});