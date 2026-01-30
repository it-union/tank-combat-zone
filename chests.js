function drawChest(ch) {
  //рисуем сундук
  ctx.save();

  // Проверка: находится ли сундук под зданием
  let isUnderBuilding = false;
  for (let obj of worldObjects) {
    if (obj.type === 'building' || obj.type === 'ruin') {
      const a = getObjectAABB(obj);
      if (ch.x > a.x && ch.x < a.x + a.w && ch.y > a.y && ch.y < a.y + a.h) {
        isUnderBuilding = true;
        break;
      }
    }
  }

  if (isUnderBuilding) ctx.globalAlpha = 0.4; // Прозрачность, если внутри
  ctx.translate(ch.x - camera.x, ch.y - camera.y);

  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  // Проверяем, пустой ли сундук
  const isEmpty = !ch.content;

  if (ch.hp > 0) {
    // Цвет сундука зависит от того, пустой он или нет
    ctx.fillStyle = isEmpty ? '#6b4423' : '#8e5a2a'; // Пустой - темнее
    ctx.fillRect(-ch.w / 2, -ch.h / 2, ch.w, ch.h);
    ctx.strokeStyle = '#3a2311';
    ctx.lineWidth = 3;
    ctx.strokeRect(-ch.w / 2 + 1, -ch.h / 2 + 1, ch.w - 2, ch.h - 2);
    ctx.fillStyle = isEmpty ? '#848484' : '#b2bec3'; // Пустой - серая застёжка
    ctx.fillRect(-ch.w / 2, -3, ch.w, 6);

    const pct = clamp(ch.hp / ch.maxHp, 0, 1);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fillRect(-ch.w / 2, -ch.h / 2 - 10, ch.w, 5);
    ctx.fillStyle = pct > 0.5 ? '#00b894' : pct > 0.25 ? '#fdcb6e' : '#d63031';
    ctx.fillRect(-ch.w / 2, -ch.h / 2 - 10, ch.w * pct, 5);
  } else if (isEmpty) {
    // Открытый ПУСТОЙ сундук
    ctx.fillStyle = '#4d3318';
    ctx.fillRect(-ch.w / 2, -ch.h / 2, ch.w, ch.h);
    ctx.fillStyle = '#3a2311';
    ctx.fillRect(-ch.w / 2 + 4, -ch.h / 2 + 4, ch.w - 8, ch.h - 8);

    ctx.shadowColor = 'transparent';
    ctx.fillStyle = '#999';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('', 0, 0); // Символ пустоты
  } else {
    ctx.fillStyle = '#5d3b1c';
    ctx.beginPath();
    ctx.moveTo(-ch.w / 2, ch.h / 2);
    ctx.lineTo(0, -ch.h / 2);
    ctx.lineTo(ch.w / 2, ch.h / 2);
    ctx.closePath();
    ctx.fill();

    if (ch.content && ch.content.kind === 'mine') {
      /*ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#8b0000';
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ff4444';*/
      /*ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('M', 0, 0);*/
    } else if (ch.loot && !ch.loot.picked) {
      const loot = ch.loot;
      ctx.shadowColor = 'transparent';
      if (loot.kind === 'perk') {
        const icons = {
          invis: '👤',
          shield: '🛡️',
          artillery: '🚀',
          medkit: '➕',
          bigammo: '📦',
        };
        const icon = icons[ch.loot.perkKey] || '?';

        ctx.save();
        ctx.shadowColor = 'rgba(139, 89, 182, 0.7)';
        ctx.shadowBlur = 12;
        ctx.fillStyle = '#9b59b6';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 0;
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(icon, 0, 0);
        ctx.restore();
      } else if (loot.kind === 'ammo') {
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2c2c2c';
        ctx.fillRect(-6, -2, 12, 4);
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('+' + loot.amount, 0, -12);
      } else {
        ctx.fillStyle = '#00b894';
        ctx.beginPath();
        ctx.arc(0, 0, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.rect(-2, -6, 4, 12);
        ctx.rect(-6, -2, 12, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText('+' + loot.amount, 0, -12);
      }
    }
  }
  ctx.restore();
}

function getChestAABB(ch) {
  //получаем AABB сундука
  const w = ch.w || 34;
  const h = ch.h || 26;
  return { x: ch.x - w / 2, y: ch.y - h / 2, w, h };
}

function spawnLootForChest(chest) {
  //спавним лут для сундука
  const content = chest.content;

  // Проверка на пустой сундук
  if (!content) {
    chest.opened = true;
    return; // Сундук пустой, ничего не даём
  }

  if (content.kind === 'mine') {
    const mine = {
      x: chest.x + (Math.random() - 0.5) * 60,
      y: chest.y + (Math.random() - 0.5) * 60,
      radius: baseMineRadiusMin + Math.random() * baseMineRadiusAdv,
      dmg:
        (baseMineDmg + Math.floor(Math.random() * (baseMineDmg + 1))) *
        Math.pow(1.02, gameLevel - 1),
      ttl: 150 * 60,
      activated: false,
    };
    mines.push(mine);
  } else if (content.kind === 'perk') {
    const loot = {
      x: chest.x,
      y: chest.y,
      kind: 'perk',
      perkKey: content.perkKey,
      picked: false,
      size: 18,
      ttl: 30 * 60,
    };
    chest.loot = loot;
  } else {
    const loot = {
      x: chest.x,
      y: chest.y,
      kind: content.kind,
      amount: content.amount,
      picked: false,
      size: 16,
      ttl: 30 * 60,
    };
    chest.loot = loot;
  }
  chest.opened = true;
}
