document.getElementById('version').innerHTML = version;
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Запрещаем контекстное меню и выделение текста
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
});

document.addEventListener('selectstart', (e) => {
  e.preventDefault();
  return false;
});

// Дополнительная защита для старых браузеров
document.addEventListener('dragstart', (e) => {
  e.preventDefault();
  return false;
});

// Запрещаем выделение через двойной клик
document.addEventListener('mousedown', (e) => {
  if (e.detail > 1) {
    e.preventDefault();
    return false;
  }
});

canvas.addEventListener('mousemove', (e) => {
  //обновляем координаты мыши
  const rect = canvas.getBoundingClientRect();
  mouseX = e.clientX - rect.left;
  mouseY = e.clientY - rect.top;
});

function continueFromSaveAfterDeath() {
  //продолжаем игру после смерти
  if (gameLevel > 1) {
    loadGame(); // применит сохранённый уровень/опыт/перки/аммо
    continueGame(); // перегенерит карту и начнёт уровень
  } else {
    startNewGame();
  }
  gamePaused = false;
  pauseOverlay.classList.remove('show');
}

function restartCurrentLevel() {
  // Перезапуск текущего уровня с загрузкой сохранения
  loadGame(); // Загружаем сохранение начала уровня

  // Сбрасываем временные эффекты
  invisTimer = 0;
  shieldTimer = 0;
  artilleryCooldown = 0;

  // Восстанавливаем HP
  restoreHpAccordingToLevel(true);

  // Сбрасываем позицию танка
  tank.x = mapWidth * 0.5;
  tank.y = mapHeight * (isMobile ? 0.75 : 0.95);
  camera = { x: tank.x - screenWidth / 2, y: tank.y - screenHeight / 2 };

  // Очищаем снаряды
  bullets.length = 0;
  enemyBullets.length = 0;

  // Перегенерируем карту
  generateMap();

  // Обновляем интерфейс
  updateHUD();
  updatePerkButtons();

  // Возобновляем игру
  resumeAllSounds();
  gamePaused = false;
  pauseOverlay.classList.remove('show');
}

function closeModal() {
  //закрываем модальное окно
  modalOverlay.classList.remove('show');
  modalButtons.innerHTML = '';
  modalOpen = false;
  // Если игра была на паузе из-за рекламы, возобновляем её
  if (gamePaused && !pauseOverlay.classList.contains('show')) {
    gamePaused = false;
    resumeAllSounds();
  } else {
    pauseAllSounds();
  }
}

function showModal({ title, message, buttons }) {
  //показываем модальное окно
  modalTitle.textContent = title || '';
  modalText.textContent = message || '';
  modalButtons.innerHTML = '';

  (buttons || []).forEach((btn) => {
    const b = document.createElement('button');
    b.className = 'modalBtn' + (btn.variant ? ' ' + btn.variant : '');
    b.type = 'button';
    b.textContent = btn.text || 'OK';
    b.addEventListener('click', () => {
      closeModal();
      if (typeof btn.onClick === 'function') btn.onClick();
    });
    modalButtons.appendChild(b);
  });

  modalOverlay.classList.add('show');
  modalOpen = true;
}

function clamp(v, a, b) {
  //ограничиваем значение v между a и b
  return Math.max(a, Math.min(b, v));
}

function rectCircleOverlap(cx, cy, r, rx, ry, rw, rh) {
  //проверяем пересечение прямоугольника и окружности
  const closestX = clamp(cx, rx, rx + rw);
  const closestY = clamp(cy, ry, ry + rh);
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= r * r;
}

function isPointInWater(x, y) {
  //проверяем нахождение точки в воде
  for (let decor of decorElements) {
    if (decor.type !== 'water') continue;
    const dx = x - decor.x;
    const dy = y - decor.y;
    if (Math.sqrt(dx * dx + dy * dy) < decor.size * 0.95) return true;
  }
  return false;
}

function isTankInSand(tankObj) {
  //проверяем нахождение танка в песке
  for (let decor of decorElements) {
    if (decor.type !== 'sand') continue;
    const dx = tankObj.x - decor.x;
    const dy = tankObj.y - decor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Проверка строго по центру танка или с минимальным заступом
    if (dist < decor.size * 0.9) return true;
  }
  return false;
}

function isTankInDirt(tankObj) {
  //проверяем нахождение танка в грязи
  for (let decor of decorElements) {
    if (decor.type !== 'dirt') continue;
    const dx = tankObj.x - decor.x;
    const dy = tankObj.y - decor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Проверка строго по центру танка или с минимальным заступом
    if (dist < decor.size * 0.9) return true;
  }
  return false;
}

function isTankInWater(tankObj) {
  //проверяем нахождение танка в воде
  for (let decor of decorElements) {
    if (decor.type !== 'water') continue;
    const dx = tankObj.x - decor.x;
    const dy = tankObj.y - decor.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    // Проверка строго по центру танка или с минимальным заступом
    if (dist < decor.size * 0.9) return true;
  }
  return false;
}

function spawnDamageNumber(x, y, dmg, color = '#ff4444', dir = '-') {
  //спавним цифры урона
  damageNumbers.push({
    x,
    y,
    text: (dir == '-' ? '-' : '') + Math.floor(dmg),
    color,
    life: 1,
    ttl: 140,
    vy: 0.55 + Math.random() * 0.25,
    size: 18,
  });
}

function spawnExpNumber(x, y, amount) {
  //спавним цифры опыта
  const v = Math.floor(amount);
  if (!Number.isFinite(v) || v === 0) return;
  const isGain = v > 0;
  damageNumbers.push({
    x,
    y,
    text: (isGain ? '+' : '') + v + ' XP',
    color: isGain ? '#66e0ff' : '#ff77aa',
    life: 1,
    ttl: 160,
    vy: 0.5 + Math.random() * 0.2,
    size: 16,
  });
}

function tryPickupLoot(loot) {
  //проверяем нахождение лут на земле
  if (!loot || loot.picked) return;
  const ab = {
    x: loot.x - loot.size / 2,
    y: loot.y - loot.size / 2,
    w: loot.size,
    h: loot.size,
  };
  const hit = rectCircleOverlap(
    tank.x,
    tank.y,
    tank.radius,
    ab.x,
    ab.y,
    ab.w,
    ab.h,
  );
  if (!hit) return;

  if (loot.kind === 'ammo') {
    ammo += loot.amount;
    spawnDamageNumber(tank.x, tank.y - 40, loot.amount, '#f1c40f', ''); // Желтый для патронов
    playLootPickupSound('ammo'); // Звук подбора патронов
  }
  if (loot.kind === 'hp') {
    tank.hp = clamp(tank.hp + loot.amount, 0, tank.maxHp);
    spawnDamageNumber(tank.x, tank.y - 40, loot.amount, '#00b894', ''); // Зеленый для ХП
    playLootPickupSound('hp'); // Звук подбора аптечки
  }
  if (loot.kind === 'perk') {
    const k = loot.perkKey;
    if (!tank.perks)
      tank.perks = { invis: 0, shield: 0, artillery: 0, medkit: 0, bigammo: 0 };

    if ((tank.perks[k] || 0) < 1) {
      tank.perks[k] = 1; // максимум 1
      loot.picked = true;
      playLootPickupSound('perk'); // Звук подбора перка
      updatePerkButtons();
      if (!learnedPerks[k]) {
        // Показываем модалку только если перк ещё не изучался
        modalOpen = true;
        pauseAllSounds();
        showModal({
          title: t('perkFound'),
          message: t(
            'perkFoundText',
            PERKS[k]?.name && typeof PERKS[k].name === 'function'
              ? PERKS[k].name()
              : k,
          ),
          buttons: [{ text: t('ok'), variant: 'primary' }],
        });
        learnedPerks[k] = true;
      }
    } else {
      // если уже есть — просто считаем подобранным (или можно оставить на земле)
      loot.picked = true;
    }
    return;
  }

  loot.picked = true;
}

function resizeCanvas() {
  // Запрос полноэкранного режима на мобильных
  /*if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    if (!document.fullscreenElement) {
      canvas.requestFullscreen().catch(() => { }); // Игнорируем ошибки
    }
  }

  // Задержка для мобильных браузеров
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(resizeCanvas, 250);*/

  const container = document.getElementById('gameContainer');
  screenWidth = container.clientWidth;
  screenHeight = container.clientHeight;

  // Прогрессивное увеличение карты: +20% каждые 11 уровней, максимум 100% (×2)
  const mapSizeMultiplier =
    1.0 + Math.min(Math.floor(gameLevel / 11) * 0.2, 1.0);

  mapWidth = screenWidth * 2 * mapSizeMultiplier;
  mapHeight = screenHeight * 3 * mapSizeMultiplier;
  canvas.width = screenWidth;
  canvas.height = screenHeight;

  if (worldObjects.length === 0) {
    tank.x = mapWidth * 0.5;
    tank.y = mapHeight * (isMobile ? 0.75 : 0.95);
    tank.level = 1;
    tank.exp = 0;
    tank.expForNextLevel = getExpForLevel(1);
    gameLevel = 1;
    restoreHpAccordingToLevel();
    generateMap();
  }
}

function fireBullet() {
  //стреляем
  playShootSound();
  if (ammo <= 0) return;
  ammo = Math.max(0, ammo - 1);

  const sx = tank.x + Math.cos(tank.angle) * 25;
  const sy = tank.y + Math.sin(tank.angle) * 25;

  bullets.push({
    x: sx,
    y: sy,
    angle: tank.angle,
    speed: bulletSpeed,
    r: 4,
    dmg: rollDamage(20 + tank.level * 3),
    startX: sx,
    startY: sy,
    maxDist: tank.bulletRange,
  });

  //console.log(tank.bulletRange);
}

function checkCollisionWithDamage(nx, ny) {
  //проверяем коллизию с повреждением
  if (nx < 25 || nx > mapWidth - 25 || ny < 25 || ny > mapHeight - 25)
    return true;

  for (let obj of worldObjects) {
    const a = getObjectAABB(obj);
    if (rectCircleOverlap(nx, ny, tank.radius, a.x, a.y, a.w, a.h)) {
      if (shieldTimer <= 0) {
        tank.hp -= 1;
        spawnDamageNumber(tank.x, tank.y - 20, 2);
      }
      obj.hp -= 10;
      if (obj.hp <= 0) {
        spawnDebrisFromObject(obj);
        worldObjects.splice(worldObjects.indexOf(obj), 1);
      }
      return true;
    }
  }

  for (let ch of chests) {
    if (ch.hp <= 0) continue;
    const a = getChestAABB(ch);
    if (rectCircleOverlap(nx, ny, tank.radius, a.x, a.y, a.w, a.h)) {
      if (shieldTimer <= 0) {
        tank.hp -= 1;
        spawnDamageNumber(tank.x, tank.y - 20, 1);
      }
      ch.hp -= 10;
      if (ch.hp <= 0 && !ch.opened) {
        spawnLootForChest(ch);
        addExperience(expChest);
      }
      return true;
    }
  }

  return false;
}

function updateHUD() {
  //обновляем HUD
  if (!Number.isFinite(tank.maxHp) || tank.maxHp <= 0) tank.maxHp = 100;
  tank.hp = clamp(tank.hp, 0, tank.maxHp);

  const hpText = Math.floor(tank.hp) + '/' + tank.maxHp;
  const hpPct = clamp(tank.hp / tank.maxHp, 0, 1);
  hpBarInner.style.width = hpPct * 100 + '%';
  hpValue.textContent = hpText;
  hpValueInline.textContent = hpText;

  if (hpPct > 0.6) {
    hpBarInner.style.background = 'linear-gradient(90deg, #00b894, #55efc4)';
  } else if (hpPct > 0.3) {
    hpBarInner.style.background = 'linear-gradient(90deg, #fdcb6e, #ffeaa7)';
  } else {
    hpBarInner.style.background = 'linear-gradient(90deg, #d63031, #ff7675)';
  }

  const ammoText = ammo + '/' + maxAmmo;
  const ammoPct = clamp(ammo / maxAmmoDisplay, 0, 1);
  ammoBarInner.style.width = ammoPct * 100 + '%';
  ammoValue.textContent = ammoText;
  ammoValueInline.textContent = ammoText;

  levelValue.textContent = tank.level;
  levelValueInline.textContent = tank.level;

  levelBarInner.style.width = clamp(tank.level / 10, 0, 1) * 100 + '%';

  const expText = tank.exp + '/' + tank.expForNextLevel;
  const expPct =
    tank.expForNextLevel > 0 ? clamp(tank.exp / tank.expForNextLevel, 0, 1) : 0;
  expBarInner.style.width = expPct * 100 + '%';
  expValue.textContent = expText;
  expValueInline.textContent = expText;

  // Обновление счетчиков внизу
  const eCount = document.getElementById('enemyCount');
  const cCount = document.getElementById('chestCount');

  if (eCount) {
    enemyPanel.querySelector('div:first-child').parentElement.style.textAlign =
      'center';
    const totalEnemies = enemyTanks.length + turrets.length;
    eCount.innerHTML = `<div style="color:#fff; font-size:10px; opacity:0.7; margin-bottom: 5px;">${t('levelWord')} ${gameLevel}</div>${t('enemiesCount', totalEnemies, levelStartedEnemies)}`;
  }
  if (cCount) {
    // Считаем только неразрушенные и непустые ящики
    const activeChests = chests.filter((c) => c.hp > 0).length;
    cCount.textContent = t('chestsCount', activeChests, chests.length);
  }
  updatePerkButtons();
}

function updatePauseStats() {
  //обновляем статистику в паузе
  pauseLevel.textContent = tank.level;
  pauseHp.textContent = `${Math.floor(tank.hp)}/${tank.maxHp}`;
  pauseAmmo.textContent = ammo;
  pauseScore.textContent = currentScore;
}

// Функция проверки коллизии снаряда по траектории движения
function checkBulletLineCollision(
  oldX,
  oldY,
  newX,
  newY,
  r,
  targetX,
  targetY,
  targetRadius,
) {
  // Проверяем несколько точек вдоль траектории
  const steps = Math.max(
    3,
    Math.ceil(Math.hypot(newX - oldX, newY - oldY) / (targetRadius * 0.5)),
  );
  for (let step = 0; step <= steps; step++) {
    const t = step / steps;
    const checkX = oldX + (newX - oldX) * t;
    const checkY = oldY + (newY - oldY) * t;
    const dx = checkX - targetX;
    const dy = checkY - targetY;
    const rr = targetRadius + r;
    if (dx * dx + dy * dy <= rr * rr) {
      return true;
    }
  }
  return false;
}

function handlePlayerBullets() {
  //обработка снарядов игрока
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    let hit = false;

    // (6) Исправление попаданий по врагам: используем круговую проверку по радиусам,
    // с проверкой по траектории для предотвращения пролёта на мобильных
    for (let j = enemyTanks.length - 1; j >= 0; j--) {
      const enemy = enemyTanks[j];
      const oldX = b.oldX !== undefined ? b.oldX : b.x;
      const oldY = b.oldY !== undefined ? b.oldY : b.y;

      if (
        checkBulletLineCollision(
          oldX,
          oldY,
          b.x,
          b.y,
          b.r,
          enemy.x,
          enemy.y,
          enemy.radius,
        )
      ) {
        const damage = b.dmg;
        enemy.hp -= damage;

        // (6) цифры урона на враге
        spawnDamageNumber(
          enemy.x,
          enemy.y - 18,
          damage,
          enemy.isBoss ? '#ffd166' : '#44ff44',
        );

        // (4) агр по попаданию
        enemy.aggroTimer = 360; // ~4 секунды при 60fps

        bullets.splice(i, 1);
        // Используем точку контакта между снарядом и врагом для эффекта
        const impactX = enemy.x + (b.x - enemy.x) * 0.5;
        const impactY = enemy.y + (b.y - enemy.y) * 0.5;
        onBulletImpact(impactX, impactY, 'tank');

        if (enemy.hp <= 0) {
          spawnExplosion(enemy.x, enemy.y, 'tank');
          addExperience(enemy.isBoss ? expBoss : expMob);

          // ЛУТ БОССА (гарантировано)
          if (enemy.isBoss) {
            droppedLoot.push({
              x: enemy.x,
              y: enemy.y,
              picked: false,
              size: 18,
              ttl: 45 * 60,
              kind: 'ammo',
              amount: 8 + Math.floor(gameLevel * 0.5),
            });
            if (Math.random() < 0.4) {
              // 40% шанс перка
              let z = Math.round(Math.random()) * 2 - 1;
              droppedLoot.push({
                x: enemy.x - 15,
                y: enemy.y + 15 * z,
                picked: false,
                size: 18,
                ttl: 45 * 60,
                kind: 'hp',
                amount: 15 + Math.floor(Math.random() * 35),
              });
            }
            if (Math.random() < 0.1) {
              // 10% шанс перка
              let z = Math.round(Math.random()) * 2 - 1;
              droppedLoot.push({
                x: enemy.x + 15,
                y: enemy.y + 15 * z,
                picked: false,
                size: 18,
                ttl: 45 * 60,
                kind: 'perk',
                perkKey: pickPerkKeyForDrop(),
                amount: 0,
              });
            }
          }

          // ЛУТ Обычный враг (20% шанс)
          if (Math.random() < 0.2) {
            droppedLoot.push({
              x: enemy.x,
              y: enemy.y,
              picked: false,
              size: 14,
              ttl: 30 * 60,
              kind: 'ammo',
              amount: 1 + Math.floor(Math.random() * 5),
            });
          }

          enemyTanks.splice(j, 1);
        }
        hit = true;
        break;
      }
    }
    if (hit) continue;

    for (let j = worldObjects.length - 1; j >= 0; j--) {
      const obj = worldObjects[j];
      const a = getObjectAABB(obj);
      if (rectCircleOverlap(b.x, b.y, b.r, a.x, a.y, a.w, a.h)) {
        obj.hp -= b.dmg;
        onBulletImpact(
          b.x,
          b.y,
          obj.type === 'fallen_tree' ? 'tree' : obj.type,
        );
        bullets.splice(i, 1);
        if (obj.hp <= 0) {
          spawnDebrisFromObject(obj);

          // ЛУТ с объектов  (10% шанс)
          if (Math.random() < 0.1) {
            droppedLoot.push({
              x: obj.x,
              y: obj.y,
              picked: false,
              size: 14,
              ttl: 30 * 60,
              kind: 'hp',
              amount: 5 + Math.floor(Math.random() * 15),
            });
          }

          if (obj.type == 'building' || obj.type == 'ruin') {
            addExperience(expDecor);
          }

          worldObjects.splice(j, 1);
        }
        hit = true;
        break;
      }
    }

    // Пули по турелям (с проверкой траектории)
    for (let j = turrets.length - 1; j >= 0; j--) {
      const turret = turrets[j];
      const oldX = b.oldX !== undefined ? b.oldX : b.x;
      const oldY = b.oldY !== undefined ? b.oldY : b.y;

      if (
        checkBulletLineCollision(
          oldX,
          oldY,
          b.x,
          b.y,
          b.r,
          turret.x,
          turret.y,
          turret.radius,
        )
      ) {
        turret.hp -= b.dmg;
        spawnDamageNumber(turret.x, turret.y - 25, b.dmg, '#ffd166');

        bullets.splice(i, 1);
        onBulletImpact(b.x, b.y, 'building');

        if (turret.hp <= 0) {
          spawnExplosion(turret.x, turret.y, 'building');
          addExperience(expTurret);
          turrets.splice(j, 1);

          // ЛУТ с турели  (40% шанс)
          if (Math.random() < 0.4) {
            droppedLoot.push({
              x: turret.x,
              y: turret.y,
              picked: false,
              size: 14,
              ttl: 30 * 60,
              kind: 'hp',
              amount: 20 + Math.floor(Math.random() * 40),
            });
          }
        }
        hit = true;
        break;
      }
    }

    if (hit) continue;

    for (let k = chests.length - 1; k >= 0; k--) {
      const ch = chests[k];
      if (ch.hp <= 0) continue;
      const a = getChestAABB(ch);
      if (rectCircleOverlap(b.x, b.y, b.r, a.x, a.y, a.w, a.h)) {
        ch.hp -= b.dmg;
        onBulletImpact(b.x, b.y, 'chest');
        bullets.splice(i, 1);
        if (ch.hp <= 0 && !ch.opened) {
          spawnLootForChest(ch);
          addExperience(expChest);
        }
        hit = true;
        break;
      }
    }
  }
}

function restartGame() {
  //перезапуск игры
  // Останавливаем все звуки перед перезапуском
  pauseAllSounds();
  
  // Сбрасываем скорость танка, чтобы звук двигателя не возобновлялся автоматически
  if (tank) {
    tank.vx = 0;
    tank.vy = 0;
    tank.speed = 0;
  }
  
  getBaseParam();
  generateMap();
  updateHUD();
  updatePerkButtons(); // Обновить кнопки перков
  
  // Уведомляем Яндекс SDK о готовности игры после генерации карты
  if (typeof notifyGameReady === 'function') {
    notifyGameReady();
  }
}

async function goToNextLevel() {
  //переход на следующий уровень
  // Останавливаем звуки и ставим игру на паузу перед показом рекламы
  pauseAllSounds();
  gamePaused = true;
  
  if (yaSDK && !adLoading) {
    await showAd(AD_REASONS.NEXT_LEVEL);
  }
  // НЕ сохраняем в таблицу рекордов при переходе на следующий уровень
  // addRecord(tank.level); // Убрано - рекорды только при поражении
  
  // Возобновляем игру после рекламы
  gamePaused = false;
  resumeAllSounds();
  resetFindChestsButton();
  levelEndCountdownActive = false;
  gameLevel++;
  saveGame(); // (1) промежуточное сохранение перед переходом уровня

  // Проверка на достижение 11,22,33 ... уровня
  if (gameLevel % baseLevelGreet === 0) {
    showModal({
      title: t('greatWarrior'),
      message: t('greatWarriorText', gameLevel),
      buttons: [
        { text: t('continueBtn'), variant: 'primary', onClick: () => {} },
      ],
    });
  }

  bullets.length = 0;
  enemyBullets.length = 0;

  restoreHpAccordingToLevel();

  tank.x = mapWidth * 0.5;
  tank.y = mapHeight * (isMobile ? 0.75 : 0.95);
  camera = { x: tank.x - screenWidth / 2, y: tank.y - screenHeight / 2 };

  generateMap();
  updateHUD();
}

function drawDamageNumbers() {
  // Отрисовка чисел урона
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (let num of damageNumbers) {
    ctx.globalAlpha = num.life;
    ctx.font = 'bold ' + (num.size || 18) + 'px Arial';

    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.strokeText(num.text, num.x - camera.x, num.y - camera.y);

    ctx.fillStyle = num.color;
    ctx.fillText(num.text, num.x - camera.x, num.y - camera.y);
  }

  ctx.globalAlpha = 1;
  ctx.restore();
}

function gameLoop(currentTime) {
  // Основной поток игры
  const rawDelta = (currentTime - lastTime) / 1000;

  // Ограничение FPS до 60 на мобильных
  if (isMobile && rawDelta < 1 / 60) {
    requestAnimationFrame(gameLoop);
    return; // Пропускаем кадр, если FPS > 60
  }

  deltaTime = Math.min(rawDelta, 1 / 15); // max 15 FPS минимум
  lastTime = currentTime;

  // Подсчет FPS
  const currentFPS = rawDelta > 0 ? Math.round(1 / rawDelta) : 60;

  // Обновляем систему мониторинга производительности
  if (isMobile) {
    performanceMonitor.update(currentFPS, currentTime);
  }

  // Отображение FPS (на всех устройствах) и качества (только на мобильных)
  if (fpsDisplay) {
    if (isMobile) {
      const quality = performanceMonitor.getQualityName();
      fpsDisplay.textContent = `FPS: ${currentFPS} | ${quality}`;
    } else {
      let coorY = Math.floor(mapHeight - 25 - tank.y);
      let coorX = -1 * Math.floor(mapWidth / 2 - tank.x);
      fpsDisplay.textContent = `FPS: ${currentFPS} | X:${coorX} Y:${coorY}`;
    }
  }

  // Адаптивное ускорение для мобильных с учетом производительности
  const adaptiveMultiplier = isMobile
    ? performanceMonitor.adaptiveSpeedMultiplier
    : 1.0;
  const effectiveDelta = isMobile ? deltaTime * adaptiveMultiplier : deltaTime;

  update(effectiveDelta);
  draw();
  updateLevelTimer();
  updatePerkHud();
  requestAnimationFrame(gameLoop);

  if (timeTrialActive && !gamePaused && !modalOpen) {
    if (levelTimeLeft <= 0) {
      gamePaused = true;
      tank.hp = 0;

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
    }
  }
}

async function startNewGame() {
  // начало новой игры
  // Останавливаем все звуки от предыдущей игры и ставим игру на паузу
  pauseAllSounds();
  gamePaused = true;
  
  if (yaSDK && !adLoading) {
    await showAd(AD_REASONS.START);
  }
  clearSave(); // Очищаем только сохранение прогресса, но НЕ рекорды
  // clearRecords(); // УБРАНО - рекорды должны сохраняться между играми
  currentScore = 0;
  updateMaxAmmo();
  resetFindChestsButton();
  restartGame();
  gamePaused = false;
}

function continueGame() {
  // продолжение игры
  // позицию карты и игрока берём "стартовую" для уровня
  tank.x = mapWidth * 0.5;
  tank.y = mapHeight * (isMobile ? 0.75 : 0.95);
  camera = { x: tank.x - screenWidth / 2, y: tank.y - screenHeight / 2 };
  bullets.length = 0;
  enemyBullets.length = 0;

  generateMap();
  updateHUD();
  
  // Уведомляем Яндекс SDK о готовности игры после генерации карты
  if (typeof notifyGameReady === 'function') {
    notifyGameReady();
  }
}

updateHUD();

let g = hasSave();

if (g > 0) {
  showModal({
    title: t('game'),
    message: t('saveFound', g),
    buttons: [
      {
        text: t('continue'),
        variant: 'primary',
        onClick: () => {
          loadGame();
          continueGame();
        },
      },
      {
        text: t('newGame'),
        variant: 'danger',
        onClick: () => startNewGame(),
      },
    ],
  });
} else {
  // если сохранения нет — игра стартует как раньше
  restartGame();
}

initRecords();

if (isMobile) {
  // Снижаем детализация графики
  tank.maxSpeed *= PLAYER_TANK_SPEEDUP; // Для игрока (1.3x)
  bulletSpeed *= MOBILE_BULLET_SPEEDUP; // Для всех (1.2x)

  // Уменьшаем эффекты
  setInterval(() => {
    if (particles.length > 100) particles.length = 50;
  }, 100);
}

gameLoop();
