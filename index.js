let _main = null;

$(document).ready(() => {
  _main = $('#' + 'sg-main');
  render();
});

const el = (arr) => $(arr.join(' '));

const render = () => {
  _main.append(el([
    `<a class="sg-item sg-flex" href="box.html">`,
      `<div id="sg-boxes" class="sg-flex sg-boxes">`,
        `<div id="sg-box-selected" class="box selected"></div>`,
        `<div id="sg-box-active" class="box active"></div>`,
      `</div>`,
    `</a>`
  ]));

  $('#' + 'sg-box-selected').css('left', (Math.random() * ($('#' + 'sg-boxes').width() - $('#' + 'sg-box-selected').width())) + 'px');
  $('#' + 'sg-box-active').css('left', (Math.random() * ($('#' + 'sg-boxes').width() - $('#' + 'sg-box-active').width())) + 'px');

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