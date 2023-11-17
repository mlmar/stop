let $backBtn = null;
let $footer = null;

$(document).ready(function() {
  $backBtn = $(`
    <a class="sg-back-btn sg-flex sg-flex-center" href="index.html">
      <img src="images/arrow-left.svg"/>
      Back
    </a>
  `);
  $('body').prepend($backBtn);

  $footer = $(`
    <footer class="sg-footer sg-flex">
      <a href="https://github.com/mlmar/stop" class="sg-img-wrapper" title="View Source"> <img src="images/github.png"/> </a>
      <a id="sg-prompt" href="https://mlmar.github.io" class="sg-img-wrapper" title="Marcus"> <img src="images/m.ico"/> </a>
    </footer>
  `);
  $('body').append($footer);
});