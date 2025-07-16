// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyAIWp63XWutRG4ZrRnSHEe57JtkB3xyj1o",
  authDomain: "paint-5496f.firebaseapp.com",
  databaseURL: "https://paint-5496f-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "paint-5496f",
  storageBucket: "paint-5496f.firebasestorage.app",
  messagingSenderId: "51632467935",
  appId: "1:51632467935:web:d7681eae239ae9e5331e6a",
  measurementId: "G-JPVHNEV5JR"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- DOM Elements ---
const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const brushBtn = document.getElementById('brushBtn');
const eraserBtn = document.getElementById('eraserBtn');
const brushSizeInput = document.getElementById('brushSize');
const sizeValue = document.getElementById('sizeValue');
const colorPicker = document.getElementById('colorPicker');

// --- State ---
let currentTool = 'brush';
let brushSize = 1;
let currentColor = '#FF0000';
let isDrawing = false;
let lastPoint = null;
let scale = 1;
let offsetX = 0, offsetY = 0;
let panStart = null;

// --- Canvas Setup ---
function setupCanvas() {
  canvas.width = 12000;
  canvas.height = 12000;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// --- Tool UI Setup ---
function setupTools() {
  brushBtn.addEventListener('click', () => {
    currentTool = 'brush';
    updateToolUI();
  });
  eraserBtn.addEventListener('click', () => {
    currentTool = 'eraser';
    updateToolUI();
  });
  brushSizeInput.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    updateSizeDisplay();
  });
  colorPicker.addEventListener('input', (e) => {
    currentColor = e.target.value;
  });
  updateToolUI();
  updateSizeDisplay();
}

function updateToolUI() {
  brushBtn.classList.toggle('active', currentTool === 'brush');
  eraserBtn.classList.toggle('active', currentTool === 'eraser');
}
function updateSizeDisplay() {
  sizeValue.textContent = `${brushSize}x${brushSize}`;
}

// --- Drawing Logic ---
function getCanvasCoordinates(e) {
  const rect = canvas.getBoundingClientRect();
  let clientX, clientY;
  if (e.touches && e.touches[0]) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else {
    clientX = e.clientX;
    clientY = e.clientY;
  }
  return {
    x: (clientX - rect.left - offsetX) / scale,
    y: (clientY - rect.top - offsetY) / scale,
    clientX,
    clientY
  };
}

function drawLine(from, to, color, size, tool) {
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.strokeStyle = tool === 'brush' ? color : '#000';
  ctx.lineWidth = size * 2;
  ctx.lineCap = 'round';
  ctx.stroke();
}
function drawDot(pt, color, size, tool) {
  ctx.beginPath();
  ctx.arc(pt.x, pt.y, size, 0, Math.PI * 2);
  ctx.fillStyle = tool === 'brush' ? color : '#000';
  ctx.fill();
}

function syncDraw(from, to, color, size, tool) {
  db.ref('drawings').push({ from, to, color, size, tool, ts: Date.now() });
}

function setupDrawing() {
  // PC events
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    lastPoint = getCanvasCoordinates(e);
    drawDot(lastPoint, currentColor, brushSize, currentTool);
    syncDraw(lastPoint, lastPoint, currentColor, brushSize, currentTool);
  });
  canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const pt = getCanvasCoordinates(e);
    drawLine(lastPoint, pt, currentColor, brushSize, currentTool);
    syncDraw(lastPoint, pt, currentColor, brushSize, currentTool);
    lastPoint = pt;
  });
  canvas.addEventListener('mouseup', () => { isDrawing = false; lastPoint = null; });
  canvas.addEventListener('mouseleave', () => { isDrawing = false; lastPoint = null; });

  // Touch events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    lastPoint = getCanvasCoordinates(e);
    drawDot(lastPoint, currentColor, brushSize, currentTool);
    syncDraw(lastPoint, lastPoint, currentColor, brushSize, currentTool);
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const pt = getCanvasCoordinates(e);
    drawLine(lastPoint, pt, currentColor, brushSize, currentTool);
    syncDraw(lastPoint, pt, currentColor, brushSize, currentTool);
    lastPoint = pt;
  });
  canvas.addEventListener('touchend', () => { isDrawing = false; lastPoint = null; });
  canvas.addEventListener('touchcancel', () => { isDrawing = false; lastPoint = null; });
}

// --- Zoom & Pan ---
function setupZoomAndPan() {
  // Zoom (wheel)
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const delta = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.1, scale + delta), 4);
    offsetX = mouseX - (mouseX - offsetX) * (newScale / scale);
    offsetY = mouseY - (mouseY - offsetY) * (newScale / scale);
    scale = newScale;
    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
  });
  // Pan (mouse middle button or right button)
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 1 || e.button === 2) {
      panStart = { x: e.clientX, y: e.clientY, ox: offsetX, oy: offsetY };
      document.body.style.cursor = 'grab';
    }
  });
  window.addEventListener('mousemove', (e) => {
    if (panStart) {
      offsetX = panStart.ox + (e.clientX - panStart.x);
      offsetY = panStart.oy + (e.clientY - panStart.y);
      canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    }
  });
  window.addEventListener('mouseup', () => {
    panStart = null;
    document.body.style.cursor = '';
  });
  // Touch pan/zoom (двумя пальцами)
  let lastTouchDist = null;
  let lastTouchCenter = null;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      lastTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
    }
  });
  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2 && lastTouchDist && lastTouchCenter) {
      const newDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const newCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
      // Zoom
      const scaleChange = newDist / lastTouchDist;
      const newScale = Math.min(Math.max(0.1, scale * scaleChange), 4);
      offsetX = newCenter.x - (lastTouchCenter.x - offsetX) * (newScale / scale);
      offsetY = newCenter.y - (lastTouchCenter.y - offsetY) * (newScale / scale);
      scale = newScale;
      canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
      lastTouchDist = newDist;
      lastTouchCenter = newCenter;
      e.preventDefault();
    }
  });
  canvas.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      lastTouchDist = null;
      lastTouchCenter = null;
    }
  });
}

// --- Firebase sync: получать и рисовать чужие штрихи ---
db.ref('drawings').on('child_added', (snapshot) => {
  const {from, to, color, size, tool} = snapshot.val();
  drawLine(from, to, color, size, tool);
});

// --- Инициализация ---
document.addEventListener('DOMContentLoaded', () => {
  setupCanvas();
  setupTools();
  setupDrawing();
  setupZoomAndPan();
});
