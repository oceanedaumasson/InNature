// Create canvases for figures
const fig1Canvas = document.getElementById('imgfig1');
const fig2Canvas = document.getElementById('imgfig2');
fig1Canvas.width = 650;
fig1Canvas.height = 650;
fig2Canvas.width = 650;
fig2Canvas.height = 650;

const ctx1 = fig1Canvas.getContext('2d');
ctx1.imageSmoothingEnabled = false;
const ctx2 = fig2Canvas.getContext('2d');
ctx2.imageSmoothingEnabled = false;

// Tint overlay canvases (for hover crossfade)
const fig1TintCanvas = document.getElementById('imgfig1Tint');
const fig2TintCanvas = document.getElementById('imgfig2Tint');
const tintCtx1 = fig1TintCanvas.getContext('2d');
const tintCtx2 = fig2TintCanvas.getContext('2d');
tintCtx1.imageSmoothingEnabled = false;
tintCtx2.imageSmoothingEnabled = false;

// Flower overlay canvases
const fig1FlowersCanvas = document.getElementById('imgfig1Flowers');
const fig2FlowersCanvas = document.getElementById('imgfig2Flowers');
const flowersCtx1 = fig1FlowersCanvas.getContext('2d');
const flowersCtx2 = fig2FlowersCanvas.getContext('2d');

const TINT_COLOR = '#FF0700';   // For hover of button

const flowerImg = new Image();
flowerImg.src = 'images/flower.png'; // adjust path if needed

// For each figure
const figState = {
  imgfig1Hover: {
    canvas: fig1Canvas, ctx: ctx1, img: null, level: 0, colorLevel: 0, flowerLevel: 0,
    tintCanvas: fig1TintCanvas, tintCtx: tintCtx1,
    flowerCanvas: fig1FlowersCanvas, flowerCtx: flowersCtx1,
    color: '#566E23', pixelScale: 25,
    flowerArea: { xMin: 0.5, xMax: 1.0, yMin: 0.45, yMax: 0.75 }, // tiny nudge down
    flowerCountPerLevel: 10, flowerMinSize: 0.02, flowerMaxSize: 0.045
  },
  imgfig2Hover: {
    canvas: fig2Canvas, ctx: ctx2, img: null, level: 0, colorLevel: 0, flowerLevel: 0,
    tintCanvas: fig2TintCanvas, tintCtx: tintCtx2,
    flowerCanvas: fig2FlowersCanvas, flowerCtx: flowersCtx2,
    color: '#BDB62C', pixelScale: 10,
    flowerArea: { xMin: 0.1, xMax: 0.25, yMin: 0.5, yMax: 0.62 }, // much tighter, slightly lower
    flowerCountPerLevel: 30, flowerMinSize: 0.005, flowerMaxSize: 0.015
  }
};

const fig1Img = new Image();
fig1Img.src = 'images/img1fig1.png';
figState.imgfig1Hover.img = fig1Img;
fig1Img.onload = () => {
  fig1Canvas.width = fig1Img.naturalWidth;
  fig1Canvas.height = fig1Img.naturalHeight;
  refreshFigure(figState.imgfig1Hover);
  initFlowers(figState.imgfig1Hover);
};

const fig2Img = new Image();
fig2Img.src = 'images/img1fig2.png';
figState.imgfig2Hover.img = fig2Img;
fig2Img.onload = () => {
  fig2Canvas.width = fig2Img.naturalWidth;
  fig2Canvas.height = fig2Img.naturalHeight;
  refreshFigure(figState.imgfig2Hover);
  initFlowers(figState.imgfig2Hover);
};

// If the flower image loads after figures already rendered, refresh both
flowerImg.onload = () => {
  initFlowers(figState.imgfig1Hover);
  initFlowers(figState.imgfig2Hover);
};

// Pixelate: sizes down then back up without smoothing
function pixelate(ctx, img, canvas, level, scaleFactor) {
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  if (level <= 0) {
    ctx.drawImage(img, 0, 0, w, h);
    return;
  }

  const scale = level * scaleFactor;
  const smallW = Math.max(1, Math.floor(w / scale));
  const smallH = Math.max(1, Math.floor(h / scale));

  const off = document.createElement('canvas');
  off.width = smallW;
  off.height = smallH;
  const offCtx = off.getContext('2d');
  offCtx.imageSmoothingEnabled = false;
  offCtx.drawImage(img, 0, 0, smallW, smallH);

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, smallW, smallH, 0, 0, w, h);
}

// Overlay for color slider
function applyColorOverlay(ctx, canvas, colorLevel, color) {
  if (colorLevel <= 0) return;

  const w = canvas.width, h = canvas.height;
  const alpha = colorLevel / 5;

  ctx.globalCompositeOperation = 'source-atop';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
}

// For hover overlay canvas
function drawTinted(ctx, img, canvas, level, color, scaleFactor) {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  pixelate(ctx, img, canvas, level, scaleFactor);
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';
}

// Scatters random flowers, count scales with level (0-5)
function drawFlowers(ctx, canvas, level, area, countPerLevel, minSizeFrac, maxSizeFrac) {
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (level <= 0 || !flowerImg.complete || flowerImg.naturalWidth === 0) return;

  const count = level * countPerLevel;
  const minSize = w * minSizeFrac;
  const maxSize = w * maxSizeFrac;

  const areaX = area.xMin * w;
  const areaY = area.yMin * h;
  const areaW = (area.xMax - area.xMin) * w;
  const areaH = (area.yMax - area.yMin) * h;

  for (let i = 0; i < count; i++) {
    const size = minSize + Math.random() * (maxSize - minSize);
    const x = areaX + Math.random() * Math.max(0, areaW - size);
    const y = areaY + Math.random() * Math.max(0, areaH - size);
    const rotation = Math.random() * Math.PI * 2;

    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);
    ctx.drawImage(flowerImg, -size / 2, -size / 2, size, size);
    ctx.restore();
  }
}

// Redraws base canvas (pixel + color), tint overlay, and flowers for a figure
function refreshFigure(state) {
  state.tintCanvas.width = state.canvas.width;
  state.tintCanvas.height = state.canvas.height;

  pixelate(state.ctx, state.img, state.canvas, state.level, state.pixelScale);
  applyColorOverlay(state.ctx, state.canvas, state.colorLevel, state.color);

  drawTinted(state.tintCtx, state.img, state.tintCanvas, state.level, TINT_COLOR, state.pixelScale);
}

function initFlowers(state) {
  state.flowerCanvas.width = state.canvas.width;
  state.flowerCanvas.height = state.canvas.height;
  drawFlowers(state.flowerCtx, state.flowerCanvas, state.flowerLevel, state.flowerArea, state.flowerCountPerLevel, state.flowerMinSize, state.flowerMaxSize);
}

// Figure select buttons
let selectedLabel = null;
const pixelSlider = document.getElementById('pixelRange');
const colorSlider = document.getElementById('colorRange');
const flowersSlider = document.getElementById('flowersRange');

document.querySelectorAll('.figureLabel').forEach(label => {
  const targetText = document.getElementById(label.dataset.text);
  const state = figState[label.dataset.target];

  label.addEventListener('mouseenter', () => {
    state.tintCanvas.classList.add('active');
  });

  label.addEventListener('mouseleave', () => {
    state.tintCanvas.classList.remove('active');
  });

  label.addEventListener('click', () => {
    if (selectedLabel && selectedLabel !== label) {
      const prevText = document.getElementById(selectedLabel.dataset.text);
      prevText.classList.remove('active');
    }

    targetText.classList.add('active');
    selectedLabel = label;

    pixelSlider.value = state.level;
    colorSlider.value = state.colorLevel;
    flowersSlider.value = state.flowerLevel;
  });
});

// Pixel slider — affects only the currently selected figure
pixelSlider.addEventListener('input', (e) => {
  if (!selectedLabel) return;
  const state = figState[selectedLabel.dataset.target];
  state.level = parseInt(e.target.value, 10);
  if (state.img.complete) refreshFigure(state);
});

// Color slider — affects only the currently selected figure
colorSlider.addEventListener('input', (e) => {
  if (!selectedLabel) return;
  const state = figState[selectedLabel.dataset.target];
  state.colorLevel = parseInt(e.target.value, 10);
  if (state.img.complete) refreshFigure(state);
});

// Flowers slider — affects only the currently selected figure
flowersSlider.addEventListener('input', (e) => {
  if (!selectedLabel) return;
  const state = figState[selectedLabel.dataset.target];
  state.flowerLevel = parseInt(e.target.value, 10);
  drawFlowers(state.flowerCtx, state.flowerCanvas, state.flowerLevel, state.flowerArea, state.flowerCountPerLevel, state.flowerMinSize, state.flowerMaxSize);
});
