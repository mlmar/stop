let _main = null;

$(document).ready(() => {
  _main = $('#' + 'sg-main');
  render();
});

const el = (arr) => $(arr.join(' '));

const render = () => {
  $backBtn.hide();
  createCircle1();
  createCircle2();
  createCircle3();
  createBox();

  // $('#' + 'sg-prompt').on('click', (e) => {
  //   e.preventDefault();
  //   localStorage.setItem('options', prompt(''));
  // });

  console.log(`%c marcus was here`, 'background: black; color: lightgreen; font-weight: 600');
}

const createBox = () => {
  _main.append(el([
    `<a class="sg-item sg-flex" href="box.html">`,
      `<div id="sg-boxes" class="sg-flex sg-boxes">`,
        `<div id="sg-box-selected" class="box selected"></div>`,
        `<div id="sg-box-active" class="box active"></div>`,
      `</div>`,
    `</a>`
  ]));

  $('#' + 'sg-box-selected').css('left', (Math.random() * ($('#' + 'sg-boxes').width() - $('#' + 'sg-box-selected').width() * 2)) + 'px');
  $('#' + 'sg-box-active').css('left', (Math.random() * ($('#' + 'sg-boxes').width() - $('#' + 'sg-box-active').width() * 2)) + 'px');
}

const createCircle1 = () => {
  _main.append(el([
    `<a class="sg-item sg-flex sg-flex-middle" href="circle.html">`,
      `<div id="sg-base" class="sg-base sg-flex">`,
          `<div id="sg-selected" class="stick sg-flex">`,
          `<div class="circle selected"></div>`,
        `</div>`,
        `<div id="sg-active" class="stick sg-flex">`,
          `<div class="circle active"></div>`,
        `</div>`,
      `</div>`,
    `</a>`
  ]));

  $('#' + 'sg-selected').css('transform', `rotate(${(Math.random() * 360)}deg)`);
  $('#' + 'sg-active').css('transform', `rotate(${(Math.random() * 360)}deg)`);
}

const createCircle2 = () => {
  _main.append(el([
    `<a class="sg-item sg-flex sg-flex-middle" href="circle.html?mode=1">`,
      `<div id="sg-base" class="sg-base sg-flex">`,
          `<div id="sg-selected-2" class="stick sg-flex">`,
          `<div class="circle selected"></div>`,
        `</div>`,
        `<div id="sg-active-2" class="stick sg-flex">`,
          `<div class="circle active"></div>`,
        `</div>`,
      `</div>`,
    `</a>`
  ]));

  $('#' + 'sg-selected-2').css('transform', `rotate(${(Math.random() * 360)}deg)`);
  $('#' + 'sg-active-2').css('transform', `rotate(${(Math.random() * 360)}deg)`);
}

const createCircle3 = () => {
  _main.append(el([
    `<a class="sg-item sg-flex sg-flex-middle" href="circle.html?mode=2">`,
      `<div id="sg-base" class="sg-base sg-flex">`,
          `<div id="sg-selected-3" class="stick sg-flex">`,
          `<div class="circle selected trapped-green"></div>`,
        `</div>`,
        `<div id="sg-active-3" class="stick sg-flex">`,
          `<div class="circle active"></div>`,
        `</div>`,
      `</div>`,
    `</a>`
  ]));

  $('#' + 'sg-selected-3').css('transform', `rotate(${(Math.random() * 360)}deg)`);
  $('#' + 'sg-active-3').css('transform', `rotate(${(Math.random() * 360)}deg)`);
}