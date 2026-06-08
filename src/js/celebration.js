(function () {
  var canvas = document.getElementById('celebration-canvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var particles = [];
  var confetti = [];
  var rockets = [];
  var animId = null;
  var confettiInterval = null;
  var running = false;

  var colors = [
    '#b8956a', '#d4b896', '#f5e6a0', '#faf6f0',
    '#6d8f6a', '#9bb896', '#ffffff', '#e8c4c4', '#ffd700'
  ];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pickColor() {
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function spawnConfetti(count) {
    for (var i = 0; i < count; i++) {
      confetti.push({
        x: rand(0, canvas.width),
        y: rand(-canvas.height, -10),
        w: rand(4, 9),
        h: rand(6, 14),
        color: pickColor(),
        vx: rand(-1.5, 1.5),
        vy: rand(2, 5),
        rot: rand(0, Math.PI * 2),
        spin: rand(-0.12, 0.12),
        opacity: rand(0.7, 1)
      });
    }
  }

  function launchRocket() {
    rockets.push({
      x: rand(canvas.width * 0.15, canvas.width * 0.85),
      y: canvas.height,
      targetY: rand(canvas.height * 0.15, canvas.height * 0.45),
      vy: -rand(9, 13),
      color: pickColor(),
      trail: []
    });
  }

  function explode(x, y, color) {
    var count = Math.floor(rand(40, 70));
    for (var i = 0; i < count; i++) {
      var angle = rand(0, Math.PI * 2);
      var speed = rand(2, 7);
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.4 ? color : pickColor(),
        life: rand(50, 90),
        maxLife: 90,
        size: rand(1.5, 3.5),
        gravity: 0.06
      });
    }
  }

  function updateRockets() {
    for (var i = rockets.length - 1; i >= 0; i--) {
      var r = rockets[i];
      r.trail.push({ x: r.x, y: r.y });
      if (r.trail.length > 8) r.trail.shift();

      r.y += r.vy;
      r.vy *= 0.98;

      if (r.y <= r.targetY || r.vy > -1) {
        explode(r.x, r.y, r.color);
        rockets.splice(i, 1);
      }
    }
  }

  function drawRockets() {
    rockets.forEach(function (r) {
      r.trail.forEach(function (t, j) {
        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(212, 184, 150, ' + ((j + 1) / r.trail.length) * 0.6 + ')';
        ctx.fill();
      });

      ctx.beginPath();
      ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = r.color;
      ctx.fill();
    });
  }

  function updateParticles() {
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.vx *= 0.98;
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }
  }

  function drawParticles() {
    particles.forEach(function (p) {
      var alpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  function updateConfetti() {
    for (var i = confetti.length - 1; i >= 0; i--) {
      var c = confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.03;
      c.rot += c.spin;
      if (c.y > canvas.height + 20) confetti.splice(i, 1);
    }
  }

  function drawConfetti() {
    confetti.forEach(function (c) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rot);
      ctx.globalAlpha = c.opacity;
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateRockets();
    drawRockets();
    updateParticles();
    drawParticles();
    updateConfetti();
    drawConfetti();

    if (running) animId = requestAnimationFrame(draw);
  }

  function scheduleBursts() {
    launchRocket();
    setTimeout(launchRocket, 350);
    setTimeout(launchRocket, 700);
    setTimeout(launchRocket, 1100);
    setTimeout(launchRocket, 1500);
    setTimeout(launchRocket, 1900);
  }

  function stopCelebration() {
    running = false;
    cancelAnimationFrame(animId);
    clearInterval(confettiInterval);
    canvas.classList.remove('active');
    canvas.classList.add('fade-out');

    setTimeout(function () {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles = [];
      confetti = [];
      rockets = [];
      canvas.classList.remove('fade-out');
    }, 600);
  }

  window.startCelebration = function () {
    if (running) return;
    running = true;
    resize();
    canvas.classList.add('active');
    spawnConfetti(80);
    scheduleBursts();

    confettiInterval = setInterval(function () {
      if (running) spawnConfetti(12);
    }, 400);

    draw();
    setTimeout(stopCelebration, 3200);
  };

  window.addEventListener('resize', resize);
})();
