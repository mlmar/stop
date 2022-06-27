const SPACE = ' ';
const ACTIVE = 'active';
const SELECTED = 'selected';
const HIGH_SCORE_CIRCLE = 'highScoreCircle';

const DEFAULTS = {
  ACCEL: .05,
  INCREMENT_ACTIVE: 2,
  DIRECTION: 1,
  MARGIN: .02,
}

let pause = false;

let _main = null;
let _sgPoints = null
let _sgBase = null;
let _sgSelected = null;
let _sgActive = null;
let _sgEnd = null;
let _sgHighScore = null;

let _accel = DEFAULTS.ACCEL;
let _incrementActive = DEFAULTS.INCREMENT_ACTIVE;
let _direction = DEFAULTS.DIRECTION;

let _points = 0;

let _elapsed = 0;
let _lastRender = 0;

let _selectedAngle = null;
let _activeAngle = null;

let _distance = null;
let _margin = null;

let _missed = false;

// 0 = menu
// 1 = playing
// 2 = game end
let _state = 0;

$(document).ready(() => {
  _main = $('#' + 'sg-main');
  addListeners();
  render();
});

const el = (arr) => $(arr.join(' '));
const rand = (offset) => {
  if(offset) {
    const max = offset + 270;
    const min = offset + 90;
    return adjustAngle((Math.floor((Math.random() * (max - min)) + min)));
  }
  return Math.floor(Math.random() * 360);
}

const addListeners = () => {
  $(document).on('keypress', handleKeyPress);
  $(document).on('touchstart', handleKeyPress);
}

const handleKeyPress = (event) => {
  event.preventDefault();
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
    `<div id="sg-base" class="sg-base sg-flex"></div>`
  ]));

  _sgPoints = $('#' + 'sg-points');
  _sgBoxes = $('#' + 'sg-base');

  _sgBoxes.append(el([
    `<div id="sg-selected" class="stick sg-flex hidden">`,
      `<div class="circle selected"></div>`,
    `</div>`
  ]));
  _sgBoxes.append(el([
    `<div id="sg-active" class="stick sg-flex hidden">`,
      `<div class="circle active"></div>`,
    `</div>`
  ]));

  _sgSelected  = $('#' + 'sg-selected');
  _sgActive = $('#' + 'sg-active');

  _main.append(el([
    `<div id="sg-end" class="sg-end sg-flex sg-flex-col sg-flex-center hidden">`,
      `<label id="sg-high-score"> High Score: 0 </label>`,
      `<label> Tap to Play Again<label>`,
    `</div>`
  ]));

  _sgEnd = $('#' + 'sg-end');
  _sgHighScore = $('#' + 'sg-high-score');
}

const renderEnd = function() {
  let highScore = localStorage.getItem(HIGH_SCORE_CIRCLE) || 0;
  _sgHighScore.text('High Score: ' + highScore);
  _sgEnd.removeClass('hidden');
}





const startGame = function() {
  _elapsed = 0;
  _lastRender = 0;

  _activeAngle = rand();
  _selectedAngle = rand(_activeAngle);
  _incrementActive = DEFAULTS.INCREMENT_ACTIVE;
  _direction = DEFAULTS.DIRECTION;
  
  _points = 0;
  
  _missed = false;
  
  window.requestAnimationFrame(handleInterval)
}

const handleInterval = (time) => {
  if(_lastRender === 0) {
    _lastRender = time;
  }

  _elapsed = time - _lastRender;

  if(!pause) {
    _activeAngle += _direction * _incrementActive * (_elapsed / 16);
  }
  
  _activeAngle = adjustAngle(_activeAngle);

  renderBoxes();
  renderPoints();
  calc();

  checkMiss();

  _lastRender = time;

  if(_state === 1) {
    window.requestAnimationFrame(handleInterval)
  }
}

const renderBoxes = () => {
  _sgSelected.css('transform', `rotate(${_selectedAngle}deg)`);
  _sgActive.css('transform', `rotate(${_activeAngle}deg)`);
  _sgSelected.removeClass('hidden');
  _sgActive.removeClass('hidden');
}

const renderPoints = () => {
  _sgPoints.text(_points);
}

const checkMiss = () => {
  if(!_missed) {
    _missed = overlap();
  } else {
    if(!overlap()) {
      endGame();
    }
  }
}

// check if active and selected boxes are overlapping
const overlap = () => {
  const selectedOffset = _sgSelected.find('.circle').offset();
  const activeOffset = _sgActive.find('.circle').offset();
  const dist = getDistance(selectedOffset, activeOffset);
  return -_margin <= dist && dist <= _margin
}

const handleSpaceSelect = () => {
  if(overlap()) { // add point and speed if overlapping
    _points += 1;
    _selectedAngle = rand(_selectedAngle);
    _incrementActive += _accel;
    _direction *= -1;
    _missed = false;
  } else { // end game if not overlapping and set high score if possible
    endGame();
  }
}

const endGame = () => {
  _direction = 0;
  _state = 2;

  if(_points > parseInt(localStorage.getItem(HIGH_SCORE_CIRCLE) || 0)) {
    localStorage.setItem(HIGH_SCORE_CIRCLE, _points);
  }
  render();
}

const getDistance = (offsetA, offsetB) => {
  return Math.sqrt(Math.pow(offsetA.left - offsetB.left, 2) + Math.pow(offsetA.top - offsetB.top, 2));
}

const calc = () => {
  const selectedOffset = _sgSelected.find('.circle').offset();
  const activeOffset = _sgActive.find('.circle').offset();
  _margin = _sgActive.height() + _sgActive.height() * DEFAULTS.MARGIN;
  _distance = getDistance(selectedOffset, activeOffset);
}

const adjustAngle = (angle) => {
  if(angle < 0) {
    return angle + 360;
  } else if(angle > 359) {
    return angle - 360;
  }
  return angle;
}