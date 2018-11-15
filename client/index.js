var io = require('socket.io-client');
//set the URL to localhost:5000 if running the local server via CLI
var socket = io('https://fast-cove-47193.herokuapp.com/');
const Max = require('max-api');

var unique_name = "Basic";
var friendfo = {
    x: 0, y: 0, name: 'Basic', active: false
};

var friends = {};

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

socket.on('connect', ()=>{
    //print when connection to socket.io is successful
    console.log("connection: "+socket.connected);
});

socket.on('friend-data', (msg)=>{
	update_friend(msg.name, msg);
    Max.outlet("friend-data",friends);
});

socket.on('friend-list', (msg)=>{
	friendfilter(msg);
    Max.outlet("friend-data",friends);
});

socket.on('disconnect', ()=>{});

socket.on('name assignment',function(msg){
    unique_name = msg;
    friendfo.name = msg;
	console.log('OK, my name is '+unique_name);
});

socket.on('online_users',function(count){
	//$('#active_users').html("");
	console.log(count.toString()+" friends online");
});

Max.addHandlers({
    send: (x,y,active) =>{
        friendfo.x = x;
        friendfo.y = y;
        friendfo.active = active;
        sendfriend();
    } 
});