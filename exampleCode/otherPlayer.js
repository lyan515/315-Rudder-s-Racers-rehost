
var OtherPlayer = function(index, game, player, startX, startY, startAngle) {
	var x = startX;
	var y = startY;
	var angle = startAngle;
	//game.load.image('bluebike', 'bluebike.png');

	this.player = player;
	this.player.name = index.toString();
	this.player = game.add.sprite(x, y, 'bluebike');
	
	this.player.anchor.setTo(0.5, 0.5);
	
	this.player.angle = angle;
	this.lastPosition = { x: x, y: y, angle: angle };
}

OtherPlayer.prototype.update = function() {
	this.lastPosition.x = this.player.x;
	this.lastPosition.y = this.player.y;
	this.lastPosition.angle = this.player.angle;
}

window.OtherPlayer = OtherPlayer;