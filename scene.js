async function update(deltaTime = 1 / 60) {
  //обновление игры
  if (modalOpen || gamePaused) {
    updatePauseStats();
    updateHUD();
    return;
  }

  if (mobileOptimizationLevel >= 1) {
    particles.forEach((p) => {
      if (Math.random() < 0.3) return; // Пропускаем 30% частиц
    });
  }

  // Ограничение объектов на мобильных
  if (particles.length > 150 && isMobile) {
    particles.splice(0, particles.length - 150);
  }

  tank.prevX = tank.x;
  tank.prevY = tank.y;

  const inWater = isTankInWater(tank);
  const inSand = isTankInSand(tank);
  const inDirt = isTankInDirt(tank);
  const frameSpeed = tank.maxSpeed * 60 * deltaTime; // 60 FPS база
  let currentMaxSpeed = frameSpeed * (inWater ? tank.waterSpeedMultiplier : 1);
  currentMaxSpeed = currentMaxSpeed * (inSand ? tank.sandSpeedMultiplier : 1);
  currentMaxSpeed = currentMaxSpeed * (inDirt ? tank.sandSpeedMultiplier : 1);

  waterDamages(inWater);
  waterEffectTimer += 0.15;
  waterSlowing(inWater);

  const forward = keys['KeyW'] || keys['ArrowUp'];
  const backward = keys['KeyS'] || keys['ArrowDown'];
  const left = keys['KeyA'] || keys['ArrowLeft'];
  const right = keys['KeyD'] || keys['ArrowRight'];

  tank.vx = 0;
  tank.vy = 0;

  // Новое управление джойстиком:
  // joystickY (вертикальная ось) - движение вперед/назад
  //   В системе координат экрана: положительный Y = вниз
  //   Для интуитивного управления инвертируем: joystickY < 0 = движение вперед, joystickY > 0 = движение назад
  // joystickX (горизонтальная ось) - поворот влево/вправо
  //   joystickX > 0 = поворот вправо
  //   joystickX < 0 = поворот влево
  // Сектор ±45 градусов от вертикали - движение без поворота
  if (joystickActive) {
    // Извлекаем компоненты управления
    // Инвертируем joystickY для интуитивного управления (вверх = вперед)
    const forwardInput = Math.max(0, -joystickY); // Вперед (отрицательные значения joystickY = вверх)
    const backwardInput = Math.max(0, joystickY); // Назад (положительные значения joystickY = вниз)
    const turnInput = joystickX; // Поворот влево/вправо
    
    // Вычисляем угол отклонения джойстика от вертикали
    // Используем абсолютные значения для определения сектора
    const absX = Math.abs(turnInput);
    const absForwardY = Math.abs(forwardInput);
    const absBackwardY = Math.abs(backwardInput);
    
    // Определяем секторы движения без поворота:
    // - Движение вперед: сектор ±45 градусов (tan(45°) = 1, т.е. |X| <= |Y|)
    // - Движение назад: сектор ±15 градусов (tan(15°) ≈ 0.268, т.е. |X| <= 0.268 * |Y|)
    const FORWARD_SECTOR_TAN = Math.tan(Math.PI / 4); // tan(45°) = 1
    const BACKWARD_SECTOR_TAN = Math.tan(Math.PI / 12); // tan(15°) ≈ 0.268
    
    const isInForwardSector = absForwardY > 0 && absX <= absForwardY * FORWARD_SECTOR_TAN;
    const isInBackwardSector = absBackwardY > 0 && absX <= absBackwardY * BACKWARD_SECTOR_TAN;
    
    // Поворот танка влево/вправо с ограниченной скоростью
    // Поворот применяется если:
    // 1. Джойстик отклонен влево/вправо (не в секторе движения вперед) И есть горизонтальное отклонение
    // 2. ИЛИ джойстик отклонен назад больше чем на 15° (не в секторе движения назад) И есть горизонтальное отклонение
    const hasHorizontalInput = Math.abs(turnInput) > 0.05;
    const shouldTurn = hasHorizontalInput && (
      (!isInForwardSector && forwardInput > 0.05) || 
      (backwardInput > 0.05 && !isInBackwardSector)
    );
    
    if (shouldTurn) {
      // Скорость поворота зависит от силы отклонения джойстика влево/вправо
      const rotationSpeedMultiplier = 2.0; // Множитель скорости поворота
      // Нормализуем силу поворота (может быть больше 1 из-за sensitivity)
      const turnStrength = Math.min(1, Math.abs(turnInput));
      const rotationSpeed = tank.rotationSpeed * rotationSpeedMultiplier * turnStrength;
      
      // Поворачиваем танк в направлении джойстика
      // turnInput > 0 = поворот вправо (увеличиваем угол)
      // turnInput < 0 = поворот влево (уменьшаем угол)
      tank.angle += turnInput > 0 ? rotationSpeed : -rotationSpeed;
      
      // Нормализуем угол танка в диапазон [-π, π]
      while (tank.angle > Math.PI) tank.angle -= 2 * Math.PI;
      while (tank.angle < -Math.PI) tank.angle += 2 * Math.PI;
    }
    
    // Движение вперед/назад
    // Движение назад происходит ТОЛЬКО если джойстик в секторе ±15°
    if (forwardInput > 0.05) {
      // Движение вперед по направлению танка
      const moveStrength = forwardInput;
      const moveSpeed = currentMaxSpeed * Math.min(1, moveStrength);
      tank.vx = Math.cos(tank.angle) * moveSpeed;
      tank.vy = Math.sin(tank.angle) * moveSpeed;
      updateEngineSound(Math.hypot(tank.vx, tank.vy), tank.maxSpeed);
    } else if (backwardInput > 0.05 && isInBackwardSector) {
      // Движение назад ТОЛЬКО если джойстик в секторе ±15°
      const moveStrength = backwardInput;
      const moveSpeed = currentMaxSpeed * Math.min(1, moveStrength) * 0.7; // Медленнее
      tank.vx = Math.cos(tank.angle + Math.PI) * moveSpeed;
      tank.vy = Math.sin(tank.angle + Math.PI) * moveSpeed;
      updateEngineSound(Math.hypot(tank.vx, tank.vy), tank.maxSpeed);
    } else {
      // Если нет движения вперед/назад или движение назад вне сектора, останавливаем танк
      tank.vx = 0;
      tank.vy = 0;
      updateEngineSound(0, tank.maxSpeed);
    }
  } else {
    const moveSpeed =
      currentMaxSpeed * (keys['ShiftLeft'] || keys['ShiftRight'] ? 0.6 : 1);

    // WS - движение вперёд/назад по направлению танка
    if (forward) {
      tank.vx = Math.cos(tank.angle) * moveSpeed;
      tank.vy = Math.sin(tank.angle) * moveSpeed;
    }
    if (backward) {
      tank.vx = Math.cos(tank.angle + Math.PI) * moveSpeed * 0.7;
      tank.vy = Math.sin(tank.angle + Math.PI) * moveSpeed * 0.7;
    }

    // AD - плавный поворот танка влево/вправо
    if (left || right) {
      const rotSpeed = tank.rotationSpeed * 1.5;
      tank.angle += right ? rotSpeed : -rotSpeed;
    }

    updateEngineSound(Math.hypot(tank.vx, tank.vy), tank.maxSpeed);
  }

  let nextX = tank.x + tank.vx;
  let nextY = tank.y + tank.vy;

  if (checkCollisionWithDamage(nextX, nextY)) {
    tank.x -= tank.vx * 0.3;
    tank.y -= tank.vy * 0.3;
  } else {
    tank.x = nextX;
    tank.y = nextY;
  }

  updateTracks(left, right, inWater);

  collisionPlayerDamage();
  collisionTurrets();

  camera.x = Math.max(
    0,
    Math.min(mapWidth - screenWidth, tank.x - screenWidth / 2),
  );
  camera.y = Math.max(
    0,
    Math.min(mapHeight - screenHeight, tank.y - screenHeight / 2),
  );

  checkMineCollision();
  handlePlayerBullets();
  handleEnemyBullets();
  updateEnemyAI();
  updateTurretAI();

  // тики перков (каждый кадр)
  if (invisTimer > 0) invisTimer--;
  if (shieldTimer > 0) shieldTimer--;
  if (artilleryCooldown > 0) artilleryCooldown--;

  for (let ch of chests) {
    if (!ch.loot) continue;
    if (!ch.loot.picked) tryPickupLoot(ch.loot);
    if (!ch.loot.picked) ch.loot.ttl--;
    if (ch.loot.ttl <= 0) ch.loot.picked = true;
  }

  for (let i = mines.length - 1; i >= 0; i--) {
    mines[i].ttl--;
    if (mines[i].ttl <= 0) {
      mines.splice(i, 1);
    }
  }

  for (let i = droppedLoot.length - 1; i >= 0; i--) {
    const loot = droppedLoot[i];
    if (!loot.picked) {
      tryPickupLoot(loot);
      if (!loot.picked) loot.ttl--;
      if (loot.ttl <= 0) droppedLoot.splice(i, 1);
    } else {
      droppedLoot.splice(i, 1);
    }
  }

  for (let i = destroyedDebris.length - 1; i >= 0; i--) {
    destroyedDebris[i].ttl--;
    if (destroyedDebris[i].ttl <= 0) destroyedDebris.splice(i, 1);
  }

  for (let i = craters.length - 1; i >= 0; i--) {
    const c = craters[i];
    c.ttl--;
    if (c.ttl < 90) c.life = c.ttl / 90;
    if (c.ttl <= 0) craters.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx * deltaTime * 60;
    p.y += p.vy * deltaTime * 60;
    p.vx *= 0.985;
    p.vy = p.vy * 0.985 + p.grav;
    p.life -= p.decay;
    if (p.life <= 0) particles.splice(i, 1);
  }

  updatePlayerSmoke();
  updateEnemySmoke();

  // Адаптивный лимит частиц на основе производительности
  if (isMobile && particles.length > performanceMonitor.adaptiveParticleLimit) {
    particles.length = performanceMonitor.adaptiveParticleLimit;
  }

  for (let i = damageNumbers.length - 1; i >= 0; i--) {
    const num = damageNumbers[i];
    num.y -= num.vy;
    num.ttl--;
    num.life = clamp(num.ttl / 160, 0, 1);
    if (num.ttl <= 0) damageNumbers.splice(i, 1);
  }

  flyBullet();

  if (tank.hp <= 0) {
    // Останавливаем звуки и ставим игру на паузу перед показом рекламы
    /*pauseAllSounds();
    gamePaused = true;
    
    if (yaSDK && !adLoading) {
      await showAd(AD_REASONS.GAME_OVER);
    }*/
    playerDead();
    return;
  }

  // Облако радиации
  if (!radiationCloud && Math.random() < RADIATION_SPAWN_CHANCE) {
    spawnRadiationCloud();
  }

  if (radiationCloud) {
    moveRadiationCloud();
  }

  const activeChests = chests.filter((c) => c.hp > 0).length;
  const levelGoalsDone = enemyTanks.length === 0 && activeChests === 0;

  if (levelGoalsDone) {
    // baseColdDownLevel секунд на лут/подбор (но один раз)
    if (!levelEndCountdownActive) {
      startLevelEndCountdown(baseColdDownLevel);
      pauseAllSounds(); // чтобы не было стрельбы/движухи после выполнения целей
    }
    return;
  }

  // ГАРАНТИРОВАННОЕ ОГРАНИЧЕНИЕ ammo после всех источников лута
  ammo = Math.min(ammo, maxAmmo);

  updateHUD();
}

function draw() {
  // Отрисовка сцены
  ctx.fillStyle = '#2d4f1e';
  ctx.fillRect(0, 0, screenWidth, screenHeight);

  const baseX = Math.floor(camera.x / 80) * 80;
  const baseY = Math.floor(camera.y / 80) * 80;
  ctx.save();
  ctx.globalAlpha = 0.12;
  for (let x = baseX; x < camera.x + screenWidth + 80; x += 80) {
    for (let y = baseY; y < camera.y + screenHeight + 80; y += 80) {
      const sx = x - camera.x + 10;
      const sy = y - camera.y + 10;
      ctx.fillStyle = '#355f20';
      ctx.fillRect(sx, sy, 2, 10);
      ctx.fillRect(sx + 14, sy + 18, 2, 12);
      ctx.fillRect(sx + 32, sy + 6, 2, 9);
    }
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  const pad = 60;
  for (let g of grassTufts) {
    if (
      g.x < camera.x - pad ||
      g.x > camera.x + screenWidth + pad ||
      g.y < camera.y - pad ||
      g.y > camera.y + screenHeight + pad
    )
      continue;
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = g.color;
    const gx = g.x - camera.x;
    const gy = g.y - camera.y;
    const sway = Math.sin(Date.now() * 0.002 + g.sway) * 1.5;
    ctx.fillRect(gx, gy, 2, g.size);
    ctx.fillRect(gx + 6 + sway, gy + 2, 2, g.size * 0.8);
    ctx.fillRect(gx - 6 - sway, gy + 3, 2, g.size * 0.7);
    ctx.restore();
  }

  decorElements.forEach((d) => {
    if (d.type === 'water') {
      drawDecorWater(d);
    } else {
      drawDecorDirt(d);
    }
  });

  craters.forEach(drawCrater);
  mines.forEach(drawMine);

  ctx.strokeStyle = '#b2bec3';
  ctx.lineWidth = 10;
  ctx.strokeRect(-camera.x, -camera.y, mapWidth, mapHeight);
  ctx.strokeStyle = '#ffcc00';
  ctx.setLineDash([20, 20]);
  ctx.strokeRect(-camera.x, -camera.y, mapWidth, mapHeight);
  ctx.setLineDash([]);

  worldObjects.forEach(drawObject);
  destroyedDebris.forEach(drawDebris);
  chests.forEach(drawChest);

  enemyTanks.forEach(drawEnemyTank);
  droppedLoot.forEach(drawEnemyLoot);

  // Отрисовка турелей
  turrets.forEach(drawTurrets);

  bullets.forEach((b) => {
    //отрисовка пуль игрока
    ctx.save();
    ctx.shadowColor = '#f1c40f';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.arc(b.x - camera.x, b.y - camera.y, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  enemyBullets.forEach((b) => {
    //отрисовка пуль врага
    drawEnemyBullets(b);
  });

  // Отрисовка облака радиации
  if (radiationCloud) {
    drawRadiationCloud();
  }

  drawParticles();
  drawDamageNumbers();

  // Рисуем следы
  tracks.forEach(drawTracks);
  drawPlayer();

  // Эффект Невидимости
  if (invisTimer > 0) {
    ctx.globalAlpha = 0.3; // Танк становится полупрозрачным
  }

  // Эффект Щита
  if (shieldTimer > 0) {
    ctx.save();
    ctx.strokeStyle = '#00d2ff';
    ctx.lineWidth = 4;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(
      tank.x - camera.x,
      tank.y - camera.y,
      tank.radius * 1.5,
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.restore();
  }

  ctx.restore();

  if (chestPointersTimer > 0) {
    chestPointersTimer--;
    arrowTime();
  }
}
