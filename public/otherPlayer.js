//stores all the info needed for the client to display the other players that are connected

var OtherPlayer = function(id, game, player, playerNum, startX, startY, startAngle) {
	var x = startX;
	var y = startY;
	var angle = startAngle;

	this.game = game;
	this.player = player;
	
	this.player = game.add.sprite(x+playerNum*35, y+playerNum, 'bluebike');		//add sprite to game in starting position based on its number
	this.player.id = id.toString();	

	this.player.anchor.setTo(0.5, 0.5);
	this.player.scale.setTo(0.5, 0.5);
	this.player.angle = angle;
	this.lastPosition = { x: x, y: y, angle: angle };	//store where it last was when updated
}

OtherPlayer.prototype.update = function() {			//function to update the stored location
	this.lastPosition.x = this.player.x;
	this.lastPosition.y = this.player.y;
	this.lastPosition.angle = this.player.angle;
}

window.OtherPlayer = OtherPlayer;