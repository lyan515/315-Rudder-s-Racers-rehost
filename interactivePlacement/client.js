window.onload = function() {

		var WORLDWIDTH = 23040;
    	var WORLDHEIGHT = 20082;
    	var WINDOWHEIGHT = 900;
    	var SCALEFACTOR = 3;

    	var CAMERASCROLLSPEED = 10;
    	var CAMERAZOOMSPEED = 0.1;

        var game = new Phaser.Game(WINDOWHEIGHT * (WORLDWIDTH / WORLDHEIGHT), WINDOWHEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update});
        var graphics;

		var socket;

    	var obstacles = [];
    	var boundaries = [];
    	var powerUps = [];

    	var cursors;
    	var leftClicked = false;
    	var rightClicked = false;

		function preload () {

			game.load.image('obstacle', 'trashCan.png');
			// total map size: 7680 x 6694
			game.load.image('mapTL', 'campusCircuit_TL.png');
			game.load.image('mapTR', 'campusCircuit_TR.png');
			game.load.image('mapBL', 'campusCircuit_BL.png');
			game.load.image('mapBR', 'campusCircuit_BR.png');
			
			//create soccket connection
			socket = io.connect({
				'reconnection': true,
				'reconnectionDelay': 1000,
				'reconnectionDelayMax': 5000});
        }
	
        function create () {
	        // set world size
	        game.world.setBounds(0, 0, WINDOWHEIGHT * (WORLDWIDTH / WORLDHEIGHT), WINDOWHEIGHT);

	        // background (map)
	        var mapTL = game.add.sprite(0, 0, 'mapTL');
	        mapTL.anchor.setTo(0, 0);
	        mapTL.scale.setTo(WINDOWHEIGHT / (WORLDHEIGHT / SCALEFACTOR), WINDOWHEIGHT / (WORLDHEIGHT / SCALEFACTOR));
	        var mapTR = game.add.sprite(game.world.width / 2, 0, 'mapTR');
	        mapTR.anchor.setTo(0, 0);
	        mapTR.scale.setTo(WINDOWHEIGHT / (WORLDHEIGHT / SCALEFACTOR), WINDOWHEIGHT / (WORLDHEIGHT / SCALEFACTOR));
	        var mapBL = game.add.sprite(0, game.world.height / 2, 'mapBL');
	        mapBL.anchor.setTo(0, 0);
	        mapBL.scale.setTo(WINDOWHEIGHT / (WORLDHEIGHT / SCALEFACTOR), WINDOWHEIGHT / (WORLDHEIGHT / SCALEFACTOR));
	        var mapBR = game.add.sprite(game.world.width / 2, game.world.height / 2, 'mapBR');
	        mapBR.anchor.setTo(0, 0);
	        mapBR.scale.setTo(WINDOWHEIGHT / (WORLDHEIGHT / SCALEFACTOR), WINDOWHEIGHT / (WORLDHEIGHT / SCALEFACTOR));

	        // create graphics object
        	graphics = game.add.graphics(0, 0);
        	graphics.lineStyle(4, 0xff0000, 1);

	        // controls
	        cursors = game.input.keyboard.createCursorKeys();
	        game.input.mouse.mouseWheelCallback = mouseWheel;

	        game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
        }

        function toDegrees (angle) {
        	return angle * (180 / Math.PI);
	    }

		function checkOverlap(spriteA, spriteB) {

			var boundsA = spriteA.getBounds();
			var boundsB = spriteB.getBounds();

			return Phaser.Rectangle.intersects(boundsA, boundsB);

		}
		
		var x1;
		var y1;
		var x2;
		var y2;
		var currentRectangle
		var shapes = [];
		var Rectangle = function () {
			var x = 0;
			var y = 0;
			var width = 0;
			var height = 0;
		}
		function update() {
			if (cursors.up.isDown) {
				game.camera.y -= CAMERASCROLLSPEED;
			}
			else if (cursors.down.isDown) {
				game.camera.y += CAMERASCROLLSPEED;
			}
			if (cursors.left.isDown) {
				game.camera.x -= CAMERASCROLLSPEED;
			}
			else if (cursors.right.isDown) {
				game.camera.x += CAMERASCROLLSPEED;
			}
			if (game.input.activePointer.leftButton.isDown && !leftClicked) {
				var rawX = game.input.activePointer.worldX;
				var rawY = game.input.activePointer.worldY;
				var scaledX = rawX * (WORLDHEIGHT / WINDOWHEIGHT);
				var scaledY = rawY * (WORLDHEIGHT / WINDOWHEIGHT);
				console.log("left mouse button clicked at (" + scaledX + ", " + scaledY + ")");
				leftClicked = true;
				x1 = game.input.activePointer.worldX;
				y1 = game.input.activePointer.worldY;
				currentRectangle = new Rectangle();
				currentRectangle.x = x1;
				currentRectangle.y = y1;
			}
			else if (game.input.activePointer.leftButton.isUp && leftClicked) {
				var rawX = game.input.activePointer.worldX;
				var rawY = game.input.activePointer.worldY;
				var scaledX = rawX * (WORLDHEIGHT / WINDOWHEIGHT);
				var scaledY = rawY * (WORLDHEIGHT / WINDOWHEIGHT);
				console.log("left mouse button released at (" + scaledX + ", " + scaledY + ")");
				leftClicked = false;
				shapes.push(currentRectangle);
			}
			if (game.input.activePointer.rightButton.isDown && !rightClicked) {
				var rawX = game.input.activePointer.worldX;
				var rawY = game.input.activePointer.worldY;
				var scaledX = rawX * (WORLDHEIGHT / WINDOWHEIGHT);
				var scaledY = rawY * (WORLDHEIGHT / WINDOWHEIGHT);
				console.log("right mouse button clicked at (" + scaledX + ", " + scaledY + ")");
				rightClicked = true;
			}
			else if (game.input.activePointer.rightButton.isUp && rightClicked) {
				var rawX = game.input.activePointer.worldX;
				var rawY = game.input.activePointer.worldY;
				var scaledX = rawX * (WORLDHEIGHT / WINDOWHEIGHT);
				var scaledY = rawY * (WORLDHEIGHT / WINDOWHEIGHT);
				console.log("right mouse button released at (" + scaledX + ", " + scaledY + ")");
				rightClicked = false;
			}
			if (leftClicked) {
				graphics.clear();
				drawShapes(shapes);
				graphics.lineStyle(4, 0xff0000, 1);
				x2 = game.input.activePointer.worldX;
				y2 = game.input.activePointer.worldY;
				currentRectangle.width = x2 - currentRectangle.x;
				currentRectangle.height = y2 - currentRectangle.y;
				graphics.drawRect(x1, y1, currentRectangle.width, currentRectangle.height);
			}
			if (rightClicked) {
				graphics.clear();
				shapes = [];
			}
	    }

	    function drawShapes(shapes) {
	    	for (var i = 0; i < shapes.length; i++) {
	    		graphics.lineStyle(4, 0xff0000, 1);
	    		graphics.drawRect(shapes[i].x, shapes[i].y, shapes[i].width, shapes[i].height);
	    	}
	    }

	    function mouseWheel (event) {
	    	if(game.input.mouse.wheelDelta > 0) {
	    		game.world.scale.setTo(game.world.scale.x + CAMERAZOOMSPEED, game.world.scale.y + CAMERAZOOMSPEED);
	    	}
	    	else if(game.input.mouse.wheelDelta < 0 && game.world.scale.x > 1) {
	    		game.world.scale.setTo(game.world.scale.x - CAMERAZOOMSPEED, game.world.scale.y - CAMERAZOOMSPEED);
	    		if(game.world.scale.x < 1) {
	    			game.world.scale.setTo(1, 1);
	    		}
	    	}
	    }
		
    };

