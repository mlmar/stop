const SPACE = ' ';
const ACTIVE = 'active';
const SELECTED = 'selected';
const TRAPPED_GREEN = 'trapped_green';
const TRAPPED_RED = 'trapped_red';
let HIGH_SCORE_CIRCLE = 'highScoreCircle';



const DEFAULTS = {
  ACCEL: .05,
  INCREMENT_ACTIVE: 2,
  DIRECTION: 1,
  MARGIN: .02,
  GREEN_ANGLE: 70,
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
let _trapped = null;

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
      handleTap();
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
  _sgBase = $('#' + 'sg-base');

  _sgBase.append(el([
    `<div id="sg-selected" class="stick sg-flex hidden">`,
      `<div class="circle selected"></div>`,
    `</div>`
  ]));
  _sgBase.append(el([
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
  
  window.requestAnimationFrame(handleLoop)
}

const handleLoop = (time) => {
  if(_lastRender === 0) {
    _lastRender = time;
  }

  _elapsed = time - _lastRender;

  if(!pause) {
    _activeAngle += _direction * _incrementActive * (_elapsed / 16);
  }

  if(DEFAULTS.AUTO) {
    if(overlap() && (_mode <= 1 || (_mode === 2 && _trapped !== TRAPPED_RED))) {
      handleTap()
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
    window.requestAnimationFrame(handleLoop)
  }
}

const renderBoxes = () => {
  _sgSelected.css('transform', `rotate(${_selectedAngle}deg)`);
  _sgActive.css('transform', `rotate(${_activeAngle}deg)`);
  // _sgBase.css('transform', `rotate(${-_activeAngle}deg)`);
  _sgSelected.removeClass('hidden');
  _sgActive.removeClass('hidden');
  _sgSelected.find('.circle').toggleClass('trapped-green', _trapped === TRAPPED_GREEN);
  _sgSelected.find('.circle').toggleClass('trapped-red', _trapped === TRAPPED_RED);
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
        handleMode1Tap();
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

const handleTap = () => {
  if(overlap()) { // add point and speed if overlapping
    if(_mode === 2) {
      if(handleMode2Tap()) return;
    }

    _points++;
    _pointsMax++;
    _incrementActive += _accel;
    _direction *= -1;
    _missed = false;

    if(_mode === 2) {
      if(_trapped === TRAPPED_GREEN) {
        _selectedAngle = adjustAngle(_selectedAngle + (DEFAULTS.GREEN_ANGLE * _direction));
      } else {
        _selectedAngle = rand(_selectedAngle);
      }
      calcTrapped();
    } else {
      _selectedAngle = rand(_selectedAngle);
    }
  } else { // end game if not overlapping and set high score if possible
    if(_mode === 1) {
      handleMode1Tap();
    } else {
      endGame();
    }
  }
}

const handleMode1Tap = () => {
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

const handleMode2Tap = () => {
  if(_trapped === TRAPPED_RED) {
    endGame();
    return true;
  } else if(_trapped === TRAPPED_GREEN) {
    _direction *= -1; // maintain direction
  }
}

const handleMode2Miss = () => {
  if(_trapped === TRAPPED_RED) {
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
  let chance = null;
  if(_trapped === TRAPPED_GREEN) { // higher chance for another green if last green
    chance = Math.floor(Math.random() * 11);
    if(chance <= 6) {
      _trapped = TRAPPED_GREEN;
    } else if(chance <= 8) {
      _trapped = TRAPPED_RED;
    } else {
      _trapped = null;
    }
  } else {
    chance = Math.floor(Math.random() * 5);
    _trapped = chance <= 2 ? TRAPPED_GREEN : null;
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