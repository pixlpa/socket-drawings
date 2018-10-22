var express = require('express')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var metal = require('metal-name');

var port = process.env.PORT || 5000;
var online_users = 0;

app.use(express.static(__dirname+'/public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function (socket){
  socket.removeAllListeners();
  var new_username = metal();
  online_users++;
  // give them their name and send user count
  socket.emit('name assignment', new_username);
  socket.emit('online_users', online_users);

  socket.on('friend-data',(msg)=>{
    //console.log(`Received scrop from ${msg.username}`);
    socket.broadcast.emit('friend-data',msg);
  });

  socket.on('disconnect', function () {
    online_users--;
    io.emit('online_users',online_users);
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});