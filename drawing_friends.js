const io = require("socket.io-client");
// set the URL to localhost:5000 if running the local server via CLI
const socket = io("https://fast-cove-47193.herokuapp.com/");
// TODO you should be able to change this from Max
// const socket = io('http://localhost:5000');
const maxApi = require("max-api");

let uniqueName = "Basic";
let friendfo = {
	x: 0, y: 0, name: "Basic", active: false
};

let friends = {};

function sendFriend() {
	socket.emit("friend-data", friendfo);
}

function friendfilter(masterlist) {
	for (var prop in friends) {
		if ( friends.hasOwnProperty(prop) ) {
			if (masterlist.indexOf(prop) === -1 ) {
				delete friends[prop];
			}
		}
	}
}

function updateFriend(name, msg) {
	friends[name] = msg;
}

socket.on("connect", ()=>{
	// print when connection to socket.io is successful
	console.log("connection: " + socket.connected);
});

socket.on("friend-data", (msg)=>{
	updateFriend(msg.name, msg);
	maxApi.outlet("friend-data", friends);
});

socket.on("friend-list", (msg)=>{
	friendfilter(msg);
	maxApi.outlet("friend-data", friends);
});

socket.on("disconnect", ()=>{});

socket.on("name assignment", function (msg) {
	uniqueName = msg;
	friendfo.name = msg;
	console.log("OK, my name is " + uniqueName);
});

socket.on("online_users", function (count) {
	// $('#active_users').html("");
	console.log(count.toString() + " friends online");
});

maxApi.addHandlers({
	send: (x, y, active) =>{
		friendfo.x = x;
		friendfo.y = y;
		friendfo.active = active;
		sendFriend();
	}
});
