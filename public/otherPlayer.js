var OtherPlayer = function(id, game, player, playerNum, startX, startY, startAngle) {
	var x = startX;
	var y = startY;
	var angle = startAngle;
	
	//game.load.image('bluebike', 'bluebike.png');

	this.game = game;
	this.player = player;
	
	this.player = game.add.sprite(x+playerNum*35, y+playerNum, 'bluebike');
	this.player.id = id.toString();
	

	this.player.anchor.setTo(0.5, 0.5);
	this.player.scale.setTo(0.5, 0.5);
	this.player.angle = angle;
	this.lastPosition = { x: x, y: y, angle: angle };
}

OtherPlayer.prototype.update = function() {
	this.lastPosition.x = this.player.x;
	this.lastPosition.y = this.player.y;
	this.lastPosition.angle = this.player.angle;
}

window.OtherPlayer = OtherPlayer;