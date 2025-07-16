const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
let scale = 1;
let offsetX = 0, offsetY = 0;

// Инициализация холста
function initCanvas() {
  canvas.width = 12000;
  canvas.height = 12000;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Зум колесом мыши
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    scale += e.deltaY * -0.001;
    scale = Math.min(Math.max(0.1, scale), 4);
    canvas.style.transform = `scale(${scale})`;
  });
}