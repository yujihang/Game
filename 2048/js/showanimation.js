//动画显示数字格子
function show_number_with_animation(i, j, rand_number) {
    var number_cell = $('#number_cell_' + i + '_' + j);
    number_cell.css('background-color', get_number_background_color(rand_number));
    number_cell.css('color', get_number_color(rand_number));
    number_cell.text(rand_number);
    number_cell.animate({
        width: '5rem',
        height: '5rem',
        top: get_pos_top(i, j) + 'rem',
        left: get_pos_left(i, j) + 'rem'
    }, 50);
}

//更新分数
function update_score(score) {
    $('#score').text(score);
}

//格子移动时有动画效果
function show_move_animation(fromx, fromy, tox, toy) {
    var number_cell = $('#number_cell_' + fromx + '_' + fromy);
    number_cell.animate({
        top: get_pos_top(tox, toy) + 'rem',
        left: get_pos_left(tox, toy) + 'rem'
    }, 200);
}