let fgImg;
let fgReady = false;

function preload() {
  fgImg = loadImage("fg_layer.png", img => {
    img.resize(800, 0); // 비율 유지 리사이즈
    fgReady = true;
  });
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noStroke();
  pixelDensity(1);
  angleMode(RADIANS);
}

function draw() {
  background(255);
  if (!fgReady) return;

  fgImg.loadPixels();
  let offsetX = width / 2 - fgImg.width / 2;
  let offsetY = height / 2 - fgImg.height / 2;

  for (let y = 0; y < fgImg.height; y += 2) {
    for (let x = 0; x < fgImg.width; x += 2) {
      let idx = 4 * (y * fgImg.width + x);
      let r = fgImg.pixels[idx];
      let g = fgImg.pixels[idx + 1];
      let b = fgImg.pixels[idx + 2];
      let a = fgImg.pixels[idx + 3];

      if (a < 30) continue;

      // 🎨 채도 강조
      let hsl = rgbToHsl(r, g, b);
      hsl[1] = min(1, hsl[1] * 1.6); // Saturation boost
      [r, g, b] = hslToRgb(hsl[0], hsl[1], hsl[2]);

      let cx = x - fgImg.width / 2;
      let cy = y - fgImg.height / 2;
      let distFromCenter = sqrt(cx * cx + cy * cy);

      let px = offsetX + x;
      let py = offsetY + y;
      let mouseAngle = atan2(py - mouseY, px - mouseX);
      let mouseDist = dist(mouseX, mouseY, px, py);

      // 🎯 마우스에 가까울수록 영향력 크게
      let mouseInfluence = map(mouseDist, 0, 300, 8.0, 0.3, true);

      // 🎯 수직/수평 성분 강조
      let dirFactorX = map(abs(r - g), 0, 255, 0.8, 2.2);
      let dirFactorY = map(abs(g - b), 0, 255, 0.8, 2.2);

      // 🎯 노이즈 + 마우스 영향 + 회복
      let n = noise(x * 0.01, y * 0.01, frameCount * 0.02);
      let wave = sin(frameCount * 0.05 + distFromCenter * 0.03);

      // 마우스가 멀면 유기적 흐름, 가까우면 터짐
      let recoverWave = sin(frameCount * 0.02 + y * 0.05 + x * 0.03);
      let driftX = map(n, 0, 1, -2, 2) * recoverWave;
      let driftY = map(n, 0, 1, -2, 2) * recoverWave;

      let dx = cos(mouseAngle + wave) * n * dirFactorX * mouseInfluence * 4 + driftX;
      let dy = sin(mouseAngle + wave) * n * dirFactorY * mouseInfluence * 4 + driftY;

      let sz = map(n, 0, 1, 1, 4);
      let alphaMask = map(n, 0, 1, 90, 240);

      fill(r, g, b, alphaMask);
      ellipse(px + dx, py + dy, sz);
    }
  }
}

// 🔁 RGB to HSL 변환
function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  let max = max3(r, g, b), min = min3(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

// 🔁 HSL to RGB 변환
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [r * 255, g * 255, b * 255];
}

// 유틸
function max3(a, b, c) {
  return max(a, max(b, c));
}
function min3(a, b, c) {
  return min(a, min(b, c));
}