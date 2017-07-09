# Gobang
五子棋，实现人机对战和玩家对战。
纯Canvas绘制，支持人机对战、玩家自由对战，预留联网对战实现。

# 人机对战，先行执黑
```javascript
$('#gobang_container').Gobang({
		GameMode: 1, // 游戏模式：1，人机；2.联网；3.自由
		playerColor: -1, // 玩家执子颜色：1，白色；-1，黑色
		blackStart: true, // 默认为true，表示黑子先行
		callback_victory: function(GameMode, chessColor, playerColor) {
			// GameMode,游戏模式； chessColor,胜利方棋子颜色 playerColor,玩家棋子颜色
		}
	}, {
		// adaptable: false, // 如果想要是interval生效请取消此行注释
		interval: interval, // 棋盘间隔，可不填，自动适应
		padding: 20,
	});
```

# 玩家自由对战，先行执黑
```javascript
$('#gobang_container').Gobang({
		GameMode: 1, // 游戏模式：1，人机；2.联网；3.自由
		playerColor: -1, // 玩家执子颜色：1，白色；-1，黑色
		callback_victory: function(GameMode, chessColor, playerColor) {
			// GameMode,游戏模式； chessColor,胜利方棋子颜色 playerColor,玩家棋子颜色
		}
	}, {
		// adaptable: false, // 如果想要是interval生效请取消此行注释
		interval: interval, // 棋盘间隔，可不填，自动适应
		padding: 20,
	});
```
