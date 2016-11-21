window.onload = function() {

		var MAPPANELWIDTH = 4096;
		var MAPPANELHEIGHT = 4096;
		var SCALEFACTOR = 1.25;
		var WORLDWIDTH = MAPPANELWIDTH * 2 * SCALEFACTOR;
    	var WORLDHEIGHT = MAPPANELHEIGHT * 2 * SCALEFACTOR;
    	var WINDOWWIDTH = 1280;
    	var WINDOWHEIGHT = 720;

    	var PLAYERSTARTX = 864;
    	var PLAYERSTARTY = 8111;

        var game = new Phaser.Game(WINDOWWIDTH, WINDOWHEIGHT, Phaser.AUTO, '', { preload: preload, create: create, update: update, render: render});

		var socket;
		var otherPlayers;
        var player;

        // player attributes
		var angle = 0;
    	var cursors;
    	var speed = 0;
    	var maxSpeed = 700;
    	var acceleration = 5;
    	var braking = 15;
    	var reversing = false;
    	var turnSpeed = 0.05;
		var cooldown = 0;

		// UI attributes
		var endText;

		// world attributes
    	var obstacles;
    	var boundaries;

    	// physics attributes
    	// create collision groups
        var playerCollisionGroup;
        var boundaryCollisionGroup;
        var obstacleCollisionGroup;

		function preload () {
			game.load.image('logo', 'phaser.png');
			game.load.image('bluebike', 'bluebike.png');
			game.load.image('trashCan', 'trashCan.png');
			game.load.image('powerUp', 'powerUp.png');
			game.load.image('arrow', 'arrow.png');
			// total map size: 7680 x 6694
			game.load.image('mapTL', 'campusCircuit_Small_TL.png');
			game.load.image('mapTR', 'campusCircuit_Small_TR.png');
			game.load.image('mapBL', 'campusCircuit_Small_BL.png');
			game.load.image('mapBR', 'campusCircuit_Small_BR.png');
			
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

        function createObjects () {
        	var objectsString = '{"boundaries":[{"rawX":96.875,"rawY":142.1875,"scaledX":1102.2222222222222,"scaledY":1617.7777777777778,"rawWidth":13.4375,"rawHeight":578.125,"scaledWidth":152.8888888888889,"scaledHeight":6577.777777777779},{"rawX":53.75,"rawY":6.5625,"scaledX":611.5555555555555,"scaledY":74.66666666666697,"rawWidth":17.8125,"rawHeight":713.125,"scaledWidth":202.66666666666674,"scaledHeight":8113.777777777777},{"rawX":97.1875,"rawY":142.8125,"scaledX":1105.7777777777778,"scaledY":1624.888888888889,"rawWidth":690,"rawHeight":12.1875,"scaledWidth":7850.666666666668,"scaledHeight":138.66666666666674},{"rawX":72.1875,"rawY":98.4375,"scaledX":821.3333333333334,"scaledY":1120,"rawWidth":825.3125,"rawHeight":15.3125,"scaledWidth":9390.222222222223,"scaledHeight":174.22222222222217},{"rawX":816.5625,"rawY":114.0625,"scaledX":9290.666666666668,"scaledY":1297.7777777777778,"rawWidth":17.8125,"rawHeight":265,"scaledWidth":202.66666666666606,"scaledHeight":3015.111111111111},{"rawX":778.125,"rawY":142.5,"scaledX":8853.333333333334,"scaledY":1621.3333333333335,"rawWidth":8.4375,"rawHeight":184.6875,"scaledWidth":96,"scaledHeight":2101.3333333333335},{"rawX":777.8125,"rawY":395.9375,"scaledX":8849.777777777777,"scaledY":4504.888888888889,"rawWidth":10,"rawHeight":49.0625,"scaledWidth":113.77777777777919,"scaledHeight":558.2222222222226},{"rawX":794.6875,"rawY":379.6875,"scaledX":9041.777777777777,"scaledY":4320,"rawWidth":39.6875,"rawHeight":7.1875,"scaledWidth":451.55555555555657,"scaledHeight":81.77777777777828},{"rawX":713.8888888888888,"rawY":356.38888888888886,"scaledX":8122.469135802468,"scaledY":4054.913580246913,"rawWidth":37.22222222222217,"rawHeight":88.05555555555554,"scaledWidth":423.50617283950487,"scaledHeight":1001.8765432098767},{"rawX":747.4999999999999,"rawY":323.33333333333326,"scaledX":8504.888888888889,"scaledY":3678.814814814814,"rawWidth":22.77777777777783,"rawHeight":20.5555555555556,"scaledWidth":259.1604938271612,"scaledHeight":233.87654320987713},{"rawX":749.7222222222221,"rawY":343.88888888888886,"scaledX":8530.172839506171,"scaledY":3912.691358024691,"rawWidth":13.055555555555657,"rawHeight":17.5,"scaledWidth":148.543209876545,"scaledHeight":199.1111111111113},{"rawX":750.2777777777777,"rawY":360.83333333333326,"scaledX":8536.493827160493,"scaledY":4105.481481481481,"rawWidth":7.777777777777715,"rawHeight":10.5555555555556,"scaledWidth":88.49382716049331,"scaledHeight":120.09876543209884},{"rawX":769.9999999999999,"rawY":323.6111111111111,"scaledX":8760.888888888889,"scaledY":3681.975308641975,"rawWidth":8.333333333333371,"rawHeight":12.5,"scaledWidth":94.81481481481387,"scaledHeight":142.22222222222217},{"rawX":786.3888888888888,"rawY":386.66666666666663,"scaledX":8947.358024691357,"scaledY":4399.407407407407,"rawWidth":15,"rawHeight":14.166666666666629,"scaledWidth":170.66666666666788,"scaledHeight":161.18518518518522},{"rawX":712.7777777777777,"rawY":444.7222222222222,"scaledX":8109.827160493826,"scaledY":5059.95061728395,"rawWidth":10.277777777777715,"rawHeight":80.27777777777771,"scaledWidth":116.93827160493765,"scaledHeight":913.382716049382},{"rawX":714.9999999999999,"rawY":520.5555555555554,"scaledX":8135.11111111111,"scaledY":5922.765432098764,"rawWidth":36.111111111111086,"rawHeight":9.444444444444457,"scaledWidth":410.86419753086284,"scaledHeight":107.45679012345681},{"rawX":777.7777777777777,"rawY":520.5555555555554,"scaledX":8849.382716049382,"scaledY":5922.765432098764,"rawWidth":29.444444444444343,"rawHeight":12.222222222222285,"scaledWidth":335.01234567901156,"scaledHeight":139.06172839506235},{"rawX":786.9444444444443,"rawY":437.2222222222222,"scaledX":8953.679012345678,"scaledY":4974.617283950617,"rawWidth":23.888888888888914,"rawHeight":7.5,"scaledWidth":271.80246913580413,"scaledHeight":85.33333333333303},{"rawX":799.1666666666665,"rawY":444.4444444444444,"scaledX":9092.740740740739,"scaledY":5056.79012345679,"rawWidth":8.6111111111112,"rawHeight":76.11111111111103,"scaledWidth":97.97530864197688,"scaledHeight":865.9753086419742},{"rawX":734.7826086956519,"rawY":455.2173913043477,"scaledX":8360.193236714973,"scaledY":5179.362318840578,"rawWidth":18.04347826086962,"rawHeight":8.47826086956519,"scaledWidth":205.29468599033862,"scaledHeight":96.463768115942},{"rawX":734.5652173913041,"rawY":498.4782608695651,"scaledX":8357.719806763283,"scaledY":5671.5748792270515,"rawWidth":18.695652173913004,"rawHeight":8.47826086956519,"scaledWidth":212.71497584540884,"scaledHeight":96.463768115942},{"rawX":777.3913043478259,"rawY":455.2173913043477,"scaledX":8844.985507246374,"scaledY":5179.362318840578,"rawWidth":13.478260869565133,"rawHeight":8.260869565217376,"scaledWidth":153.3526570048307,"scaledHeight":93.99033816425163},{"rawX":777.173913043478,"rawY":499.3478260869564,"scaledX":8842.512077294683,"scaledY":5681.468599033815,"rawWidth":13.913043478260875,"rawHeight":8.913043478260818,"scaledWidth":158.29951690821326,"scaledHeight":101.41062801932367},{"rawX":777.9545454545453,"rawY":532.9545454545453,"scaledX":8851.393939393938,"scaledY":6063.838383838382,"rawWidth":12.5,"rawHeight":38.40909090909088,"scaledWidth":142.2222222222208,"scaledHeight":437.0101010101007},{"rawX":752.272727272727,"rawY":610.681818181818,"scaledX":8559.191919191917,"scaledY":6948.2020202020185,"rawWidth":27.045454545454618,"rawHeight":4.090909090909122,"scaledWidth":307.7171717171732,"scaledHeight":46.54545454545496},{"rawX":757.9545454545453,"rawY":604.7727272727271,"scaledX":8623.838383838382,"scaledY":6880.969696969696,"rawWidth":18.863636363636374,"rawHeight":4.772727272727252,"scaledWidth":214.62626262626327,"scaledHeight":54.30303030303003},{"rawX":762.272727272727,"rawY":600.2272727272725,"scaledX":8672.969696969694,"scaledY":6829.252525252523,"rawWidth":19.772727272727252,"rawHeight":3.863636363636374,"scaledWidth":224.9696969696961,"scaledHeight":43.9595959595963},{"rawX":767.4999999999998,"rawY":595.681818181818,"scaledX":8732.444444444442,"scaledY":6777.5353535353515,"rawWidth":15.454545454545496,"rawHeight":4.545454545454504,"scaledWidth":175.8383838383852,"scaledHeight":51.71717171717137},{"rawX":773.4090909090907,"rawY":588.181818181818,"scaledX":8799.676767676765,"scaledY":6692.2020202020185,"rawWidth":8.863636363636374,"rawHeight":6.81818181818187,"scaledWidth":100.8484848484859,"scaledHeight":77.57575757575796},{"rawX":776.3636363636361,"rawY":581.1363636363635,"scaledX":8833.292929292928,"scaledY":6612.040404040403,"rawWidth":13.863636363636374,"rawHeight":6.363636363636374,"scaledWidth":157.73737373737276,"scaledHeight":72.40404040404064},{"rawX":778.181818181818,"rawY":569.7727272727271,"scaledX":8853.979797979797,"scaledY":6482.7474747474735,"rawWidth":13.409090909090878,"rawHeight":10.68181818181813,"scaledWidth":152.56565656565544,"scaledHeight":121.53535353535335},{"rawX":744.0909090909089,"rawY":520.2272727272726,"scaledX":8466.101010101009,"scaledY":5919.030303030302,"rawWidth":7.727272727272748,"rawHeight":36.36363636363626,"scaledWidth":87.91919191919078,"scaledHeight":413.73737373737276},{"rawX":629.7727272727271,"rawY":545.9090909090908,"scaledX":7165.41414141414,"scaledY":6211.2323232323215,"rawWidth":114.31818181818176,"rawHeight":10.68181818181813,"scaledWidth":1300.6868686868684,"scaledHeight":121.53535353535335},{"rawX":579.9999999999999,"rawY":548.181818181818,"scaledX":6599.11111111111,"scaledY":6237.090909090907,"rawWidth":55.68181818181813,"rawHeight":27.954545454545496,"scaledWidth":633.5353535353524,"scaledHeight":318.0606060606069},{"rawX":547.0454545454544,"rawY":545.681818181818,"scaledX":6224.161616161615,"scaledY":6208.646464646463,"rawWidth":32.27272727272725,"rawHeight":22.045454545454504,"scaledWidth":367.1919191919187,"scaledHeight":250.82828282828268},{"rawX":525.9090909090908,"rawY":539.5454545454544,"scaledX":5983.676767676766,"scaledY":6138.828282828281,"rawWidth":20.68181818181813,"rawHeight":14.545454545454504,"scaledWidth":235.31313131313073,"scaledHeight":165.49494949494965},{"rawX":419.54545454545445,"rawY":554.0909090909089,"scaledX":4773.494949494949,"scaledY":6304.3232323232305,"rawWidth":109.7727272727272,"rawHeight":13.863636363636374,"scaledWidth":1248.969696969696,"scaledHeight":157.73737373737367},{"rawX":437.4999999999999,"rawY":614.3181818181816,"scaledX":4977.7777777777765,"scaledY":6989.575757575756,"rawWidth":14.545454545454504,"rawHeight":16.136363636363626,"scaledWidth":165.49494949494965,"scaledHeight":183.59595959595936},{"rawX":437.27272727272714,"rawY":597.9545454545453,"scaledX":4975.191919191918,"scaledY":6803.393939393937,"rawWidth":13.181818181818187,"rawHeight":16.363636363636374,"scaledWidth":149.9797979797977,"scaledHeight":186.18181818181893},{"rawX":435.2272727272726,"rawY":584.7727272727271,"scaledX":4951.919191919191,"scaledY":6653.41414141414,"rawWidth":15.227272727272748,"rawHeight":12.5,"scaledWidth":173.25252525252472,"scaledHeight":142.22222222222172},{"rawX":442.4999999999999,"rawY":583.4090909090908,"scaledX":5034.666666666665,"scaledY":6637.8989898989885,"rawWidth":13.181818181818187,"rawHeight":7.5,"scaledWidth":149.9797979797986,"scaledHeight":85.33333333333303},{"rawX":449.5454545454544,"rawY":578.181818181818,"scaledX":5114.828282828281,"scaledY":6578.424242424241,"rawWidth":12.272727272727309,"rawHeight":8.18181818181813,"scaledWidth":139.63636363636488,"scaledHeight":93.0909090909081},{"rawX":455.6818181818181,"rawY":573.8636363636361,"scaledX":5184.646464646464,"scaledY":6529.2929292929275,"rawWidth":13.18181818181813,"rawHeight":8.181818181818244,"scaledWidth":149.9797979797977,"scaledHeight":93.09090909090901},{"rawX":463.86363636363626,"rawY":569.0909090909089,"scaledX":5277.737373737373,"scaledY":6474.989898989897,"rawWidth":9.999999999999943,"rawHeight":7.954545454545496,"scaledWidth":113.77777777777737,"scaledHeight":90.50505050505126},{"rawX":466.1363636363635,"rawY":563.181818181818,"scaledX":5303.595959595958,"scaledY":6407.757575757574,"rawWidth":12.045454545454561,"rawHeight":10,"scaledWidth":137.0505050505053,"scaledHeight":113.77777777777737},{"rawX":650.681818181818,"rawY":614.9999999999998,"scaledX":7403.31313131313,"scaledY":6997.333333333331,"rawWidth":137.72727272727263,"rawHeight":8.409090909090992,"scaledWidth":1567.0303030303012,"scaledHeight":95.67676767676858},{"rawX":650.681818181818,"rawY":622.2727272727271,"scaledX":7403.31313131313,"scaledY":7080.0808080808065,"rawWidth":8.18181818181813,"rawHeight":8.409090909090878,"scaledWidth":93.0909090909081,"scaledHeight":95.67676767676767},{"rawX":505.90909090909076,"rawY":628.6363636363635,"scaledX":5756.121212121211,"scaledY":7152.484848484847,"rawWidth":150.45454545454538,"rawHeight":7.727272727272634,"scaledWidth":1711.8383838383825,"scaledHeight":87.91919191919078},{"rawX":505.90909090909076,"rawY":628.6363636363635,"scaledX":5756.121212121211,"scaledY":7152.484848484847,"rawWidth":8.863636363636374,"rawHeight":59.545454545454504,"scaledWidth":100.84848484848499,"scaledHeight":677.4949494949497},{"rawX":477.9545454545453,"rawY":682.0454545454544,"scaledX":5438.060606060605,"scaledY":7760.161616161615,"rawWidth":44.77272727272731,"rawHeight":7.954545454545382,"scaledWidth":509.41414141414134,"scaledHeight":90.50505050504944},{"rawX":431.1363636363635,"rawY":629.9999999999998,"scaledX":4905.373737373736,"scaledY":7167.999999999997,"rawWidth":12.5,"rawHeight":16.363636363636374,"scaledWidth":142.22222222222263,"scaledHeight":186.18181818181893},{"rawX":362.4999999999999,"rawY":647.2727272727271,"scaledX":4124.444444444443,"scaledY":7364.525252525251,"rawWidth":87.5,"rawHeight":189.31818181818176,"scaledWidth":995.5555555555557,"scaledHeight":2154.0202020202014},{"rawX":477.9545454545453,"rawY":682.272727272727,"scaledX":5438.060606060605,"scaledY":7762.747474747473,"rawWidth":29.545454545454504,"rawHeight":154.5454545454545,"scaledWidth":336.1616161616157,"scaledHeight":1758.3838383838383},{"rawX":478.1818181818181,"rawY":837.0454545454543,"scaledX":5440.646464646464,"scaledY":9523.71717171717,"rawWidth":14.772727272727252,"rawHeight":32.5,"scaledWidth":168.0808080808074,"scaledHeight":369.7777777777774},{"rawX":326.590909090909,"rawY":864.772727272727,"scaledX":3715.878787878787,"scaledY":9839.191919191917,"rawWidth":152.95454545454538,"rawHeight":11.363636363636374,"scaledWidth":1740.2828282828277,"scaledHeight":129.29292929292933},{"rawX":327.04545454545445,"rawY":759.3181818181816,"scaledX":3721.050505050504,"scaledY":8639.353535353534,"rawWidth":7.045454545454561,"rawHeight":105.68181818181813,"scaledWidth":80.16161616161662,"scaledHeight":1202.424242424242},{"rawX":210.68181818181813,"rawY":749.0909090909089,"scaledX":2397.0909090909086,"scaledY":8522.989898989897,"rawWidth":114.09090909090907,"rawHeight":15.909090909090878,"scaledWidth":1298.1010101010097,"scaledHeight":181.0101010101007},{"rawX":320.9090909090908,"rawY":752.272727272727,"scaledX":3651.2323232323224,"scaledY":8559.191919191917,"rawWidth":9.772727272727252,"rawHeight":10.227272727272748,"scaledWidth":111.19191919191871,"scaledHeight":116.36363636363603},{"rawX":192.27272727272722,"rawY":749.772727272727,"scaledX":2187.636363636363,"scaledY":8530.747474747472,"rawWidth":18.18181818181816,"rawHeight":8.181818181818244,"scaledWidth":206.86868686868684,"scaledHeight":93.09090909090992},{"rawX":46.136363636363626,"rawY":740.4545454545453,"scaledX":524.9292929292928,"scaledY":8424.72727272727,"rawWidth":155.4545454545454,"rawHeight":9.772727272727252,"scaledWidth":1768.727272727272,"scaledHeight":111.19191919192053},{"rawX":49.999999999999986,"rawY":719.0909090909089,"scaledX":568.8888888888888,"scaledY":8181.6565656565635,"rawWidth":21.136363636363626,"rawHeight":23.409090909090878,"scaledWidth":240.48484848484827,"scaledHeight":266.34343434343464},{"rawX":67.49999999999999,"rawY":736.8181818181816,"scaledX":767.9999999999999,"scaledY":8383.353535353534,"rawWidth":6.36363636363636,"rawHeight":5.909090909090878,"scaledWidth":72.4040404040403,"scaledHeight":67.23232323232332},{"rawX":97.49999999999997,"rawY":711.5909090909089,"scaledX":1109.333333333333,"scaledY":8096.3232323232305,"rawWidth":275.4545454545454,"rawHeight":8.863636363636374,"scaledWidth":3134.060606060605,"scaledHeight":100.84848484848499},{"rawX":352.72727272727263,"rawY":714.5454545454544,"scaledX":4013.2525252525243,"scaledY":8129.939393939392,"rawWidth":17.95454545454544,"rawHeight":17.045454545454504,"scaledWidth":204.28282828282818,"scaledHeight":193.939393939394},{"rawX":850,"rawY":412,"scaledX":9671.111111111111,"scaledY":4687.644444444445,"rawWidth":0,"rawHeight":0,"scaledWidth":0,"scaledHeight":0},{"rawX":145.7142857142857,"rawY":203.57142857142856,"scaledX":1657.9047619047617,"scaledY":2316.190476190476,"rawWidth":0,"rawHeight":0,"scaledWidth":0,"scaledHeight":0}],"obstacles":[{"rawX":77.85714285714283,"rawY":667.142857142857,"scaledX":885.8412698412696,"scaledY":7590.603174603173},{"rawX":88.80952380952378,"rawY":655.9523809523807,"scaledX":1010.4550264550262,"scaledY":7463.280423280421},{"rawX":79.04761904761902,"rawY":629.5238095238094,"scaledX":899.3862433862431,"scaledY":7162.582010582009}],"powerUps":[{"rawX":88.33333333333331,"rawY":601.6666666666665,"scaledX":1005.0370370370368,"scaledY":6845.629629629628},{"rawX":81.4285714285714,"rawY":640.7142857142856,"scaledX":926.4761904761903,"scaledY":7289.904761904761},{"rawX":85.95238095238093,"rawY":690.2380952380951,"scaledX":977.9470899470898,"scaledY":7853.37566137566},{"rawX":185.47619047619042,"rawY":689.7619047619046,"scaledX":2110.306878306878,"scaledY":7847.95767195767}]}';
        	var objects = JSON.parse(objectsString);
			var boundaryArray = objects.boundaries;
			var obstacleArray = objects.obstacles;
			var powerUpArray = objects.powerUps;
    		createBoundaries(boundaryArray);
    		createObstacles(obstacleArray);
    		createPowerUps(powerUpArray);
        }

		function createObs(){
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
		}
		
		function createArrows(){
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
			var boundaryObjects = [];
			var boundaryObject;
			for (var i = 0; i < boundaryArray.length; i++) {
				console.log("creating boundary at: " + boundaryArray[i].scaledX + ", " + boundaryArray[i].scaledY);
				boundaryObject = boundaries.create(boundaryArray[i].scaledX, boundaryArray[i].scaledY);
				boundaryObject.width = boundaryArray[i].scaledWidth;
				boundaryObject.height = boundaryArray[i].scaledHeight;				
				boundaryObject.anchor.setTo(0, 0);
				boundaryObject.body.setRectangle(boundaryArray[i].scaledWidth, boundaryArray[i].scaledHeight, boundaryArray[i].scaledWidth / 2, boundaryArray[i].scaledHeight / 2);
				boundaryObject.body.static = true;
				boundaryObject.body.setCollisionGroup(boundaryCollisionGroup);
				boundaryObject.body.collides(playerCollisionGroup);
			}
		}

		function createObstacles (obstacleArray) {
			var obstacleObjects = [];
			var obstacleObject;
			for (var i = 0; i < obstacleArray.length; i++) {
				console.log("creating obstacle at: " + obstacleArray[i].scaledX + ", " + obstacleArray[i].scaledY);
				obstacleObject = obstacles.create(obstacleArray[i].scaledX, obstacleArray[i].scaledY, 'trashCan');
				obstacleObject.anchor.setTo(0, 0);
				obstacleObject.body.setRectangleFromSprite(obstacleObject.sprite);
				obstacleObject.body.static = true;
				obstacleObject.body.setCollisionGroup(obstacleCollisionGroup);
				obstacleObject.body.collides(playerCollisionGroup);
			}
		}

		function createPowerUps (powerUpArray) {
			var powerUpObjects = [];
			var powerUpObject;
			for (var i = 0; i < powerUpArray.length; i++) {
				console.log("creating power-up at: " + powerUpArray[i].scaledX + ", " + powerUpArray[i].scaledY);
				powerUpObject = powerUps.create(powerUpArray[i].scaledX, powerUpArray[i].scaledY, 'powerUp');
				powerUpObject.anchor.setTo(0, 0);
				powerUpObject.body.immovable = true;
			}
		}
	
        function create () {
			// enable P2 Physics system
	        game.physics.startSystem(Phaser.Physics.P2JS);
	        // turn on collisions
	        game.physics.p2.setImpactEvents(true);
	        game.physics.p2.restitution = 0.8;

	        // set objects to collide with world bounds
	        game.physics.p2.updateBoundsCollisionGroup();

	        playerCollisionGroup = game.physics.p2.createCollisionGroup();
        	boundaryCollisionGroup = game.physics.p2.createCollisionGroup();
        	obstacleCollisionGroup = game.physics.p2.createCollisionGroup();

	        // set world size
	        game.world.setBounds(0, 0, WORLDWIDTH, WORLDHEIGHT);

	        // background (map)
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
			
			//finish line
			finish = game.add.sprite(3100, 16065, 'finish');
			finish.scale.setTo(0.25, .75);

	        // add arrows

	        createArrows();

	        // player
	        player = game.add.sprite(PLAYERSTARTX, PLAYERSTARTY, 'bluebike');
	        player.anchor.setTo(0.5, 0.5);
		    player.scale.setTo(0.5, 0.5);
		    player.laps = 0;
	        game.physics.p2.enable(player);
	        player.body.setCollisionGroup(playerCollisionGroup);
	        player.body.collides([boundaryCollisionGroup, obstacleCollisionGroup]);
	        player.body.fixedRotation = true;
	        //player.body.collideWorldBounds = true;
	        console.log(player.body.debug);

	        // set up objects physics	        
			boundaries = game.add.group();			
			obstacles = game.add.group();			
			powerUps = game.add.group();
	        boundaries.enableBody = true;
	        obstacles.enableBody = true;
	        powerUps.enableBody = true;
	        boundaries.physicsBodyType = Phaser.Physics.P2JS;
	        obstacles.physicsBodyType = Phaser.Physics.P2JS;
	        powerUps.physicsBodyType = Phaser.Physics.P2JS;

	        // create objects
	        createObjects();
			
	        // set up camera size
	        game.camera.width = 1280;
	        game.camera.height = 720;

	        // controls
	        cursors = game.input.keyboard.createCursorKeys();
			
			//endText
			endText = game.add.text(player.x, player.y, "", {
						font: "65px Arial",
						fill: "#ff0044",
						align: "center"
			});
			endText.anchor.setTo(0.5, 0.5);

        }

        function toDegrees (angle) {
        	return angle * (180 / Math.PI);
	    }
		
		function forward() {		//forward function
			if (speed < 0) {		// if going backwards, brake and move forward
				speed += (acceleration + braking);
			}
			else if(speed < maxSpeed){	//max speed
				speed += acceleration;
			}
			if (speed > maxSpeed) {
				speed = maxSpeed;
			}
		}

		function reverse() {	//reverse function
			if (speed > 0) {		// if going forward, brake and reverse
				speed -= (acceleration + braking);
			}
			else if(speed > (-maxSpeed / 2)) {	// min speed
				speed -= acceleration;
			}
			else if (speed < (-maxSpeed / 2)) {
				speed = -maxSpeed / 2;
			}
		}

		function decelerate() {
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

			// player controls

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
			endText.x = player.x;
			endText.y = player.y;
			
			//check for finish line
			if (checkOverlap(player, finish)&& cooldown < 0)
			{
				player.laps++;
				cooldown = 2400;//resets cooldown to prevent multiple lap increments
				if(player.laps >= 3){
					socket.emit('gameWin', { id:player.id});
					endText.setText("You Win!")
				}
			}
			cooldown--;//decrement cooldown
			game.debug.text("player laps: "+ player.laps + "/3", 32, 32);
	
	        // check for collisions
	        //var hitArrows = game.physics.p2.collide(player, arrow);
			//var hitObstacle = game.physics.p2.collide(player, obstacles);

			//var hitBoundaries = game.physics.p2.collide(player, boundaries);
			
			// if(hitObstacle == true){
			// 	speed = 0;
			// }
			socket.emit('movePlayer', { x: player.x, y: player.y, angle: player.angle, laps: player.laps});
		}

		function render () {
			game.debug.spriteInfo(player, 32, 32);
			game.debug.body(player);
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

