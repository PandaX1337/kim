const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
let currentTool = 'brush';
let brushSize = 1;
let currentColor = '#FF0000';
let isDrawing = false;
let scale = 1;
let offsetX = 0, offsetY = 0;
let lastPoint = null;

// Инициализация
function init() {
  setupCanvas();
  setupTools();
  setupZoom();
  setupDrawing();
}

// Холст
function setupCanvas() {
  canvas.width = 12000;
  canvas.height = 12000;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function setCustomCursor(clientX, clientY) {
  const cursorSize = brushSize * 8;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${cursorSize}' height='${cursorSize}'><circle cx='${cursorSize/2}' cy='${cursorSize/2}' r='${cursorSize/2-1}' fill='${currentTool === 'brush' ? currentColor : '#000'}' fill-opacity='0.5' stroke='white' stroke-width='2'/></svg>`;
  canvas.style.cursor = `url('data:image/svg+xml;utf8,${svg.replace(/[#%]/g, encodeURIComponent)}') ${cursorSize/2} ${cursorSize/2}, auto`;
}

// Для мобильных: рисовать кружок под пальцем
let touchCursor = null;
function showTouchCursor(x, y) {
  if (!touchCursor) {
    touchCursor = document.createElement('div');
    touchCursor.style.position = 'fixed';
    touchCursor.style.pointerEvents = 'none';
    touchCursor.style.zIndex = 200;
    document.body.appendChild(touchCursor);
  }
  const size = brushSize * 8;
  touchCursor.style.width = `${size}px`;
  touchCursor.style.height = `${size}px`;
  touchCursor.style.left = `${x - size/2}px`;
  touchCursor.style.top = `${y - size/2}px`;
  touchCursor.style.background = currentTool === 'brush' ? currentColor : '#000';
  touchCursor.style.opacity = '0.5';
  touchCursor.style.border = '2px solid #fff';
  touchCursor.style.borderRadius = '50%';
  touchCursor.style.display = 'block';
}
function hideTouchCursor() {
  if (touchCursor) touchCursor.style.display = 'none';
}

// Инструменты
function setupTools() {
  document.getElementById('brushBtn').addEventListener('click', () => {
    currentTool = 'brush';
    document.getElementById('brushBtn').classList.add('active');
    document.getElementById('eraserBtn').classList.remove('active');
    setCustomCursor();
  });
  document.getElementById('eraserBtn').addEventListener('click', () => {
    currentTool = 'eraser';
    document.getElementById('eraserBtn').classList.add('active');
    document.getElementById('brushBtn').classList.remove('active');
    setCustomCursor();
  });
  document.getElementById('brushSize').addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    document.getElementById('sizeValue').textContent = `${brushSize}x${brushSize}`;
    setCustomCursor();
  });
  document.getElementById('colorPicker').addEventListener('input', (e) => {
    currentColor = e.target.value;
    setCustomCursor();
  });
  setCustomCursor();
}

// Зум
function setupZoom() {
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
}

// Рисование
function setupDrawing() {
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

  function drawLine(from, to) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.strokeStyle = currentTool === 'brush' ? currentColor : 'black';
    ctx.lineWidth = brushSize * 2;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  function onPointerDown(e) {
    isDrawing = true;
    const pt = getCanvasCoordinates(e);
    lastPoint = pt;
    drawDot(pt);
    setCustomCursor(pt.clientX, pt.clientY);
    if (e.touches) showTouchCursor(pt.clientX, pt.clientY);
  }

  function onPointerMove(e) {
    if (!isDrawing) {
      if (!e.touches) setCustomCursor(e.clientX, e.clientY);
      return;
    }
    const pt = getCanvasCoordinates(e);
    drawLine(lastPoint, pt);
    lastPoint = pt;
    setCustomCursor(pt.clientX, pt.clientY);
    if (e.touches) showTouchCursor(pt.clientX, pt.clientY);
  }

  function onPointerUp(e) {
    isDrawing = false;
    lastPoint = null;
    if (e && e.touches) hideTouchCursor();
  }

  function drawDot(pt) {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, brushSize, 0, Math.PI * 2);
    ctx.fillStyle = currentTool === 'brush' ? currentColor : 'black';
    ctx.fill();
  }

  // PC events
  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  canvas.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('mouseleave', onPointerUp);
  canvas.addEventListener('mousemove', (e) => setCustomCursor(e.clientX, e.clientY));

  // Mobile events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    onPointerDown(e);
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    onPointerMove(e);
  });
  canvas.addEventListener('touchend', onPointerUp);
  canvas.addEventListener('touchcancel', onPointerUp);
}

// Запуск
document.addEventListener('DOMContentLoaded', init);
