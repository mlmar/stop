const SPACE = ' ';
const ACTIVE = 'active';
const SELECTED = 'selected';
let HIGH_SCORE_CIRCLE = 'highScoreCircle';



const DEFAULTS = {
  ACCEL: .05,
  INCREMENT_ACTIVE: 2,
  DIRECTION: 1,
  MARGIN: .02,
  GREEN_ANGLE: 85,
  IVL: false,
  AUTO: false,
  MODE: 0,
}

// parse options
const parseOptions = () => {
  const options = localStorage.getItem('options');
  localStorage.removeItem('options');
  if(options) {
    const split = options.split(';').map(i => i.trim());
    const parsed = split.filter(i => i.includes('=')).map(i => i.split('=').slice(0,2).map(i => i.trim()));
    parsed.forEach(([key, val]) => {
      const parsedVal = parseFloat(val);
      DEFAULTS[key.toUpperCase()] = parsedVal !== NaN ? parsedVal : val;
    });
  }

  const urlSearchParams = new URLSearchParams(window.location.search);
  const params = Object.fromEntries(urlSearchParams.entries());
  for(let key in params) {
    const val = params[key];
    const parsedVal = parseFloat(val);
    DEFAULTS[key.toUpperCase()] = parsedVal !== NaN ? parsedVal : val;
  }

  if(DEFAULTS.MODE > 0) {
    HIGH_SCORE_CIRCLE += DEFAULTS.MODE;
  }
}
parseOptions();

let pause = false;

let _main = null;
let _sgPoints = null;
let _sgPointsMax = null;
let _sgBase = null;
let _sgSelected = null;
let _sgActive = null;
let _sgEnd = null;
let _sgHighScore = null;

let _accel = DEFAULTS.ACCEL;
let _incrementActive = DEFAULTS.INCREMENT_ACTIVE;
let _direction = DEFAULTS.DIRECTION;
let _mode = DEFAULTS.MODE;

let _points = 0;
let _pointsMax = 0;

let _elapsed = 0;
let _lastRender = 0;

let _selectedAngle = null;
let _activeAngle = null;

let _distance = null;
let _margin = null;

let _missed = false;
let _trapped = false;

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
  $(document).on('touchend', e => e.preventDefault());
}

const handleKeyPress = (event) => {
  event.preventDefault();
  const key = event.key;
  if(key === SPACE || event.touches || event.type === 'mousedown') {
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

  if(_mode === 1) {
    _main.append(el([
      `<div class="sg-points-holder sg-flex sg-flex-center">`,
        `<label id="sg-points" class="sg-points"> 0 </label>`,
        `<label id="sg-points-max" class="sg-points"> 0 </label>`,
      `</div>`
    ]));
    _sgPointsMax = $('#' + 'sg-points-max');
  } else {
    _main.append(el([
      `<label id="sg-points" class="sg-points"> 0 </label>`,
    ]));
  }

  _main.append(el([
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

  _sgSelected = $('#' + 'sg-selected');
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
  _pointsMax = 0;
  
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

  if(DEFAULTS.AUTO) {
    if(overlap() && (_mode <= 1 || (_mode === 2 && _trapped !== 0))) {
      handleSpaceSelect()
    }
  }
  
  _activeAngle = adjustAngle(_activeAngle);

  renderBoxes();
  renderPoints();
  calc();

  if(!DEFAULTS.IVL) {
    checkMiss();
  }

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
  _sgSelected.find('.circle').toggleClass('trapped-0', _trapped === 0);
  _sgSelected.find('.circle').toggleClass('trapped-1', _trapped === 1);
}

const renderPoints = () => {
  _sgPoints.text(_points);
  if(_mode === 1) {
    _sgPointsMax.text(_pointsMax);
  }
}

const checkMiss = () => {
  if(!_missed) {
    _missed = overlap();
  } else {
    if(!overlap()) {
      if(_mode === 1) {
        handleMode1Penalty();
      } else if(_mode === 2) {
        handleMode2Miss();
      } else {
        endGame();
      }
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
    if(_mode === 2) {
      if(handleMode2Penalty()) return;
    }

    _points++;
    _pointsMax++;
    _incrementActive += _accel;
    _direction *= -1;
    _missed = false;

    if(_mode === 2 && _trapped === 1) {
      _selectedAngle = adjustAngle(_selectedAngle + (DEFAULTS.GREEN_ANGLE * _direction));
    } else {
      _selectedAngle = rand(_selectedAngle);
    }

    calcTrapped();
  } else { // end game if not overlapping and set high score if possible
    if(_mode === 1) {
      handleMode1Penalty();
    } else {
      endGame();
    }
  }
}

const handleMode1Penalty = () => {
  _points = Math.floor(_points / 2);
  if(_points <= 0) {
    _sgPoints.text(0);
    endGame();
  } else {
    _selectedAngle = rand(_selectedAngle);
    _incrementActive += _accel;
    _direction *= -1;
    _missed = false;
  }
}

const handleMode2Penalty = () => {
  if(_trapped === 0) {
    endGame();
    return true;
  } else if(_trapped === 1) {
    _direction *= -1;
  }
}

const handleMode2Miss = () => {
  if(_trapped === 0) {
    _pointsMax++;
    _points++;
    _selectedAngle = rand(_selectedAngle);
    _direction *= -1;
    _missed = false;
    calcTrapped();
  } else {
    endGame();
  }
}

const endGame = () => {
  _direction = 0;
  _state = 2;

  if(_pointsMax > parseInt(localStorage.getItem(HIGH_SCORE_CIRCLE) || 0)) {
    localStorage.setItem(HIGH_SCORE_CIRCLE, _pointsMax);
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

const calcTrapped = () => {
  if(_trapped === 1) { // higher chance for another green if last green
    _trapped = Math.floor(Math.random() * 10);
    if(_trapped >= 2 && _trapped <= 7) {
      _trapped = 1;
    } else if(_trapped <= 1) {
      _trapped = 0;
    }
  } else {
    _trapped = Math.floor(Math.random() * 5);
  }
}

const adjustAngle = (angle) => {
  if(angle < 0) {
    return angle + 360;
  } else if(angle > 359) {
    return angle - 360;
  }
  return angle;
}