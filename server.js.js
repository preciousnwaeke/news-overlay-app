const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Initial state
let state = {
  video1Headline: "Behind the headlines",
  video2Rotations: [
    {
      headline: "Studio Update",
      info: [
        "Second camera feed live now",
        "Guest analysis continues after the break",
        "Full story coming up at the top of the hour"
      ]
    },
    {
      headline: "Viewer Engagement",
      info: [
        "Send in your questions on air",
        "Follow along for live reaction",
        "Stay tuned for more"
      ]
    }
  ],
  ticker: "Unlock the secrets behind the scenes and discover the fascinating details that make each moment unforgettable."
};

// --- OBS OVERLAY ROUTE (http://localhost:8080) ---
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Two-Feed News Overlay</title>
<script src="/socket.io/socket.io.js"></script>
<style>
  :root{
    --bg-offwhite: #F6F4EF;
    --headline-red: #C8272B;
    --ink: #17181A;
    --ink-soft: #4B4D52;
    --rule: rgba(23,24,26,0.12);
  }
  html,body{
    margin:0; padding:0; width:1920px; height:1080px; overflow:hidden;
    background:transparent; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
  .stage{ position:relative; width:1920px; height:1080px; background:var(--bg-offwhite); }
  .cam{ position:absolute; background:transparent; }
  .stage.show-guides .cam{ outline:2px dashed rgba(23,24,26,0.55); outline-offset:-2px; }
  .stage.show-guides .cam::after{
    content:attr(data-label); position:absolute; top:12px; left:12px; font-size:15px;
    color:rgba(23,24,26,0.55); background:rgba(246,244,239,0.85); padding:4px 10px; border-radius:3px;
  }
  .cam-main{ left:108px; top:161px; width:1068px; height:658px; }
  .cam-secondary{ left:1204px; top:161px; width:594px; height:329px; }
  .info-panel{ position:absolute; left:1204px; top:508px; width:594px; transition: opacity 0.3s ease; }
  .info-panel h2{ margin:0 0 12px 0; font-size:26px; font-weight:700; color:var(--ink); }
  .info-panel ul{ margin:0; padding:0; list-style:none; }
  .info-panel li{ font-size:19px; line-height:1.5; color:var(--ink-soft); padding:6px 0; border-top:1px solid var(--rule); }
  .info-panel li:first-child{ border-top:none; }
  .headline-bar{ position:absolute; left:108px; top:857px; width:1812px; height:110px; background:var(--headline-red); display:flex; align-items:center; padding:0 32px; box-sizing:border-box; }
  .headline-bar h1{ margin:0; font-size:40px; font-weight:700; color:#FFFFFF; }
  .ticker-wrap{ position:absolute; left:108px; top:1005px; width:1812px; height:44px; overflow:hidden; }
  .ticker-track{ display:flex; white-space:nowrap; position:absolute; top:0; left:0; height:100%; align-items:center; animation: ticker-scroll linear infinite; }
  .ticker-track span{ font-size:22px; color:var(--ink); padding-right:90px; }
  @keyframes ticker-scroll{ from{ transform: translateX(0); } to{ transform: translateX(-50%); } }
</style>
</head>
<body>
<div class="stage" id="stage">
  <div class="cam cam-main" data-label="CAM 1 — main feed"></div>
  <div class="cam cam-secondary" data-label="CAM 2 — secondary feed"></div>
  <div class="info-panel" id="infoPanel">
    <h2 id="video2Headline"></h2>
    <ul id="video2Info"></ul>
  </div>
  <div class="headline-bar">
    <h1 id="video1Headline"></h1>
  </div>
  <div class="ticker-wrap">
    <div class="ticker-track" id="tickerTrack"></div>
  </div>
</div>
<script>
  const socket = io();
  let rotations = [];
  let currentRotationIndex = 0;
  let rotationTimer = null;

  socket.on('state-update', (data) => {
    document.getElementById('video1Headline').textContent = data.video1Headline;

    const track = document.getElementById('tickerTrack');
    if (track.dataset.currentTicker !== data.ticker) {
      track.dataset.currentTicker = data.ticker;
      track.innerHTML = '';
      const span1 = document.createElement('span');
      span1.textContent = data.ticker;
      const span2 = document.createElement('span');
      span2.textContent = data.ticker;
      track.appendChild(span1);
      track.appendChild(span2);

      const singleWidth = span1.getBoundingClientRect().width;
      const duration = singleWidth / 140;
      track.style.animationDuration = duration + 's';
    }

    rotations = data.video2Rotations || [];
    currentRotationIndex = 0;
    renderSecondaryPanel(currentRotationIndex);

    if (rotationTimer) clearInterval(rotationTimer);
    if (rotations.length > 0) {
      rotationTimer = setInterval(() => {
        currentRotationIndex = (currentRotationIndex + 1) % rotations.length;
        renderSecondaryPanel(currentRotationIndex);
      }, 20000);
    }
  });

  function renderSecondaryPanel(index) {
    if (!rotations || rotations.length === 0) return;
    const panel = document.getElementById('infoPanel');
    const data = rotations[index];

    panel.style.opacity = '0';
    setTimeout(() => {
      document.getElementById('video2Headline').textContent = data.headline;
      const list = document.getElementById('video2Info');
      list.innerHTML = '';
      data.info.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        list.appendChild(li);
      });
      panel.style.opacity = '1';
    }, 300);
  }

  if (new URLSearchParams(window.location.search).get('guide') === '1') {
    document.getElementById('stage').classList.add('show-guides');
  }
</script>
</body>
</html>
  `);
});

// --- ADMIN DASHBOARD ROUTE (http://localhost:8080/admin) ---
app.get('/admin', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Overlay Control Panel</title>
  <script src="/socket.io/socket.io.js"></script>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f0f0f0; }
    .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    h2, h3 { margin-top: 0; }
    input[type="text"], textarea { width: 100%; padding: 8px; margin: 6px 0 16px; box-sizing: border-box; }
    .slide-box { border: 1px dashed #ccc; padding: 12px; margin-bottom: 12px; background: #fafafa; position: relative; }
    button { padding: 10px 18px; background: #C8272B; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
    button:hover { background: #a51f22; }
    .btn-secondary { background: #555; }
    .btn-secondary:hover { background: #333; }
    .btn-danger { background: #d9534f; float: right; padding: 4px 8px; }
  </style>
</head>
<body>
  <h1>News Overlay Controller</h1>
  <div class="card">
    <h2>Main Headline</h2>
    <input type="text" id="video1Headline" placeholder="Main Headline Text">
    <h2>Ticker Message</h2>
    <input type="text" id="ticker" placeholder="Running ticker text">
  </div>
  <div class="card">
    <h2>Secondary Feed Rotations (20s Cycle)</h2>
    <div id="slidesContainer"></div>
    <button type="button" class="btn-secondary" onclick="addSlide()">+ Add Secondary Slide</button>
  </div>
  <button type="button" onclick="sendUpdate()">PUSH LIVE UPDATES</button>

  <script>
    const socket = io();
    socket.on('state-update', (state) => {
      document.getElementById('video1Headline').value = state.video1Headline;
      document.getElementById('ticker').value = state.ticker;
      const container = document.getElementById('slidesContainer');
      container.innerHTML = '';
      (state.video2Rotations || []).forEach(slide => addSlide(slide.headline, slide.info));
    });

    function addSlide(headline = '', info = []) {
      const container = document.getElementById('slidesContainer');
      const div = document.createElement('div');
      div.className = 'slide-box';
      div.innerHTML = \`
        <button class="btn-danger" onclick="this.parentElement.remove()">Delete</button>
        <h3>Slide</h3>
        <label>Headline:</label>
        <input type="text" class="slide-headline" value="\${headline}">
        <label>Bullet Points (One per line):</label>
        <textarea class="slide-info" rows="3">\${info.join('\\n')}</textarea>
      \`;
      container.appendChild(div);
    }

    function sendUpdate() {
      const slides = [];
      document.querySelectorAll('.slide-box').forEach(box => {
        const headline = box.querySelector('.slide-headline').value;
        const infoRaw = box.querySelector('.slide-info').value;
        const info = infoRaw.split('\\n').map(s => s.trim()).filter(s => s.length > 0);
        slides.push({ headline, info });
      });

      const payload = {
        video1Headline: document.getElementById('video1Headline').value,
        ticker: document.getElementById('ticker').value,
        video2Rotations: slides
      };
      socket.emit('update-overlay', payload);
      alert('Overlay Updated Live!');
    }
  </script>
</body>
</html>
  `);
});

// Socket communication
io.on('connection', (socket) => {
  socket.emit('state-update', state);
  socket.on('update-overlay', (newState) => {
    state = newState;
    io.emit('state-update', state);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});