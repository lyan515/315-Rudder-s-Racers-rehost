var MAPPANELWIDTH = 3840;
var MAPPANELHEIGHT = 3347;
var SCALEFACTOR = 2;
var WORLDWIDTH = MAPPANELWIDTH * 2 * SCALEFACTOR;
var WORLDHEIGHT = MAPPANELHEIGHT * 2 * SCALEFACTOR;
var WINDOWHEIGHT = 900;

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
var enterPressed = false;

// 1 : boundaries, 2 : obstacles, 3 : power-ups
var currentTool = 1;
var tooltext;

var currentObject;
var Rectangle = function () {
	var rawX = 0;
	var rawY = 0;
	var scaledX = 0;
	var scaledY = 0;
	var rawWidth = 0;
	var rawHeight = 0;
	var scaledWidth = 0;
	var scaledHeight = 0;
}

function preload () {

	game.load.image('obstacle', 'trashCan.png');
	game.load.
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

	// create text
	toolText = game.add.text(32, 32, "Boundaries", {
		font: "32px Arial",
		fill: "#ffffff",
		align:"left"
	});

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

function update() {

	// scroll camera
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

	// change tools
	if (game.input.keyboard.isDown(Phaser.KeyCode.ONE)) {
		currentTool = 1;
		toolText.text = "Boundaries";
	}
	else if (game.input.keyboard.isDown(Phaser.KeyCode.TWO)) {
		currentTool = 2;
		toolText.text = "Obstacles";
	}
	else if (game.input.keyboard.isDown(Phaser.KeyCode.THREE)) {
		currentTool = 3;
		toolText.text = "Power-Ups";
	}

	// handle left clicks
	if (game.input.activePointer.leftButton.isDown && !leftClicked) {
		var rawX = game.input.activePointer.worldX;
		var rawY = game.input.activePointer.worldY;
		var scaledX = rawX * (WORLDHEIGHT / WINDOWHEIGHT) / game.world.scale.x;
		var scaledY = rawY * (WORLDHEIGHT / WINDOWHEIGHT) / game.world.scale.y;
		leftClicked = true;
		x1 = game.input.activePointer.worldX / game.world.scale.x;
		y1 = game.input.activePointer.worldY / game.world.scale.y;
		currentObject = new Rectangle();
		currentObject.rawX = x1;
		currentObject.rawY = y1;
		currentObject.scaledX = scaledX;
		currentObject.scaledY = scaledY;
	}
	else if (game.input.activePointer.leftButton.isUp && leftClicked) {
		var rawX = game.input.activePointer.worldX;
		var rawY = game.input.activePointer.worldY;
		var scaledX = rawX * (WORLDHEIGHT / WINDOWHEIGHT) / game.world.scale.x;
		var scaledY = rawY * (WORLDHEIGHT / WINDOWHEIGHT) / game.world.scale.y;
		leftClicked = false;
		if (currentObject.rawWidth < 0) {
			currentObject.rawX = currentObject.rawX + currentObject.rawWidth;
			currentObject.scaledX = currentObject.scaledX + currentObject.scaledWidth;
			currentObject.rawWidth *= -1;
			currentObject.scaledWidth *= -1;
		}
		if (currentObject.rawHeight < 0) {
			currentObject.rawY = currentObject.rawY + currentObject.rawHeight;
			currentObject.scaledY = currentObject.scaledY + currentObject.scaledHeight;
			currentObject.rawHeight *= -1;
			currentObject.scaledHeight *= -1;
		}
		boundaries.push(currentObject);
	}

	// handle right clicks
	if (game.input.activePointer.rightButton.isDown && !rightClicked) {
		rightClicked = true;
		graphics.clear();
		if (boundaries.length > 0) {
			boundaries.splice(boundaries.length - 1);
		}
		drawObjects();
	}
	else if (game.input.activePointer.rightButton.isUp && rightClicked) {
		rightClicked = false;
	}

	// left click drag
	if (leftClicked) {
		graphics.clear();
		drawObjects();
		graphics.lineStyle(4, 0xff0000, 1);
		var rawX = game.input.activePointer.worldX / game.world.scale.x;
		var rawY = game.input.activePointer.worldY / game.world.scale.y;
		var scaledX = rawX * (WORLDHEIGHT / WINDOWHEIGHT);
		var scaledY = rawY * (WORLDHEIGHT / WINDOWHEIGHT);
		currentObject.rawWidth = rawX - currentObject.rawX;
		currentObject.rawHeight = rawY - currentObject.rawY;
		currentObject.scaledWidth = scaledX - currentObject.scaledX;
		currentObject.scaledHeight = scaledY - currentObject.scaledY;
		graphics.drawRect(currentObject.rawX, currentObject.rawY, currentObject.rawWidth, currentObject.rawHeight);
	}

	// handle enter pressed
	if (game.input.keyboard.isDown(Phaser.KeyCode.ENTER) && !enterPressed) {
		printAllObjects();
		enterPressed = true;
	}
	else if (!game.input.keyboard.isDown(Phaser.KeyCode.ENTER) && enterPressed) {
		enterPressed = false;
	}
}

function drawObjects() {
	for (var i = 0; i < boundaries.length; i++) {
		graphics.lineStyle(4, 0xff0000, 1);
		graphics.drawRect(boundaries[i].rawX, boundaries[i].rawY, boundaries[i].rawWidth, boundaries[i].rawHeight);
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

function printAllObjects () {
	var result = '{"boundaries":';
	result += JSON.stringify(boundaries);
	result += "}";
	console.log(result);
}

function loadObjects (filePath) {
	var objectsString = readTextFile(filePath);
	if (objectsString) {
		var objects = JSON.parse(objectsString);
    	boundaries = objects.boundaries;
    	//obstacles = objects.obstacles;
    	//powerUps = objects.powerUps;
    	drawObjects();
    }
    else {
    	console.log("File empty");
    }
}

var reader = new XMLHttpRequest() || new ActiveXObject('MSXML2.XMLHTTP');
var response = "";
function readTextFile(filePath) {
    reader.open('get', filePath, true); 
    reader.onreadystatechange = function () {
    	if (reader.readyState == 4) {
    		response = reader.responseText;
    		console.log("response: " + response);
    	}
    }
    reader.send(null);
    return response;
}
