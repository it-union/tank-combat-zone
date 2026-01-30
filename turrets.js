function spawnTurret() {
  //спавним турель
  const attempts = 100;
  for (let i = 0; i < attempts; i++) {
    //console.log(i);
    const x = 300 + Math.random() * (mapWidth - 600);
    const y = 100 + Math.random() * (mapHeight - 300);

    // НЕ может стоять в воде
    //if (isPointInWater(x, y)) continue;

    // НЕ рядом с игроком
    if (Math.hypot(x - tank.x, y - tank.y) < 300) continue;

    // Проверяем, не слишком ли близко к другим турелям (минимум 120px)
    let tooClose = false;
    for (let turret of turrets) {
      if (Math.hypot(x - turret.x, y - turret.y) < 50) {
        tooClose = true;
        break;
      }
    }
    if (tooClose) continue;

    // Проверяем коллизии с объектами (можно стоять на зданиях)
    let collision = false;
    for (let obj of worldObjects) {
      const a = getObjectAABB(obj);
      const turretHalf = 16;
      if (rectCircleOverlap(x, y, turretHalf, a.x, a.y, a.w, a.h)) {
        collision = true;
        break;
      }
    }
    if (!collision) {
      // Точность зависит от уровня карты
      const turretAccuracy = Math.min(0.95, 0.65 + (gameLevel - 1) * 0.03);

      turrets.push({
        x,
        y,
        angle: Math.random() * Math.PI * 2, // Случайный начальный угол
        lastShot: 0,
        shootCooldown: (300 + Math.random() * 200) * 8, // медленнее танков
        viewRadius: getEnemyViewRadius(true, gameLevel), // как у боссов
        accuracy: turretAccuracy, // Точность растет с уровнем
        hp:
          (baseEnemyHp + Math.random() * baseEnemyHp) *
          Math.pow(1.03, gameLevel - 1),
        maxHp: 0,
        radius: 14,
        rotationSpeed: 0.003, // Скорость поворота при наведении на игрока
        idleRotationSpeed: 0.0008, // Медленное вращение в режиме ожидания
        idleRotationDirection: Math.random() < 0.5 ? 1 : -1, // Случайное направление вращения
        isShooting: false, // Флаг стрельбы для остановки вращения
        isFacingPlayer: false, // Флаг, что турель наведена на игрока
        alertTimer: 0, // Таймер лампочки
        aggro: false,
      });
      turrets[turrets.length - 1].maxHp = turrets[turrets.length - 1].hp;
      //console.log(turrets);
      break;
    }
  }
}

function drawTurrets(turret) {
  ctx.save();
  ctx.translate(turret.x - camera.x, turret.y - camera.y);
  ctx.rotate(turret.angle);

  // Постамент турели
  ctx.fillStyle = '#4a4a4a';
  ctx.fillRect(-12, -8, 24, 16);
  ctx.fillStyle = '#666';
  ctx.fillRect(-10, 10, 20, 15);

  // Башня турели
  ctx.shadowColor = '#ff4444';
  ctx.shadowBlur = 12;
  ctx.fillStyle = '#cc3333';
  ctx.beginPath();
  ctx.arc(0, 0, 16, 0, Math.PI * 2);
  ctx.fill();

  // Ствол
  ctx.strokeStyle = '#8b0000';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(32, 0);
  ctx.stroke();

  // HP полоска
  const hpPct = clamp(turret.hp / turret.maxHp, 0, 1);
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(-18, -28, 36, 4);
  ctx.fillStyle = hpPct > 0.3 ? '#44ff44' : '#ff4444';
  ctx.fillRect(-18, -28, 36 * hpPct, 4);

  // Лампочка при обнаружении
  if (turret.alertTimer > 0) {
    const pulse = Math.sin(turret.alertTimer * 0.3) * 0.3 + 0.7;
    ctx.beginPath();
    ctx.arc(0, -turret.radius + 16, 6, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, ${Math.floor(100 + pulse * 155)}, 0, ${pulse})`;
    ctx.shadowColor = '#ff6600';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

function updateTurretAI() {
  const now = performance.now();
  const playerInvisible = invisTimer > 0;

  // Обновление турелей (код в том же цикле now/now.repeat)
  turrets.forEach((turret) => {
    const distToPlayer = Math.hypot(turret.x - tank.x, turret.y - tank.y);
    const isPlayerInRange = distToPlayer < turret.viewRadius && invisTimer <= 0;

    // Обновление таймера лампочки
    if (turret.alertTimer > 0) {
      turret.alertTimer--;
    }

    // Инициализация параметров, если их нет
    if (turret.isShooting === undefined) turret.isShooting = false;
    if (turret.isFacingPlayer === undefined) turret.isFacingPlayer = false;
    if (turret.idleRotationSpeed === undefined)
      turret.idleRotationSpeed = 0.0008;
    if (turret.idleRotationDirection === undefined)
      turret.idleRotationDirection = Math.random() < 0.5 ? 1 : -1;

    // Проверка, закончилась ли анимация выстрела
    if (turret.isShooting && performance.now() - turret.lastShot > 120) {
      turret.isShooting = false;
    }

    // Игрок в зоне агра
    if (isPlayerInRange) {
      const angleToPlayer = Math.atan2(tank.y - turret.y, tank.x - turret.x);
      if (!turret.aggro) turret.alertTimer = 180;
      turret.aggro = true;

      // Разворот по наименьшему углу (только если не стреляет)
      if (!turret.isShooting) {
        // Вычисляем наименьшую разницу углов
        let angleDiff = angleToPlayer - turret.angle;
        // Нормализуем угол в диапазон [-PI, PI]
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        const rotationSpeed = turret.rotationSpeed || 0.003;

        if (Math.abs(angleDiff) > 0.01) {
          // Поворачиваемся в направлении наименьшего угла
          turret.angle +=
            Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), rotationSpeed);
          turret.isFacingPlayer = false;
        } else {
          turret.angle = angleToPlayer;
          turret.isFacingPlayer = true;
        }
      }
    } else {
      // Игрок вне зоны агра - медленное вращение в случайном направлении
      turret.aggro = false;
      turret.isFacingPlayer = false;
      if (!turret.isShooting) {
        turret.angle += turret.idleRotationSpeed * turret.idleRotationDirection;

        // Периодически меняем направление вращения для разнообразия
        if (Math.random() < 0.002) {
          turret.idleRotationDirection *= -1;
        }
      }
    }

    // Стрельба: только если игрок в зоне агра И турель наведена на него
    if (
      isPlayerInRange &&
      turret.isFacingPlayer &&
      performance.now() - turret.lastShot > turret.shootCooldown
    ) {
      // Проверяем точность с учетом уровня
      const angleToPlayer = Math.atan2(tank.y - turret.y, tank.x - turret.x);
      const angleDiffToPlayer = Math.abs(
        ((angleToPlayer - turret.angle + Math.PI) % (Math.PI * 2)) - Math.PI,
      );
      const isFacingPlayer = angleDiffToPlayer < 0.08; // ~4.6 градусов для более точного наведения

      if (isFacingPlayer) {
        // Разброс зависит от точности (чем выше точность, тем меньше разброс)
        const maxSpread = 0.5;
        const spread = maxSpread * (1 - turret.accuracy);
        const bulletAngle = turret.angle + (Math.random() - 0.5) * spread;

        enemyBullets.push({
          x: turret.x + Math.cos(turret.angle) * 18,
          y: turret.y + Math.sin(turret.angle) * 18,
          angle: bulletAngle,
          speed: bulletSpeed * 0.75 * (isMobile ? MOBILE_BULLET_SPEEDUP : 1),
          r: 5,
          dmg: rollDamage(18),
          startX: turret.x,
          startY: turret.y,
          maxDist: enemyBaseRange * Math.min(2, Math.pow(1.02, gameLevel - 1)),
        });
        turret.lastShot = performance.now();
        turret.shootCooldown = (280 + Math.random() * 160) * 8;
        turret.isShooting = true;
      }
    }
  });
}

function collisionTurrets() {
  // Коллизия с турелями
  for (let i = turrets.length - 1; i >= 0; i--) {
    const turret = turrets[i];
    const dist = Math.hypot(tank.x - turret.x, tank.y - turret.y);
    if (dist < tank.radius + turret.radius) {
      // Урон игроку при столкновении с турелью
      const playerDmg = 0.5; // урон игроку за кадр контакта
      const turretDmg = 1.0; // урон турели за кадр контакта

      if (shieldTimer <= 0) {
        tank.hp -= playerDmg;
        if (Math.random() < 0.02)
          spawnDamageNumber(tank.x, tank.y - 20, 1, '#ff4444');
      }

      // Урон турели от тарана
      turret.hp -= turretDmg;
      if (Math.random() < 0.02)
        spawnDamageNumber(turret.x, turret.y - 25, 1, '#ffd166');

      // Если турель уничтожена от тарана
      if (turret.hp <= 0) {
        spawnExplosion(turret.x, turret.y, 'building');
        addExperience(expTurret);
        turrets.splice(i, 1);
      }

      // Отталкивание игрока от турели
      const pushAngle = Math.atan2(tank.y - turret.y, tank.x - turret.x);
      tank.x += Math.cos(pushAngle) * 2;
      tank.y += Math.sin(pushAngle) * 2;
    }
  }
}
