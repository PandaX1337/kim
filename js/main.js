const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
let currentTool = 'brush';
let brushSize = 1;
let currentColor = '#FF0000';
let isDrawing = false;
let scale = 1;
let offsetX = 0, offsetY = 0;

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

// Инструменты
function setupTools() {
  document.getElementById('brushBtn').addEventListener('click', () => {
    currentTool = 'brush';
    document.getElementById('brushBtn').classList.add('active');
    document.getElementById('eraserBtn').classList.remove('active');
  });

  document.getElementById('eraserBtn').addEventListener('click', () => {
    currentTool = 'eraser';
    document.getElementById('eraserBtn').classList.add('active');
    document.getElementById('brushBtn').classList.remove('active');
  });

  document.getElementById('brushSize').addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    document.getElementById('sizeValue').textContent = `${brushSize}x${brushSize}`;
  });

  document.getElementById('colorPicker').addEventListener('input', (e) => {
    currentColor = e.target.value;
  });
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

  function draw(e) {
    if (!isDrawing) return;
    const { x, y } = getCanvasCoordinates(e);
    
    ctx.beginPath();
    ctx.arc(x, y, brushSize, 0, Math.PI * 2);
    ctx.fillStyle = currentTool === 'brush' ? currentColor : 'black';
    ctx.fill();
  }

  // PC events
  canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    draw(e);
  });

  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', () => isDrawing = false);

  // Mobile events
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    const touch = e.touches[0];
    draw({ clientX: touch.clientX, clientY: touch.clientY });
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    draw({ clientX: touch.clientX, clientY: touch.clientY });
  });

  canvas.addEventListener('touchend', () => isDrawing = false);
}

// Запуск
document.addEventListener('DOMContentLoaded', init);