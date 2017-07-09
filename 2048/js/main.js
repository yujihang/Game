var board = new Array();    //每个格子的数字
var score = 0;  //分数
var has_conflicted = new Array();   //解决连续消除的标记
var success_string = 'Success';
var back = new Array();//数组对象

var startx = 0; //移动端触摸屏幕时开始点的x坐标
var starty = 0; //移动端触摸屏幕时开始点的y坐标
var endx = 0;   //移动端触摸屏幕时结束点的x坐标
var endy = 0;   //移动端触摸屏幕时结束点的y坐标

//初始化棋局
$(document).ready(function() {
    prepare_for_mobile();   //适配移动端
    new_game();
});

//开始新游戏
function new_game() {
    back = [];
    //初始化棋盘
    init();
    //在随机两个格子生成数字
    generate_one_number();
    generate_one_number();
}

//初始化
function init() {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            var grid_cell = $('#grid_cell_' + i + '_' + j);
            grid_cell.css('top', get_pos_top(i, j) + 'rem');//每个格子距离顶部和左边的距离；
            grid_cell.css('left', get_pos_left(i, j) + 'rem');
        }
    }
    for (var i = 0; i < 4; i++) {
        board[i] = new Array();
        has_conflicted[i] = new Array();
        for (var j =0; j < 4; j++) {
            board[i][j] = 0;//生成二维数组，每个格子的数字初始化为0；
            has_conflicted[i][j] = false;
        }
    }


    update_board_view();
    score = 0;
    update_score(score);
}

//更新棋局
function update_board_view() {
    $('.number_cell').remove();//？？number_cell
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            $('#grid_container').append('<div class="number_cell" id="number_cell_' + i + '_' + j + '"></div>');
            var number_cell = $('#number_cell_' + i + '_' + j);
            if (board[i][j] == 0) {
                number_cell.css({
                    'width': '0',//宽度、高度为0
                    'height': '0',
                    'top': get_pos_top(i, j) + 2.5 + 'rem',//这是每个数字的位置，其相对于每个格子的位置还要加2.5rem（每个格子高度、宽度为5rem）
                    'left': get_pos_left(i, j) + 2.5 +'rem',
                    'line-height': '5rem',
                    'font-size': '3rem'
                });

            }else if(board[i][j] >= 1024){
                console.log(board[i][j]);
                number_cell.css({
                    'width': '5rem',
                    'height': '5rem',
                    'top': get_pos_top(i, j) + 'rem',
                    'left': get_pos_left(i, j) + 'rem',
                    'background-color': get_number_background_color(board[i][j]),//改变背景颜色
                    'color': get_number_color(board[i][j]),//改变数字颜色
                    'line-height': '5rem',
                    'font-size': '2rem'//字体变小
                });
                number_cell.text(board[i][j]);
            }else if(board[i][j] >= 100){
                number_cell.css({
                    'width': '5rem',
                    'height': '5rem',
                    'top': get_pos_top(i, j) + 'rem',
                    'left': get_pos_left(i, j) + 'rem',
                    'background-color': get_number_background_color(board[i][j]),
                    'color': get_number_color(board[i][j]),
                    'line-height': '5rem',
                    'font-size': '2.5rem'
                });
                number_cell.text(board[i][j]);
            }else {//小于100
                number_cell.css({
                    'width': '5rem',
                    'height': '5rem',
                    'top': get_pos_top(i, j) + 'rem',
                    'left': get_pos_left(i, j) + 'rem',
                    'background-color': get_number_background_color(board[i][j]),
                    'color': get_number_color(board[i][j]),
                    'line-height': '5rem',
                    'font-size': '3rem'
                });
                number_cell.text(board[i][j]);//.text（）方法设置或返回被选元素的文本内容
            }
            has_conflicted[i][j] = false;
        }
    }


}

//随机在一个格子生成数字
function generate_one_number() {
    if (nospace(board)) {//若nospace(board)返回true，说明没有空格子；
        return false;
    }
    //随机一个位置
    var randx = parseInt(Math.floor(Math.random() * 4));
    var randy = parseInt(Math.floor(Math.random() * 4));//在124行调用
    var time = 0;
    while (time < 50) {//time？？50？？
        if (board[randx][randy] == 0) {//看看随机选的位置上数字是否为0，为0则可用，跳出循环，不为0，则重新找位置。
            break;
        }
        randx = parseInt(Math.floor(Math.random() * 4));//当board[randx][randy]不为0，则重新选位置。
        randy = parseInt(Math.floor(Math.random() * 4));
        time++;
    }
    if (time == 50) {//如果连续找了50次都没找到数字为0的位置，则按二维数组挨个去找，直到找到第一个数字为0的格子；
        for (var i = 0; i < 4; i++) {
            for (var j = 0; j < 4; j++) {
                if (board[i][j] == 0) {
                    randx = i;
                    randy = j;
                }
            }
        }
    }
    //随机一个数字
    var rand_number = Math.random() < 0.5 ? 2 : 4;
    //在随机位置显示随机数字
    board[randx][randy] = rand_number;
    show_number_with_animation(randx, randy, rand_number);//动画显示数字格子
    save_status(board); //每生产一个数字，保存状态（以便撤回），对应的back数组长度加1，模拟快照，每一步生成一个对象，调用support.js中函数
    return true;
}

//监听键盘的上下左右移动
$(document).keydown(function(event) {
    if ($('#score').text() == success_string) {//一按下键盘首先判断是否成功。324行判断数字是否到达2048，若等于2048则调用showanimation.js中的更新分数函数；
        new_game();
        return;
    }
    switch (event.keyCode) {//键盘上下左右 方向键的键码（keyCode）是38、40、37和39
        case 37: //left
            event.preventDefault();
            if (move_left()) {
                setTimeout('generate_one_number()', 200);//在指定的毫秒数后调用函数或计算表达式，setTimeout() 只执行 code 一次；
                setTimeout('is_gameover()', 300);
            }
            break;
        case 38: //up
            event.preventDefault();
            if(move_up()){
                setTimeout('generate_one_number()',200);
                setTimeout('is_gameover()', 300);
            }
            break;
        case 39: //right
            event.preventDefault();
            if(move_right()){
                setTimeout('generate_one_number()',200);
                setTimeout('is_gameover()', 300);
            }
            break;
        case 40: //down
            event.preventDefault();
            if (move_down()){
                setTimeout('generate_one_number()',200);
                setTimeout('is_gameover()', 300);
            }
            break;
        default:
            break;
    }
});

//向左移动
function move_left() {//判断能否左移，调用support.js
    if (!can_move_left(board)) {
        return false;
    }
    //move left
    for (var i = 0; i < 4; i++) {
        for (var j = 1; j < 4; j++) {  //j=1
            if (board[i][j] != 0) {
                for (var k = 0; k < j; k++) {
                    if (board[i][k] == 0 && no_block_horizontal(i, k, j, board)) {//（i，k）为0且（i，k）到（i，j）之间都是0
                        show_move_animation(i, j, i, k);//格子移动时有动画效果，从（i，j）到（i，k）
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        break;//跳出的只是199行的for循环，外面还有两层循环
                    } else if (board[i][k] == board[i][j] && no_block_horizontal(i, k, j, board) && !has_conflicted[i][k]) {//可合并的情况，（i，k）和（i，j）数字相等且（i，k）到（i，j）之间都是0
                        show_move_animation(i, j, i, k);
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[i][k];
                        update_score(score);
                        has_conflicted[i][k] = true;//？？
                        break;
                    }
                }
            }
        }
    }
    setTimeout('update_board_view()', 200);
    return true;
}

//向右移动
function move_right() {
    if (!can_move_right(board)) {
        return false;
    }
    //move right
    for (var i = 0; i < 4; i++) {
        for (var j = 2; j >= 0; j--) {
            if (board[i][j] != 0) {
                for (var k = 3; k > j; k--) {
                    if (board[i][k] == 0 && no_block_horizontal(i, j, k, board)) {
                        show_move_animation(i, j, i, k);
                        board[i][k] = board[i][j];
                        board[i][j] = 0;
                        break;
                    } else if (board[i][k] == board[i][j] && no_block_horizontal(i, j, k, board) && !has_conflicted[i][k]) {
                        show_move_animation(i, j, i, k);
                        board[i][k] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[i][k];
                        update_score(score);
                        has_conflicted[i][k] = true;
                        break;
                    }
                }
            }
        }
    }
    setTimeout('update_board_view()', 200);//更新棋局
    return true;
}

//向上移动
function move_up() {
    if(!can_move_up(board)){
        return false;
    }
    //move up
    for (var j = 0; j < 4; j++) {
        for (var i = 1; i < 4; i++) {
            if (board[i][j] != 0) {
                for (var k = 0; k < i; k++) {
                    if (board[k][j] == 0 && no_block_vertical(j, k, i, board)) {
                        show_move_animation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        break;
                    } else if (board[k][j] == board[i][j] && no_block_vertical(j, k, i, board) && !has_conflicted[k][j]) {
                        show_move_animation(i, j, k, j);
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[k][j];
                        update_score(score);
                        has_conflicted[k][j] = true;
                        break;
                    }
                }
            }
        }
    }
    setTimeout('update_board_view()',200);
    return true;
}

//向下移动
function move_down() {
    if (!can_move_down(board)) {
        return false;
    }
    //move down
    for (var j = 0; j < 4; j++) {
        for (var i = 2; i >= 0; i--) {
            if (board[i][j] != 0) {
                for (var k = 3; k > i; k--) {
                    if (board[k][j] == 0 && no_block_vertical(j, i, k, board)) {
                        show_move_animation(i, j, k, j);
                        board[k][j] = board[i][j];
                        board[i][j] = 0;
                        break;
                    } else if (board[k][j] == board[i][j] && no_block_vertical(j, i, k, board) && !has_conflicted[k][j]) {
                        show_move_animation(i, j, k, j);
                        board[k][j] += board[i][j];
                        board[i][j] = 0;
                        //add score
                        score += board[k][j];
                        update_score(score);
                        has_conflicted[k][j] = true;
                        break;
                    }
                }
            }
        }
    }
    setTimeout('update_board_view()', 200);
    return true;
}


//判断游戏是否成功
function is_gameover() {
    for(var i=0; i<4; i++){
        for(var j=0; j<4; j++){
            if (board[i][j] == 2048){
                update_score(success_string);
                return;
            }
        }
    }
    if (nospace(board) && nomove(board)) {//没有空格子，且各个方向不能移动合并；
        gameover();
    }
}

function gameover() {
   alert("走投无路啦");
}

//回退函数
function come_back() {
    if (back.length<=2){//back数组长度小于2
        return;
    }
    var o = back[back.length-2];//结合support.js中保存状态的函数理解，back数组长度减2，back[]取减2后的位置上的值，（每生成一个数字会保存一次状态，back数组长度加1）
    var n = 1;
    //o[n]遍历对象
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {//把存的score和board[i][j]取出
            board[i][j]  = parseInt(o[n].substr(o[n].lastIndexOf(',')+1));//lastIndexOf从右向左出现某个字符或字符串的首个字符索引值，该索引值加1，即可去到，的后半部分
            score = parseInt(o[n]);//逗号前面的
            n++;
        }
    }
    update_score(score);
    back.pop();//？？只用pop一次？？应该2次？？可以不要？？
    setTimeout('update_board_view()',200);
}

