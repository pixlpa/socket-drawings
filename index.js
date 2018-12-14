const express = require("express");// use express to serve up the UI page
const app = express();
const http = require("http").Server(app);// Socket.IO uses a html server
const io = require("socket.io")(http);
const metal = require("metal-name");// generates fun heavy metal names

const port = process.env.PORT || 5000;

let onlineUsers = [];

app.use(express.static(__dirname + "/public"));

// connection listener
io.on("connection", function (socket) {
	socket.removeAllListeners();
	let newUsername = metal();
	socket.metalname = newUsername;
	onlineUsers++;
	// give them their name and send user count
	socket.emit("name-assignment", newUsername);
	socket.emit("online-users", onlineUsers);
	// create a list of friends (using their "metalname")
	let friendList = [];
	io.sockets.clients((error, clients) => {
		friendList = [];
		if (error) throw error;
		for (let i = 0; i < clients.length; i++) {
			// query each of the connected clients for their name
			friendList[i] = io.sockets.connected[clients[i]].metalname;
		}
		// send the list
		io.emit("friend-list", friendList);
	});

	// pass along all the incoming messages to everyone
	socket.on("friend-data", (msg) => {
		socket.broadcast.emit("friend-data", msg);
	});

	// client disconnection handler
	socket.on("disconnect", function () {
		onlineUsers--;
		console.log("user disconnected. Now there are " + onlineUsers);
		let friendList = [];
		io.sockets.clients((error, clients) => {
			friendList = [];
			if (error) throw error;
			for (let i = 0; i < clients.length; i++) {
				friendList[i] = io.sockets.connected[clients[i]].metalname;
			}
			io.emit("friend-list", friendList);
		});
		io.emit("online-users", onlineUsers);
	});
});

http.listen(port, function () {
	console.log("listening on *:" + port);
});
