function spawnRadiationCloud() {
  //спавним облако радиации
  if (radiationCloud) return; // Уже есть облако

  radiationCloud = {
    x: Math.random() * (mapWidth - 200) + 100,
    y: Math.random() * (mapHeight - 200) + 100,
    radius: 80 + Math.random() * 60,
    speedX: (Math.random() - 0.5) * 0.8,
    speedY: (Math.random() - 0.5) * 0.8,
    damage: 1, // Урон в секунду
    ttl: 30 * 60, // 30 секунд
    pulse: 0,
  };
}

function drawRadiationCloud() {
  //рисуем облако радиации
  ctx.save();
  const cx = radiationCloud.x - camera.x;
  const cy = radiationCloud.y - camera.y;

  // Внешнее свечение
  const pulse = Math.sin(radiationCloud.pulse) * 0.2 + 0.8;
  const gradient = ctx.createRadialGradient(
    cx,
    cy,
    0,
    cx,
    cy,
    radiationCloud.radius,
  );
  gradient.addColorStop(0, 'rgba(0, 255, 0, 0.3)');
  gradient.addColorStop(0.7, 'rgba(0, 200, 0, 0.15)');
  gradient.addColorStop(1, 'rgba(0, 150, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radiationCloud.radius * pulse, 0, Math.PI * 2);
  ctx.fill();

  // Внутренняя часть
  ctx.fillStyle = 'rgba(0, 255, 0, 0.2)';
  ctx.beginPath();
  ctx.arc(cx, cy, radiationCloud.radius * 0.6 * pulse, 0, Math.PI * 2);
  ctx.fill();

  // Текст предупреждения
  ctx.fillStyle = '#00ff00';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(t('radiation'), cx, cy);

  ctx.restore();
}

function moveRadiationCloud() {
  // Движение облака
  radiationCloud.x += radiationCloud.speedX;
  radiationCloud.y += radiationCloud.speedY;

  // Отскок от границ
  if (
    radiationCloud.x < radiationCloud.radius ||
    radiationCloud.x > mapWidth - radiationCloud.radius
  ) {
    radiationCloud.speedX *= -1;
  }
  if (
    radiationCloud.y < radiationCloud.radius ||
    radiationCloud.y > mapHeight - radiationCloud.radius
  ) {
    radiationCloud.speedY *= -1;
  }

  // Пульсация
  radiationCloud.pulse += 0.05;

  // Проверка столкновения с танком
  const dx = tank.x - radiationCloud.x;
  const dy = tank.y - radiationCloud.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < radiationCloud.radius && shieldTimer <= 0) {
    // Наносим урон (0.5 в секунду при 60 FPS = 0.0083 за кадр)
    tank.hp -= radiationCloud.damage / 60;

    // Показываем урон раз в секунду
    if (Math.random() < 0.016) {
      spawnDamageNumber(tank.x, tank.y - 30, 1, '#00ff00');
    }
  }

  // Уменьшаем время жизни
  radiationCloud.ttl--;
  if (radiationCloud.ttl <= 0) {
    radiationCloud = null;
  }
}
