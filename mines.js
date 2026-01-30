function drawMine(mine) {
  //рисуем мин
  const cx = mine.x - camera.x;
  const cy = mine.y - camera.y;

  ctx.save();
  // Уменьшенная яркость вспышки
  ctx.shadowColor = 'rgba(139, 0, 0, 0.35)';
  ctx.shadowBlur = 8; // Было 12

  const pulse = Math.sin(Date.now() * 0.008 + mine.x * 0.01) * 0.25 + 0.6; // Меньше пульсация
  ctx.fillStyle = `rgba(90, 15, 15, ${pulse * 0.7})`; // Менее яркий красный
  ctx.beginPath();
  ctx.arc(cx, cy, mine.radius * 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255, 68, 68, 0.85)`; // Менее насыщенный
  ctx.beginPath();
  ctx.arc(cx, cy, mine.radius * 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px Arial'; // Меньший шрифт
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('М', cx, cy);

  ctx.restore();
}

function checkMineCollision() {
  // проверяем коллизию мины с танком и врагами (точно по кругу отрисовки)
  for (let i = mines.length - 1; i >= 0; i--) {
    const mine = mines[i];

    // Радиус коллизии делаем таким же, как внешний круг в drawMine()
    const mineCollisionRadius = mine.radius * 4.5;

    // С танком
    if (
      circleCircleOverlapMine(
        mine.x,
        mine.y,
        mineCollisionRadius,
        tank.x,
        tank.y,
        tank.radius,
      )
    ) {
      if (shieldTimer <= 0) {
        tank.hp -= mine.dmg;
        spawnDamageNumber(tank.x, tank.y - 20, mine.dmg);
      } else {
        spawnDamageNumber(tank.x, tank.y - 20, 0, '#66e0ff');
      }
      spawnExplosion(tank.x, tank.y, 'ground');
      spawnCrater(tank.x, tank.y, mine.radius * 0.8);
      mines.splice(i, 1);
      continue;
    }

    // С врагами
    for (let j = enemyTanks.length - 1; j >= 0; j--) {
      const enemy = enemyTanks[j];

      if (
        circleCircleOverlapMine(
          mine.x,
          mine.y,
          mineCollisionRadius,
          enemy.x,
          enemy.y,
          enemy.radius,
        )
      ) {
        enemy.hp -= mine.dmg;
        spawnDamageNumber(enemy.x, enemy.y - 15, mine.dmg, '#44ff44');
        spawnExplosion(enemy.x, enemy.y, 'ground');
        spawnCrater(enemy.x, enemy.y, mine.radius * 0.8);
        mines.splice(i, 1);
        break;
      }
    }
  }
}

function circleCircleOverlapMine(x1, y1, r1, x2, y2, r2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const rr = r1 + r2;
  return dx * dx + dy * dy <= rr * rr;
}
