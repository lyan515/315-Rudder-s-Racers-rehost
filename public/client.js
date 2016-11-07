var count;
// var socket;

window.onload = function() {

        var game = new Phaser.Game(1280, 720, Phaser.AUTO, '', { preload: preload, create: create, update: update });

		var socket;
		var otherPlayers;
        var player;

		var angle = 0;
    	var cursors;
    	var speed = 400;
    	var turnSpeed = 0.05;
		var cooldown = 0;

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
			
			game.load.image('finish', 'finishline.png');
			
			otherPlayers = [];	//hold list of other players connected
			create();			//load all of the objects onto the screen
			
			//create soccket connection
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
			
			//finish line
			finish = game.add.sprite(3100, 16065, 'finish');
			finish.scale.setTo(0.25, .75);

	        // player
	        player = game.add.sprite(game.world.centerX, game.world.centerY, 'bluebike');
	        player.anchor.setTo(0.5, 0.5);
		    player.scale.setTo(0.5, 0.5);
		    player.x =  2900;
		    player.y = 16150;
			player.laps = 0;
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
		
		function speedup(){		//acceleration function
			if(speed < 700){	//max speed
				speed+= 5;
			}
		}
		
		var setEventHandlers = function() {					//set all of the callback functions for socket events
			socket.on('connect', onSocketConnected);		//new connection
			socket.on('newPlayer', onNewPlayer);			//new player
			socket.on('playerID', setPlayerId);				//send a new id to the new player
			socket.on('movePlayer', onMovePlayer);			//one of the players has moved
			socket.on('disconnect', onSocketDisconnect);	//player disconnected
			socket.on('removePlayer', onRemovePlayer);		//remove player from game
		}
		
		function onSocketConnected() {
			console.log('Connected to socket server');
			
			socket.emit('newPlayer', { x: player.x, y: player.y, angle: player.angle });	//send server info to create new player
	
		}

		function onSocketDisconnect () {
 			console.log('Disconnected from socket server');
		}
		
		function setPlayerId(data) {
			player.id = data.id;
			player.playerNum = data.playerNum;	//index in the servers player list
			player.x += (player.playerNum*35);	//set starting position based on how many people are connected
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
			otherPlayers.push(new OtherPlayer(data.id, game, player, data.playerNum, data.x, data.y, data.angle));	//create new player and put it into list of current players
			console.log(otherPlayers);	//debugging
		}
		
		function onMovePlayer (data) {
			var movePlayer = playerById(data.id);	//get the player that is currently being moved

		  // Player not found
			if (!movePlayer) {
				console.log('Player not found: ', data.id);
				return
			}

			// Update player position
			movePlayer.player.x = data.x;
			movePlayer.player.y = data.y;
			movePlayer.player.angle = data.angle;
			movePlayer.player.laps = data.laps;
			

		}
		
		function checkOverlap(spriteA, spriteB) {

			var boundsA = spriteA.getBounds();
			var boundsB = spriteB.getBounds();

			return Phaser.Rectangle.intersects(boundsA, boundsB);

		}
		
		function update() {
			// player movement
	        // reset the player's velocity
			player.body.velocity.x = 0;
	        player.body.velocity.y = 0;

	        if (cursors.up.isDown) {	//forward and backward movement
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

	        if (cursors.left.isDown) {			//left and right angled movement
	            if (cursors.down.isDown) {		//two buttons pressed simultaneously 
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
			
			//check for finish line
			if (checkOverlap(player, finish)&& cooldown < 0)
			{
				player.laps++;
				cooldown = 100;//resets cooldown to prevent multiple lap increments
			}
			cooldown--;//decrement cooldown
			game.debug.text("player laps: "+ player.laps + "/3", 32, 32);
	
	        // check for collisions
	        var hitObstacle = game.physics.arcade.collide(player, obstacles);
			var hitObstacle = game.physics.arcade.collide(player, obstacles);
			
			if(hitObstacle == true){
				speed = 0;
			}
			socket.emit('movePlayer', { x: player.x, y: player.y, angle: player.angle, laps: player.laps});
		}

		function onRemovePlayer (data) {					//remove player from client screen
			var removePlayer = playerById(data.id)

			// Player not found
			if (!removePlayer) {
			  	console.log('Player not found: ', data.id)
				return
			}
			
			//remove from screen
			removePlayer.player.kill();

			// Remove player from array
			otherPlayers.splice(otherPlayers.indexOf(removePlayer), 1);
		}

		function playerById (id) {								//returns player from given id
			for (var i = 0; i < otherPlayers.length; i++) {
				if (otherPlayers[i].player.id === id) {
					return otherPlayers[i];
				}
			}

			return false;
		}

    };
