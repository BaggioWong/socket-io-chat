var socket = io();  
    
var nickname = "";
$(document).ready(function(){
    bootbox.prompt("What's your nickname?", function(result) {
        nickname = result;

        //  show all users
        socket.emit("all users", nickname + "");    //  "" - msg not used anyway


        socket.emit("new user connects", nickname); // to show "{user} connected" message

    }); 

    //  evokes explicitly because of modal conflicts with focus function
    $('.bootbox').on('hidden.bs.modal', function() { 
        //  focus on the entry area right away
        $('#m').focus();
    });

    /**
     *  socket.emit hndlers
     */

    //  emit message when new user logs on
    socket.emit("new user", "");    //  "" - msg not used anyway

    //  handler for submitting form
    $('#chat-form').submit(function(event){
        //  emit chat message
        socket.emit('chat message', nickname + ": " + $('#m').val());

        //  append it in messages area
        $("#messages").append($("<li>").text("Me: " + $('#m').val()));

        //  clear field
        $('#m').val('');

        //  default return
        return false;
    });

    //  before the window closes
    $(window).bind("beforeunload", function() { 
        socket.emit("logs off", "");
        socket.emit("logs off all users", nickname);
        socket.emit("user disconnects", nickname);
    });

    var timer = null;

    //  when a user types / is idle
    $("#chat-form").on("keypress", function(){
        //  if the timer is set then user is typing
        if (timer) {
            socket.emit("user typing", nickname + " is typing...");
            clearTimeout(timer);
        }

        //  else set the timer to zero and fire event when 1500 seconds lapsed
        timer = setTimeout(function(){
            socket.emit("user not typing", "");
        }, 1500);
        
    });

    /**
     *  socket.on handlers
     */

    //  on receiving a chat message
    socket.on("chat message", function(msg){
        $("#messages").append($("<li>").text(msg));
    });

    //  when a new user logs on
    socket.on("new user", function(msg){
        $("#new-user").text(msg);
    });

    //  to show {user} connected message
    socket.on("new user connects", function(msg){
        var liNode = $("<li>");
        liNode.css("background-color", "white");
        liNode.css("text-align", "center");
        liNode.text(msg);
        $("#messages").append(liNode);
    });

    //  getting all users names
    socket.on("all users", function(msg){
        //   construct message
        var arrayLength = msg.length;
        var message = "";

        for (var i = 0; i < arrayLength; i++) {
            if (msg[i] == nickname)
                message += msg[i] + " (you)";
            else 
                message += msg[i];

            if (i != arrayLength - 1)
                message += ", ";
        }

        message += " online.";

        $("#all-users").text(message);
    })

    //  when a new user logs off
    socket.on("logs off", function(msg){
        $("#new-user").text(msg);
    });

    socket.on("logs off all users", function(msg){
        //   construct message
        var arrayLength = msg.length;
        var message = "";

        for (var i = 0; i < arrayLength; i++) {
            if (msg[i] == nickname)
                message += msg[i] + " (you)";
            else 
                message += msg[i];

            if (i != arrayLength - 1)
                message += ", ";
        }

        message += " online.";

        $("#all-users").text(message);
    });

    socket.on("user disconnects", function(msg){
        var liNode = $("<li>");
        liNode.css("background-color", "white");
        liNode.css("text-align", "center");
        liNode.text(msg);
        $("#messages").append(liNode);
    });

    //  when a user is typing
    socket.on("user typing", function(msg){
        $("#user-typing").text(msg);
    });

    //  when a user stops typing
    socket.on("user not typing", function(msg){
        $("#user-typing").text("");
    });
});