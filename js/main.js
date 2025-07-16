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

function setCustomCursor() {
  const cursorSize = brushSize * 8;
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${cursorSize}' height='${cursorSize}'><circle cx='${cursorSize/2}' cy='${cursorSize/2}' r='${cursorSize/2-1}' fill='${currentTool === 'brush' ? currentColor : '#000'}' fill-opacity='0.5' stroke='white' stroke-width='2'/></svg>`;
  canvas.style.cursor = `url('data:image/svg+xml;utf8,${svg.replace(/[#%]/g, encodeURIComponent)}') ${cursorSize/2} ${cursorSize/2}, auto`;
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
    return {
      x: (e.clientX - rect.left - offsetX) / scale,
      y: (e.clientY - rect.top - offsetY) / scale
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
    lastPoint = getCanvasCoordinates(e);
    drawDot(lastPoint);
  }

  function onPointerMove(e) {
    if (!isDrawing) return;
    const point = getCanvasCoordinates(e);
    drawLine(lastPoint, point);
    lastPoint = point;
  }

  function onPointerUp() {
    isDrawing = false;
    lastPoint = null;
  }

  function drawDot(point) {
    ctx.beginPath();
    ctx.arc(point.x, point.y, brushSize, 0, Math.PI * 2);
    ctx.fillStyle = currentTool === 'brush' ? currentColor : 'black';
    ctx.fill();
  }

  // PC events
  canvas.addEventListener('mousedown', onPointerDown);
  canvas.addEventListener('mousemove', onPointerMove);
  canvas.addEventListener('mouseup', onPointerUp);
  canvas.addEventListener('mouseleave', onPointerUp);

  // Mobile events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const touch = e.touches[0];
    lastPoint = getCanvasCoordinates(touch);
    drawDot(lastPoint);
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const touch = e.touches[0];
    const point = getCanvasCoordinates(touch);
    drawLine(lastPoint, point);
    lastPoint = point;
  });
  canvas.addEventListener('touchend', onPointerUp);
  canvas.addEventListener('touchcancel', onPointerUp);
}

// Запуск
document.addEventListener('DOMContentLoaded', init);
