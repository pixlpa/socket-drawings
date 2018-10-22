var io = require('socket.io-client');
var socket = io('http://localhost:5000');
const Max = require('max-api');

var friendfo = {
    x: 0, y: 0, name: 'Basic', active: false
};

socket.on('connect', ()=>{
    //print when connection to socket.io is successful
    console.log("connection: "+socket.connected);
});

socket.on('friend-data', (msg)=>{
    Max.outlet("friend-data",msg);
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
	console.log(count.toString()+" friendss online");
});