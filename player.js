function waterDamages(inWater) {
  if (inWater && !modalOpen && !gamePaused) {
    // Наносим 1 единицы урона в секунду (при 60 FPS это ~0.016 за кадр)
    const waterDamage = 0.016;
    if (shieldTimer <= 0) {
      tank.hp -= waterDamage;
      // Редкий спавн цифр урона, чтобы не спамить (раз в секунду)
      if (Math.random() < 0.015)
        spawnDamageNumber(tank.x, tank.y - 20, 1, '#66ccff');
    }
  }
}

function waterSlowing(inWater) {
  //замедление в воде
  if (inWater) {
    tank.width = 40 + Math.sin(waterEffectTimer) * 3;
    tank.height = 30 + Math.sin(waterEffectTimer + 1.2) * 2;
  } else {
    tank.width = 40;
    tank.height = 30;
  }
}

function collisionPlayerDamage() {
  for (let enemy of enemyTanks) {
    if (
      rectCircleOverlap(
        tank.x,
        tank.y,
        tank.radius,
        enemy.x - enemy.radius,
        enemy.y - enemy.radius,
        enemy.width,
        enemy.height,
      )
    ) {
      // небольшой урон “тараном”
      const playerDmg = 0.35; // примерно 0.35 HP за кадр контакта (подберите)
      const enemyDmg = playerDmg * 2;

      if (shieldTimer <= 0) {
        tank.hp -= playerDmg;
        // чтобы не спамить цифрами — показываем редко
        if (Math.random() < 0.02)
          spawnDamageNumber(tank.x, tank.y - 20, 1, '#ffaa00');
      }

      enemy.hp -= enemyDmg;
      if (Math.random() < 0.02)
        spawnDamageNumber(enemy.x, enemy.y - 18, 1, '#44ff44');

      // если враг умер от тарана — удалить и выдать награду как обычно
      if (enemy.hp <= 0) {
        spawnExplosion(enemy.x, enemy.y, 'tank');
        addExperience(enemy.isBoss ? expBoss : expMob);
        enemyTanks.splice(enemyTanks.indexOf(enemy), 1);
      }

      // Отталкивание игрока от танка противника
      const pushAngle = Math.atan2(tank.y - enemy.y, tank.x - enemy.x);
      tank.x += Math.cos(pushAngle) * 2;
      tank.y += Math.sin(pushAngle) * 2;
    }
  }
}

function updatePlayerSmoke() {
  // Генерация дыма от повреждённого танка игрока (HP ≤ 30%)
  const hpPercent = tank.hp / tank.maxHp;
  if (hpPercent <= 0.3 && hpPercent > 0) {
    // ✅ Добавлена проверка > 0
    // Генерируем частицы дыма с определённой частотой
    if (Math.random() < 0.3) {
      // 30% шанс каждый кадр
      const smokeIntensity = 1 - hpPercent / 0.3; // Чем меньше HP, тем больше дыма
      const numParticles = Math.random() < smokeIntensity ? 2 : 1;

      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: tank.x + (Math.random() - 0.5) * 20,
          y: tank.y + (Math.random() - 0.5) * 15,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -0.5 - Math.random() * 0.5, // Дым поднимается вверх
          size: 4 + Math.random() * 6,
          life: 1.0,
          decay: 0.012 + Math.random() * 0.008,
          color: Math.random() < 0.5 ? '#666666' : '#777777',
          grav: 0, // Дым не падает
          type: 'smoke',
        });
      }
    }
  }
}

function flyBullet() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];

    // Сохраняем старую позицию для проверки коллизий по траектории
    const oldX = b.x;
    const oldY = b.y;

    b.x += Math.cos(b.angle) * b.speed * deltaTime * 60;
    b.y += Math.sin(b.angle) * b.speed * deltaTime * 60;

    // Сохраняем траекторию для проверки коллизий
    b.oldX = oldX;
    b.oldY = oldY;

    const dist = Math.hypot(b.x - b.startX, b.y - b.startY);
    if (dist >= b.maxDist) {
      onBulletImpact(b.x, b.y, 'ground');
      bullets.splice(i, 1);
      continue;
    }

    if (b.x < 0 || b.x > mapWidth || b.y < 0 || b.y > mapHeight) {
      const ix = clamp(b.x, 0, mapWidth);
      const iy = clamp(b.y, 0, mapHeight);
      onBulletImpact(ix, iy, 'ground');
      bullets.splice(i, 1);
      continue;
    }
  }
}

function playerDead() {
  // ✅ ИСПРАВЛЕНИЕ: Останавливаем игру СРАЗУ!
  gamePaused = true;
  pauseAllSounds();
  tank.hp = 0;

  // ДОБАВИТЬ СБРОС ПЕРКОВ ПРИ ПОРАЖЕНИИ
  tank.perks = { invis: 0, shield: 0, artillery: 0, medkit: 0, bigammo: 0 };
  invisTimer = 0;
  shieldTimer = 0;
  artilleryCooldown = 0;
  updatePerkButtons();

  updateHUD();
  Object.keys(keys).forEach((key) => (keys[key] = false));
  joystickActive = false;
  joystickX = 0;
  joystickY = 0;

  if (engineGain) engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
  addRecord(tank.level, true); // Сохраняем результат ТОЛЬКО при поражении (isDefeat = true)

  const canContinue = gameLevel > 1;

  showModal({
    title: t('tankDestroyed'),
    message: t('yourScore', currentScore + tank.level * 100),
    buttons: [
      ...(canContinue
        ? [
            {
              text: t('continue'),
              variant: 'primary',
              onClick: () => continueFromSaveAfterDeath(),
            },
          ]
        : []),
      {
        text: t('newGame'),
        variant: canContinue ? '' : 'primary',
        onClick: () => startNewGame(),
      },
    ],
  });

  // Вставляем таблицу в текстовый блок модалки
  const modalTxtElem = document.getElementById('modalText');
  modalTxtElem.innerHTML += getRecordsHTML();
}

function drawPlayer() {
  // Танк игрока

  ctx.save();

  // 1) СНАЧАЛА ставим прозрачность, если активна невидимость,
  // чтобы она повлияла на весь танк.
  const invisActive = invisTimer > 0;
  ctx.globalAlpha = invisActive ? 0.3 : 1.0;

  ctx.translate(tank.x - camera.x, tank.y - camera.y);
  ctx.rotate(tank.angle);

  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  const waterAlpha = isTankInWater(tank) ? 0.85 : 1;
  ctx.fillStyle = isTankInWater(tank)
    ? `rgba(46, 58, 11, ${waterAlpha})`
    : `rgba(62, 74, 17, ${waterAlpha})`;

  // корпус
  ctx.fillRect(-tank.width / 2, -tank.height / 2, tank.width, tank.height);

  // башня
  ctx.fillStyle = isTankInWater(tank) ? '#3e4a11' : '#4e5d16';
  const towerRipple = isTankInWater(tank)
    ? Math.sin(waterEffectTimer * 2) * 2
    : 0;
  ctx.beginPath();
  ctx.arc(
    towerRipple,
    0,
    12 + (isTankInWater(tank) ? Math.sin(waterEffectTimer) * 1 : 0),
    0,
    Math.PI * 2,
  );
  ctx.fill();

  // ствол
  ctx.strokeStyle = '#2c3a0d';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(28, 0);
  ctx.stroke();

  ctx.restore(); // <-- закрыли "танк" (прозрачность тоже вернётся)
}

function arrowTime() {
  //указатели на танки и противников
  const activeChests = chests.filter((c) => c.hp > 0);
  const activeEnemies = enemyTanks.filter((e) => e.hp > 0);
  const activeTurrets = turrets.filter((e) => e.hp > 0);

  activeTurrets.forEach((ch) => {
    if (
      ch.x < camera.x ||
      ch.x > camera.x + screenWidth ||
      ch.y < camera.y ||
      ch.y > camera.y + screenHeight
    ) {
      const angle = Math.atan2(ch.y - tank.y, ch.x - tank.x);
      ctx.save();
      ctx.translate(
        clamp(tank.x - camera.x + Math.cos(angle) * 100, 30, screenWidth - 30),
        clamp(tank.y - camera.y + Math.sin(angle) * 100, 30, screenHeight - 30),
      );
      ctx.rotate(angle);
      // Рисуем стрелку
      ctx.fillStyle = 'rgba(248, 248, 6, 0.8)';
      ctx.shadowColor = '#3498db';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-5, -10);
      ctx.lineTo(-5, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  });

  activeEnemies.forEach((ch) => {
    if (
      ch.x < camera.x ||
      ch.x > camera.x + screenWidth ||
      ch.y < camera.y ||
      ch.y > camera.y + screenHeight
    ) {
      const angle = Math.atan2(ch.y - tank.y, ch.x - tank.x);
      ctx.save();
      ctx.translate(
        clamp(tank.x - camera.x + Math.cos(angle) * 100, 30, screenWidth - 30),
        clamp(tank.y - camera.y + Math.sin(angle) * 100, 30, screenHeight - 30),
      );
      ctx.rotate(angle);
      // Рисуем стрелку
      ctx.fillStyle = 'rgba(233, 34, 20, 0.8)';
      ctx.shadowColor = '#3498db';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-5, -10);
      ctx.lineTo(-5, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  });

  activeChests.forEach((ch) => {
    // Проверяем, находится ли сундук за пределами экрана
    if (
      ch.x < camera.x ||
      ch.x > camera.x + screenWidth ||
      ch.y < camera.y ||
      ch.y > camera.y + screenHeight
    ) {
      const angle = Math.atan2(ch.y - tank.y, ch.x - tank.x);

      ctx.save();
      ctx.translate(
        clamp(tank.x - camera.x + Math.cos(angle) * 100, 30, screenWidth - 30),
        clamp(tank.y - camera.y + Math.sin(angle) * 100, 30, screenHeight - 30),
      );
      ctx.rotate(angle);

      // Рисуем стрелку
      ctx.fillStyle = 'rgba(52, 152, 219, 0.8)';
      ctx.shadowColor = '#3498db';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-5, -10);
      ctx.lineTo(-5, 10);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  });
}

function drawTracks(t) {
  //рисуем следы
  ctx.save();
  const alpha = (t.life / t.maxLife) * 0.4; // 0.4 - макс. прозрачность следа
  ctx.globalAlpha = alpha;
  ctx.translate(t.x - camera.x, t.y - camera.y);
  ctx.rotate(t.angle);

  // Цвет: темный в воде, серо-коричневый на земле
  ctx.fillStyle = t.inWater ? '#1a2008' : '#2d261e';

  // Рисуем один сегмент гусеницы
  ctx.fillRect(-6, -4, 12, 8);
  ctx.restore();
}

function updateTracks(left, right, inWater) {
  //следы
  const isMoving =
    Math.abs(tank.vx) > 0.1 || Math.abs(tank.vy) > 0.1 || left || right;

  if (isMoving) {
    // Создаем след каждые 15 пикселей пути (чтобы не спамить)
    if (!tank.lastTrackDist) tank.lastTrackDist = 0;
    const distSinceLast = Math.hypot(
      tank.x - (tank.lastTrackX || 0),
      tank.y - (tank.lastTrackY || 0),
    );

    if (distSinceLast > 15) {
      const offset = 10; // Расстояние между гусеницами
      const trackData = {
        angle: tank.angle,
        life: 380, // Время жизни (4 секунды при 60fps)
        maxLife: 380,
        inWater: inWater,
      };

      // Левая гусеница
      tracks.push({
        ...trackData,
        x: tank.x + Math.cos(tank.angle + Math.PI / 2) * offset,
        y: tank.y + Math.sin(tank.angle + Math.PI / 2) * offset,
      });
      // Правая гусеница
      tracks.push({
        ...trackData,
        x: tank.x + Math.cos(tank.angle - Math.PI / 2) * offset,
        y: tank.y + Math.sin(tank.angle - Math.PI / 2) * offset,
      });

      tank.lastTrackX = tank.x;
      tank.lastTrackY = tank.y;
    }
  }

  // Обновляем (удаляем) старые следы
  for (let i = tracks.length - 1; i >= 0; i--) {
    tracks[i].life--;
    if (tracks[i].life <= 0) tracks.splice(i, 1);
  }
}
