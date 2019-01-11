//Set up the canvas variables for drawing and interaction
let outcan = document.getElementById("outcanvas");
let outc = outcan.getContext("2d");
let ocw = outcan.width;
let och = outcan.height;

//this sets the drawing loop.
let time = window.setInterval(animate, 60);
let nameFlash = 0;

//prototype object for representing current state
let friend = {
	x: 0, y: 0, name: "FriendName", active: false
};

//the array of connected clients
let friends = {};


// drawing loop
function animate() {
	friender();
	if (friend.active) {
		outc.beginPath();
		outc.arc(friend.x * 640, friend.y * 640, 3, 0, Math.PI * 2.0);
		outc.fill();
	}

	nameFlash++;
	if (nameFlash > 3) {
		$("#incoming_scrop").html("…");
	}
}

// render friends onto canvas
function friender() {
	outc.fillStyle = "#888";
	Object.keys(friends).forEach(function (name) {
		if (friends[name].active) {
			outc.beginPath();
			outc.arc(friends[name].x * 640, friends[name].y * 640, 3, 0, Math.PI * 2.0);
			outc.fill();
		}
	});
	outc.fillStyle = "#00A";
}

// ------------socket stuff

/* Socket messages come in the form of an identifier followed by whatever data 
	is being sent. When setting up new messages, you need to make sure there are
	handlers in place on both the client and server side.
	*/
let socket = io();

// send current drawing state
function sendIt() {
	if (friend.name != "FriendName") {
	    socket.emit("friend-data", friend);
	}
}

//handler for receiving "friend-data" messages from socket
socket.on("friend-data", function (msg) {
	updateFriend(msg.name, msg);
	$("#incoming_scrop").html("Receiving " + msg.name);
	nameFlash = 0;
});

//handler for the initial socket connection
socket.on("connect", function () {
	console.log("connection: " + socket.connected);
});

//handler for receiving "name-assignment" messages from socket
socket.on("name-assignment", function (msg) {
	friend.name = msg;
	$("#my_name").html("We shall call you " + msg);
});

//handler for receiving "online-users messages from socket"
socket.on("online-users", function (count) {
	// $('#active_users').html("");
	$("#active_users").html(count.toString() + " friends online");
});

//handler for receiving "friend-list" messages from socket
socket.on("friend-list", (msg)=>{
	friendFilter(msg);
});

// ----friend management
function sendFriend() {
	socket.emit("friend-data", friend);
}

function friendFilter(masterList) {
	Object.keys(friends).forEach(function (name) {
		if (masterList.indexOf(name) === -1) {
			delete friends[name];
		}
	});
}

function updateFriend(name, msg) {
	friends[name] = msg;
};


// ----------bind the touch/click events
$(document).ready(function () {
	$("#outcanvas").on("mousedown", function (e) {
		e.originalEvent.preventDefault();
		ocw = outcan.scrollWidth;
		och = outcan.scrollHeight;
		friend.active = true;
		friend.x = e.pageX / ocw;
		friend.y = e.pageY / och;
		sendIt();
		$(document).on("mousemove", function (e) {
			friend.x = e.pageX / ocw;
			friend.y = e.pageY / och;
			sendIt();
		});
		$(document).on("mouseup", function (e) {
			$(document).unbind("mousemove");
			$(document).unbind("mouseup");
			friend.active = false;
			sendIt();
		});
	});

	$("#outcanvas").on("touchstart", function (e) {
		e.preventDefault();
		e.originalEvent.preventDefault();
		let ev = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
		ocw = outcan.scrollWidth;
		och = outcan.scrollHeight;
		friend.active = true;
		friend.x = ev.pageX / ocw;
		friend.y = ev.pageY / och;
		sendIt();
		$(document).on("touchmove", function (e) {
			e.preventDefault();
			e.originalEvent.preventDefault();
			let ev = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			friend.x = ev.pageX / ocw;
			friend.y = ev.pageY / och;
			sendIt();
		});
		$(document).on("touchend", function (e) {
			$(document).unbind("touchmove");
			$(document).unbind("touchend");
			friend.active = false;
			sendIt();
		});
	});
});
