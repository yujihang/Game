(function($, window, document) {
	var DEBUG_MODE = true;
	var DEBUG_STEP = 1;
	var GameToken = "";
	var nextStep = null;
	/*
	 * 这里的设置是可以通过控制台之类的工具修改的
	 * 如果实战，服务器应当实现完全的胜负判定、默认规则
	 * 悔棋（残局）可以通过移除（设置）chessArr的数据来实现
	 * 悔棋还需要加（或修改）一个记录棋步的数组
	 */
	var chessboardOptions = {
		adaptable: true, // 自动设置棋盘宽度、棋盘间距
		chessboard_container: null,
		chessboard_width: 0, // 棋盘宽度，设置了也没用，宽度可设置interval来调节
		chessboard_interval: 30, //棋盘线间隔 
		chessboard_padding: 20, // 棋盘内间距
		chessboard_margin: 10, // 棋盘外间距
		//@params 游戏模式, 胜利方执子颜色, 玩家执子颜色
		callback_victory: function(GameMode, chessColor, playerColor) {},
	};
	// 这里可以自定义游戏数据
	var defaultOptions = {
		GameMode: 1, // 1.玩家对战电脑 2.联网玩家对战 3.玩家自由对战
		initURL: '/', // 游戏初始化链接
		gameURL: '/', // 游戏数据链接
		chessArray: [], // 记录棋子
		chessCount: 0, // 记录棋步
		blackStart: true, // 黑先
		playerColor: -1, // 玩家执子颜色
		isGameStart: false, // 游戏已经开始
		isGameOver: false, // 游戏结束
		blackLastChess: [], // 黑棋最后下子位置
		whiteLastChess: [], // 白棋最后下子位置
	};
	// 这里的属性不可由用户初始化改变值，其实是可以自由改变的
	var defaultConfigs = {
		NO_CHESS: 0,
		BLACK_CHESS: -1,
		WHITE_CHESS: 1,
		MODE_MAN_MACHINE: 1,
		MODE_NETWORK: 2,
		MODE_FREEDOM: 3
	};
	var AI = {
		//AI下棋
		moveChess: function(chessColor) {
			var maxX = 0,
				maxY = 0,
				maxWeight = 0,
				i, j, temp;
			for(i = 14; i >= 0; i--) {
				for(j = 14; j >= 0; j--) {
					if(defaultOptions.chessArray[i][j] !== defaultConfigs.NO_CHESS) {
						continue;
					}
					tem = this.computeWeight(i, j, chessColor);
					if(tem > maxWeight) {
						maxWeight = tem;
						maxX = i;
						maxY = j;
					}
				}
			}
			playChess(maxX, maxY, chessColor);
			if(chessColor == defaultConfigs.BLACK_CHESS)
				defaultOptions.blackLastChess = [maxX, maxY];
			else
				defaultOptions.whiteLastChess = [maxX, maxY];
			if((maxWeight >= 100000 && maxWeight < 250000) || (maxWeight >= 500000)) {
				hasWin(chessColor);
			} else {
				nextPlayer();
			}
		},
		//下子到i，j X方向 结果: 多少连子 两边是否截断
		putDirectX: function(i, j, chessColor) {
			var m, n,
				nums = 1,
				side1 = false,
				side2 = false;
			for(m = j - 1; m >= 0; m--) {
				if(defaultOptions.chessArray[i][m] === chessColor) {
					nums++;
				} else {
					if(defaultOptions.chessArray[i][m] === defaultConfigs.NO_CHESS) {
						side1 = true;
					}
					break;
				}
			}
			for(m = j + 1; m < 15; m++) {
				if(defaultOptions.chessArray[i][m] === chessColor) {
					nums++;
				} else {
					if(defaultOptions.chessArray[i][m] === defaultConfigs.NO_CHESS) {
						side2 = true;
					}
					break;
				}
			}
			return {
				"nums": nums,
				"side1": side1,
				"side2": side2
			};
		},
		//下子到i，j Y方向 结果
		putDirectY: function(i, j, chessColor) {
			var m, n,
				nums = 1,
				side1 = false,
				side2 = false;
			for(m = i - 1; m >= 0; m--) {
				if(defaultOptions.chessArray[m][j] === chessColor) {
					nums++;
				} else {
					if(defaultOptions.chessArray[m][j] === defaultConfigs.NO_CHESS) {
						side1 = true;
					}
					break;
				}
			}
			for(m = i + 1; m < 15; m++) {
				if(defaultOptions.chessArray[m][j] === chessColor) {
					nums++;
				} else {
					if(defaultOptions.chessArray[m][j] === defaultConfigs.NO_CHESS) {
						side2 = true;
					}
					break;
				}
			}
			return {
				"nums": nums,
				"side1": side1,
				"side2": side2
			};
		},
		//下子到i，j XY方向 结果
		putDirectXY: function(i, j, chessColor) {
			var m, n,
				nums = 1,
				side1 = false,
				side2 = false;
			for(m = i - 1, n = j - 1; m >= 0 && n >= 0; m--, n--) {
				if(defaultOptions.chessArray[m][n] === chessColor) {
					nums++;
				} else {
					if(defaultOptions.chessArray[m][n] === defaultConfigs.NO_CHESS) {
						side1 = true;
					}
					break;
				}
			}
			for(m = i + 1, n = j + 1; m < 15 && n < 15; m++, n++) {
				if(defaultOptions.chessArray[m][n] === chessColor) {
					nums++;
				} else {
					if(defaultOptions.chessArray[m][n] === defaultConfigs.NO_CHESS) {
						side2 = true;
					}
					break;
				}
			}
			return {
				"nums": nums,
				"side1": side1,
				"side2": side2
			};
		},
		putDirectYX: function(i, j, chessColor) {
			var m, n,
				nums = 1,
				side1 = false,
				side2 = false;
			for(m = i - 1, n = j + 1; m >= 0 && n < 15; m--, n++) {
				if(defaultOptions.chessArray[m][n] === chessColor) {
					nums++;
				} else {
					if(defaultOptions.chessArray[m][n] === defaultConfigs.NO_CHESS) {
						side1 = true;
					}
					break;
				}
			}
			for(m = i + 1, n = j - 1; m < 15 && n >= 0; m++, n--) {
				if(defaultOptions.chessArray[m][n] === chessColor) {
					nums++;
				} else {
					if(defaultOptions.chessArray[m][n] === defaultConfigs.NO_CHESS) {
						side2 = true;
					}
					break;
				}
			}
			return {
				"nums": nums,
				"side1": side1,
				"side2": side2
			};
		},
		//计算下子至i,j的权重
		computeWeight: function(i, j, chessColor) {
			var weight = 14 - (Math.abs(i - 7) + Math.abs(j - 7)), //基于棋盘位置权重
				pointInfo = {}; //某点下子后连子信息
			//x方向
			pointInfo = this.putDirectX(i, j, chessColor);
			weight += this.weightStatus(pointInfo.nums, pointInfo.side1, pointInfo.side2, true); //AI下子权重
			pointInfo = this.putDirectX(i, j, -chessColor);
			weight += this.weightStatus(pointInfo.nums, pointInfo.side1, pointInfo.side2, false); //player下子权重
			//y方向
			pointInfo = this.putDirectY(i, j, chessColor);
			weight += this.weightStatus(pointInfo.nums, pointInfo.side1, pointInfo.side2, true); //AI下子权重
			pointInfo = this.putDirectY(i, j, -chessColor);
			weight += this.weightStatus(pointInfo.nums, pointInfo.side1, pointInfo.side2, false); //player下子权重
			//左斜方向
			pointInfo = this.putDirectXY(i, j, chessColor);
			weight += this.weightStatus(pointInfo.nums, pointInfo.side1, pointInfo.side2, true); //AI下子权重
			pointInfo = this.putDirectXY(i, j, -chessColor);
			weight += this.weightStatus(pointInfo.nums, pointInfo.side1, pointInfo.side2, false); //player下子权重
			//右斜方向
			pointInfo = this.putDirectYX(i, j, chessColor);
			weight += this.weightStatus(pointInfo.nums, pointInfo.side1, pointInfo.side2, true); //AI下子权重
			pointInfo = this.putDirectYX(i, j, -chessColor);
			weight += this.weightStatus(pointInfo.nums, pointInfo.side1, pointInfo.side2, false); //player下子权重
			return weight;
		},
		//权重方案   独：两边为空可下子，单：一边为空
		weightStatus: function(nums, side1, side2, isAI) {
			var weight = 0;
			switch(nums) {
				case 1:
					if(side1 && side2) {
						weight = isAI ? 15 : 10; //独一
					}
					break;
				case 2:
					if(side1 && side2) {
						weight = isAI ? 100 : 50; //独二
					} else if(side1 || side2) {
						weight = isAI ? 10 : 5; //单二
					}
					break;
				case 3:
					if(side1 && side2) {
						weight = isAI ? 500 : 200; //独三
					} else if(side1 || side2) {
						weight = isAI ? 30 : 20; //单三
					}
					break;
				case 4:
					if(side1 && side2) {
						weight = isAI ? 5000 : 2000; //独四
					} else if(side1 || side2) {
						weight = isAI ? 400 : 100; //单四
					}
					break;
				case 5:
					weight = isAI ? 100000 : 10000; //五
					break;
				default:
					weight = isAI ? 500000 : 250000;
					break;
			}
			return weight;
		}

	};

	function gameInit(container) {
		if(DEBUG_MODE)
			console.log((DEBUG_STEP++) + ' : 游戏初始化');
		chessboardOptions.chessboard_container = container;
		container.html('<canvas id="id_gobang_board"></canvas><span class="indicator"></span>');
		var chess_canvas = container.find('canvas#id_gobang_board');
		var indicator = container.find('span.indicator');
		indicator.hide();//小黄点
		chess_canvas.on('mousedown', function(event) {
			// 如果不是玩家下棋阶段或是游戏已经结束，则直接返回
			if(!isPlayerTurn() || defaultOptions.isGameOver) {
				return;
			}
			var tx = event.offsetX - chessboardOptions.chessboard_margin - chessboardOptions.chessboard_padding;
			var ty = event.offsetY - chessboardOptions.chessboard_margin - chessboardOptions.chessboard_padding;
			var pointX = Math.floor(tx / chessboardOptions.chessboard_interval + 0.5);
			var pointY = Math.floor(ty / chessboardOptions.chessboard_interval + 0.5);
			if(defaultOptions.chessArray[pointX][pointY] === defaultConfigs.NO_CHESS) {
				var chessColor = getCurrentColor();
				playChess(pointX, pointY, chessColor);
				if(chessColor == defaultConfigs.BLACK_CHESS)
					defaultOptions.blackLastChess = [pointX, pointY];
				else
					defaultOptions.whiteLastChess = [pointX, pointY];
				winOrNot(pointX, pointY, chessColor);
			}
		});
		var i, j;
		for(i = 0; i < 15; i++) {
			defaultOptions.chessArray[i] = [];
			for(j = 0; j < 15; j++) {
				defaultOptions.chessArray[i][j] = defaultConfigs.NO_CHESS;
			}
		}
		defaultOptions.chessCount = 0;
		drawChessboard(container, chess_canvas);
		gameStart();
	}
	// 绘制棋盘
	function drawChessboard(container, chess_canvas) {
		chessboardOptions.chessboard_width = chessboardOptions.chessboard_interval * 14 + chessboardOptions.chessboard_padding * 2 + chessboardOptions.chessboard_margin * 2;
		container.css('width', chessboardOptions.chessboard_width + 'px');
		chess_canvas.attr('width', chessboardOptions.chessboard_width);
		chess_canvas.attr('height', chessboardOptions.chessboard_width);
		var start = chessboardOptions.chessboard_margin + chessboardOptions.chessboard_padding;
		var end = start + chessboardOptions.chessboard_interval * 14;

		var ctx = document.getElementById('id_gobang_board').getContext('2d');
		ctx.fillStyle = '#202020';
		ctx.font = "10px Aril";
		ctx.textAlign = 'center';
		for(var x = 0; x < 15; x++) {
			ctx.beginPath();
			ctx.moveTo(start + x * chessboardOptions.chessboard_interval, start);
			ctx.lineTo(start + x * chessboardOptions.chessboard_interval, end);
			ctx.stroke();
			ctx.fillText(String.fromCharCode(65 + x), start + x * chessboardOptions.chessboard_interval, start - 4);
		}
		ctx.textAlign = 'right';
		for(var y = 0; y < 15; y++) {
			ctx.beginPath();
			ctx.moveTo(start, start + y * chessboardOptions.chessboard_interval);
			ctx.lineTo(end, start + y * chessboardOptions.chessboard_interval);
			ctx.stroke();
			ctx.fillText("" + (y + 1), start - 4, start + y * chessboardOptions.chessboard_interval + 3);
		}
		var width = chessboardOptions.chessboard_interval * 14 + chessboardOptions.chessboard_padding * 2;
		ctx.rect(chessboardOptions.chessboard_margin, chessboardOptions.chessboard_margin, width, width);
		ctx.stroke();

		var r = 4,
			sAngle = 0,
			eAngle = Math.PI * 2;
		ctx.beginPath();
		ctx.arc(start + chessboardOptions.chessboard_interval * 3, start + chessboardOptions.chessboard_interval * 3, r, sAngle, eAngle);
		ctx.closePath();
		ctx.fillStyle = 'Rgb(0,0,0)';
		ctx.fill();
		ctx.beginPath();
		ctx.arc(start + chessboardOptions.chessboard_interval * 11, start + chessboardOptions.chessboard_interval * 3, r, sAngle, eAngle);
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		ctx.arc(start + chessboardOptions.chessboard_interval * 3, start + chessboardOptions.chessboard_interval * 11, r, sAngle, eAngle);
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		ctx.arc(start + chessboardOptions.chessboard_interval * 11, start + chessboardOptions.chessboard_interval * 11, r, sAngle, eAngle);
		ctx.closePath();
		ctx.fill();
	}
	// 游戏开始
	function gameStart() {
		if(DEBUG_MODE)
			console.log((DEBUG_STEP++) + ' : 游戏开始');
		defaultOptions.isGameStart = true;
		defaultOptions.isGameOver = false;

		/*if(defaultOptions.GameMode == defaultConfigs.MODE_NETWORK) {
			var chessColor = getCurrentColor();
			playChess(2, 2, chessColor);
			if(chessColor == defaultConfigs.BLACK_CHESS)
				defaultOptions.blackLastChess = [2, 2];
			else
				defaultOptions.whiteLastChess = [2, 2];
		}*/
		nextPlayer();
	}
	// 得到当前游戏方颜色
	function getCurrentColor() {
		//		if(DEBUG_MODE)
		//			console.log((DEBUG_STEP++) + ' : 得到当前游戏方颜色(' + defaultOptions.blackStart + "," + defaultOptions.chessCount + ")");
		if(defaultOptions.blackStart) {
			if(defaultOptions.chessCount % 2 == 0)
				return defaultConfigs.BLACK_CHESS;
			else
				return defaultConfigs.WHITE_CHESS;
		} else {
			if(defaultOptions.chessCount % 2 == 1)
				return defaultConfigs.BLACK_CHESS;
			else
				return defaultConfigs.WHITE_CHESS;
		}
	}

	function isPlayerTurn() { 
		switch(defaultOptions.GameMode) {
			case defaultConfigs.MODE_NETWORK:
			case defaultConfigs.MODE_MAN_MACHINE:
				{
					if(getCurrentColor() == defaultOptions.playerColor)
						return true;
				}
				break;
			case defaultConfigs.MODE_FREEDOM:
				return true;
			default:
				break;
		}
		return false;
	}

	// 得到下一步棋子
	function nextPlayer() {
		if(isPlayerTurn()) {
			if(DEBUG_MODE)
				console.log((DEBUG_STEP++) + ' : 等待玩家落子中');
			return;
		}
		switch(defaultOptions.GameMode) {
			case defaultConfigs.MODE_MAN_MACHINE:
				{
					if(DEBUG_MODE)
						console.log((DEBUG_STEP++) + ' : AI落子中');
					AI.moveChess(getCurrentColor());
				}
				break;
			case defaultConfigs.MODE_FREEDOM:
				{
					// 玩家落子
					if(DEBUG_MODE)
						console.log((DEBUG_STEP++) + ' : 等待另一位玩家落子中');
				}
				break;
			case defaultConfigs.MODE_NETWORK:
				{
					// 从服务器得到下一步
					// 因为阿里云不支持WebSocket所以没写啦
				}
				break;
			default:
				return;
		}
	}

	// 检测输赢
	function winOrNot(i, j, chessColor) {
		//		console.log('check color ' + chessColor);
		var nums = 1, //连续棋子个数
			m, n;
		//x方向
		for(m = j - 1; m >= 0; m--) {
			if(defaultOptions.chessArray[i][m] === chessColor) {
				nums++;
			} else {
				break;
			}
		}
		for(m = j + 1; m < 15; m++) {
			if(defaultOptions.chessArray[i][m] === chessColor) {
				nums++;
			} else {
				break;
			}
		}
		if(nums >= 5) {
			hasWin(chessColor);
			return;
		} else {
			nums = 1;
		}
		//y方向
		for(m = i - 1; m >= 0; m--) {
			if(defaultOptions.chessArray[m][j] === chessColor) {
				nums++;
			} else {
				break;
			}
		}
		for(m = i + 1; m < 15; m++) {
			if(defaultOptions.chessArray[m][j] === chessColor) {
				nums++;
			} else {
				break;
			}
		}
		if(nums >= 5) {
			hasWin(chessColor);
			return;
		} else {
			nums = 1;
		}
		//左斜方向
		for(m = i - 1, n = j - 1; m >= 0 && n >= 0; m--, n--) {
			if(defaultOptions.chessArray[m][n] === chessColor) {
				nums++;
			} else {
				break;
			}
		}
		for(m = i + 1, n = j + 1; m < 15 && n < 15; m++, n++) {
			if(defaultOptions.chessArray[m][n] === chessColor) {
				nums++;
			} else {
				break;
			}
		}
		if(nums >= 5) {
			hasWin(chessColor);
			return;
		} else {
			nums = 1;
		}
		//右斜方向
		for(m = i - 1, n = j + 1; m >= 0 && n < 15; m--, n++) {
			if(defaultOptions.chessArray[m][n] === chessColor) {
				nums++;
			} else {
				break;
			}
		}
		for(m = i + 1, n = j - 1; m < 15 && n >= 0; m++, n--) {
			if(defaultOptions.chessArray[m][n] === chessColor) {
				nums++;
			} else {
				break;
			}
		}
		if(nums >= 5) {
			hasWin(chessColor);
			return;
		}
		nextPlayer();
	}

	function hasWin(chessColor) {
		gameOver();
		showWinChesses(chessColor);
		// 这行建议放在最后执行
		defaultOptions.callback_victory(defaultOptions.GameMode, chessColor, defaultOptions.playerColor);
	}

	//标记显示获胜棋子
	function showWinChesses(chessColor) {
		var nums = 1, //连续棋子个数
			lineChess = [], //连续棋子位置
			i,
			j,
			chessColor,
			m, n;
		var winColor = (chessColor == defaultOptions.BLACK_CHESS) ? 'black' : 'white';
		if(chessColor == defaultConfigs.BLACK_CHESS) {
			i = defaultOptions.blackLastChess[0];
			j = defaultOptions.blackLastChess[1];
		} else {
			i = defaultOptions.whiteLastChess[0];
			j = defaultOptions.whiteLastChess[1];
		}
		console.log(winColor + ' win.');
		console.log(i + ',' + j);
		//x方向
		lineChess[0] = [i];
		lineChess[1] = [j];
		for(m = j - 1; m >= 0; m--) {
			if(defaultOptions.chessArray[i][m] === chessColor) {
				lineChess[0][nums] = i;
				lineChess[1][nums] = m;
				nums++;
			} else {
				break;
			}
		}
		for(m = j + 1; m < 15; m++) {
			if(defaultOptions.chessArray[i][m] === chessColor) {
				lineChess[0][nums] = i;
				lineChess[1][nums] = m;
				nums++;
			} else {
				break;
			}
		}
		if(nums >= 5) {
			console.log(nums);
			for(k = nums - 1; k >= 0; k--) {
				markChess(lineChess[0][k], lineChess[1][k], winColor);
			}
			return;
		}
		//y方向
		nums = 1;
		lineChess[0] = [i];
		lineChess[1] = [j];
		for(m = i - 1; m >= 0; m--) {
			if(defaultOptions.chessArray[m][j] === chessColor) {
				lineChess[0][nums] = m;
				lineChess[1][nums] = j;
				nums++;
			} else {
				break;
			}
		}
		for(m = i + 1; m < 15; m++) {
			if(defaultOptions.chessArray[m][j] === chessColor) {
				lineChess[0][nums] = m;
				lineChess[1][nums] = j;
				nums++;
			} else {
				break;
			}
		}
		if(nums >= 5) {
			console.log(nums);
			for(k = nums - 1; k >= 0; k--) {
				markChess(lineChess[0][k], lineChess[1][k], winColor);
			}
			return;
		}
		//左斜方向
		nums = 1;
		lineChess[0] = [i];
		lineChess[1] = [j];
		for(m = i - 1, n = j - 1; m >= 0 && n >= 0; m--, n--) {
			if(defaultOptions.chessArray[m][n] === chessColor) {
				lineChess[0][nums] = m;
				lineChess[1][nums] = n;
				nums++;
			} else {
				break;
			}
		}
		for(m = i + 1, n = j + 1; m < 15 && n < 15; m++, n++) {
			if(defaultOptions.chessArray[m][n] === chessColor) {
				lineChess[0][nums] = m;
				lineChess[1][nums] = n;
				nums++;
			} else {
				break;
			}
		}
		if(nums >= 5) {
			console.log(nums);
			for(k = nums - 1; k >= 0; k--) {
				markChess(lineChess[0][k], lineChess[1][k], winColor);
			}
			return;
		}
		//右斜方向
		nums = 1;
		lineChess[0] = [i];
		lineChess[1] = [j];
		for(m = i - 1, n = j + 1; m >= 0 && n < 15; m--, n++) {
			if(defaultOptions.chessArray[m][n] === chessColor) {
				lineChess[0][nums] = m;
				lineChess[1][nums] = n;
				nums++;
			} else {
				break;
			}
		}
		for(m = i + 1, n = j - 1; m < 15 && n >= 0; m++, n--) {
			if(defaultOptions.chessArray[m][n] === chessColor) {
				lineChess[0][nums] = m;
				lineChess[1][nums] = n;
				nums++;
			} else {
				break;
			}
		}
		if(nums >= 5) {
			console.log(nums);
			for(k = nums - 1; k >= 0; k--) {
				markChess(lineChess[0][k], lineChess[1][k], winColor);
			}
		}
	}

	function markChess(pointX, pointY, color) {
		console.log(pointX + ',' + pointY + ',' + color);
		var start = chessboardOptions.chessboard_margin + chessboardOptions.chessboard_padding;
		var r = 4,
			sAngle = 0,
			eAngle = Math.PI * 2;
		var ctx = document.getElementById('id_gobang_board').getContext('2d');
		ctx.beginPath();
		ctx.arc(start + chessboardOptions.chessboard_interval * pointX, start + chessboardOptions.chessboard_interval * pointY, r, sAngle, eAngle);
		ctx.closePath();
		ctx.fillStyle = 'Rgb(255,120,0)';
		ctx.fill();
		ctx.stroke();
	}

	function gameOver() {
		defaultOptions.isGameStart = false;
		defaultOptions.isGameOver = true;
		chessboardOptions.chessboard_container.find('span.indicator').hide();//当前棋子的小黄点隐藏
	}

	// 落子pointX行，pointY列，chessColor颜色
	function playChess(pointX, pointY, chessColor) {
		if(pointX < 0 || pointX > 14)
			return;
		if(pointY < 0 || pointY > 14)
			return;
		chessboardOptions.chessboard_container.find('span.indicator').show();
		defaultOptions.chessCount++;
		defaultOptions.chessArray[pointX][pointY] = chessColor;

		var start = chessboardOptions.chessboard_margin + chessboardOptions.chessboard_padding;
		var r = chessboardOptions.chessboard_interval * 2 / 5,
			sAngle = 0,
			eAngle = Math.PI * 2;
		var ctx = document.getElementById('id_gobang_board').getContext('2d');
		ctx.beginPath();
		ctx.arc(start + chessboardOptions.chessboard_interval * pointX, start + chessboardOptions.chessboard_interval * pointY, r, sAngle, eAngle);
		ctx.closePath();
		if(chessColor === defaultConfigs.BLACK_CHESS) {
			ctx.fillStyle = 'Rgb(0,0,0)';
			ctx.fill();
		} else {
			ctx.fillStyle = 'Rgb(255,255,255)';
			ctx.fill();
			ctx.stroke();
		}
		var _margin = chessboardOptions.chessboard_container.find('span.indicator').width() / 2;
		chessboardOptions.chessboard_container.find('span.indicator').css({
			left: (start + chessboardOptions.chessboard_interval * pointX - _margin) + 'px',//span.indicator不是圆，是块，左上角位置
			top: (start + chessboardOptions.chessboard_interval * pointY - _margin) + 'px',
		});
	}

	$.fn.Gobang = function(options, boards) {
		defaultOptions = $.extend(defaultOptions, options);
		chessboardOptions = $.extend(chessboardOptions, boards);
		if(chessboardOptions.adaptable) {
			var interval = Math.min($(window).width(), 480);
			interval = interval - chessboardOptions.chessboard_margin * 2 - chessboardOptions.chessboard_padding * 2;
			interval = Math.floor(interval / 14);
			chessboardOptions.chessboard_interval = interval;
		}
		gameInit(this);
		return defaultOptions;
	}
})(jQuery, window, document);
