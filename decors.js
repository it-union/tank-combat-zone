function drawDecorWater(decor) {
  const cx = decor.x - camera.x;
  const cy = decor.y - camera.y;
  const size = decor.size;

  // Основной градиент воды
  const gradient = ctx.createRadialGradient(
    cx,
    cy,
    0,
    cx + (Math.random() - 0.5) * 20,
    cy + (Math.random() - 0.5) * 20,
    size,
  );
  gradient.addColorStop(0, `rgba(41, 128, 185, ${0.9 * decor.shade})`);
  gradient.addColorStop(0.4, `rgba(30, 100, 160, ${0.7 * decor.shade})`);
  gradient.addColorStop(1, `rgba(15, 70, 120, ${0.4 * decor.shade})`);

  ctx.save();
  ctx.translate(cx, cy);

  // Общий масштаб для анимации покачивания воды
  const waveScaleX = 1 + Math.sin(Date.now() * 0.003 + decor.x * 0.01) * 0.05;
  const waveScaleY = 1 + Math.cos(Date.now() * 0.002 + decor.y * 0.01) * 0.03;
  ctx.scale(waveScaleX, waveScaleY);

  // Рисуем основную форму озера
  ctx.beginPath();
  ctx.moveTo(0, -size);
  const steps = 32;
  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * Math.PI * 2;
    const noise =
      (Math.sin(angle * 3 + Date.now() * 0.001) * 0.2 +
        Math.cos(angle * 5 + Date.now() * 0.0015) * 0.15) *
      decor.irregularity;
    // Убираем проблемный множитель (abs/PI), чтобы границы совпадали с логикой
    const r = size * (1 + noise * 0.6);
    ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // --- ДОБАВЛЕНИЕ ГЛУБОКОГО ПЯТНА ---
  // Смещение центра глубины (например, чуть вправо и вниз)
  const depthOffsetX = size * 0.15;
  const depthOffsetY = size * 0.1;
  const depthRadius = size * 0.5; // Пятно в два раза меньше озера

  const deepGradient = ctx.createRadialGradient(
    depthOffsetX,
    depthOffsetY,
    0,
    depthOffsetX,
    depthOffsetY,
    depthRadius,
  );
  deepGradient.addColorStop(0, `rgba(5, 30, 60, ${0.6 * decor.shade})`); // Темный центр
  deepGradient.addColorStop(1, 'rgba(5, 30, 60, 0)'); // Прозрачные края

  ctx.fillStyle = deepGradient;
  ctx.beginPath();
  // Рисуем эллипс глубины со смещением
  ctx.arc(depthOffsetX, depthOffsetY, depthRadius, 0, Math.PI * 2);
  ctx.fill();
  // ----------------------------------

  ctx.restore();

  // Отрисовка бликов (поверх воды)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(
    cx + 15,
    cy - 10,
    8 + Math.sin(Date.now() * 0.008) * 2,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(
    cx - 25,
    cy + 5,
    6 + Math.cos(Date.now() * 0.006) * 1.5,
    0,
    Math.PI * 2,
  );
  ctx.stroke();
}

function drawDecorDirt(decor) {
  //рисуем землю
  const cx = decor.x - camera.x;
  const cy = decor.y - camera.y;
  const size = decor.size;

  const t = Date.now() * 0.0005;
  const irr = decor.irregularity || 0.25;
  const seed = decor.seed || 0;

  ctx.save();
  ctx.translate(cx, cy);

  if (decor.type === 'sand') {
    const shade = decor.shade || 1;

    ctx.fillStyle = `rgba(104, 121, 52, ${0.65 * shade})`; //'#687934';
    ctx.beginPath();
    const steps = 26;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const n =
        (Math.sin(a * 3 + seed) * 0.35 + Math.cos(a * 5 + seed * 1.7) * 0.25) *
        irr;
      const rr = size * (0.85 + n * 0.6);
      ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = `rgba(104, 121, 52, ${1 * shade})`; //'#0d3217';
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const n =
        (Math.sin(a * 4 + seed + 2 + t) * 0.3 +
          Math.cos(a * 6 + seed * 2.2) * 0.22) *
        irr;
      const rr = size * (0.55 + n * 0.55);
      ctx.lineTo(Math.cos(a) * rr + 10, Math.sin(a) * rr - 7);
    }
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    return;
  }

  ctx.fillStyle = '#5e4d2a';
  ctx.beginPath();
  const steps = 26;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const n =
      (Math.sin(a * 3 + seed) * 0.35 + Math.cos(a * 5 + seed * 1.7) * 0.25) *
      irr;
    const rr = size * (0.85 + n * 0.6);
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#4a3d20';
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const n =
      (Math.sin(a * 4 + seed + 2 + t) * 0.3 +
        Math.cos(a * 6 + seed * 2.2) * 0.22) *
      irr;
    const rr = size * (0.55 + n * 0.55);
    ctx.lineTo(Math.cos(a) * rr + 10, Math.sin(a) * rr - 7);
  }
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawDebris(debris) {
  //рисуем развалины
  ctx.save();
  ctx.translate(debris.x - camera.x, debris.y - camera.y);
  ctx.rotate(debris.angle);

  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  ctx.globalAlpha = Math.max(0, debris.ttl / (10 * 60));
  ctx.fillStyle = debris.color;
  ctx.fillRect(-debris.size / 2, -debris.size / 2, debris.size, debris.size);
  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawCrater(c) {
  //рисуем воронку
  const cx = c.x - camera.x;
  const cy = c.y - camera.y;
  const r = c.size;

  ctx.save();
  ctx.globalAlpha = 0.85 * c.life;

  const g = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.2);
  g.addColorStop(0, 'rgba(20, 15, 10, 0.0)');
  g.addColorStop(0.55, 'rgba(30, 22, 12, 0.35)');
  g.addColorStop(1, 'rgba(10, 8, 5, 0.55)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 1.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(35, 28, 16, 0.45)';
  ctx.beginPath();
  ctx.ellipse(
    cx + 2,
    cy + 1,
    r * 0.75,
    r * 0.55,
    (c.x * 0.01) % Math.PI,
    0,
    Math.PI * 2,
  );
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.restore();
}

function drawParticles() {
  //рисуем частицы
  for (let p of particles) {
    ctx.save();
    ctx.globalAlpha = clamp(p.life, 0, 1);

    // Особая отрисовка для дыма
    if (p.type === 'smoke') {
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = clamp(p.life * 0.6, 0, 0.6); // Дым более прозрачный
    } else {
      ctx.fillStyle = p.color;
    }

    ctx.beginPath();
    ctx.arc(p.x - camera.x, p.y - camera.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function getObjectAABB(obj) {
  //получаем AABB объекта
  const w = obj.w || 40;
  const h = obj.h || 40;
  return { x: obj.x - w / 2, y: obj.y - h / 2, w, h };
}

function spawnDebrisFromObject(obj) {
  //спавним развалины из объекта
  const count = 4 + Math.floor(Math.random() * 5);
  for (let i = 0; i < count; i++) {
    destroyedDebris.push({
      x: obj.x + (Math.random() - 0.5) * obj.w * 0.6,
      y: obj.y + (Math.random() - 0.5) * obj.h * 0.6,
      size: 8 + Math.random() * 8,
      angle: Math.random() * Math.PI * 2,
      color:
        obj.type === 'tree' || obj.type === 'fallen_tree'
          ? ['#5e3a1a', '#8b4513', '#a0522d'][Math.floor(Math.random() * 3)]
          : ['#5d6d7e', '#7f8c8d', '#95a5a6'][Math.floor(Math.random() * 3)],
      ttl: 10 * 60,
    });
  }
}

function spawnCrater(x, y, baseSize = 18) {
  //спавним воронку
  craters.push({
    x,
    y,
    size: baseSize + Math.random() * 10,
    life: 1,
    ttl: 45 * 60,
  });
}

function spawnExplosion(x, y, kind) {
  //спавним взрыв
  let count = 26;
  let colA = '#e67e22',
    colB = '#f1c40f',
    smoke = 'rgba(30,30,30,0.75)';
  let maxSize = 5.5;
  let speed = 2.8;

  if (kind === 'ground') {
    count = 22;
    colA = '#7f5a2a';
    colB = '#4a3d20';
    smoke = 'rgba(20,20,20,0.55)';
    maxSize = 4.8;
    speed = 2.2;
  } else if (kind === 'tree') {
    count = 30;
    colA = '#a0522d';
    colB = '#5e3a1a';
    smoke = 'rgba(25,25,25,0.65)';
    maxSize = 5.2;
    speed = 2.6;
  } else if (kind === 'building') {
    count = 38;
    colA = '#b2bec3';
    colB = '#636e72';
    smoke = 'rgba(10,10,10,0.8)';
    maxSize = 6.2;
    speed = 3.15;
  } else if (kind === 'ruin') {
    count = 34;
    colA = '#95a5a6';
    colB = '#34495e';
    smoke = 'rgba(12,12,12,0.78)';
    maxSize = 6.0;
    speed = 2.95;
  } else if (kind === 'chest') {
    count = 28;
    colA = '#c27c3a';
    colB = '#5d3b1c';
    smoke = 'rgba(15,15,15,0.6)';
    maxSize = 5.3;
    speed = 2.75;
  }

  for (let i = 0; i < count; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = speed * (0.35 + Math.random() * 0.85);
    particles.push({
      x: x + (Math.random() - 0.5) * 6,
      y: y + (Math.random() - 0.5) * 6,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      size: 2 + Math.random() * maxSize,
      life: 1,
      decay: 0.016 + Math.random() * 0.02,
      color: Math.random() < 0.55 ? colA : colB,
      grav: 0.02 + Math.random() * 0.04,
    });
  }

  const smokeCount = Math.floor(count * 0.35);
  for (let i = 0; i < smokeCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const sp = 1.2 * (0.2 + Math.random() * 0.8);
    particles.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 0.6,
      size: 6 + Math.random() * 10,
      life: 0.9,
      decay: 0.01 + Math.random() * 0.012,
      color: smoke,
      grav: -0.01,
    });
  }
}

function generateGrassTufts() {
  //спавним траву
  grassTufts.length = 0;
  const density = Math.floor((mapWidth * mapHeight) / 15000);
  const count = clamp(density, 500, 2500);

  const palette = ['#3d6b22', '#2f5a18', '#437a27', '#2d4f1e'];
  for (let i = 0; i < count; i++) {
    const x = Math.random() * mapWidth;
    const y = Math.random() * mapHeight;
    if (isPointInWater(x, y)) continue;
    grassTufts.push({
      x,
      y,
      size: 6 + Math.random() * 14,
      color: palette[Math.floor(Math.random() * palette.length)],
      sway: Math.random() * 10,
    });
  }
}

function onBulletImpact(x, y, kind) {
  //эффект взрыва
  if (kind === 'ground') spawnCrater(x, y, 16 + Math.random() * 10);
  spawnExplosion(x, y, kind);
  playExplosionSound(kind === 'tank' || kind === 'building');
}

function drawObject(obj) {
  // Отрисовка объектов
  ctx.save();
  ctx.translate(obj.x - camera.x, obj.y - camera.y);

  ctx.shadowColor = 'rgba(0,0,0,0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 6;
  ctx.shadowOffsetY = 6;

  if (obj.type === 'building' || obj.type === 'ruin') {
    ctx.rotate(obj.rotation);

    const base = obj.type === 'building' ? '#7f8c8d' : '#5d6d7e';
    const alt = obj.type === 'building' ? '#95a5a6' : '#4b5a6a';

    ctx.fillStyle = obj.variant % 2 === 0 ? base : alt;
    ctx.fillRect(-obj.w / 2, -obj.h / 2, obj.w, obj.h);

    ctx.strokeStyle = '#4d5656';
    ctx.lineWidth = 2;
    ctx.strokeRect(-obj.w / 2 + 5, -obj.h / 2 + 5, obj.w - 10, obj.h - 10);

    if (obj.type === 'building') {
      const rows = 2 + (obj.variant % 2);
      const cols = 2 + ((obj.variant + 1) % 3);
      const pad = 10;
      const ww = Math.max(6, (obj.w - pad * 2) / cols - 6);
      const hh = Math.max(6, (obj.h - pad * 2) / rows - 6);

      ctx.shadowColor = 'transparent';
      ctx.fillStyle = 'rgba(20, 20, 20, 0.35)';
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          //if (Math.random() < 0.12) continue;
          const x = -obj.w / 2 + pad + c * ((obj.w - pad * 2) / cols) + 3;
          const y = -obj.h / 2 + pad + r * ((obj.h - pad * 2) / rows) + 3;
          ctx.fillRect(x, y, ww, hh);
        }
      }

      ctx.rotate(0);
      ctx.fillStyle = 'rgba(60, 60, 60, 0.25)';
      ctx.fillRect(-obj.w / 2, -obj.h / 2 - 6, obj.w, 8);
    }

    if (obj.type === 'ruin') {
      ctx.shadowColor = 'transparent';
      ctx.fillStyle = 'rgba(44, 62, 80, 0.85)';

      const rows = 2 + (obj.variant % 4);
      const cols = 2 + ((obj.variant + 1) % 7);
      const pad = 10;
      const ww = Math.max(6, (obj.w - pad * 2) / cols - 6);
      const hh = Math.max(6, (obj.h - pad * 2) / rows - 6);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          //if (Math.random() < 0.12) continue;
          const x = -obj.w / 2 + pad + c * ((obj.w - pad * 2) / cols) + 3;
          const y = -obj.h / 2 + pad + r * ((obj.h - pad * 2) / rows) + 3;
          ctx.fillRect(x, y, ww, hh);
        }
      }
    }
  } else if (obj.type === 'tree') {
    const crown = obj.crown || { r1: 24, r2: 16, offx: -5, offy: -5, shade: 1 };
    const trunk = obj.trunk || { w: 8, h: 22, lean: 0 };

    ctx.rotate(obj.rotation * 0.25);

    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 10;

    const greens = ['#1e8449', '#27ae60', '#196f3d', '#229954'];
    const g1 = greens[obj.variant % greens.length];
    const g2 = greens[(obj.variant + 2) % greens.length];

    ctx.fillStyle = g1;
    ctx.beginPath();
    ctx.arc(0, -trunk.h * 0.35, crown.r1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = g2;
    ctx.beginPath();
    ctx.arc(crown.offx, -trunk.h * 0.35 + crown.offy, crown.r2, 0, Math.PI * 2);
    ctx.fill();

    if (obj.variant % 3 === 0) {
      ctx.fillStyle = 'rgba(30, 132, 73, 0.85)';
      ctx.beginPath();
      ctx.arc(
        -crown.offx * 0.6,
        -trunk.h * 0.35 - 8,
        crown.r2 * 0.75,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  } else if (obj.type === 'pine') {
    // ЁЛКА - вид сверху (конус из треугольных ярусов)
    const crown = obj.crown || { r1: 24, r2: 16, offx: -5, offy: -5, shade: 1 };
    const trunk = obj.trunk || { w: 8, h: 22, lean: 0 };

    ctx.rotate(obj.rotation * 0.25);

    ctx.shadowColor = 'rgba(0,0,0,0.25)';
    ctx.shadowBlur = 10;

    // Цвета для ёлки (более тёмные и холодные оттенки зелёного)
    const pineGreens = ['#0d5c3d', '#1a5c42', '#0f4c2f', '#145239'];
    const g1 = pineGreens[obj.variant % pineGreens.length];
    const g2 = pineGreens[(obj.variant + 1) % pineGreens.length];

    // Рисуем ёлку как несколько треугольных ярусов (вид сверху - звезда/снежинка)
    const baseRadius = crown.r1;    // Нижний ярус (самый большой)
    ctx.fillStyle = g1;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const x = Math.cos(angle) * baseRadius;
      const y = Math.sin(angle) * baseRadius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();    // Средний ярус (меньше)
    ctx.fillStyle = g2;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.PI / 6; // Смещение для реалистичности
      const x = Math.cos(angle) * (baseRadius * 0.65);
      const y = Math.sin(angle) * (baseRadius * 0.65);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();    // Верхний ярус (самый маленький, центральная звезда)
    ctx.fillStyle = pineGreens[(obj.variant + 2) % pineGreens.length];
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const x = Math.cos(angle) * (baseRadius * 0.35);
      const y = Math.sin(angle) * (baseRadius * 0.35);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();    // Центральная точка (ствол сверху)
    ctx.fillStyle = 'rgba(15, 76, 47, 0.9)';
    ctx.beginPath();
    ctx.arc(0, 0, baseRadius * 0.15, 0, Math.PI * 2);
    ctx.fill();
  } else if (obj.type === 'fallen_tree') {
    ctx.rotate(obj.rotation);
    ctx.fillStyle = '#5e3a1a';
    ctx.fillRect(-30, -5, 60, 10);    const greens = ['#1e8449', '#27ae60', '#196f3d', '#229954'];
    ctx.fillStyle = greens[obj.variant % greens.length];
    ctx.beginPath();
    ctx.arc(22, 0, 12 + (obj.variant % 3) * 3, 0, Math.PI * 2);
    ctx.fill();
    if (obj.variant % 2 === 0) {
      ctx.beginPath();
      ctx.arc(30, -6, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}
