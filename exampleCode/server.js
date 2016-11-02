var app = require('express')();
var http = require('http').Server(app);
var socket = require('socket.io')(http);

var fs = require('fs');
var path = require('path');

var connectionCount = 0;

app.get('/*', function(request, response){
    console.log('request starting...');

    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';
	
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

var setEventHandlers = function (socket) {
  // Socket.IO
  socket.on('connection', onSocketConnection(socket));
  
  socket.on('disconnect', onSocketDisconnect(socket));
}

socket.on('connection', function(socket) {
	connectionCount = connectionCount + 1;
	console.log('New player has connected', connectionCount)
	
	socket.emit('updateCount', {c: connectionCount});
	socket.broadcast.emit('updateCount', {c: connectionCount});
	// Listen for client disconnected
	
});

socket.on('disconnect', function(socket) {
	console.log('Player has disconnected');
	connectionCount = connectionCount - 1;
	//var count = {c: connectionCount};
	socket.emit('updateCount', {c: connectionCount});
	socket.broadcast.emit('updateCount', {c: connectionCount});
});

http.listen(31400, function(){
  console.log('listening on *:31400'); //changed from 31337 for testing purposes

});

// Put a friendly message on the terminal
console.log("Server running at http://127.0.0.1:31400/");
