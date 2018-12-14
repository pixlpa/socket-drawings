let outcan = document.getElementById("outcanvas");
let outc = outcan.getContext("2d");
let ocw = outcan.width;
let och = outcan.height;

let time = window.setInterval(animate, 60);
let video = document.createElement("video");
let nameFlash = 0;

let friend = {
	x: 0, y: 0, name: "Basic", active: false
};

let friends = {};


// function to provide gestural feedback
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
let sockImage = new Image();
let socket = io();

function sendIt() {
	if (friend.name != "Basic") {
	    socket.emit("friend-data", friend);
	}
}

socket.on("friend-data", function (msg) {
	updateFriend(msg.name, msg);
	$("#incoming_scrop").html("Receiving " + msg.name);
	nameFlash = 0;
});

socket.on("connect", function () {
	console.log("connection: " + socket.connected);
});

socket.on("name-assignment", function (msg) {
	friend.name = msg;
	console.log("OK, my name is " + msg);
	$("#my_name").html("We shall call you " + msg);
});

socket.on("online-users", function (count) {
	// $('#active_users').html("");
	$("#active_users").html(count.toString() + " friends online");
});

socket.on("friend-list", (msg)=>{
	friendFilter(msg);
});

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
