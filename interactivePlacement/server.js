var express = require('express');
var app = express();
var http = require('http').Server(app);
var socket = require('socket.io')(http);

var fs = require('fs');
var path = require('path');

var PORT = 32018;					//we are 1337 h4x0r5

app.use(express.static('interactivePlacement'));

//mostly inspired by example code given to us on piazza
//returns requested files
app.get('/*', function(request, response){
    console.log('request starting...');

    var filePath = __dirname + request.url;
    console.log("Path: " + filePath);
    if (filePath == __dirname)
        filePath = __dirname + '/../interactivePlacement/index.html';
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
        case '.txt':
            contentType = 'text/plain';
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
    socket.listen(http);
};

// Put a friendly message on the terminal
console.log("Server running at http://compute.cse.tamu.edu:" + PORT);
