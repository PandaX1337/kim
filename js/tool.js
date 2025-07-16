// tools.js - Управление инструментами рисования

// Конфигурация инструментов
const toolsConfig = {
  brush: {
    name: 'Кисть',
    cursor: 'url(assets/icons/brush-cursor.png) 0 24, auto',
    defaultSize: 1
  },
  eraser: {
    name: 'Ластик',
    cursor: 'url(assets/icons/eraser-cursor.png) 8 24, auto',
    defaultSize: 2
  }
};

// Элементы интерфейса
const elements = {
  brushBtn: document.getElementById('brushBtn'),
  eraserBtn: document.getElementById('eraserBtn'),
  brushSize: document.getElementById('brushSize'),
  sizeValue: document.getElementById('sizeValue'),
  colorPicker: document.getElementById('colorPicker')
};

// Состояние инструментов
let currentState = {
  tool: 'brush',
  size: toolsConfig.brush.defaultSize,
  color: '#FF0000',
  lastColor: '#FF0000'
};

// Инициализация инструментов
function initTools() {
  // Настройка кнопок инструментов
  elements.brushBtn.addEventListener('click', () => switchTool('brush'));
  elements.eraserBtn.addEventListener('click', () => switchTool('eraser'));
  
  // Настройка ползунка размера
  elements.brushSize.value = currentState.size;
  elements.brushSize.addEventListener('input', updateBrushSize);
  updateSizeDisplay();
  
  // Настройка выбора цвета
  elements.colorPicker.value = currentState.color;
  elements.colorPicker.addEventListener('input', updateCurrentColor);
  
  // Активируем инструмент по умолчанию
  switchTool('brush');
}

// Переключение между инструментами
function switchTool(toolName) {
  // Обновляем состояние
  currentState.tool = toolName;
  
  // Если включаем ластик - запоминаем последний цвет
  if (toolName === 'eraser') {
    currentState.lastColor = currentState.color;
    document.getElementById('pixelCanvas').style.cursor = toolsConfig.eraser.cursor;
  } else {
    currentState.color = currentState.lastColor;
    elements.colorPicker.value = currentState.color;
    document.getElementById('pixelCanvas').style.cursor = toolsConfig.brush.cursor;
  }
  
  // Обновляем UI
  updateToolButtons();
  updateCursor();
}

// Обновление размера кисти
function updateBrushSize() {
  currentState.size = parseInt(elements.brushSize.value);
  updateSizeDisplay();
  updateCursor();
}

// Обновление текущего цвета
function updateCurrentColor(e) {
  currentState.color = e.target.value;
  if (currentState.tool === 'brush') {
    currentState.lastColor = currentState.color;
  }
}

// Обновление отображения размера
function updateSizeDisplay() {
  elements.sizeValue.textContent = `${currentState.size}x${currentState.size}`;
}

// Обновление кнопок инструментов
function updateToolButtons() {
  elements.brushBtn.classList.toggle('active', currentState.tool === 'brush');
  elements.eraserBtn.classList.toggle('active', currentState.tool === 'eraser');
}

// Обновление курсора
function updateCursor() {
  const cursorSize = currentState.size * 8;
  const canvas = document.getElementById('pixelCanvas');
  
  if (currentState.tool === 'brush') {
    canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${cursorSize}" height="${cursorSize}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="${currentState.color.replace('#', '%23')}" opacity="0.7"/></svg>') ${cursorSize/2} ${cursorSize/2}, auto`;
  } else {
    canvas.style.cursor = `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${cursorSize}" height="${cursorSize}" viewBox="0 0 100 100"><rect width="100" height="100" fill="black" opacity="0.5"/></svg>') ${cursorSize/2} ${cursorSize/2}, auto`;
  }
}

// Получение текущих настроек
function getCurrentTool() {
  return {
    name: currentState.tool,
    size: currentState.size,
    color: currentState.tool === 'brush' ? currentState.color : '#000000'
  };
}

// Экспорт функций
export {
  initTools,
  getCurrentTool,
  switchTool,
  updateBrushSize
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', initTools);