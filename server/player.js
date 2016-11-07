var Player = function (startX, startY, startAngle) {
	var x = startX;
	var y = startY;
	var angle = startAngle;
	var id;
	var playerNum;
	var lapNum = 0;
	
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