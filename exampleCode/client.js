var count;
var socket;

function create () {
	socket = io.connect();
	setEventHandlers();
	
}

var setEventHandlers = function () {
  // Socket connection successful
  socket.on('connect', onSocketConnected);
  socket.on('updateCount', onUpdateCount);
  // Socket disconnection
  socket.on('disconnect', onSocketDisconnect);
}

function onSocketConnected () {
	console.log('Connected to socket server');
	socket.emit('connection');
}

function onUpdateCount (data) {
	count = data.c;
	console.log(count, "Players are connected");
}

function onSocketDisconnect () {
  console.log('Disconnected from socket server');
  socket.emit('disconnect');
}

create();