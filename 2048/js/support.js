
//获得相应格子距离期盘顶部的距离
function get_pos_top(i, j) {
    return 1 + i * (1 +5);
}

//获得相应格子距离棋盘左边的距离
function get_pos_left(i, j) {
    return 1 + j * (1 +5);
}

//获得相应数字的背景色
function get_number_background_color(number) {
    switch (number) {
        case 2: return '#eee4da'; break;
        case 4: return '#ede0c8'; break;
        case 8: return '#f2b179'; break;
        case 16: return '#f59563'; break;
        case 32: return '#f67c5f'; break;
        case 64: return '#f65e3b'; break;
        case 128: return '#edcf72'; break;
        case 256: return '#edcc61'; break;
        case 512: return '#9c0'; break;
        case 1024: return '#33b5e5'; break;
        case 2048: return '#09c'; break;

    }
    return 'black';
}

//获得相应数字的颜色
function get_number_color(number) {
    if (number <= 4)
        return '#776e65';
    return 'white';
}

//判断棋盘上是否还有空格子
function nospace(board) {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (board[i][j] == 0) {
                return false;  //只要有一个数字为0，则返回false，说明有空格子；
            }
        }
    }
    return true;
}

//判断能否左移，返回true或false
function can_move_left(board) {
    for(var i=0; i<4; i++){
        for(var j=1; j<4; j++){
            if(board[i][j] != 0){
                if(board[i][j-1] == 0 || board[i][j] == board[i][j-1]){//左边一个为0或者它和左边一个数字相等；
                    return true;
                }
            }
        }
    }
    return false;
}
//判断能否右移
function can_move_right(board) {
    for (var i = 0; i < 4; i++) {
        for (var j = 2; j >= 0; j--) {
            if (board[i][j] != 0) {
                if (board[i][j + 1] == 0 || board[i][j] == board[i][j + 1]) {
                    return true;
                }
            }
        }
    }
    return false;
}

//判断能否上移
function can_move_up(board) {
    for (var j = 0; j < 4; j++) {
        for (var i = 1; i < 4; i++) {
            if (board[i][j] != 0) {
                if (board[i - 1][j] == 0 || board[i - 1][j] == board[i][j]) {
                    return true;
                }
            }
        }
    }
    return false;
}

//判断是否能向下移动
function can_move_down(board) {
    for (var j = 0; j < 4; j++) {
        for (var i = 2; i >= 0; i--) {
            if (board[i][j] != 0) {
                if (board[i + 1][j] == 0 || board[i + 1][j] == board[i][j]) {
                    return true;
                }
            }
        }
    }
    return false;
}


//判断水平方向上时候是否有空格子
function no_block_horizontal(row, col1, col2, board) {
    for (var i = col1 + 1; i < col2; i++) {
        if (board[row][i] != 0) {
            return false;
        }
    }
    return true;//true，从（i，k）水平方向到（i，j）范围内的数字都为0；或者是两个格子相邻且数字相等；
}

//判断垂直方向移动的时候是否有空格
function no_block_vertical(col,row1,row2,board) {
    for (var i = row1 + 1; i < row2; i++){
        if (board[i][col] != 0){
            return false;
        }
    }
    return true;
}

//无法移动
function nomove(board) {
    if (can_move_down(board) || can_move_up(board) || can_move_right(board) || can_move_left(board)) {
        return false;
    }
    return true;
}

//保存状态，模拟快照，每一步生成一个对象，146行调用
function save_status(board) {
    var o = new Object();
    var n = 1;
    for(var i=0; i<4; i++){
        for(var j=0; j<4; j++){
            o[n] = score+ ',' + board[i][j];//每个o长度为16
            n ++;
        }
    }
    back.push(o);   //调用一次save_status(board)，back长度加1.
}

//适配移动端
var document_width = window.screen.availWidth;  //屏幕宽度
function prepare_for_mobile() {
    if (document_width < 500) {
        $('html').css({
            'font-size': '40px'
        });

    }
}


//监听移动设备的触摸开始
document.addEventListener('touchstart',function (event) {
    startx = event.touches[0].pageX;
    starty = event.touches[0].pageY;
});

//监听移动设备的触摸移动
document.addEventListener('touchmove',function (evnet) {
    event.preventDefault();
});

//监听移动设备的触摸结束
document.addEventListener('touchend',function (event) {
    endx = event.changedTouches[0].pageX;
    endy = event.changedTouches[0].pageY;

    var x = endx - startx;
    var y = endy - starty;

    if(Math.abs(x) < 0.3*document_width && Math.abs(y) < 0.3*document_width){
        return;
    }

    if ($('#score').text == success_string) {
        new_game();
        return;
    }

    //x
    if(Math.abs(x) > Math.abs(y)){
        if(x > 0){
            //向右移动
            if (move_right()){
                setTimeout('generate_one_number()',210);
                setTimeout('is_gameover()',300);
            }
        } else {
            //向左移动
            if (move_left()){
                setTimeout('generate_one_number()',210);
                setTimeout('is_gameover()',300);
            }
        }
    } else if(Math.abs(x) < Math.abs(y)) { //y
        if (y < 0){
            //向上移动
            if (move_up()){
                setTimeout('generate_one_number()',210);
                setTimeout('is_gameover()',300);
            }

        } else {  //向下移动
            if (move_down()){
                setTimeout('generate_one_number()',210);
                setTimeout('is_gameover()',300);
            }
        }
    }

})
