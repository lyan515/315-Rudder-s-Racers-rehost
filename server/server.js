var express = require('express');
var app = express();
var http = require('http').Server(app);
var socket = require('socket.io')(http);

var Player = require('./player')

var fs = require('fs');
var path = require('path');

var PORT = 31337;					//we are 1337 h4x0r5

app.use(express.static('public'));
var players;

//mostly inspired by example code given to us on piazza
//returns requested files
app.get('/*', function(request, response){
    console.log('request starting...');

    var filePath = __dirname + '/..' +request.url;
    console.log("Path: " + filePath);
    if (filePath == __dirname)
        filePath = __dirname + '/../public/index.html';
    console.log("Path: " + filePath);
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;      
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    }

    fs.readFile(filePath, function(error, content) {
        if (error) {
            if(error.code == 'ENOENT'){
                fs.readFile('./404.html', function(error, content) {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                });
            }
            else {
                response.writeHead(500);
                response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
                response.end(); 
            }
        }
        else {
            response.writeHead(200, { 'Content-Type': contentType });
            response.end(content, 'utf-8');
        }
    });

});

//Some ideas on how to run a game server taken from:
//https://github.com/xicombd/phaser-multiplayer-game



http.listen(PORT, function(){	//start up the surver on current port
    console.log('listening on *:'+PORT);
    init();
});

function init() {	//initialize player list, socket, and event handlers
    players = [];
    socket.listen(http);
    
    setEventHandlers();
};

var setEventHandlers = function() {
    socket.sockets.on('connection', onSocketConnection);
};

function onSocketConnection(client) {

    client.on('newPlayer', onNewPlayer);//listen for new player
    client.on('movePlayer', onMovePlayer);//update a players location
    client.on('disconnect', onClientDisconnect);//a player disconnected
	client.on('gameWin', onGameWin);   
};

function onNewPlayer(data) {
	console.log('Player connected: ' + this.id);
    var newPlayer = new Player(data.x, data.y, data.angle);	//create the new player
    newPlayer.id = this.id;		//set the player id to the same as the socket id since it is unique enough for our purposes
	newPlayer.playerNum = players.length;	//set the players number to its new index
    
    this.emit('playerID', {id: newPlayer.id, playerNum: newPlayer.playerNum});		//send the new player id back to the player
    this.broadcast.emit('newPlayer', {id: newPlayer.id, playerNum: newPlayer.playerNum, x: newPlayer.getX(), y: newPlayer.getY(), angle: newPlayer.getAngle()});	//send the new players info to everyone else
		
    //send all of the currently connected players back to the new player
	var i, existingPlayer;
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i]
        this.emit('newPlayer', {id: existingPlayer.id, playerNum: newPlayer.playerNum, x: existingPlayer.getX(), y: existingPlayer.getY(), angle: existingPlayer.getAngle()});
    }
    
    players.push(newPlayer);	//insert new player into servers list of players
}

function onMovePlayer (data) {
    // Find player in array
    var movePlayer = playerById(this.id);

    // Player not found
    if (!movePlayer) {
        console.log('Player not found: ' + this.id);
        return;
    }
    
    // Update player position
    movePlayer.setX(data.x);
    movePlayer.setY(data.y);
    movePlayer.setAngle(data.angle);

    // Broadcast updated position to connected socket clients
    this.broadcast.emit('movePlayer', {id: movePlayer.id, x: movePlayer.getX(), y: movePlayer.getY(), angle: movePlayer.getAngle()});
}

function onGameWin (data) {

    // Broadcast updated position to connected socket clients
    this.broadcast.emit('gameFinish', {id: data.id});
}

function onClientDisconnect () {
  console.log('Player has disconnected: ' + this.id)

  var removePlayer = playerById(this.id)

  // Player not found
  if (!removePlayer) {
    console.log('Player not found: ' + this.id)
    return
  }

  // Remove player from players array
  players.splice(players.indexOf(removePlayer), 1)

  // Broadcast removed player to connected socket clients
  this.broadcast.emit('removePlayer', {id: this.id})
}

function playerById (id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id === id) {
          return players[i];
        }
    }

    return false;
}

// Put a friendly message on the terminal
console.log("Server running at http://compute.cse.tamu.edu:" + PORT);
