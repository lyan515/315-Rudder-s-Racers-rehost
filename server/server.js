var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var Player = require('./player')

var fs = require('fs');
var path = require('path');

var connectionCount = 0;

app.use(express.static('public'));

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


//https://github.com/xicombd/phaser-multiplayer-game

var players;

http.listen(31337, function(){
    console.log('listening on *:31338'); //changed from 31337 for testing purposes
    init();
});

function init() {
    players = [];
    socket = io.listen(http);
    
    setEventHandlers();
};

var setEventHandlers = function() {
    socket.sockets.on('connection', onSocketConnection);
};

function onSocketConnection(client) {
    console.log('Player connected');
    
    client.on('newPlayer', onNewPlayer);
    client.on('movePlayer', onMovePlayer);
    client.on('disconnect', onClientDisconnect);
    
};

function onNewPlayer(data) {
    var newPlayer = new Player(data.x, data.y, data.angle);
    newPlayer.id = this.id;
    
    this.emit('playerID', {id: newPlayer.id});
    this.broadcast.emit('newPlayer', {id: newPlayer.id, x: newPlayer.getX(), y: newPlayer.getY(), angle: newPlayer.getAngle()});
    
    var i, existingPlayer;
    for (i = 0; i < players.length; i++) {
        existingPlayer = players[i]
        this.emit('newPlayer', {id: existingPlayer.id, x: existingPlayer.getX(), y: existingPlayer.getY(), angle: existingPlayer.getAngle()});
    }
    
    players.push(newPlayer);
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
console.log("Server running at http://127.0.0.1:31337/");