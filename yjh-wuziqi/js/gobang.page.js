$(function() {
	var interval = Math.min($(window).width(), 480);
	interval = interval - 20 * 2 - 10 * 2;
	interval = Math.floor(interval / 14);
	/*调用Gobang()*/
	var chess = $('#gobang_container').Gobang({
		GameMode: 1,
		playerColor: -1,
		callback_victory: function(GameMode, chessColor, playerColor) {
			if(chessColor == -1) {
				$('#showResult').find('.modal-title').text('提示【你执' + (playerColor == 1 ? "白子" : "黑子") + '】');
				$('#showResult').find('.modal-body').text('黑棋赢了！');
			} else {
				$('#showResult').find('.modal-title').text('提示【你执' + (playerColor == 1 ? "白子" : "黑子") + '】');
				$('#showResult').find('.modal-body').text('白棋赢了！');
			}
			$('#showResult').modal();
		}
	}, {
		interval: interval,
		padding: 20,
	});
	$("[name='firstStart']").on("change", function(e) {
		var start = $(e.target).val();
		if(start == "player") {
			$('#OptionsB1').removeAttr('disabled');
		} else {
			$('#OptionsB1').attr('disabled', 'disabled');
		}
		refreshState();
	});
	$("[name='firstColor']").on("change", function(e) {
		refreshState();
	});
	$("#OptionsB1").on("change", function(e) {
		var checked = $('#OptionsB1').filter(":checked");
		if(checked.length == 1) {
			$('#gameState').text("游戏模式：玩家自由对战");
		} else {
			refreshState();
		}
	});

	function refreshState() {
		var start = $("[name='firstStart']").filter(":checked").val();
		var color = $("[name='firstColor']").filter(":checked").val();
		var state = "游戏模式：";
		if(start === "player")
			state += "玩家";
		else
			state += "电脑";
		if(color === "black")
			state += "执黑";
		else
			state += "执白";
		$('#gameState').text(state + "先行");
	}

	function getPlayerColor(start, color) {
		if(start === "player") {
			return color;
		}
		if(color === "black") {//默认电脑黑子先行
			return "white";//默认玩家是白色
		}
		return "black";
	}

	function isFreedomPlayer(start) {
		if(start !== "player") {
			return false;
		}
		var checked = $('#OptionsB1').filter(":checked");
		if(checked.length != 1) {
			return false;
		}
		return true;
	}
	$('.id_start_game').click(function() {
		var start = $("[name='firstStart']").filter(":checked").val();
		var color = $("[name='firstColor']").filter(":checked").val();
		if(isFreedomPlayer(start)) {
			chess = $('#gobang_container').Gobang({
				GameMode: 3,
				playerColor: (color == "black") ? -1 : 1,
				blackStart: (color == "black") ? true : false,
				callback_victory: function(GameMode, chessColor, playerColor) {
					if(chessColor == -1) {
						$('#showResult').find('.modal-title').text('提示【先行执' + (playerColor == 1 ? "白子" : "黑子") + '】');
						$('#showResult').find('.modal-body').text('黑棋赢了！');
					} else {
						$('#showResult').find('.modal-title').text('提示【先行执' + (playerColor == 1 ? "白子" : "黑子") + '】');
						$('#showResult').find('.modal-body').text('白棋赢了！');
					}
					$('#showResult').modal();
				}
			});
		} else {
			chess = $('#gobang_container').Gobang({
				GameMode: 1,
				playerColor: (getPlayerColor(start, color) == "black") ? -1 : 1,
				blackStart: (color == "black") ? true : false,
				callback_victory: function(GameMode, chessColor, playerColor) {
					if(chessColor == -1) {
						$('#showResult').find('.modal-title').text('提示【你执' + (playerColor == 1 ? "白子" : "黑子") + '】');
						$('#showResult').find('.modal-body').text('黑棋赢了！');
					} else {
						$('#showResult').find('.modal-title').text('提示【你执' + (playerColor == 1 ? "白子" : "黑子") + '】');
						$('#showResult').find('.modal-body').text('白棋赢了！');
					}
					$('#showResult').modal();
				}
			});
		}
	});
});
