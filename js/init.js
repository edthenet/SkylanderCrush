// constants
var ICON_SIZE = 40;
var NR_LINES = 8;
var NR_COLUMNS = 8;
var NR_ICONS = 6;

// variables
var debug_mode = false;
var hint_mode = false;
var best_score = 0;
var score = 0;
var best_combo = 0;
var combo = 0;
var doigt_init_x = 0;
var doigt_init_y = 0;
var $icon;
var $binome;
var direction = '';
var displacement_current = false;
var displacement_prohibited = false;
var hint_timeout;
var fast_move_timeout;
var tab_icons = [];
var tab_suppr = [];
var test_horiz = [];
var test_verti = [];
var tab_test = [];
var multiplier = 0;
var images = [
  'images/icons/sprite.png',
  'images/picto/fire.gif',
  'images/picto/star.gif',
  'images/anim/explosion.png'
];



$(function () { // DOM ready

  $(window).resize(on_resize);
  $('.icon').live('dragstart', function (e) {
    // prevent image dragging
    e.preventDefault();
  });

  $('#zone_message').live('touchmove mousemove', function (e) {
    // prevent window scrolling
    e.preventDefault();
  });

  $('.icon').live('touchstart mousedown', function (e) {
  
    if (!displacement_current && !displacement_prohibited) {
      dragmove = false;
      $icon = $(this);
      $icon.css('z-index', 20);
      icon_row = Number($icon.attr('data-row'));
      icon_col = Number($icon.attr('data-col'));
      if (e.originalEvent.type == 'touchstart') {
        doigt_init_x = e.originalEvent.touches[0].clientX;
        doigt_init_y = e.originalEvent.touches[0].clientY;
      }
      if (e.originalEvent.type == 'mousedown') {
        doigt_init_x = e.originalEvent.clientX;
        doigt_init_y = e.originalEvent.clientY;
      }
      displacement_current = true;
    }

  });

  $('#zone_game').live('touchmove mousemove', function (e) {
    // prevent window scrolling
    e.preventDefault();

    if (displacement_current) {

      var distance_x, distance_y;

      if (e.originalEvent.type == 'touchmove') {
        distance_x = e.originalEvent.touches[0].clientX - doigt_init_x;
        distance_y = e.originalEvent.touches[0].clientY - doigt_init_y;
      }
      if (e.originalEvent.type == 'mousemove') {
        distance_x = e.originalEvent.clientX - doigt_init_x;
        distance_y = e.originalEvent.clientY - doigt_init_y;
      }

      if (Math.abs(distance_x) > Math.abs(distance_y)) {
        if (distance_x > ICON_SIZE / 2) {
          // right
          if (icon_col < NR_COLUMNS - 1) {
            dragmove = true;
            $('.icon').removeClass('click adjacent');
            deplacement(icon_row, icon_col, icon_row, icon_col + 1);
          }
        }

        if (distance_x < -ICON_SIZE / 2) {
          // left
          if (icon_col > 0) {
            dragmove = true;
            $('.icon').removeClass('click adjacent');
            deplacement(icon_row, icon_col, icon_row, icon_col - 1);
          }
        }
      } else {
        if (distance_y > ICON_SIZE / 2) {
          // down
          if (icon_row < NR_LINES - 1) {
            dragmove = true;
            $('.icon').removeClass('click adjacent');
            deplacement(icon_row, icon_col, icon_row + 1, icon_col);
          }
        }

        if (distance_y < -ICON_SIZE / 2) {
          // up
          if (icon_row > 0) {
            dragmove = true;
            $('.icon').removeClass('click adjacent');
            deplacement(icon_row, icon_col, icon_row - 1, icon_col);
          }
        }
      }
    }
  });

  $('#zone_game').live('touchend mouseup', function (e) {
    if (displacement_current) {
      displacement_current = false;
      $icon.css('z-index', 10);
      if(!dragmove){
        verif_click($icon);
      }
    }
  });

  $('.bt_new_game').live('click', function () {
    init_game();
  });

  on_resize();

  // wait until every image is loaded to launch the game
  loadimages(images, function () {
    init_game();
  });

  // tabs and panels
  $('.panel').hide();
  $('.tab').click(function(){
    var $this = $(this);
    $('.tab').removeClass('on');
    $this.addClass('on');
    $('.panel').hide();
    $('#'+$this.attr('data-target')).show();
  });
  $('.tab:first').click();

});

function verif_click($icon_test) {
  if(!$('.icon.click').length){
    $icon_test.addClass('click');
    icon_test_row = Number($icon_test.attr('data-row'));
    icon_test_col = Number($icon_test.attr('data-col'));
    add_adjacent(icon_test_row, icon_test_col);
  } else {
    $icon_ref = $('.icon.click');
    icon_ref_row = Number($icon_ref.attr('data-row'));
    icon_ref_col = Number($icon_ref.attr('data-col'));
    icon_test_row = Number($icon_test.attr('data-row'));
    icon_test_col = Number($icon_test.attr('data-col'));
    // proximity check
    if (
      (icon_ref_row == icon_test_row && icon_ref_col == icon_test_col - 1) ||
      (icon_ref_row == icon_test_row && icon_ref_col == icon_test_col + 1) ||
      (icon_ref_row == icon_test_row - 1 && icon_ref_col == icon_test_col) ||
      (icon_ref_row == icon_test_row + 1 && icon_ref_col == icon_test_col) 
    ) {
      $icon = $icon_ref;
      deplacement(icon_ref_row, icon_ref_col, icon_test_row, icon_test_col);
      $('.icon').removeClass('click adjacent');
    } else {
      $('.icon').removeClass('click adjacent');
      $icon_test.addClass('click');
      add_adjacent(icon_test_row, icon_test_col);
    }
  }

};

function add_adjacent(row, column) {
  if (row>0) {
    $('.icon[data-row=' + (row-1) + '][data-col=' + column + ']').addClass('adjacent');
  }
  if (column>0) {
    $('.icon[data-row=' + row + '][data-col=' + (column-1) + ']').addClass('adjacent');
  }
  if (column<NR_COLUMNS-1) {
    $('.icon[data-row=' + row + '][data-col=' + (column+1) + ']').addClass('adjacent');
  }
  if (row<NR_LINES-1) {
    $('.icon[data-row=' + (row+1) + '][data-col=' + column + ']').addClass('adjacent');
  }
}


function init_game() {
  $('#zone_message').html('');

  score = 0;
  combo = 0;
  NR_ICONS = 6; // normal : 6

  tab_icons = [];
  var playing_area = '';

  clearTimeout(hint_timeout);
  $('.hint').removeClass('hint');
  hint_mode = false;

  on_resize();

  for (var i = 0 ; i < NR_LINES ; i++) {
    tab_icons[i] = [];
    for (var j = 0 ; j < NR_COLUMNS ; j++) {
      var nb_icon = Math.ceil(Math.random() * NR_ICONS);

      if (i > 1) {
        while(tab_icons[i-2][j] == nb_icon && tab_icons[i-1][j] == nb_icon){
          nb_icon = Math.ceil(Math.random() * NR_ICONS);
        }
      }
      if (j > 1) {
        while(tab_icons[i][j-2] == nb_icon && tab_icons[i][j-1] == nb_icon){
          nb_icon = Math.ceil(Math.random() * NR_ICONS);

          if (i > 1) {
            while(tab_icons[i-2][j] == nb_icon && tab_icons[i-1][j] == nb_icon){
              nb_icon = Math.ceil(Math.random() * NR_ICONS);
            }
          }

        }
      }

      tab_icons[i][j] = nb_icon;
      playing_area += '<div class="icon icon_' + nb_icon + '" data-row="' + i + '" data-col="' + j + '" data-icon="' + nb_icon + '" style="top: ' + Number(i*ICON_SIZE) + 'px; left: ' + Number(j*ICON_SIZE) + 'px;"></div>';
    }
  }  

  $('#zone_game').html(playing_area);

  var local_best_score = localStorage.getItem('best_score');
  if (local_best_score != null) {
    best_score = local_best_score;
  }
  $('#best_score_num').html(best_score);

  var local_best_combo = localStorage.getItem('best_combo');
  if (local_best_combo != null) {
    best_combo = local_best_combo;
  }
  $('#best_combo_num').html(best_combo);

  // initial check
  multiplier = 0;
  verify_playing_area();

  $('#current_score_num').html(score);
  $('#current_combo_num').html(combo);

};


function deplacement(icon_row, icon_col, binome_row, binome_col) {
  displacement_current = false;
  displacement_prohibited = true;

  clearTimeout(hint_timeout);
  $('.hint').removeClass('hint');
  hint_mode = false;

  $binome = $('.icon[data-row=' + binome_row + '][data-col=' + binome_col + ']');

  $icon.css('z-index', 10);

  // icons switch positions

  var icon_row_origin = icon_row;
  var icon_col_origin = icon_col;
  var icon_num_origin = tab_icons[icon_row][icon_col];
  var binome_row_origin = binome_row;
  var binome_col_origin = binome_col;
  var binome_num_origin = tab_icons[binome_row][binome_col];

  $icon.attr('data-row', binome_row_origin);
  $icon.attr('data-col', binome_col_origin);
  $binome.attr('data-row', icon_row_origin);
  $binome.attr('data-col', icon_col_origin);

  $icon.css({
    'left': binome_col_origin*ICON_SIZE,
    'top': binome_row_origin*ICON_SIZE
  });
  $binome.css({
    'left': icon_col_origin*ICON_SIZE,
    'top': icon_row_origin*ICON_SIZE
  });

  tab_icons[icon_row_origin][icon_col_origin] = binome_num_origin;
  tab_icons[binome_row_origin][binome_col_origin] = icon_num_origin;

  // after the movement : check for new chains
  setTimeout(function () {
    if (!verify_playing_area()) {
      // no chain found : back to initial position

      $icon.attr('data-row', icon_row_origin);
      $icon.attr('data-col', icon_col_origin);
      $binome.attr('data-row', binome_row_origin);
      $binome.attr('data-col', binome_col_origin);

      $icon.css({
        'left': icon_col_origin*ICON_SIZE,
        'top': icon_row_origin*ICON_SIZE
      });
      $binome.css({
        'left': binome_col_origin*ICON_SIZE,
        'top': binome_row_origin*ICON_SIZE
      });

      tab_icons[icon_row_origin][icon_col_origin] = icon_num_origin;
      tab_icons[binome_row_origin][binome_col_origin] = binome_num_origin;

      setTimeout(function () {
        verify_playing_area();
      }, 300);
      
    }

    $icon = undefined;
    $binome = undefined;

  }, 300);
  
  
};



function verify_playing_area() {

  for (var i = 0; i < NR_LINES; i++) {
    tab_suppr[i] = [];
    for (var j = 0; j < NR_COLUMNS; j++) {
      tab_suppr[i][j] = false;
    }
  }

  for (var i = 0; i < NR_LINES; i++) {
    test_horiz[i] = [];
    for (var j = 0; j < NR_COLUMNS; j++) {
      test_horiz[i][j] = false;
    }
  }

  for (var i = 0; i < NR_LINES; i++) {
    test_verti[i] = [];
    for (var j = 0; j < NR_COLUMNS; j++) {
      test_verti[i][j] = false;
    }
  }

  $('.icon.hypercube').removeClass('new');

  var chaine_found = false;

  for (var i = 0; i < NR_LINES; i++) {
    for (var j = 0 ; j < NR_COLUMNS; j++) {
      if (test_chaine(i, j)) {
        chaine_found = true;
      }
    }
  }

  // check for hypercube move
  if ($icon != undefined && $binome != undefined) {
    if ($icon.hasClass('hypercube') && !$icon.hasClass('new')) {
      destroy_color($binome.attr('data-icon'), $icon.attr('data-row'), $icon.attr('data-col'));
      tab_suppr[$icon.attr('data-row')][$icon.attr('data-col')] = true;
      chaine_found = true;
      multiplier++;
      if(multiplier > combo){
        combo = multiplier;
        $('#current_combo_num').html(combo);
      }
      $('#zone_message').append('<div class="hypercube">EXCELLENT!</div>');

    }
    if ($binome.hasClass('hypercube') && !$binome.hasClass('new')) {
      destroy_color($icon.attr('data-icon'), $binome.attr('data-row'), $binome.attr('data-col'));
      tab_suppr[$binome.attr('data-row')][$binome.attr('data-col')] = true;
      chaine_found = true;
      multiplier++;
      if(multiplier > combo){
        combo = multiplier;
        $('#current_combo_num').html(combo);
      }
      $('#zone_message').append('<div class="hypercube">EXCELLENT!</div>');
    }
  }

  if (chaine_found) {
    clearTimeout(fast_move_timeout);

    for (var i = 0; i < NR_LINES; i++) {
      for (var j = 0 ; j < NR_COLUMNS; j++) {
        if (tab_suppr[i][j]) {
          tab_icons[i][j] = 0;
          $('.icon[data-row=' + i + '][data-col=' + j + ']').fadeOut(300, function () { $(this).remove(); });
          var points = 10 * multiplier;
          var $aff_score = $('<div class="aff_score" style="left:' + j*ICON_SIZE + 'px; top:' + i*ICON_SIZE + 'px;">+' + points + '</div>');
          $('#zone_game').append($aff_score);
          score += points;
        }          
      }
    }
    $('#current_score_num').html(score);
    setTimeout(function () {
      $aff_score.fadeOut(400, function () { $('.aff_score').remove(); });
      $('#zone_message').html('');
    }, 700);


    setTimeout(function () {
      drop_icons();
      setTimeout(function () {
        verify_playing_area();
      }, 400);
    }, 400);
  } else {
    // no chain found

    if ($icon == undefined && $binome == undefined) {
      if (test_possible_move()) {
        displacement_prohibited = false;
        if (score > 1000) {
          // difficulty++
          NR_ICONS = 7;
        }
        if (score > 2000) {
          // difficulty++
          NR_ICONS = 8;
        }

        // reset multiplier if the player not not find new chain fast
        fast_move_timeout = setTimeout(function () {
          multiplier = 0;
        }, 1500);

        // display hint after a few seconds
        hint_timeout = setTimeout(function () {
          hint_mode = true;
          test_possible_move();
        }, 7000);
      } else {
        $('#zone_message').html('<div class="bad">GAME OVER</div>');
        $('#zone_message').append('<div class="good">' + score + ' points</div>');
        if (score > best_score) {
          best_score = score;
          localStorage.setItem('best_score', best_score);
          $('#best_score_num').html(best_score);
        }
        $('#zone_message').append('<div class="good">combo x ' + combo + '</div>');
        if (combo > best_combo) {
          best_combo = combo;
          localStorage.setItem('best_combo', best_combo);
          $('#best_combo_num').html(best_combo);
        }
        $('#zone_message').append('<div class="bt_new_game">Play again</div>');

      }
    }    
  }

  return chaine_found;
};

function test_chaine(row, column) {
  var chaine_found = false;
  var num_icon = tab_icons[row][column];
  var sequence_verti = 1;
  var sequence_horiz = 1;
  var i;

  // down
  if (!test_verti[row][column]) {
    i = 1;
    while(row+i < NR_COLUMNS && tab_icons[row+i][column] == num_icon && !test_verti[row+i][column]) {
      sequence_verti++;
      i++;
    }

    if (sequence_verti >= 3) {
      chaine_found = true;
      multiplier++;
      if(multiplier > combo){
        combo = multiplier;
        $('#current_combo_num').html(combo);
      }
      if (multiplier > 1) {
        var $aff_combo = $('<div class="aff_combo" style="left:' + (column*ICON_SIZE) + 'px; top:' + (row*ICON_SIZE) + 'px;">x' + multiplier + '</div>');
        $('#zone_game').append($aff_combo);
        $aff_combo.animate(
          {
            top : '-=' + (ICON_SIZE/2),
            opacity : 0
          },
          600,
          function(){
            $(this).remove();
          }
        );
      }

      if ($('.icon[data-row=' + row + '][data-col=' + column + ']').hasClass('fire')) {
        destroy_around(row, column);
      }
      if ($('.icon[data-row=' + row + '][data-col=' + column + ']').hasClass('star')) {
        destroy_line_column(row, column);
      }

      tab_suppr[row][column] = true;
      test_verti[row][column] = true;

      if(sequence_verti == 4){
        // animate fireball creation
        $('.icon[data-row=' + row + '][data-col=' + column + ']').css({
          'top': (row+1)*ICON_SIZE
        });
      }
      if(sequence_verti == 5){
        // animate hypercube creation
        $('.icon[data-row=' + row + '][data-col=' + column + ']').css({
          'top': (row+2)*ICON_SIZE
        });
      }

      // down
      i = 1;
      while(row+i < NR_COLUMNS && tab_icons[row+i][column] == num_icon) {
        if ($('.icon[data-row=' + (row+i) + '][data-col=' + column + ']').hasClass('fire')) {
          destroy_around(row+i, column);
        }
        if ($('.icon[data-row=' + (row+i) + '][data-col=' + column + ']').hasClass('star')) {
          destroy_line_column(row+i, column);
        }
        if(sequence_verti == 4){
          // animate fireball creation
          $('.icon[data-row=' + (row+i) + '][data-col=' + column + ']').css({
            'top': (row+1)*ICON_SIZE
          });
        }
        if(sequence_verti == 5){
          // animate hypercube creation
          $('.icon[data-row=' + (row+i) + '][data-col=' + column + ']').css({
            'top': (row+2)*ICON_SIZE
          });
        }
        if(i == 1 && multiplier%5 == 0){
          // create a star gem (can destroy line and column)
          $('.icon[data-row=' + (row+i) + '][data-col=' + column + ']').addClass('star');
          $('#zone_message').append('<div class="star">SUPER COMBO!</div>');
        } else {
          if(i == 1 && sequence_verti == 4){
            // create a fire gem (can destroy 8 surrounding icons)
            $('.icon[data-row=' + (row+i) + '][data-col=' + column + ']').addClass('fire');
            $('#zone_message').append('<div class="fire">FIREBALL!</div>');
          } else {
            if(i == 2 && sequence_verti == 5){
              // create a hypercube (can destroy all icons)
              $('.icon[data-row=' + (row+i) + '][data-col=' + column + ']')
                .removeClass('icon_1 icon_2 icon_3 icon_4 icon_5 icon_6 icon_7 icon_8')
                .addClass('hypercube new');
              tab_icons[row+i][column] = 10;
              $('#zone_message').append('<div class="hypercube">HYPERCUBE!</div>');
            } else {
              tab_suppr[row+i][column] = true;
              test_verti[row+i][column] = true;
            }
          }
        }
        
        i++;
      }
    }
  }


  // right
  if (!test_horiz[row][column]) {
    i = 1;
    while(column+i < NR_LINES && tab_icons[row][column+i] == num_icon && !test_horiz[row][column+i]) {
      sequence_horiz++;
      i++;
    }

    if (sequence_horiz >= 3) {
      chaine_found = true;
      multiplier++;
      if(multiplier > combo){
        combo = multiplier;
        $('#current_combo_num').html(combo);
      }
      if (multiplier > 1) {
       var $aff_combo = $('<div class="aff_combo" style="left:' + (column*ICON_SIZE) + 'px; top:' + (row*ICON_SIZE) + 'px;">x' + multiplier + '</div>');
        $('#zone_game').append($aff_combo);
        $aff_combo.animate(
          {
            top : '-=' + (ICON_SIZE/2),
            opacity : 0
          },
          600,
          function(){
            $(this).remove();
          }
        );
      }

      if ($('.icon[data-row=' + row + '][data-col=' + column + ']').hasClass('fire')) {
        destroy_around(row, column);
      }
      if ($('.icon[data-row=' + row + '][data-col=' + column + ']').hasClass('star')) {
        destroy_line_column(row, column);
      }

      tab_suppr[row][column] = true;
      test_horiz[row][column] = true;

      if(sequence_horiz == 4){
        // animate fireball creation
        $('.icon[data-row=' + row + '][data-col=' + column + ']').css({
          'left': (column+1)*ICON_SIZE
        });
      }
      if(sequence_horiz == 5){
        // animate hypercube creation
        $('.icon[data-row=' + row + '][data-col=' + column + ']').css({
          'left': (column+2)*ICON_SIZE
        });
      }

      // right
      i = 1;
      while(column+i < NR_LINES && tab_icons[row][column+i] == num_icon) {
        if ($('.icon[data-row=' + row + '][data-col=' + (column+i) + ']').hasClass('fire')) {
          destroy_around(row, column+i);
        }
        if ($('.icon[data-row=' + row + '][data-col=' + (column+i) + ']').hasClass('star')) {
          destroy_line_column(row, column+i);
        }
        if(sequence_horiz == 4){
          // animate fireball creation
          $('.icon[data-row=' + row + '][data-col=' + (column+i) + ']').css({
            'left': (column+1)*ICON_SIZE
          });
        }
        if(sequence_horiz == 5){
          // animate hypercube creation
          $('.icon[data-row=' + row + '][data-col=' + (column+i) + ']').css({
            'left': (column+2)*ICON_SIZE
          });
        }
        if(i == 1 && multiplier%5 == 0){
          // create a star gem (can destroy line and column)
          $('.icon[data-row=' + row + '][data-col=' + (column+i) + ']').addClass('star');
          $('#zone_message').append('<div class="star">SUPER COMBO!</div>');
        } else {
          if (i == 1 && sequence_horiz == 4) {
            // create a fire gem (can destroy 8 surrounding icons)
            $('.icon[data-row=' + row + '][data-col=' + (column+i) + ']').addClass('fire');
            $('#zone_message').append('<div class="fire">FIREBALL!</div>');
          } else {
            if (i == 2 && sequence_horiz == 5) {
              // create a hypercube (can destroy all icons)
              $('.icon[data-row=' + row + '][data-col=' + (column+i) + ']')
                .removeClass('icon_1 icon_2 icon_3 icon_4 icon_5 icon_6 icon_7 icon_8')
                .addClass('hypercube new');
              tab_icons[row][column+i] = 10;
            $('#zone_message').append('<div class="hypercube">HYPERCUBE!</div>');
            } else {
              tab_suppr[row][column+i] = true;
              test_horiz[row][column+i] = true;
            }
          }
        }

        i++;
      } 
    }
  } 
  return chaine_found;
};


function destroy_around(row, column) {
  if (row>0 && column>0) {
    tab_suppr[row-1][column-1] = true;
  }
  if (row>0) {
    tab_suppr[row-1][column] = true;
  }
  if (row>0 && column<NR_COLUMNS-1) {
    tab_suppr[row-1][column+1] = true;
  }
  if (column>0) {
    tab_suppr[row][column-1] = true;
  }
  if (column<NR_COLUMNS-1) {
    tab_suppr[row][column+1] = true;
  }
  if (row<NR_LINES-1 && column>0) {
    tab_suppr[row+1][column-1] = true;
  }
  if (row<NR_LINES-1) {
    tab_suppr[row+1][column] = true;
  }
  if (row<NR_LINES-1 && column<NR_COLUMNS-1) {
    tab_suppr[row+1][column+1] = true;
  }
  explosion(row, column);
};

function explosion(row, column) {
  var $explosion = $('<div class="explosion"></div>');
  $explosion.css({
    'left': (column-1)*ICON_SIZE,
    'top': (row-1)*ICON_SIZE
  });
  $('#zone_game').append($explosion);
  $('#zone_message').append('<div class="fire">GREAT!</div>');
  setTimeout(function () {
    $explosion.remove();
  }, 600);

};

function destroy_color(num_icon, row, column) {
  for (var i = 0; i < NR_LINES; i++) {
    for (var j = 0 ; j < NR_COLUMNS; j++) {
      if (tab_icons[i][j] == num_icon) {
        tab_suppr[i][j] = true;
        $('.icon[data-row=' + i + '][data-col=' + j + ']').css({
          'left': column*ICON_SIZE,
          'top': row*ICON_SIZE
        });
      }
    }
  }
};

function destroy_line_column(row, column) {
  $('#zone_message').append('<div class="star">GREAT!</div>');
  for (var i = 0; i < NR_LINES; i++) {
    tab_suppr[i][column] = true;
    $('.icon[data-row=' + i + '][data-col=' + column + ']').css({
      'left': column*ICON_SIZE,
      'top': row*ICON_SIZE
    });
  }
  for (var i = 0; i < NR_LINES; i++) {
    tab_suppr[row][i] = true;
    $('.icon[data-row=' + row + '][data-col=' + i + ']').css({
      'left': column*ICON_SIZE,
      'top': row*ICON_SIZE
    });
  }
};


function drop_icons() {
  hole_located = false;
  for (var i = NR_LINES-1; i >= 0 ; i--) {
    for (var j = 0 ; j < NR_COLUMNS; j++) {


      if (tab_icons[i][j] == 0) {
        hole_located = true;
        // look above for an icon to fill the hole
        var k = 1;
        while((i - k) >= 0 && tab_icons[i-k][j] == 0) {
          k++;
        }
        if ((i - k) < 0) {
          // no icon found above : create random new icon
          var random_icon = Math.ceil(Math.random() * NR_ICONS);
          $new_icon = $('<div class="icon icon_' + random_icon + '" data-row="' + i + '" data-col="' + j + '" data-icon="' + random_icon + '"></div>');
          $new_icon.css({
            'left': j*ICON_SIZE,
            'top': -ICON_SIZE
          });
          $('#zone_game').append($new_icon);
          
          $new_icon.animate({
            'top': i*ICON_SIZE
          }, 0);

          
          tab_icons[i][j] = random_icon;
        } else {
          // icon found above : icon falling animation
          var $icon_drop = $('.icon[data-row=' + (i - k) + '][data-col=' + j + ']');
          // update icon properties (correct line and column numbers)
          $icon_drop.attr('data-row', i);
          $icon_drop.css('top', i*ICON_SIZE);

          tab_icons[i][j] = tab_icons[i-k][j];
          tab_icons[i-k][j] = 0;

        }
      }
    }
  }
};

function test_possible_move() {
  var move_found = false;
  var hint_displayed = false;
  var nr_possible_moves = 0;

  for (var i = 0; i < NR_LINES; i++) {
    tab_test[i] = [];
    for (var j = 0 ; j < NR_COLUMNS; j++) {
      tab_test[i][j] = tab_icons[i][j];
    }
  }

  for (var i = 0; i < NR_LINES; i++) {
    for (var j = 0 ; j < NR_COLUMNS; j++) {
      // test right move
      if (j < NR_COLUMNS-1) {
        tab_test[i][j] = tab_icons[i][j+1];
        tab_test[i][j+1] = tab_icons[i][j];
        if (test_chain_game_over(i, j)) {
          move_found = true;
          nr_possible_moves++;
          if(debug_mode){
            $('.icon[data-row=' + i + '][data-col=' + (j+1) + ']').addClass('hint');
          }
          if (hint_mode && !hint_displayed) {
            $('.icon[data-row=' + i + '][data-col=' + (j+1) + ']').addClass('hint');
            hint_displayed = true;
          }
        }
        if (test_chain_game_over(i, j+1)) {
          move_found = true;
          nr_possible_moves++;
          if(debug_mode){
            $('.icon[data-row=' + i + '][data-col=' + j + ']').addClass('hint');
          }
          if (hint_mode && !hint_displayed) {
            $('.icon[data-row=' + i + '][data-col=' + j + ']').addClass('hint');
            hint_displayed = true;
          }
        }
        tab_test[i][j] = tab_icons[i][j];
        tab_test[i][j+1] = tab_icons[i][j+1];
      }

      // test down move
      if (i < NR_LINES-1) {
        tab_test[i][j] = tab_icons[i+1][j];
        tab_test[i+1][j] = tab_icons[i][j];
        if (test_chain_game_over(i, j)) {
          move_found = true;
          nr_possible_moves++;
          if(debug_mode){
            $('.icon[data-row=' + (i+1) + '][data-col=' + j + ']').addClass('hint');
          }
          if (hint_mode && !hint_displayed) {
            $('.icon[data-row=' + (i+1) + '][data-col=' + j + ']').addClass('hint');
            hint_displayed = true;
          }
        }
        if (test_chain_game_over(i+1, j)) {
          move_found = true;
          nr_possible_moves++;
          if(debug_mode){
            $('.icon[data-row=' + i + '][data-col=' + j + ']').addClass('hint');
          }
          if (hint_mode && !hint_displayed) {
            $('.icon[data-row=' + i + '][data-col=' + j + ']').addClass('hint');
            hint_displayed = true;
          }
        }
        tab_test[i][j] = tab_icons[i][j];
        tab_test[i+1][j] = tab_icons[i+1][j];
      }
    }
  }

  if(nr_possible_moves <= 3) {
    if(nr_possible_moves <= 1) {
      $('#moves').addClass('critical').html(nr_possible_moves + '<br>Zet');
    } else {
      $('#moves').removeClass('critical').html(nr_possible_moves + '<br>Zetten');
    }
  } else {
    $('#moves').removeClass('critical').html('');
  }
  

  return move_found;
};




function test_chain_game_over(row, column) {
  var chaine_found = false;
  var num_icon = tab_test[row][column];
  var sequence_verti = 1;
  var sequence_horiz = 1;
  var i;
  // up
  i = 1;
  while(row-i >= 0 && tab_test[row-i][column] == num_icon) {
    sequence_verti++;
    i++;
  }
  // down
  i = 1;
  while(row+i < NR_COLUMNS && tab_test[row+i][column] == num_icon) {
    sequence_verti++;
    i++;
  }
  // left
  i = 1;
  while(column-i >= 0 && tab_test[row][column-i] == num_icon) {
    sequence_horiz++;
    i++;
  }
  // right
  i = 1;
  while(column+i < NR_LINES && tab_test[row][column+i] == num_icon) {
    sequence_horiz++;
    i++;
  }

  if (sequence_verti >= 3) {
    chaine_found = true;
  }
  if (sequence_horiz >= 3) {
    chaine_found = true;
  }
  if (tab_test[row][column] == 10) {
    // hypercube
    chaine_found = true;
  }
  return chaine_found;
};

function on_resize() {
  board_size = $('#zone_game').width();
  ICON_SIZE = board_size/8;

  $('#zone_game').css({
    'height': board_size + 'px',
    'background-size': board_size/4 + 'px ' + board_size/4 + 'px'
  });

  for (var i = 0; i < NR_LINES; i++) {
    for (var j = 0 ; j < NR_COLUMNS; j++) {
      $('.icon[data-row=' + i + '][data-col=' + j + ']').css({
        'left': j*ICON_SIZE + 'px',
        'top': i*ICON_SIZE + 'px'
      });
    }
  }

  setTimeout(function () {
    // hide the address bar
    window.scrollTo(0, 1);
  }, 0);

};

function loadimages(imgArr,callback) {
  //Keep track of the images that are loaded
  var imagesLoaded = 0;
  function _loadAllImages(callback) {
    //Create an temp image and load the url
    var img = new Image();
    $(img).attr('src',imgArr[imagesLoaded]);
    if (img.complete || img.readyState === 4) {
      // image is cached
      imagesLoaded++;
      //Check if all images are loaded
      if (imagesLoaded == imgArr.length) {
        //If all images loaded do the callback
        callback();
      } else {
        //If not all images are loaded call own function again
        _loadAllImages(callback);
      }
    } else {
      $(img).load(function () {
        //Increment the images loaded variable
        imagesLoaded++;
        //Check if all images are loaded
        if (imagesLoaded == imgArr.length) {
          //If all images loaded do the callback
          callback();
        } else {
          //If not all images are loaded call own function again
          _loadAllImages(callback);
        }
      });
    }
  };    
  _loadAllImages(callback);
}
