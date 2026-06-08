(function () {
  var loader = document.getElementById('loader');
  var invitation = document.getElementById('invitation');

  setTimeout(function () {
    loader.classList.add('show-text');
  }, 200);

  setTimeout(function () {
    loader.classList.add('open-doors');
    if (window.startCelebration) window.startCelebration();
  }, 5000);

  setTimeout(function () {
    invitation.classList.add('visible');
  }, 5800);

  setTimeout(function () {
    loader.classList.add('hide');
  }, 6000);

  setTimeout(function () {
    loader.remove();
  }, 7000);
})();
