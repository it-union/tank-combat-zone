function handleEnemyBullets() {
  //обработка пуль врагов
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];

    // Сохраняем старую позицию для проверки коллизий по траектории
    const oldX = b.x;
    const oldY = b.y;

    b.x += Math.cos(b.angle) * b.speed * deltaTime * 60;
    b.y += Math.sin(b.angle) * b.speed * deltaTime * 60;

    b.oldX = oldX;
    b.oldY = oldY;

    const dist = Math.hypot(b.x - b.startX, b.y - b.startY);
    if (dist >= b.maxDist) {
      onBulletImpact(b.x, b.y, 'ground');
      enemyBullets.splice(i, 1);
      continue;
    }

    if (b.x < 0 || b.x > mapWidth || b.y < 0 || b.y > mapHeight) {
      const ix = clamp(b.x, 0, mapWidth);
      const iy = clamp(b.y, 0, mapHeight);
      onBulletImpact(ix, iy, 'ground');
      enemyBullets.splice(i, 1);
      continue;
    }

    // Проверка попадания в игрока (с проверкой траектории)
    const prevX = b.oldX !== undefined ? b.oldX : b.x;
    const prevY = b.oldY !== undefined ? b.oldY : b.y;

    if (
      checkBulletLineCollision(
        prevX,
        prevY,
        b.x,
        b.y,
        b.r,
        tank.x,
        tank.y,
        tank.radius,
      )
    ) {
      if (shieldTimer <= 0) {
        tank.hp -= b.dmg;
        spawnDamageNumber(tank.x, tank.y - 20, b.dmg, '#ff6666');
      } else {
        spawnDamageNumber(tank.x, tank.y - 20, 0, '#66e0ff'); // можно убрать, если не надо нули
      }
      onBulletImpact(b.x, b.y, 'tank');
      enemyBullets.splice(i, 1);
      continue;
    }

    // Проверка столкновения с объектами (деревья, камни, стены и т.д.)
    let hitObject = false;
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
        enemyBullets.splice(i, 1);
        if (obj.hp <= 0) {
          spawnDebrisFromObject(obj);
          worldObjects.splice(j, 1);
        }
        hitObject = true;
        break;
      }
    }
    if (hitObject) continue;
  }

  enemyBullets.forEach((b) => {
    if (b.isBomb) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 20;
      ctx.fillStyle = '#ff6666';
      ctx.beginPath();
      ctx.arc(b.x - camera.x, b.y - camera.y, b.r * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      // обычные пули врагов
      ctx.save();
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff4444';
      ctx.beginPath();
      ctx.arc(b.x - camera.x, b.y - camera.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  });
}

function drawEnemyTank(enemy) {
  //рисуем врага
  ctx.save();
  ctx.translate(enemy.x - camera.x, enemy.y - camera.y);
  ctx.rotate(enemy.angle);
  ctx.shadowColor = 'rgba(139, 0, 0, 0.6)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;

  const waterAlpha = isTankInWater(enemy) ? 0.85 : 1;
  ctx.fillStyle = enemy.isBoss
    ? `rgba(110, 0, 0, ${waterAlpha})`
    : `rgba(139, 0, 0, ${waterAlpha})`;
  ctx.fillRect(-enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);

  ctx.fillStyle = enemy.isBoss ? '#7d1d1d' : '#b33939';
  const towerRipple = isTankInWater(enemy)
    ? Math.sin(waterEffectTimer * 2 + enemy.x * 0.01) * 1.5
    : 0;
  ctx.beginPath();
  ctx.arc(towerRipple, 0, enemy.isBoss ? 14 : 11, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = enemy.isBoss ? '#4a0000' : '#8b0000';
  ctx.lineWidth = enemy.isBoss ? 6 : 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(enemy.isBoss ? 30 : 25, 0);
  ctx.stroke();

  const hpPct = clamp(enemy.hp / enemy.maxHp, 0, 1);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(-enemy.width / 2, -enemy.height / 2 - 8, enemy.width, 4);
  ctx.fillStyle = enemy.isBoss
    ? '#ffd166'
    : hpPct > 0.3
      ? '#44ff44'
      : '#ff4444';
  ctx.fillRect(-enemy.width / 2, -enemy.height / 2 - 8, enemy.width * hpPct, 4);

  if (enemy.isBoss) {
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(-enemy.width / 2, -enemy.height / 2 - 22, enemy.width, 10);
    ctx.fillStyle = '#ffd166';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t('boss'), 0, -enemy.height / 2 - 17);
  }

  // Лампочка при обнаружении
  if (enemy.alertTimer > 0) {
    const pulse = Math.sin(enemy.alertTimer * 0.3) * 0.3 + 0.7;
    ctx.beginPath();
    ctx.arc(
      0,
      enemy.isBoss ? -enemy.radius + 20 : -enemy.radius + 16,
      6,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = `rgba(255, ${Math.floor(100 + pulse * 155)}, 0, ${pulse})`;
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function spawnEnemyTank(isBoss = false) {
  //спавним врага
  const attempts = 50;
  for (let i = 0; i < attempts; i++) {
    const x = 200 + Math.random() * (mapWidth - 400);
    const y = 100 + Math.random() * (mapHeight * 0.6 - 200);

    // if (isPointInWater(x, y)) continue;
    // const distToPlayer = Math.hypot(x - tank.x, y - tank.y);
    // if (distToPlayer < 300) continue;

    let collision = false;
    for (let obj of worldObjects) {
      const a = getObjectAABB(obj);
      if (rectCircleOverlap(x, y, 20, a.x, a.y, a.w, a.h)) {
        collision = true;
        break;
      }
    }
    if (collision) continue;

    const hpMultiplier = Math.pow(1.03, Math.max(0, gameLevel - 1)); // +3% за каждый уровень
    const baseHp =
      (baseEnemyHp + Math.floor(Math.random() * baseEnemyHp * 0.5)) *
      hpMultiplier;
    const enemy = {
      x,
      y,
      angle: Math.random() * Math.PI * 2,
      patrolAngle: Math.random() * Math.PI * 2,
      patrolTarget: {
        x: x + (Math.random() - 0.5) * 700,
        y: y + (Math.random() - 0.5) * 700,
      },
      speed: 0.4 * (isMobile ? ENEMY_TANK_SPEEDUP : 1),
      chaseSpeed: 0.35 * (isMobile ? ENEMY_TANK_SPEEDUP : 1),
      maxSpeed: 0.8 * (isMobile ? ENEMY_TANK_SPEEDUP : 1),
      rotationSpeed: 0.02,
      width: isBoss ? 44 : 36,
      height: isBoss ? 33 : 27,
      radius: isBoss ? 20 : 16,
      hp: isBoss ? Math.floor(baseHp * 4) : Math.floor(baseHp),
      maxHp: 0,
      bulletRange: enemyBaseRange,
      viewRadius: getEnemyViewRadius(isBoss, gameLevel),
      accuracy: isBoss
        ? Math.min(0.55, 0.18 + (gameLevel - 1) * 0.025)
        : Math.min(0.3, 0.05 + (gameLevel - 1) * 0.02),
      lastShot: 0,
      shootCooldown: (220 + Math.random() * 120) * 7,
      patrolChangeTimer: 600 + Math.random() * 180,
      chasing: false,
      isBoss: !!isBoss,
      run: false,
      alertTimer: 0, // Таймер лампочки
      // (4) агр по попаданию
      aggroTimer: 0,
      collisionAttemp: 0,
      collisionDir: Math.random() < 0.3 ? true : false, //true - вправо, false - в лево
      avoidingObstacle: false,
    };
    enemy.maxHp = enemy.hp;

    let enemyRange = enemyBaseRange * Math.pow(1.02, gameLevel - 1);
    enemy.bulletRange = isBoss ? enemyRange * 1.3 : enemyRange;
    enemyTanks.push(enemy);
    break;
  }
}

function drawEnemyBullets(b) {
  //рисуем пули врагов
  ctx.save();
  ctx.shadowColor = '#ff4444';
  ctx.shadowBlur = 8;
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.arc(b.x - camera.x, b.y - camera.y, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function updateEnemyAI() {
  //обработка врагов
  const now = performance.now();
  const playerInvisible = invisTimer > 0;

  for (let i = enemyTanks.length - 1; i >= 0; i--) {
    const enemy = enemyTanks[i];
    const distToPlayer = Math.hypot(enemy.x - tank.x, enemy.y - tank.y);

    // Обновление таймера лампочки
    if (enemy.alertTimer > 0) {
      enemy.alertTimer--;
    }

    if (!enemy.isBoss) {
      // 1. Уклонение: проверяем пули игрока рядом с врагом
      for (let b of bullets) {
        let distToBullet = Math.hypot(b.x - enemy.x, b.y - enemy.y);
        if (distToBullet < 200 && enemy.aggroTimer == 0 && !enemy.run) {
          // Если пуля близко
          enemy.patrolChangeTimer = -1;
          enemy.speed = enemy.maxSpeed * 1.3; // Ускоряется, чтобы уйти с линии
          enemy.run = true;
          enemy.patrolAngle = tank.angle;
          enemy.patrolTarget.x = enemy.x + (Math.random() - 0.5) * 800;
          enemy.patrolTarget.y = enemy.y + (Math.random() - 0.5) * 800;
          enemy.patrolChangeTimer = 700 + Math.random() * 180;
          enemy.alertTimer = 180;
        }
      }

      if (enemy.run) {
        if (distToPlayer > tank.bulletRange * 2.2) {
          enemy.run = !enemy.run;
          enemy.speed = enemy.chaseSpeed;
          enemy.patrolChangeTimer = -1;
        }
      }
    }

    // (4) враг "видит" игрока, если либо в радиусе, либо недавно получил урон
    const aggroed = enemy.aggroTimer > 0;
    const canSeePlayer =
      !playerInvisible && (distToPlayer < enemy.viewRadius || aggroed);

    if (canSeePlayer) {
      if (!enemy.chasing) enemy.alertTimer = 180;
      enemy.chasing = true;
      enemy.patrolChangeTimer = 300 + Math.random() * 180;
    } else if (enemy.patrolChangeTimer <= 0) {
      enemy.chasing = false;
      if (enemy.run) {
        enemy.run = !enemy.run;
        enemy.speed = enemy.chaseSpeed;
      }
      enemy.patrolAngle = Math.random() * Math.PI * 2;
      enemy.patrolTarget.x = enemy.x + (Math.random() - 0.5) * 400;
      enemy.patrolTarget.y = enemy.y + (Math.random() - 0.5) * 400;
      enemy.patrolChangeTimer = 300 + Math.random() * 180;
    }

    const currentSpeed = enemy.chasing ? enemy.chaseSpeed : enemy.speed;
    const inWater = isTankInWater(enemy);
    let moveSpeed = currentSpeed * (inWater ? 0.45 : 1);
    const inSand = isTankInSand(enemy);
    moveSpeed = moveSpeed * (inSand ? 0.75 : 1);
    const inDirt = isTankInDirt(enemy);
    moveSpeed = moveSpeed * (inDirt ? 0.65 : 1);

    let targetAngle;
    if (enemy.chasing && canSeePlayer) {
      targetAngle = Math.atan2(tank.y - enemy.y, tank.x - enemy.x);
    } else {
      const dx = enemy.patrolTarget.x - enemy.x;
      const dy = enemy.patrolTarget.y - enemy.y;
      targetAngle = Math.atan2(dy, dx);
      if (Math.hypot(dx, dy) < 40) {
        enemy.patrolChangeTimer = 0;
      }
    }

    const angleDiff =
      ((targetAngle - enemy.angle + Math.PI) % (Math.PI * 2)) - Math.PI;
    enemy.angle += Math.sign(angleDiff) * enemy.rotationSpeed;

    // ДОБАВИТЬ ПРОВЕРКУ УГЛА ПОВОРОТА ПЕРЕД ВЫСТРЕЛОМ
    const angleToPlayer = Math.atan2(tank.y - enemy.y, tank.x - enemy.x);
    const angleDiffToPlayer = Math.abs(
      ((angleToPlayer - enemy.angle + Math.PI) % (Math.PI * 2)) - Math.PI,
    );
    const isFacingPlayer = angleDiffToPlayer < 0.35; // ~20 градусов

    const nextX = enemy.x + Math.cos(enemy.angle) * moveSpeed * deltaTime * 60;
    const nextY = enemy.y + Math.sin(enemy.angle) * moveSpeed * deltaTime * 60;

    let collision = false;
    let collidedObject = null;
    for (let obj of worldObjects) {
      const a = getObjectAABB(obj);
      if (rectCircleOverlap(nextX, nextY, enemy.radius, a.x, a.y, a.w, a.h)) {
        collision = true;
        collidedObject = obj; // Запоминаем объект столкновения
        break;
      }
    }

    if (
      !collision &&
      nextX > 25 &&
      nextX < mapWidth - 25 &&
      nextY > 25 &&
      nextY < mapHeight - 25
    ) {
      enemy.x = nextX;
      enemy.y = nextY;
      enemy.collisionAttemp = 0;
    } else {
      //Смена направления при столкновении

      if (enemy.collisionDir) {
        enemy.angle += 0.05; //поворот при коллизии с объектом
      } else {
        enemy.angle -= 0.05; //поворот при коллизии с объектом
      }

      //если застрял на границах
      if (
        nextX < 25 ||
        nextX > mapWidth - 25 ||
        nextY < 25 ||
        nextY > mapHeight - 25
      ) {
        enemy.patrolTarget.x = mapWidth / 2 + (Math.random() - 0.5) * 200;
        enemy.patrolTarget.y = mapHeight / 2 + (Math.random() - 0.5) * 200;
        enemy.collisionAttemp = 0; // Сбрасываем счетчик
      } else {
        if (enemy.collisionAttemp > 20) {
          enemy.patrolTarget.x = enemy.x + (Math.random() - 0.5) * 400;
          enemy.patrolTarget.y = enemy.y + (Math.random() - 0.5) * 400;
        }
      }

      enemy.collisionAttemp++;
    }

    // ИЗМЕНИТЬ УСЛОВИЕ ВЫСТРЕЛА: добавить проверку isFacingPlayer
    if (
      canSeePlayer &&
      distToPlayer < enemy.viewRadius &&
      now - enemy.lastShot > enemy.shootCooldown &&
      isFacingPlayer
    ) {
      if (Math.random() < enemy.accuracy) {
        const spread = enemy.isBoss ? 0.32 : 0.55;
        const bulletAngle =
          Math.atan2(tank.y - enemy.y, tank.x - enemy.x) +
          (Math.random() - 0.5) * spread;
        enemyBullets.push({
          x: enemy.x + Math.cos(enemy.angle) * 20,
          y: enemy.y + Math.sin(enemy.angle) * 20,
          angle: bulletAngle,
          speed: bulletSpeed * 0.85 * (isMobile ? MOBILE_BULLET_SPEEDUP : 1),
          r: 4,
          dmg: rollDamage(enemy.isBoss ? 20 : 16),
          startX: enemy.x,
          startY: enemy.y,
          maxDist: enemy.bulletRange,
        });
        enemy.lastShot = now;
        enemy.shootCooldown = (200 + Math.random() * 140) * 7;
      }
    }

    enemy.patrolChangeTimer--;

    // (4) затухание агра
    if (enemy.aggroTimer > 0) enemy.aggroTimer -= 0.6; // медленнее “сдувается”
  }
}

// Получить вектор направления от object2 к object1
function getDirectionToTarget(targetX, targetY, currentX, currentY) {
  let dx = targetX - currentX;
  let dy = targetY - currentY;
  let dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return { x: 0, y: 0 };

  return {
    x: dx / dist,
    y: dy / dist,
  };
}

// Плавный поворот угла (интерполяция)
function smoothRotate(fromAngle, toAngle, speed) {
  let diff = toAngle - fromAngle;

  // Нормализуем угол в диапазон [-PI, PI]
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;

  return fromAngle + Math.sign(diff) * Math.min(Math.abs(diff), speed);
}

function updateEnemySmoke() {
  // Генерация дыма от повреждённых танков противников (HP ≤ 30%)
  for (let enemy of enemyTanks) {
    const enemyHpPercent = enemy.hp / enemy.maxHp;
    if (enemyHpPercent <= 0.3 && enemyHpPercent > 0) {
      if (Math.random() < 0.25) {
        // 25% шанс (чуть меньше чем у игрока)
        const enemySmokeIntensity = 1 - enemyHpPercent / 0.3;
        const numParticles = Math.random() < enemySmokeIntensity ? 2 : 1;

        for (let i = 0; i < numParticles; i++) {
          particles.push({
            x: enemy.x + (Math.random() - 0.5) * 18,
            y: enemy.y + (Math.random() - 0.5) * 12,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.4 - Math.random() * 0.4,
            size: 3 + Math.random() * 5,
            life: 1.0,
            decay: 0.014 + Math.random() * 0.01,
            color: Math.random() < 0.5 ? '#555555' : '#666666', // Чуть темнее
            grav: 0,
            type: 'smoke',
          });
        }
      }
    }
  }
}

function drawEnemyLoot(loot) {
  //отрисовка лута врага
  if (!loot.picked) {
    ctx.save();
    ctx.translate(loot.x - camera.x, loot.y - camera.y);
    ctx.shadowBlur = 12;

    if (loot.kind === 'perk') {
      ctx.shadowColor = '#9b59b6';
      ctx.fillStyle = '#9b59b6';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', 0, 0);
    } else {
      if (loot.kind === 'hp') {
        ctx.shadowColor = '#00b894';
        ctx.fillStyle = '#00b894';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('+' + loot.amount, 0, 2);
      } else {
        ctx.shadowColor = '#f1c40f';
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.fillText('+' + loot.amount, 0, 2);
      }
    }
    ctx.restore();
  }
}
