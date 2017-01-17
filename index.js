//	initialize app as a function handler
var express = require("express");
var app = express();
var http = require("http").Server(app);

//	initialise new instance of socket.io with the http object
var io = require("socket.io")(http);

//	number of users
var usersCount = 0;		//	not 0!
var users = [];

//	define route handler to get called when website home is visited
app.get("/", function(req, res){ 
	res.sendFile(__dirname + "/index.html");
});

//	serving js and css files
app.use("/js", express.static(__dirname + "/js"));
app.use("/css", express.static(__dirname + "/css"));

// listen in on incoming connections
io.on("connection", function(socket){
	//	chat message event
	socket.on("chat message", function(msg){
		//	broadcast to everyone (except user)
		socket.broadcast.emit("chat message", msg);
	});

	//	new user logs on
	socket.on("new user", function(msg){
		++usersCount;

		var message = usersCount + " users";
		io.emit("new user", message);	//	number of users
	});

	//	show {user} connected message
	socket.on("new user connects", function(msg){
		socket.broadcast.emit("new user connects", msg + " has joined the convo.");
	});

	socket.on("all users", function(msg){
		var arrayLength = users.length;

		users[arrayLength++] = msg;

		io.emit("all users", users);	//	user names
	});	

	//	user logs off
	socket.on("logs off", function(msg){
		--usersCount;

		var message = usersCount + " users";
		socket.broadcast.emit("logs off", message);
	});

	socket.on("logs off all users", function(msg){
		//	get index of logged off user
		var loggedOffUserIndex = users.indexOf(msg);

		//	remove from array
		users.splice(loggedOffUserIndex, 1);

		io.emit("logs off all users", users);	//	user names
	});

	//	show {user} connected message
	socket.on("user disconnects", function(msg){
		socket.broadcast.emit("user disconnects", msg + " has left the convo");
	});

	//	user types
	socket.on("user typing", function(msg){
		socket.broadcast.emit("user typing", msg);
	});

	//	user not typing
	socket.on("user not typing", function(msg){
		socket.broadcast.emit("user not typing", msg);
	})

});



//	set http server to listen on port 3000
http.listen(3000, function() {
	console.log("listening on *: 3000");
});