const SPACE = ' ';
const ACTIVE = 'active';
const SELECTED = 'selected';
let ACCEL = .4;

let _main = null;
let _sgPoints = null
let _sgBoxes = null;
let _sgBoxSelected = null;
let _sgBoxActive = null;
let _sgEnd = null;
let _sgHighScore = null;

let _xSelected = 0;
let _xActive = 0;

let _incrementActive = 5;
let _direction = 1;

let _points = 0;
let _turns = 0;

let _elapsed = 0;
let _lastRender = 0;

let _selectedLeft = null;
let _selectedRight = null;
let _activeLeft = null;
let _activeRight = null;
let _width = null;

// 0 = menu
// 1 = playing
// 2 = game end
let _state = 0;

$(document).ready(() => {
  _main = $('#' + 'sg-main');
  addListers();
  render();
});

const el = (arr) => $(arr.join(' '));
const rand = (alternate) => {
  if(alternate) {
    if(_selectedLeft > _sgBoxes.width() / 2) {
      return Math.floor(Math.random() * (_sgBoxes.width() / 2 - _width));
    } else {
      return Math.floor(Math.random() * ((_sgBoxes.width() - _width) - _sgBoxes.width() / 2) + _sgBoxes.width() / 2);
    }
  }
  return Math.floor(Math.random() * (_sgBoxes.width() - _width))
}

const addListers = () => {
  $(document).on('keypress', handleKeyPress);
  $(document).on('touchstart', handleKeyPress);
}

const handleKeyPress = (event) => {
  const key = event.key;
  if(key === SPACE || event.touches) {
    if(_state === 0) {
      _state = 1;
      render();
      startGame();
    } else if(_state === 1) {
      handleSpaceSelect();
    } else {
      _state = 1;
      render();
      startGame();
    }
  }
}



const render = () => {
  if(_state === 0) {
    renderStartMenu();
  } else if(_state === 1) {
    renderGame();
  } else {
    renderEnd();
  }
}

const renderStartMenu = function() {
  _main.html('');
  _main.html(el([
    `<label> Tap to Start </label>`
  ]))
}

const renderGame = function() {
  _main.html('');
  _main.append(el([
    `<label id="sg-points" class="sg-points"> 0 </label>`,
    `<div id="sg-boxes" class="sg-boxes sg-flex"></div>`
  ]));

  _sgPoints = $('#' + 'sg-points');
  _sgBoxes = $('#' + 'sg-boxes');

  _sgBoxes.append(`<div id="sg-box-selected" class="box selected hidden"></div>`);
  _sgBoxes.append(`<div id="sg-box-active" class="box active hidden"></div>`);

  _sgBoxSelected  = $('#' + 'sg-box-selected');
  _sgBoxActive = $('#' + 'sg-box-active');

  _main.append(el([
    `<div id="sg-end" class="sg-end sg-flex sg-flex-col sg-flex-center hidden">`,
      `<label id="sg-high-score"> High Score: 0 </label>`,
      `<label> Tap to Play Again.<label>`,
    `</div>`
  ]));

  _sgEnd = $('#' + 'sg-end');
  _sgHighScore = $('#' + 'sg-high-score');
}

const renderEnd = function() {
  let highScore = localStorage.getItem('highScore') || 0;
  _sgHighScore.text('High Score: ' + highScore);
  _sgEnd.removeClass('hidden');
}





const startGame = function() {
  _elapsed = 0;
  _lastRender = 0;

  _xSelected = rand();
  _xActive = rand();
  _incrementActive = 5;
  _direction = 1;
  
  _points = 0;
  _turns = 0;
  
  if(_xSelected < _xActive) {
    _direction = -1;
  }

  window.requestAnimationFrame(handleInterval)
}

const handleInterval = (time) => {
  if(_lastRender === 0) {
    _lastRender = time;
  }

  _elapsed = time - _lastRender;

  if(!validBounds()) {
    _direction *= -1;
    _turns++;
  }

  _xActive += _direction * _incrementActive * (_elapsed / 16);

  renderBoxes();
  renderPoints();
  calc();
  
  _lastRender = time;

  if(_state === 1) {
    window.requestAnimationFrame(handleInterval)
  }
}

const renderBoxes = () => {
  _sgBoxSelected.css('left', _xSelected + 'px');
  _sgBoxActive.css('left', _xActive + 'px');
  _sgBoxSelected.removeClass('hidden');
  _sgBoxActive.removeClass('hidden');
}

const renderPoints = () => {
  _sgPoints.text(_points);
}

const handleSpaceSelect = () => {
  if(overlap()) { // add point and speed if overlapping
    _points += 1;
    _direction *= -1;
    _incrementActive += ACCEL;
    _xSelected = rand(true);
    _turns = 0;
  } else { // end game if not overlapping and set high score if possible
    _direction = 0;
    _state = 2;

    if(_points > parseInt(localStorage.getItem('highScore') || 0)) {
      localStorage.setItem('highScore', _points);
    }
    render();
  }
}

// check if active box is within div
const validBounds = () => {
  if(_direction < 0) {
    return _activeLeft >= 0;
  } else if(_direction > 0) {
    return _activeRight >= 0;
  } else {
    return true;
  }
}

// check if active and selected boxes are overlapping
const overlap = () => {
  return (
    (_selectedLeft <= _activeLeft && _activeLeft <= _selectedLeft + _width) ||
    (_selectedRight <= _activeRight && _activeRight <= _selectedRight + _width) 
  )
}

// track positions of active and selected boxes
const calc = () => {
  _selectedLeft = parseFloat(_sgBoxSelected.css('left').replace('px', ''));
  _selectedRight = parseFloat(_sgBoxSelected.css('right').replace('px', ''));
  _activeLeft = parseFloat(_sgBoxActive.css('left').replace('px', ''));
  _activeRight = parseFloat(_sgBoxActive.css('right').replace('px', ''));
  _width = _sgBoxActive.width();
}