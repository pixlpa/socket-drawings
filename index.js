var express = require('express');//use express to serve up the UI page
var app = express();
var http = require('http').Server(app);//Socket.IO uses a html server
var io = require('socket.io')(http);
var metal = require('metal-name');//generates fun heavy metal names

var port = process.env.PORT || 5000;

var online_users = [];

app.use(express.static(__dirname+'/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

//connection listener
io.on('connection', function (socket){
  socket.removeAllListeners();
  var new_username = metal();
  socket.metalname = new_username;
  online_users++;
  // give them their name and send user count
  socket.emit('name assignment', new_username);
  socket.emit('online_users', online_users);
  // create a list of friends (using their "metalname")
  let friend_list = [];
  io.sockets.clients((error,clients)=>{
    friend_list = [];
    if (error) throw error;
    for (let i = 0; i < clients.length; i++){
      //query each of the connected clients for their name
      friend_list[i] = io.sockets.connected[clients[i]].metalname;
    }
    //send the list
    io.emit("friend-list", friend_list);
  });

  //pass along all the incoming messages to everyone
  socket.on('friend-data',(msg)=>{
    socket.broadcast.emit('friend-data',msg);
  });

  //client disconnection handler
  socket.on('disconnect', function () {
    online_users--;
    console.log("user disconnected. Now there are "+online_users);
    let friend_list = [];
    io.sockets.clients((error,clients)=>{
      friend_list = [];
      if (error) throw error;
      for (let i = 0; i < clients.length; i++){
        friend_list[i] = io.sockets.connected[clients[i]].metalname;
      }
      io.emit("friend-list", friend_list);
    });
    io.emit('online_users',online_users);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});