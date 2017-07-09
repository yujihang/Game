var chessBoard = [];
var me = true;
var over = false;

//赢法数组,三维
var wins = [];

//赢法的统计数组，一维
var myWin = [];
var computerWin = [];

//定义棋盘
for(var i = 0; i < 15; i++) {
    chessBoard[i] = [];
    for(var j = 0; j < 15; j++) {
        chessBoard[i][j] = 0;
    }
}

//初始化赢法数组
for(var i = 0; i < 15; i++) {
    wins[i] = [];
    for(var j = 0; j < 15; j++) {
        wins[i][j] = [];
    }
}

//赢法数组的索引

var count = 0;
for(var i = 0 ; i < 15; i++) {
    for(var j = 0; j < 11; j++) {
        //使得：
        //第0中赢法
//      wins[0][0][0] = true
//      wins[0][1][0] = true
//      wins[0][2][0] = true
//      wins[0][3][0] = true
//      wins[0][4][0] = true
        //第1种赢法
//      wins[0][1][1] = true
//      wins[0][2][1] = true
//      wins[0][3][1] = true
//      wins[0][4][1] = true
//      wins[0][5][1] = true
        //统计了横线的赢法
        for(var k = 0; k < 5; k++) {
            wins[i][j+k][count] = true;
        }
        count++;
    }
}

//竖线赢法
for(var i = 0 ; i < 15; i++) {
    for(var j = 0; j < 11; j++) {
        for(var k = 0; k < 5; k++) {
            wins[j+k][i][count] = true;
        }
        count++;
    }
}

//斜线
//注意i
for(var i = 0 ; i < 11; i++) {//
    for(var j = 0; j < 11; j++) {
        for(var k = 0; k < 5; k++) {
            wins[i+k][j+k][count] = true;
        }
        count++;
    }
}

//反斜线
for(var i = 0 ; i < 11; i++) {
    //注意j
    for(var j = 14; j > 3; j--) {//
        for(var k = 0; k < 5; k++) {
            wins[i+k][j-k][count] = true;
        }
        count++;
    }
}

//统计下有多少种赢法
console.log(count);//572种

for(var i = 0; i < count; i++) {
    myWin[i] = 0;
    computerWin[i] = 0;
}

var chess = document.getElementById('chess');
var context = chess.getContext('2d');

context.strokeStyle = "#BFBFBF";

var logo = new Image();
logo.src = "images/hh.gif";//source//图片请自己放在相应文件夹
logo.onload = function() {//才能显示图片
    context.drawImage(logo, 0, 0, 450, 450);
    drawChessBoard();//让图片先画，再画棋盘，以免图片挡住棋盘


}


//写成函数，让图片先画，再画棋盘，以免图片挡住棋盘
var drawChessBoard = function() {
    for(var i = 0; i < 15; i++) {
        context.moveTo(15 + i * 30, 15);
        context.lineTo(15 + i * 30, 435);
        context.stroke();
        context.moveTo(15, 15 + i * 30);
        context.lineTo(435, 15 + i * 30);
        context.stroke();
    }
}

var oneStep = function(i, j, me) {
    context.beginPath();
    //arc可用来画扇形和圆
    context.arc(15 + i * 30, 15 + j * 30
            , 13, 0, 2 * Math.PI);

    context.closePath();
    //gradient渐变 (6个参数来定义两个圆)
    var gradient = context.createRadialGradient
    (15 + i * 30 + 2, 15 + j * 30 - 2, 13, 
            15 + i * 30 + 2, 15 + j * 30 - 2, 0);
    if(me) {
        gradient.addColorStop(0, "#0A0A0A");
        gradient.addColorStop(1, "#636766");
    } else {
        gradient.addColorStop(0, "#D1D1D1");
        gradient.addColorStop(1, "#F9F9F9");
    }

    context.fillStyle = gradient;
    context.fill();
}

chess.onclick = function(e) {
    if(over) {
        return;
    }
    if(!me) {
        return;
    }
    var x = e.offsetX;
    var y = e.offsetY;
    var i = Math.floor(x / 30);
    var j = Math.floor(y / 30);
    if(chessBoard[i][j] == 0) {
        oneStep(i, j, me);
//      if(me) {
//          chessBoard[i][j] = 1;
//      } else {
//          chessBoard[i][j] = 2;
//      }
        chessBoard[i][j] = 1;
        //没人机时候位置这样才对
//      me = !me;
        for(var k = 0; k < count; k++) {
            if(wins[i][j][k]) {
                myWin[k]++;
                computerWin[k] = 5;//设它不可能赢了
                if(myWin[k] == 5) {
                    window.alert
                    ("你赢了n(*≧▽≦*)n，因吹思婷");
                    over = true;
    //2016年4月7日00:48:22，2-3节，有某些情况还没到5就赢了
                }
            }
        }
        if(!over) {
            me = !me;
            computerAI();
        }
    }
    //me = !me;
}

var computerAI = function() {
    //初始化
    var myScore = [];
    var computerScore = [];
    //max用于保存最高分数
    var max = 0;
    //保存最高分的坐标
    var u = 0, v = 0;

    for(var i = 0; i < 15; i++) {
        myScore[i] = [];
        computerScore[i] = [];
        for (var j = 0; j < 15; j++) {
            myScore[i][j] = 0;
            computerScore[i][j] = 0;
        }
    }
    //初始化完

    for(var i = 0; i < 15; i++) {
        for(var j = 0; j < 15; j++) {
            if(chessBoard[i][j] == 0) {
                for(var k = 0; k < count; k++) {
                    //如果第k种赢法在这个点是true，则有意义
                    if(wins[i][j][k]) {
                        if(myWin[k] == 1) {
                            //给它200的价值
                            /*
                             * 200
                             * 400
                             * 2000
                             * 10000
                             */
                            myScore[i][j] += 230;
                        } else if(myWin[k] == 2) {
                            myScore[i][j] += 430;
                        } else if(myWin[k] == 3) {
                            //2000换到2500
                            myScore[i][j] += 2500;
                        } else if(myWin[k] == 4) {
                            //10000换到10010
                            myScore[i][j] += 20000;
                        }
                        if(computerWin[k] == 1) {
                            /*
                             * 220
                             * 420
                             * 2100
                             * 20000
                             */
                            computerScore[i][j] += 220;
                        } else if(myWin[k] == 2) {
                            computerScore[i][j] += 420;
                        } else if(myWin[k] == 3) {
                            computerScore[i][j] += 2100;
                        } else if(myWin[k] == 4) {
                            //白棋四个子，堵住的价值很大,我把老师的20000换成10000试试
                            computerScore[i][j] += 10000;
                        }
                    }
                }
                if(myScore[i][j] > max) {
                    max = myScore[i][j];
                    u = i;
                    v = j;
                } else if(myScore[i][j] == max) {
                    if(computerScore[i][j] > computerScore[u][v]) {
                        u = i;
                        v = j;
                    }
                if(computerScore[i][j] > max) {
                        max = computerScore[i][j];
                        u = i;
                        v = j;
                } else if(computerScore[i][j] == max) {
                        if(myScore[i][j] > myScore[u][v]) {
                            u = i;
                            v = j;
                    }
                }
            }
        }
    }

    }
    oneStep(u, v, false);
    chessBoard[u][v] = 2;
    //判断电脑是否取胜
    for(var k = 0; k < count; k++) {
        if(wins[u][v][k]) {
            computerWin[k]++;
            myWin[k] = 5;//设它不可能赢了
            if(computerWin[k] == 5) {
                window.alert
                ("You Lose, T_T");
                over = true;
//2016年4月7日00:48:22，2-3节，有某些情况还没到5就赢了
            }
        }
    }
    if(!over) {
        me = !me;
    }
}
