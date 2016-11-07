var count;
// var socket;

window.onload = function() {

        //  Note that this html file is set to pull down Phaser 2.5.0 from the JS Delivr CDN.
        //  Although it will work fine with this tutorial, it's almost certainly not the most current version.
        //  Be sure to replace it with an updated version before you start experimenting with adding your own code.

        var game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update });

		var socket;
		var otherPlayers;
        var player;

		var angle = 0;
    	var cursors;
    	var speed = 400;
    	var turnSpeed = 0.05;

    	var obstacles;
		function preload () {

			game.load.image('logo', 'phaser.png');
			game.load.image('bluebike', 'bluebike.png');
			game.load.image('trashCan', 'trashCan.png');
			// total map size: 7680 x 6694
			game.load.image('mapTL', 'campusCircuit_TL.png');
			game.load.image('mapTR', 'campusCircuit_TR.png');
			game.load.image('mapBL', 'campusCircuit_BL.png');
			game.load.image('mapBR', 'campusCircuit_BR.png');
			otherPlayers = [];
			create();
			
			socket = io.connect({
				'reconnection': true,
				'reconnectionDelay': 1000,
				'reconnectionDelayMax': 5000});
			setEventHandlers();
        }
	
		

        function create () {

            
			// enable Arcade Physics system
	        game.physics.startSystem(Phaser.Physics.ARCADE);

	        // set world size
	        game.world.setBounds(0, 0, 23040, 20082);

	        // background (map)
	        var map = game.add.sprite(0, 0, 'mapTL');
	        map.anchor.setTo(0, 0);
	        map.scale.setTo(3, 3);
	        map = game.add.sprite(game.world.width / 2, 0, 'mapTR');
	        map.anchor.setTo(0, 0);
	        map.scale.setTo(3, 3);
	        map = game.add.sprite(0, game.world.height / 2, 'mapBL');
	        map.anchor.setTo(0, 0);
	        map.scale.setTo(3, 3);
	        map = game.add.sprite(game.world.width / 2, game.world.height / 2, 'mapBR');
	        map.anchor.setTo(0, 0);
	        map.scale.setTo(3, 3);

	        // player
	        player = game.add.sprite(game.world.centerX, game.world.centerY, 'bluebike');
	        player.anchor.setTo(0.5, 0.5);
		    player.scale.setTo(0.5, 0.5);
		    player.x =  2900;
		    player.y = 16150;
	        // player.enableBody = true;
	        game.physics.arcade.enable(player);
	        player.body.collideWorldBounds = true;

	        // set up obstacles
	        obstacles = game.add.group();
	        obstacles.enableBody = true;
	        var staticObstacle = obstacles.create(600, 400, 'trashCan');
	        staticObstacle.body.immovable = true;

	        // set up camera size
	        game.camera.width = 1280;
	        game.camera.height = 720;

	        // controls
	        cursors = game.input.keyboard.createCursorKeys();

        }

        function toDegrees (angle) {
        	return angle * (180 / Math.PI);
	    }
		
		function speedup(){
			if(speed < 700){
				speed+= 5;
			}
		}
		
		var setEventHandlers = function() {
			socket.on('connect', onSocketConnected);
			
			socket.on('newPlayer', onNewPlayer);
			
			socket.on('movePlayer', onMovePlayer);
			socket.on('disconnect', onSocketDisconnect);
			socket.on('removePlayer', onRemovePlayer);
			socket.on('playerID', function(data) {
				player.id = data.id;
				player.playerNum = data.playerNum;
				player.x += (player.playerNum*35); 
			});
		}
		
		function onSocketConnected() {
			console.log('Connected to socket server');
			
			socket.emit('newPlayer', { x: player.x, y: player.y, angle: player.angle });
	
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
			if (player.id == data.id){
				return;
			}
			// Add new player to the remote players array
			otherPlayers.push(new OtherPlayer(data.id, game, player, data.playerNum, data.x, data.y, data.angle));
			console.log(otherPlayers);
		}
		
		function onMovePlayer (data) {
			var movePlayer = playerById(data.id);

		  // Player not found
			if (!movePlayer) {
				console.log('Player not found: ', data.id);
				return
			}

			// Update player position
			movePlayer.player.x = data.x;
			movePlayer.player.y = data.y;
			movePlayer.player.angle = data.angle;

		}
		
		function update() {
			// player movement
	        // reset the player's velocity
	        player.body.velocity.x = 0;
	        player.body.velocity.y = 0;

	        if (cursors.up.isDown) {
				speedup();
	            player.body.velocity.x = (speed * Math.sin(angle));
	            player.body.velocity.y = (-speed * Math.cos(angle));
	        }
	        else if (cursors.down.isDown) {
	            speedup();
				player.body.velocity.x = (-speed * 0.5 * Math.sin(angle));
	            player.body.velocity.y = (speed * 0.5 * Math.cos(angle));
	        }
			else{
				speed = 0;
			}

	        if (cursors.left.isDown) {
	            if (cursors.down.isDown) {
	                angle -= turnSpeed * 0.5;
	            }
	            else if (cursors.up.isDown) {
	                angle -= turnSpeed;
	            }
	            player.angle = toDegrees(angle);
	        }
	        else if (cursors.right.isDown) {
	            if (cursors.down.isDown) {
	                angle += turnSpeed * 0.5;
	            }
	            else if (cursors.up.isDown) {
	                angle += turnSpeed;
	            }
	            player.angle = toDegrees(angle);
	        }

	        // update camera position
	        game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.5, 0.5);

	        // check for collisions
	        var hitObstacle = game.physics.arcade.collide(player, obstacles);
			
			if(hitObstacle == true){
				speed = 0;
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

// function create () {
	// socket = io.connect();
	// setEventHandlers();
	
// }

// var setEventHandlers = function () {
  // Socket connection successful
  // socket.on('connect', onSocketConnected);
  // socket.on('updateCount', onUpdateCount);
  // Socket disconnection
  // socket.on('disconnect', onSocketDisconnect);
// }

// function onSocketConnected () {
	// console.log('Connected to socket server');
	// socket.emit('connection');
// }

// function onUpdateCount (data) {
	// count = data.c;
	// console.log(count, "Players are connected");
// }

// function onSocketDisconnect () {
  // console.log('Disconnected from socket server');
  // socket.emit('disconnect');
// }



