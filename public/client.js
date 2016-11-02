var count;
var socket;

window.onload = function() {

        //  Note that this html file is set to pull down Phaser 2.5.0 from the JS Delivr CDN.
        //  Although it will work fine with this tutorial, it's almost certainly not the most current version.
        //  Be sure to replace it with an updated version before you start experimenting with adding your own code.

        var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

		var socket;
		var otherPlayers;
        
		function preload () {

			game.load.image('logo', 'phaser.png');
			game.load.image('bluebike', 'bluebike.png');
			create();
        }
	
		var player;

        function create () {

            socket = io.connect({
				'reconnection': true,
				'reconnectionDelay': 1000,
				'reconnectionDelayMax': 5000});
				
			var logo = game.add.sprite(game.world.centerX, game.world.centerY, 'logo');
            logo.anchor.setTo(0.5, 0.5);
			player = game.add.sprite(game.world.centerX, game.world.centerY, 'bluebike');
			player.anchor.setTo(0.5, 0.5);
    	    player.scale.setTo(0.5, 0.5);
			
			otherPlayers = [];
			
			setEventHandlers();
			
        }
		
		var setEventHandlers = function() {
			socket.on('connect', onSocketConnected);
			
			socket.on('newPlayer', onNewPlayer);
			
			socket.on('movePlayer', onMovePlayer);
			socket.on('disconnect', onSocketDisconnect);
			socket.on('removePlayer', onRemovePlayer);
		}
		
		function onSocketConnected() {
			console.log('Connected to socket server');
			
			socket.emit('newPlayer', { x: player.x, y: player.y, angle: player.angle });
			socket.on('playerID', function(data) {player.id = data.id;});
		}

		function onSocketDisconnect () {
 			console.log('Disconnected from socket server')
		}
		
		function onNewPlayer (data) {
			console.log('New player connected:', data.id);

			// Avoid possible duplicate players
			var duplicate = playerById(data.id);
			if (duplicate) {
				console.log('Duplicate player!');
				return;
			}

			// Add new player to the remote players array
			otherPlayers.push(new OtherPlayer(data.id, game, player, data.x, data.y, data.angle));
			console.log(otherPlayers);
		}
		
		function onMovePlayer (data) {
			var movePlayer = playerById(data.id);

		  // Player not found
			if (!movePlayer) {
				console.log('Player not found: ', data.id);
				return
			}
			//console.log("moving " + this.id);
		  // Update player position
			movePlayer.player.x = data.x;
			movePlayer.player.y = data.y;
			movePlayer.player.angle = data.angle;

		}
		
		function update() {

    	    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
    	    {
				player.x -= 5;
				player.angle = 270;
    	    }
    	    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
    	    {
				player.x += 5;
				player.angle = 90;
    	    }

    	    if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
    	    {
				player.y -= 5;
				player.angle = 0;
    	    }
    	    else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
    	    {
				player.y += 5;
				player.angle = 180;
    	    }
			socket.emit('movePlayer', { x: player.x, y: player.y, angle: player.angle });
		}

		function onRemovePlayer (data) {
			var removePlayer = playerById(data.id)

			  // Player not found
			if (!removePlayer) {
			  	console.log('Player not found: ', data.id)
				return
			}

			removePlayer.player.kill()

			  // Remove player from array
			  otherPlayers.splice(otherPlayers.indexOf(removePlayer), 1)
		}

		function playerById (id) {
			for (var i = 0; i < otherPlayers.length; i++) {
				if (otherPlayers[i].player.id === id) {
					return otherPlayers[i];
				}
			}

			return false;
		}

    };

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



