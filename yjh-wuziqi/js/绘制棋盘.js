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