function generateMap() {
  //генерируем карту
  worldObjects.length = 0;
  destroyedDebris.length = 0;
  decorElements.length = 0;
  chests.length = 0;
  craters.length = 0;
  particles.length = 0;
  mines.length = 0;
  enemyTanks.length = 0;
  damageNumbers.length = 0;
  let perkPlacedOnThisMap = false;

  // Множитель объектов на карте (зависит от площади карты)
  const mapSizeMultiplier =
    1.0 + Math.min(Math.floor(gameLevel / 11) * 0.05, 1.0);
  const objectsMultiplier = mapSizeMultiplier * mapSizeMultiplier; // Площадь = размер²

  // Озёра (увеличивается с размером карты)
  //const waterCount = Math.floor(baseWaterMin * objectsMultiplier);
  const waterMultiplier = 1.1 * objectsMultiplier;
  const waterCount = Math.floor(
    (baseWaterMin + Math.floor(Math.random() * baseWaterMax)) * waterMultiplier,
  );

  for (let i = 0; i < waterCount; i++) {
    let attempts = 0;
    let placed = false;

    while (!placed && attempts < 50) {
      const x = Math.random() * mapWidth;
      const y = Math.random() * mapHeight * 0.7;
      const size = 80 + Math.random() * 120;

      // Проверяем, не пересекается ли новое озеро с существующими
      let overlap = false;

      for (let decor of decorElements) {
        if (decor.type !== 'water') continue;

        const dx = x - decor.x;
        const dy = y - decor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Расстояние должно быть больше суммы радиусов + минимальный зазор
        const minDistance = (size + decor.size) * 1.2; // 20% зазор

        if (distance < minDistance) {
          overlap = true;
          break;
        }
      }

      if (!overlap) {
        decorElements.push({
          x: x,
          y: y,
          type: 'water',
          size: size,
          shade: 0.4 + Math.random() * 0.6,
          irregularity: 0.1 + Math.random() * 0.3,
        });
        placed = true;
      }

      attempts++;
    }

    // Если не удалось разместить озеро после 50 попыток, пропускаем его
    if (!placed) {
      console.warn(`Не удалось разместить озеро ${i + 1} без пересечений`);
    }
  }

  // (4) Песок только на границе воды: делаем "кольцо" вокруг каждого озера
  for (let w of decorElements) {
    if (w.type !== 'water') continue;

    // несколько песчаных "сегментов" по окружности
    const segments = baseSandMin + Math.floor(Math.random() * baseSandMax); // 1..3
    for (let s = 0; s < segments; s++) {
      const a = Math.random() * Math.PI * 2;

      // ставим центр песка примерно по краю воды
      const ringR = w.size * (0.92 + Math.random() * 0.12); // около границы
      const px = w.x + Math.cos(a) * ringR;
      const py = w.y + Math.sin(a) * ringR;

      decorElements.push({
        x: px,
        y: py,
        type: 'sand',
        // размер песка меньше воды и не "оборачивает" её целиком
        size: w.size * (0.28 + Math.random() * 0.18),
        irregularity: w.irregularity * (0.9 + Math.random() * 0.25),
        shade: 0.75 + Math.random() * 0.35,
        seed: Math.random() * 1000 + w.x * 0.1 + w.y * 0.1,
      });
    }
  }

  // Грязь (базово 20, увеличивается с размером карты)
  const dirtCount = Math.floor(baseDirt * objectsMultiplier);
  for (let i = 0; i < dirtCount; i++) {
    decorElements.push({
      x: Math.random() * mapWidth,
      y: Math.random() * mapHeight,
      type: 'dirt',
      size: 30 + Math.random() * 45,
      irregularity: 0.15 + Math.random() * 0.35,
      seed: Math.random() * 1000,
    });
  }

  // Проверка: является ли уровень кратным 4
  const isForestLevel = gameLevel % 4 === 0;
  const forestMultiplier = isForestLevel ? 1.3 : 1.0;

  const types = ['tree', 'building', 'ruin', 'fallen_tree'];
  // Объекты (деревья, здания) увеличиваются с размером карты
  const objectTarget = Math.floor(
    baseObjects * forestMultiplier * objectsMultiplier,
  );
  const tries = objectTarget * (isMobile ? 12 : 25);

  // 1. Увеличиваем количество лесных кластеров (островков леса)
  const baseClusters = 3 + Math.floor(Math.random() * 4);
  const forestClusters = Math.floor(
    baseClusters * forestMultiplier * mapSizeMultiplier,
  );
  for (let c = 0; c < forestClusters; c++) {
    const centerX = Math.random() * (mapWidth - 200) + 100;
    const centerY = Math.random() * (mapHeight * 0.85 - 200) + 100;

    const treeCount =
      Math.floor((5 + Math.floor(Math.random() * 8)) * forestMultiplier) *
      (isMobile ? 0.5 : 1);
    for (let t = 0; t < treeCount; t++) {
      const x = centerX + (Math.random() - 0.5) * (120 + Math.random() * 120);
      const y = centerY + (Math.random() - 0.5) * (120 + Math.random() * 120);
      if (x < 60 || x > mapWidth - 60 || y < 60 || y > mapHeight - 60) continue;

      const distToTank = Math.hypot(x - tank.x, y - tank.y);
      if (distToTank <= 150) continue;

      const sizeVar = 0.75 + Math.random() * 0.7;
      const isPine = Math.random() < 0.35; // 35% шанс ёлки

      const obj = {
        x,
        y,
        type: isPine ? 'pine' : 'tree',
        rotation: Math.random() * Math.PI * 2,
        w: 36 * sizeVar,
        h: 36 * sizeVar,
        variant: Math.floor(Math.random() * 5),
        crown: {
          r1: 16 * sizeVar + Math.random() * 10,
          r2: 10 * sizeVar + Math.random() * 9,
          offx: (Math.random() - 0.5) * 10,
          offy: (Math.random() - 0.5) * 10,
          shade: 0.85 + Math.random() * 0.4,
        },
        trunk: {
          w: 6 * sizeVar + Math.random() * 4,
          h: 18 * sizeVar + Math.random() * 10,
          lean: (Math.random() - 0.5) * 0.4,
        },
      };
      obj.maxHp = 30 + Math.floor(Math.random() * 31);
      obj.hp = obj.maxHp;
      worldObjects.push(obj);
    }
  }

  //console.log(worldObjects);

  for (let i = 0; i < tries && worldObjects.length < objectTarget; i++) {
    let type = types[Math.floor(Math.random() * types.length)];
    const x = Math.random() * (mapWidth - 100) + 50;
    const y = Math.random() * (mapHeight - 200) + 50;

    const distToTank = Math.hypot(x - tank.x, y - tank.y);
    if (distToTank <= 150) continue;

    const inWater = isPointInWater(x, y);
    if (inWater && type !== 'tree') continue;

    let obj = {
      x,
      y,
      type: type,
      rotation: Math.random() * Math.PI * 2,
      w:
        type === 'building' || type === 'ruin'
          ? 56 + Math.random() * 54
          : 34 + Math.random() * 18,
      h:
        type === 'building' || type === 'ruin'
          ? 56 + Math.random() * 54
          : 34 + Math.random() * 18,
      variant: Math.floor(Math.random() * 6),
      palette: {
        a: 0.75 + Math.random() * 0.5,
        b: 0.75 + Math.random() * 0.5,
      },
    };

    if (type === 'tree') {
      const sizeVar = 0.8 + Math.random() * 0.8;
      obj.w = 36 * sizeVar;
      obj.h = 36 * sizeVar;
      obj.crown = {
        r1: 16 * sizeVar + Math.random() * 12,
        r2: 10 * sizeVar + Math.random() * 10,
        offx: (Math.random() - 0.5) * 12,
        offy: (Math.random() - 0.5) * 12,
        shade: 0.85 + Math.random() * 0.5,
      };
      obj.trunk = {
        w: 6 * sizeVar + Math.random() * 5,
        h: 18 * sizeVar + Math.random() * 12,
        lean: (Math.random() - 0.5) * 0.45,
      };
    }

    if (type === 'building') {
      obj.roof = {
        kind: Math.random() < 0.6 ? 'gable' : 'flat',
        shade: 0.75 + Math.random() * 0.45,
      };
      obj.windows = 2 + Math.floor(Math.random() * 5);
      obj.w = 58 + Math.random() * 64;
      obj.h = 58 + Math.random() * 64;
    }

    if (type === 'ruin') {
      obj.damage = 0.3 + Math.random() * 0.6;
      // Генерируем отверстия один раз чтобы избежать мерцания
      const holesCount = 2 + Math.floor(obj.damage * 5);
      obj.holes = [];
      for (let i = 0; i < holesCount; i++) {
        obj.holes.push({
          x: (Math.random() - 0.5) * obj.w * 0.6,
          y: (Math.random() - 0.5) * obj.h * 0.6,
          r: 6 + Math.random() * 16,
          depth: Math.random(),
        });
      }
    }

    let maxHp;
    //let hpMultiplier = Math.pow(1.05, gameLevel - 1); //ХП объектов не растет с уровнем
    if (type === 'building')
      maxHp = 90 + Math.random() * 61; // * hpMultiplier;
    else if (type === 'ruin')
      maxHp = 60 + Math.random() * 61; // * hpMultiplier;
    else if (type === 'tree')
      maxHp = 30 + Math.random() * 31; // * hpMultiplier;
    else maxHp = 25 + Math.floor(Math.random() * 31);

    obj.maxHp = maxHp;
    obj.hp = maxHp;
    worldObjects.push(obj);
  }

  let b = Math.floor((gameLevel - 1) / 3); // +1 ящик каждые 3 уровней
  const chestBonus = b > maxchestBase ? maxchestBase : b; //ограничение по максимальному количеству ящиков
  const chestCount = chestBase + chestBonus;
  const chestTries = chestCount * 30;

  for (let i = 0; i < chestTries && chests.length < chestCount; i++) {
    const x = Math.random() * (mapWidth - 120) + 60;
    const y = Math.random() * (mapHeight - 220) + 60;

    if (isPointInWater(x, y)) continue;

    const ch = {
      x,
      y,
      w: 36,
      h: 28,
      hp: (25 + Math.floor(Math.random() * 26)) * Math.pow(1.05, gameLevel - 1),
      maxHp: 0,
      opened: false,
      loot: null,
      content: null,
    };
    ch.maxHp = ch.hp;

    const perkChance = 0.06; // очень редко ~6% (можно сделать 3-5%)
    const emptyChance = 0.2; // 20% сундуков пустые
    const rand = Math.random();

    // 20% шанс пустого сундука (кроме последнего, который гарантирует перк)
    if (
      Math.random() < emptyChance &&
      i < chestTries - 1 &&
      chests.length < chestCount - 1
    ) {
      ch.content = null; // Пустой сундук!
    } else if (
      !perkPlacedOnThisMap &&
      (i === chestTries - 1 || chests.length === chestCount - 1)
    ) {
      // на последнем шансе гарантируем перк, если ещё не было
      ch.content = { kind: 'perk', perkKey: pickPerkKeyForDrop() };
      perkPlacedOnThisMap = true;
    } else if (
      rand < perkChance &&
      !perkPlacedOnThisMap &&
      Math.random() < 0.35
    ) {
      // ограничиваем, чтобы перков действительно было мало (доп. редкость)
      ch.content = { kind: 'perk', perkKey: pickPerkKeyForDrop() };
      perkPlacedOnThisMap = true;
    } else if (rand < 0.3) {
      ch.content = { kind: 'mine', amount: 1 };
    } else if (rand < 0.65) {
      ch.content = { kind: 'ammo', amount: 5 + Math.floor(Math.random() * 16) };
    } else {
      ch.content = { kind: 'hp', amount: 10 + Math.floor(Math.random() * 31) };
    }

    const distToTank = Math.hypot(ch.x - tank.x, ch.y - tank.y);
    if (distToTank > 150) chests.push(ch);
  }

  const enemyCount = getEnemyCountForLevel(gameLevel);
  for (let i = 0; i < enemyCount; i++) spawnEnemyTank(false);
  spawnEnemyTank(true);
  // Дополнительные боссы:
  const extraBossCount = Math.floor((gameLevel - 1) / 5);
  for (let i = 0; i < extraBossCount; i++) {
    spawnEnemyTank(true);
  }

  //турели
  const turretCount = Math.floor((gameLevel - 1) / baseTurretCount);
  turrets.length = 0;
  for (let i = 0; i < turretCount; i++) {
    spawnTurret();
  }

  levelStartedEnemies = enemyTanks.length + turrets.length;
  console.log(
    `enemys=${enemyTanks.length} turrets=${turrets.length} chests=${chests.length} level=${gameLevel} objects=${worldObjects.length} bulletRange=${tank.bulletRange}`,
  );
  // console.log('userTank', tank);
  // console.log('enemyTank', enemyTanks);

  generateGrassTufts();
  updateHUD();
  updatePerkButtons();
  startLevelTimer();
}
