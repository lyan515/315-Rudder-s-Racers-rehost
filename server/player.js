//Some ideas on how to run a game server taken from:
//https://github.com/xicombd/phaser-multiplayer-game

//stores all the functions and info needed for the server to keep track of players who are connected

var Player = function (startX, startY, startAngle) {
	var x = startX;				//current x coordinate
	var y = startY;				//current y coordinate
	var angle = startAngle;		//current angle
	var id;						//unique id number
	var playerNum;				//index in servers list of players
	var lapNum = 0;				//lap currently on
	
	var getX = function () {
		return x
	}

	var getY = function () {
		return y
	}
	var getAngle = function () {
		return angle
	}
	
	var getLapNum = function() {
		return lapNum;
	}
	
	var setX = function (newX) {
		x = newX
	}

	var setY = function (newY) {
		y = newY
	}
	
	var setAngle = function (newAngle) {
		angle = newAngle
	}
	
	var setLapNum = function(newLap) {
		lapNum = newLap;
	}
	
	return {
		getX: getX,
		getY: getY,
		getAngle: getAngle,
		getLapNum: getLapNum,
		setX: setX,
		setY: setY,
		setAngle: setAngle,
		getLapNum: getLapNum,
		id: id,
		playerNum: playerNum
	}
}

module.exports = Player;