//Some ideas on how to run a game server taken from:
//https://github.com/xicombd/phaser-multiplayer-game

window.onload = function() {

		var MAPPANELWIDTH = 3840;
		var MAPPANELHEIGHT = 3347;
		var SCALEFACTOR = 3;
		var WORLDWIDTH = MAPPANELWIDTH * 2 * SCALEFACTOR;
    	var WORLDHEIGHT = MAPPANELHEIGHT * 2 * SCALEFACTOR;
    	var WINDOWWIDTH = 1280;
    	var WINDOWHEIGHT = 720;

    	var PLAYERSTARTX = 2904;
    	var PLAYERSTARTY = 16102;

        var game = new Phaser.Game(WINDOWWIDTH, WINDOWHEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update});

		var socket;
		var otherPlayers = [];
        var player;

		var angle = 0;
    	var cursors;
    	var speed = 0;
    	var maxSpeed = 700;
    	var acceleration = 5;
    	var braking = 15;
    	var reversing = false;
    	var turnSpeed = 0.05;
		var cooldown = 0;
		var endText;
		var gotPow = 0;

    	var obstacles;
    	var boundaries;

    	function preload () {	//load in map and sprites
            game.load.spritesheet('sampleman', 'spritesheet.png', 60, 80, 2); //x and y of each sprite is 60 and 80, and there are 2 sprites in the spritesheet
			game.load.image('bluebike', 'bluebike.png');		//sprite of player
			game.load.image('trashCan', 'trashCan.png');		//sprite of trash can obstacle
			game.load.image('arrow', 'arrow.png');				//sprite of arrow used to direct players
			// total map size: 7680 x 6694
			game.load.image('mapTL', 'campusCircuit_TL.png');	//top left of map
			game.load.image('mapTR', 'campusCircuit_TR.png');	//top right of map
			game.load.image('mapBL', 'campusCircuit_BL.png');	//bottom left of map
			game.load.image('mapBR', 'campusCircuit_BR.png');	//bottom right of map\
			game.load.image('powerUp', 'pow.png');
            //game.load.image('sampleman', 'sample_man.png');
			
			game.load.image('finish', 'finishline.png');		//finish line
        }

        function createObjects () {
   //      	console.log("createObjects called");
   //      	var objectsString = readTextFile("objects.txt");
			// if (!objectsString) {
			// 	objectsString = readTextFile("objects.txt");
			// }
			// if (!objectsString) {
			// 	objectsString = readTextFile("objects.txt");
			// }
			// if (!objectsString) {
			// 	objectsString = readTextFile("objects.txt");
			// }
			// if (!objectsString) {
			// 	objectsString = readTextFile("objects.txt");
			// }
			// if (!objectsString) {
			// 	objectsString = readTextFile("objects.txt");
			// }
			// if (objectsString) {
			// 	console.log("successful reading object file");
				var objectsString = '{"boundaries":[{"rawX":139.58333333333334,"rawY":73.33333333333334,"scaledX":3114.5694444444443,"scaledY":1636.3111111111114,"rawWidth":430.41666666666674,"rawHeight":646.2121212121212,"scaledWidth":9604.030555555557,"scaledHeight":14419.146464646465},{"rawX":1.6666666666666667,"rawY":1.1111111111111112,"scaledX":37.18888888888889,"scaledY":24.792592592592595,"rawWidth":1029.333333333333,"rawHeight":56.88888888888888,"scaledWidth":22967.857777777772,"scaledHeight":1269.3807407407405},{"rawX":569.5454545454546,"rawY":74.0909090909091,"scaledX":12708.457575757577,"scaledY":1653.2151515151515,"rawWidth":311.81818181818187,"rawHeight":219.09090909090915,"scaledWidth":6957.70303030303,"scaledHeight":4888.648484848486},{"rawX":840.3333333333333,"rawY":292.66666666666663,"scaledX":18750.637777777774,"scaledY":6530.368888888888,"rawWidth":21.333333333333258,"rawHeight":31.333333333333314,"scaledWidth":476.017777777779,"scaledHeight":699.1511111111104},{"rawX":854.6666666666665,"rawY":290.99999999999994,"scaledX":19070.462222222217,"scaledY":6493.1799999999985,"rawWidth":15,"rawHeight":26,"scaledWidth":334.7000000000007,"scaledHeight":580.1466666666665},{"rawX":779.3333333333333,"rawY":323.66666666666663,"scaledX":17389.524444444443,"scaledY":7222.082222222221,"rawWidth":73.33333333333326,"rawHeight":53.66666666666663,"scaledWidth":1636.3111111111066,"scaledHeight":1197.482222222221},{"rawX":902.3333333333331,"rawY":2.666666666666657,"scaledX":20134.06444444444,"scaledY":59.50222222222237,"rawWidth":89.33333333333337,"rawHeight":209.33333333333331,"scaledWidth":1993.3244444444426,"scaledHeight":4670.924444444444},{"rawX":909.3333333333331,"rawY":211.99999999999997,"scaledX":20290.257777777773,"scaledY":4730.426666666666,"rawWidth":83,"rawHeight":686.9999999999999,"scaledWidth":1852.0066666666644,"scaledHeight":15329.259999999998},{"rawX":871.9999999999999,"rawY":342.33333333333326,"scaledX":19457.226666666662,"scaledY":7638.597777777776,"rawWidth":52.33333333333326,"rawHeight":34,"scaledWidth":1167.731111111112,"scaledHeight":758.6533333333327},{"rawX":882.6666666666665,"rawY":330.99999999999994,"scaledX":19695.23555555555,"scaledY":7385.713333333332,"rawWidth":32,"rawHeight":15.666666666666686,"scaledWidth":714.0266666666685,"scaledHeight":349.5755555555552},{"rawX":759.3333333333333,"rawY":377.33333333333326,"scaledX":16943.257777777777,"scaledY":8419.564444444442,"rawWidth":78,"rawHeight":73.66666666666669,"scaledWidth":1740.4399999999987,"scaledHeight":1643.7488888888893},{"rawX":836.6666666666665,"rawY":424.66666666666663,"scaledX":18668.822222222218,"scaledY":9475.728888888887,"rawWidth":12.666666666666742,"rawHeight":25.66666666666663,"scaledWidth":282.6355555555565,"scaledHeight":572.7088888888884},{"rawX":883.9999999999999,"rawY":377.33333333333326,"scaledX":19724.986666666664,"scaledY":8419.564444444442,"rawWidth":31.333333333333258,"rawHeight":174.66666666666663,"scaledWidth":699.1511111111104,"scaledHeight":3897.395555555555},{"rawX":869.9999999999999,"rawY":423.33333333333326,"scaledX":19412.6,"scaledY":9445.977777777776,"rawWidth":38.33333333333326,"rawHeight":129,"scaledWidth":855.3444444444394,"scaledHeight":2878.42},{"rawX":760.3333333333333,"rawY":496.6666666666666,"scaledX":16965.57111111111,"scaledY":11082.288888888887,"rawWidth":149.9999999999999,"rawHeight":401.3333333333333,"scaledWidth":3346.9999999999964,"scaledHeight":8955.084444444443},{"rawX":568.9999999999999,"rawY":402.33333333333326,"scaledX":12696.286666666663,"scaledY":8977.397777777776,"rawWidth":188.66666666666663,"rawHeight":63.333333333333314,"scaledWidth":4209.78222222222,"scaledHeight":1413.177777777777},{"rawX":566.6666666666666,"rawY":462.33333333333326,"scaledX":12644.22222222222,"scaledY":10316.197777777776,"rawWidth":26.333333333333258,"rawHeight":15.666666666666686,"scaledWidth":587.5844444444429,"scaledHeight":349.5755555555552},{"rawX":622.9999999999999,"rawY":505.6666666666666,"scaledX":13901.206666666663,"scaledY":11283.108888888886,"rawWidth":140.33333333333337,"rawHeight":40.00000000000006,"scaledWidth":3131.304444444444,"scaledHeight":892.5333333333347},{"rawX":625.9999999999999,"rawY":545.6666666666666,"scaledX":13968.146666666664,"scaledY":12175.64222222222,"rawWidth":135,"rawHeight":88.33333333333326,"scaledWidth":3012.2999999999993,"scaledHeight":1971.0111111111091},{"rawX":594.9999999999999,"rawY":634.6666666666666,"scaledX":13276.43333333333,"scaledY":14161.528888888888,"rawWidth":173,"rawHeight":263.33333333333326,"scaledWidth":3860.206666666665,"scaledHeight":5875.844444444441},{"rawX":399.66666666666663,"rawY":718.9999999999999,"scaledX":8917.895555555555,"scaledY":16043.286666666663,"rawWidth":170,"rawHeight":107.66666666666663,"scaledWidth":3793.2666666666664,"scaledHeight":2402.402222222223},{"rawX":134.66666666666663,"rawY":844.9999999999999,"scaledX":3004.862222222222,"scaledY":18854.766666666663,"rawWidth":460,"rawHeight":52.66666666666663,"scaledWidth":10264.133333333331,"scaledHeight":1175.1688888888893},{"rawX":251.94444444444437,"rawY":733.6111111111109,"scaledX":5621.720370370369,"scaledY":16369.309259259253,"rawWidth":121.66666666666666,"rawHeight":111.38888888888891,"scaledWidth":2714.7888888888883,"scaledHeight":2485.457407407406},{"rawX":361.94444444444434,"rawY":739.4444444444442,"scaledX":8076.187037037034,"scaledY":16499.470370370364,"rawWidth":18.333333333333314,"rawHeight":105,"scaledWidth":409.07777777777665,"scaledHeight":2342.9000000000015},{"rawX":2.2222222222222285,"rawY":729.4444444444442,"scaledX":49.585185185184855,"scaledY":16276.337037037032,"rawWidth":248.33333333333326,"rawHeight":168.33333333333326,"scaledWidth":5541.144444444443,"scaledHeight":3756.0777777777766},{"rawX":2.6666666666666714,"rawY":48,"scaledX":59.50222222222237,"scaledY":1071.039999999999,"rawWidth":123.99999999999997,"rawHeight":680.9999999999999,"scaledWidth":2766.8533333333326,"scaledHeight":15195.379999999997},{"rawX":1015,"rawY":20,"scaledX":22648.033333333333,"scaledY":446.26666666666665,"rawWidth":0,"rawHeight":0,"scaledWidth":0,"scaledHeight":0}],"obstacles":[],"powerUps":[]}';
				var objects = JSON.parse(objectsString);
				var boundaryArray = objects.boundaries;
				var obstacleArray = objects.obstacles;
				var powerUpArray = objects.powerUps;
        		createBoundaries(boundaryArray);
        		createObstacles(obstacleArray);
        		createPowerUps(powerUpArray);
   //      	}        	
			// else {
			// 	console.log("error reading object file");
			// 	console.log("objectString: " + objectsString);
			// }
		}
		

		function createObs(){	//terrible way of loading in all of the obstacles into the game
			obstacles = game.add.group();
			obstacles.enableBody = true;
			var staticObstacle1 = obstacles.create(3072, 15052, 'trashCan');
			staticObstacle1.anchor.setTo(0.5, 0.5);
			staticObstacle1.body.immovable = true;
			var staticObstacle2 = obstacles.create(2972, 13425, 'trashCan');
			staticObstacle2.anchor.setTo(0.5, 0.5);
			staticObstacle2.body.immovable = true;
			var staticObstacle3 = obstacles.create(3022, 11101, 'trashCan');
			staticObstacle3.anchor.setTo(0.5, 0.5);
			staticObstacle3.body.immovable = true;
			var staticObstacle4 = obstacles.create(2970, 8763, 'trashCan');
			staticObstacle4.anchor.setTo(0.5, 0.5);
			staticObstacle4.body.immovable = true;
			var staticObstacle5 = obstacles.create(2932, 6462, 'trashCan');
			staticObstacle5.anchor.setTo(0.5, 0.5);
			staticObstacle5.body.immovable = true;
			var staticObstacle5 = obstacles.create(3013, 3007, 'trashCan');
			staticObstacle5.anchor.setTo(0.5, 0.5);
			staticObstacle5.body.immovable = true;
			var staticObstacle6 = obstacles.create(2903, 2974, 'trashCan');
			staticObstacle6.anchor.setTo(0.5, 0.5);
			staticObstacle6.body.immovable = true;
			var staticObstacle7 = obstacles.create(3673, 1382, 'trashCan');
			staticObstacle7.anchor.setTo(0.5, 0.5);
			staticObstacle7.body.immovable = true;
			var staticObstacle7 = obstacles.create(3673, 1335, 'trashCan');
			staticObstacle7.anchor.setTo(0.5, 0.5);
			staticObstacle7.body.immovable = true;
			var staticObstacle7 = obstacles.create(3673, 1450, 'trashCan');
			staticObstacle7.anchor.setTo(0.5, 0.5);
			staticObstacle7.body.immovable = true;
			var staticObstacle8 = obstacles.create(4996, 1451, 'trashCan');
			staticObstacle8.anchor.setTo(0.5, 0.5);
			staticObstacle8.body.immovable = true;
			var staticObstacle9 = obstacles.create(6469, 1377, 'trashCan');
			staticObstacle9.anchor.setTo(0.5, 0.5);
			staticObstacle9.body.immovable = true;
			var staticObstacle10 = obstacles.create(7324, 1513, 'trashCan');
			staticObstacle10.anchor.setTo(0.5, 0.5);
			staticObstacle10.body.immovable = true;
			var staticObstacle11 = obstacles.create(7324, 1434, 'trashCan');
			staticObstacle11.anchor.setTo(0.5, 0.5);
			staticObstacle11.body.immovable = true;
			var staticObstacle12 = obstacles.create(9517, 1573, 'trashCan');
			staticObstacle12.anchor.setTo(0.5, 0.5);
			staticObstacle12.body.immovable = true;
			var staticObstacle13 = obstacles.create(9479, 1473, 'trashCan');
			staticObstacle13.anchor.setTo(0.5, 0.5);
			staticObstacle13.body.immovable = true;
			var staticObstacle14 = obstacles.create(12853, 1535, 'trashCan');
			staticObstacle14.anchor.setTo(0.5, 0.5);
			staticObstacle14.body.immovable = true;
			var staticObstacle15 = obstacles.create(12853, 1463, 'trashCan');
			staticObstacle15.anchor.setTo(0.5, 0.5);
			staticObstacle15.body.immovable = true;
			var staticObstacle16 = obstacles.create(19820, 1599, 'trashCan');
			staticObstacle16.anchor.setTo(0.5, 0.5);
			staticObstacle16.body.immovable = true;
			var staticObstacle17 = obstacles.create(16500, 1463, 'trashCan');
			staticObstacle17.anchor.setTo(0.5, 0.5);
			staticObstacle17.body.immovable = true;
			var staticObstacle18 = obstacles.create(20044, 3986, 'trashCan');
			staticObstacle18.anchor.setTo(0.5, 0.5);
			staticObstacle18.body.immovable = true;
			var staticObstacle19 = obstacles.create(15171, 9436, 'trashCan');
			staticObstacle19.anchor.setTo(0.5, 0.5);
			staticObstacle19.body.immovable = true;
			var staticObstacle20 = obstacles.create(15171, 9436, 'trashCan');
			staticObstacle20.anchor.setTo(0.5, 0.5);
			staticObstacle20.body.immovable = true;
			var staticObstacle20 = obstacles.create(15171, 9436, 'trashCan');
			staticObstacle20.anchor.setTo(0.5, 0.5);
			staticObstacle20.body.immovable = true;
			var staticObstacle21 = obstacles.create(19176, 9866, 'trashCan');
			staticObstacle21.anchor.setTo(0.5, 0.5);
			staticObstacle21.body.immovable = true;
			var staticObstacle22 = obstacles.create(19176, 9866, 'trashCan');
			staticObstacle22.anchor.setTo(0.5, 0.5);
			staticObstacle22.body.immovable = true;
			staticObstacle22.scale.setTo(5,5);
			var staticObstacle23 = obstacles.create(19493, 7349, 'trashCan');
			staticObstacle23.anchor.setTo(0.5, 0.5);
			staticObstacle23.body.immovable = true;
			staticObstacle23.scale.setTo(5,5);
			var staticObstacle24 = obstacles.create(18410, 10766, 'trashCan');
			staticObstacle24.anchor.setTo(0.5, 0.5);
			staticObstacle24.body.immovable = true;
			staticObstacle24.scale.setTo(5,5);
			var staticObstacle25 = obstacles.create(13696, 10830, 'trashCan');
			staticObstacle25.anchor.setTo(0.5, 0.5);
			staticObstacle25.body.immovable = true;
			staticObstacle25.scale.setTo(10,10);
			var staticObstacle26 = obstacles.create(12992, 14569, 'trashCan');
			staticObstacle26.anchor.setTo(0.5, 0.5);
			staticObstacle26.body.immovable = true;
			var staticObstacle27 = obstacles.create(12826, 18547, 'trashCan');
			staticObstacle27.anchor.setTo(0.5, 0.5);
			staticObstacle27.body.immovable = true;
			var staticObstacle27 = obstacles.create(4502, 16125, 'trashCan');
			staticObstacle27.anchor.setTo(0.5, 0.5);
			staticObstacle27.body.immovable = true;
            
/*          var samplePedestrian = obstacles.create(2836, 1316, 'sampleman');   //chose these coordinates to be near an arrow (that I know is on the path). hopefully the track where I picked isn't too wide.
                                                                                //ending (x) position will be 8929 (6060 pixels from the start point). the opposite will be true when it goes back to start.
            samplePedestrian.frame = 0; //initially displays the first frame
            samplePedestrian.anchor.setTo(1,1);      //adding this line and...
            samplePedestrian.body.immovable = false; //this line because the other obstacles do it too
            samplePedestrian.animations.add('move', [0, 1], 2, true); //loops through frames 1 and 2 at 2 frames per second.
            samplePedestrian.animations.play('move'); */
		}
        
        function createMovingObs(){
            samplePedestrian = game.add.sprite(2839, 1916, 'sampleman');   //chose these coordinates to be near an arrow (that I know is on the path). hopefully the track where I picked isn't too wide.
                                                                           //ending (x) position will be 3239 the opposite will be true when it goes back to start.
            samplePedestrian.anchor.setTo(0.5, 0.5);
            samplePedestrian.scale.setTo(0.75,0.75);
            game.physics.arcade.enable(samplePedestrian);
            samplePedestrian.body.immovable = true;
            samplePedestrian.frame = 0; //initially displays the first frame
            samplePedestrian.animations.add('move', [0, 1], 2, true); //loops through frames 1 and 2 at 2 frames per second.
            samplePedestrian.animations.play('move');
        } 
		
		function createArrows(){	//terrible way of loading in all of the arrows into the game
			var arrow = game.add.sprite(2856, 16022, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = -90;
	        arrow = game.add.sprite(2878, 13332, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = -90;
	        arrow = game.add.sprite(2789, 8872, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = -90;
	        arrow = game.add.sprite(2896, 4725, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = -90;
	        arrow = game.add.sprite(2896, 1316, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow = game.add.sprite(8869, 1316, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow = game.add.sprite(12192, 1316, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow = game.add.sprite(18124, 1316, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow = game.add.sprite(20113, 1440, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 90;
	        arrow = game.add.sprite(19721, 5366, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 90;
	        arrow = game.add.sprite(20053, 7105, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 135;
	        arrow = game.add.sprite(19055, 7962, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 90;
	        arrow = game.add.sprite(19093, 8894, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 90;
	        arrow = game.add.sprite(19429, 8894, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 90;
	        arrow = game.add.sprite(19188, 10409, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 135;
	        arrow = game.add.sprite(18498, 11000, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 180;
	        arrow = game.add.sprite(17242, 10245, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 135;
	        arrow = game.add.sprite(16449, 11225, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 180;
	        arrow = game.add.sprite(16449, 10428, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 180;
	        arrow = game.add.sprite(15552, 11225, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 180;
	        arrow = game.add.sprite(15552, 10428, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 180;
	        arrow = game.add.sprite(14344, 11225, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 180;
	        arrow = game.add.sprite(14244, 10428, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 180;
	        arrow = game.add.sprite(13357, 10517, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 135;
	        arrow = game.add.sprite(12772, 10821, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 90;
	        arrow = game.add.sprite(13251, 13685, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 90;
	        arrow = game.add.sprite(13235, 16722, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 90;
	        arrow = game.add.sprite(13020, 18800, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 180;
	        arrow = game.add.sprite(9628, 18800, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 180;
	        arrow = game.add.sprite(8520, 18668, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = -90;
	        arrow = game.add.sprite(8770, 16183, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = -135;
	        arrow = game.add.sprite(5654, 16263, 'arrow');
	        arrow.anchor.setTo(0.5, 0.5);
	        arrow.scale.setTo(0.1, 0.1);
	        arrow.angle = 180;
		}

		function createBoundaries (boundaryArray) {
			boundaries = game.add.group();
			boundaries.enableBody = true;
			var boundaryObjects = [];
			var boundaryObject;
			for (var i = 0; i < boundaryArray.length; i++) {
				console.log("creating boundary at: " + boundaryArray[i].scaledX + ", " + boundaryArray[i].scaledY);
				boundaryObject = boundaries.create(boundaryArray[i].scaledX, boundaryArray[i].scaledY);
				boundaryObject.anchor.setTo(0, 0);
				boundaryObject.width = boundaryArray[i].scaledWidth;
				boundaryObject.height = boundaryArray[i].scaledHeight;
				boundaryObject.body.immovable = true;
			}
		}

		function createObstacles (obstacleArray) {
			obstacles = game.add.group();
			obstacles.enableBody = true;
			var obstacleObjects = [];
			var obstacleObject;
			for (var i = 0; i < obstacleArray.length; i++) {
				console.log("creating obstacle at: " + obstacleArray[i].scaledX + ", " + obstacleArray[i].scaledY);
				obstacleObject = obstacles.create(obstacleArray[i].scaledX, obstacleArray[i].scaledY, 'trashCan');
				obstacleObject.anchor.setTo(0, 0);
				obstacleObject.body.immovable = true;
			}
		}

		function createPowerUps (powerUpArray) {
			powerUps = game.add.group();
			powerUps.enableBody = true;
			var powerUpObjects = [];
			var powerUpObject;
			for (var i = 0; i < powerUpArray.length; i++) {
				console.log("creating power-up at: " + powerUpArray[i].scaledX + ", " + powerUpArray[i].scaledY);
				powerUpObject = powerUps.create(powerUpArray[i].scaledX, powerUpArray[i].scaledY, 'powerUp');
				powerUpObject.anchor.setTo(0, 0);
				powerUpObject.body.immovable = true;
			}
		}
	
        function create () {		//initialize game as it loads	
        	console.log("create");
			socket = io.connect();	//set up connection with the server
			
			// enable Arcade Physics system
	        game.physics.startSystem(Phaser.Physics.ARCADE);

	        // set world size
	        game.world.setBounds(0, 0, WORLDWIDTH, WORLDHEIGHT);

	        // load in background (map)
	        var mapTL = game.add.sprite(0, 0, 'mapTL');
	        mapTL.anchor.setTo(0, 0);
	        mapTL.scale.setTo(SCALEFACTOR, SCALEFACTOR);
	        var mapTR = game.add.sprite(game.world.width / 2, 0, 'mapTR');
	        mapTR.anchor.setTo(0, 0);
	        mapTR.scale.setTo(SCALEFACTOR, SCALEFACTOR);
	        var mapBL = game.add.sprite(0, game.world.height / 2, 'mapBL');
	        mapBL.anchor.setTo(0, 0);
	        mapBL.scale.setTo(SCALEFACTOR, SCALEFACTOR);
	        var mapBR = game.add.sprite(game.world.width / 2, game.world.height / 2, 'mapBR');
	        mapBR.anchor.setTo(0, 0);
	        mapBR.scale.setTo(SCALEFACTOR, SCALEFACTOR);
			
			//load in finish line
			finish = game.add.sprite(3100, 16065, 'finish');
			finish.scale.setTo(0.25, .75);

	        // load in arrows
	        createArrows();

	        // player
	        player = game.add.sprite(PLAYERSTARTX, PLAYERSTARTY, 'bluebike');
	        player.anchor.setTo(0.5, 0.5);
		    player.scale.setTo(0.5, 0.5);
		    player.laps = 1;
	        game.physics.arcade.enable(player);
	        player.body.collideWorldBounds = true;
            player.body.bounce.setTo(4,4);

	        // create objects
	        createObjects();
			
			// set up powerup
			powerUp = game.add.sprite(2900, 15000, 'powerUp');
			powerUp.scale.setTo(0.25, 0.25);

	        //load in obstacles
			createObs();
            
            //load in moving obstacles
            createMovingObs();    //works now
            
			
	        // set up camera size
	        game.camera.width = WINDOWWIDTH;
	        game.camera.height = WINDOWHEIGHT;			

	        // controls
	        cursors = game.input.keyboard.createCursorKeys();
			
			// endText that gets changed when player wins or loses
			endText = game.add.text(player.x, player.y, "", {
						font: "65px Arial",
						fill: "#ff0044",
						align: "center"
			});
			endText.anchor.setTo(0.5, 0.5);
			
			
			setEventHandlers();				//initialize event handlers
			console.log("sendPlayers");		//tell server that you are ready to recieve the other players connected
			socket.emit('sendPlayers', {id: player.id});
			
        }
        
        function move()
        {                
            game.physics.arcade.moveToXY(samplePedestrian, samplePedestrian.body.x + 300, samplePedestrian.body.y, 4000);
            game.physics.arcade.moveToXY(samplePedestrian, samplePedestrian.body.x - 300, samplePedestrian.body.y, 4000);
            //move();
        }

        function toDegrees (angle) {		//converts an angle to degrees
        	return angle * (180 / Math.PI);
	    }
		
		function forward() {						//forward function
			if (speed < 0) {						// if going backwards, brake and move forward
				speed += (acceleration + braking);
			}
			else if(speed < maxSpeed){				//max speed
				speed += acceleration;
			}
			if (speed > maxSpeed) {
				speed = maxSpeed;
			}
		}

		function reverse() {						//reverse function
			if (speed > 0) {						// if going forward, brake and reverse
				speed -= (acceleration + braking);
			}
			else if(speed > (-maxSpeed / 2)) {		// min speed
				speed -= acceleration;
			}
			else if (speed < (-maxSpeed / 2)) {
				speed = -maxSpeed / 2;
			}
		}

		function decelerate() {		//deceleration function for when the player lets go of the up button or starts moving backwards
			if (speed > 0) {
				speed -= braking;
			}
			else if (speed < 0) {
				speed += braking;
				reversing = true;
			}
			if ((speed < 0 && !reversing) || (speed > 0 && reversing)) {
				speed = 0;
				reversing = false;
			}
		}
		
		var setEventHandlers = function() {//set all of the callback functions for socket events
			
			console.log("setEventHandlers");
			socket.on('newPlayer', onNewPlayer);		//new player
			socket.on('connect', onSocketConnected);	//new connection
			socket.on('movePlayer', onMovePlayer);		//send a new id to the new player
			socket.on('disconnect', onSocketDisconnect);//one of the players has moved
			socket.on('removePlayer', onRemovePlayer);	//player disconnected
			socket.on('playerID', function(data) {		//set the id of this player
				player.id = data.id;
				player.playerNum = data.playerNum;
				player.x += (player.playerNum*35);		//set the starting location
			});
			socket.on('gameFinish', onGameFinish);		//notify server that a player has one the game
			
		}
		
		function onSocketConnected() {
			console.log('Connected to socket server');
			
			socket.emit('newPlayer', { x: player.x, y: player.y, angle: player.angle });	//send server info to create new player
		}

		function onSocketDisconnect () {
 			console.log('Disconnected from socket server');
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
		
		function onGameFinish (data) {
			endText.setText("You Lose!");	// I lost :(
			endText.anchor.setTo(0.5, 0.5);
		}
		
		function checkOverlap(spriteA, spriteB) {	//checks to see if the player is crossing the finish line

			var boundsA = spriteA.getBounds();
			var boundsB = spriteB.getBounds();

			return Phaser.Rectangle.intersects(boundsA, boundsB);

		}
		
		function getPowerUp(){
			if(gotPow == 0){
				game.debug.text("Got Power Up!!!", 32, 64);
				powerUp.kill();
				gotPow = 1;
			}				
			//powerUp.destroy();
		}

		var setEventHandlers = function() {//set all of the callback functions for socket events
			socket.on('connect', onSocketConnected);//new connection
			
			socket.on('newPlayer', onNewPlayer);//new player
			
			socket.on('movePlayer', onMovePlayer);//send a new id to the new player
			socket.on('disconnect', onSocketDisconnect);//one of the players has moved
			socket.on('removePlayer', onRemovePlayer);//player disconnected
			socket.on('playerID', function(data) {
				player.id = data.id;
				player.playerNum = data.playerNum;
				player.x += (player.playerNum*35); 
			});
			socket.on('gameFinish', onGameFinish);//remove player from game

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
		
		function onGameFinish (data) {
			endText.setText("You Lose!");
			endText.anchor.setTo(0.5, 0.5);
		}
		
		function checkOverlap(spriteA, spriteB) {

			var boundsA = spriteA.getBounds();
			var boundsB = spriteB.getBounds();

			return Phaser.Rectangle.intersects(boundsA, boundsB);

		}
		
		function update() {
			// player movement

	        if (cursors.up.isDown) {	//forward and backward movement
				forward();
				reversing = false;
	            player.body.velocity.x = (speed * Math.sin(angle));
	            player.body.velocity.y = (-speed * Math.cos(angle));
	        }
	        else if (cursors.down.isDown) {
	            reverse();
	            reversing = true;
				player.body.velocity.x = (speed * Math.sin(angle));
	            player.body.velocity.y = (-speed * Math.cos(angle));
	        }
	        else {
	        	decelerate();
	        	player.body.velocity.x = (speed * Math.sin(angle));
	        	player.body.velocity.y = (-speed * Math.cos(angle));
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
			
			//update location of endText to follow player
			endText.x = player.x;
			endText.y = player.y;
			
			//check for finish line
			if (checkOverlap(player, finish)&& cooldown < 0)
			{
				player.laps++;
				cooldown = 2400;	//resets cooldown to prevent multiple lap increments
				if(player.laps >= 3){
					socket.emit('gameWin', { id:player.id});
					endText.setText("You Win!");	//I won :)
				}
			}

			cooldown--;//decrement cooldown
			game.debug.text("player laps: "+ player.laps + "/3", 32, 32);
			
			if (checkOverlap(player, powerUp)==true)
			{
				getPowerUp();
			}
            
            //move();
            samplePedestrian.body.velocity.x = 200;
            if(samplePedestrian.body.x >= 3039)
            {
                samplePedestrian.body.x = 2839;
                samplePedestrian.body.y = 1916;
                //game.physics.arcade.moveToXY(samplePedestrian, samplePedestrian.body.x + 300, samplePedestrian.body.y, 4000);
                //game.physics.arcade.moveToXY(samplePedestrian, samplePedestrian.body.x - 300, samplePedestrian.body.y, 4000);
            }
            
            //if (checkOverlap(player, samplePedestrian)==true)
            //{
            //    speed = 0;
            //}
            
            //animate samplePedestrian      //this currently causes the game not to load
            //TODO: make a helper function to animate all moving obstacles
            //sampleman.body.velocity.x = 100; //this might be way too fast
            //game.physics.arcade.moveToXY(samplePedestrian, samplePedestrian.body.x + 6000, samplePedestrian.body.y, 150, 5000);
            //if(samplePedestrian.x > 8929)
            //{
            //    samplePedestrian.x = 2776;
                //if(samplePedestrian.x > 2836)
                //{
                //    samplePedestrian.x -= 100;
                //}
            //}
	
	        // check for collisions
			var hitObstacle = game.physics.arcade.collide(player, obstacles);
			var hitBoundaries = game.physics.arcade.collide(player, boundaries);
            var hitMoving_Obstacle = game.physics.arcade.collide(player, samplePedestrian);
			
			if(hitObstacle == true){
				speed = 0;
				//if the obstacle is a map/path boundary, should their speed still drop to 0?
			}
            if(hitMoving_Obstacle == true){
                speed = 0;
            }
			
			//update server of the players new location
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

		var reader = new XMLHttpRequest() || new ActiveXObject('MSXML2.XMLHTTP');
		var response = "";
		function readTextFile(filePath) {
		    reader.open('get', filePath, true);
		    reader.onreadystatechange = function () {
		    	if (reader.readyState == 4) {
		    		response = reader.responseText;
		    	}
		    }
		    reader.send(null);
		    return response;
		}
		
    };