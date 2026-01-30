const PERKS = {
  invis: { key: 'invis', name: () => t('invisibility'), duration: 20 * 60 },
  shield: { key: 'shield', name: () => t('shield'), duration: 20 * 60 },
  artillery: { key: 'artillery', name: () => t('artillery'), duration: 0 },
  medkit: { key: 'medkit', name: () => t('medkit'), duration: 0 },
  bigammo: { key: 'bigammo', name: () => t('bigAmmo'), duration: 0 },
};

tank.perks = tank.perks || {
  invis: 0,
  shield: 0,
  artillery: 0,
  medkit: 0,
  bigammo: 0,
};

let invisTimer = 0;
let shieldTimer = 0;
let artilleryCooldown = 0;

function updatePerkButtons() {
  const set = (k) => {
    const c = tank.perks[k] || 0;
    const btn = document.getElementById('perk_' + k);
    const cnt = document.getElementById('perkCount_' + k);
    if (cnt) cnt.textContent = String(c);
    if (btn) btn.disabled = c <= 0 || modalOpen || gamePaused;
  };

  set('invis');
  set('shield');
  set('artillery');
  set('medkit');
  set('bigammo');

  const invBtn = document.getElementById('perk_invis');
  if (invBtn) invBtn.classList.toggle('perk-active', invisTimer > 0);

  const shBtn = document.getElementById('perk_shield');
  if (shBtn) shBtn.classList.toggle('perk-active', shieldTimer > 0);
}

function spendPerk(k) {
  if (!tank.perks[k] || tank.perks[k] <= 0) return false;
  tank.perks[k] = 0; // max 1, so spend to 0
  updatePerkButtons();
  return true;
}

function callArtilleryStrike() {
  if (enemyTanks.length === 0) return;

  // select closest enemy to player
  let best = enemyTanks[0];
  let bestD = Infinity;
  for (const e of enemyTanks) {
    const d = Math.hypot(e.x - tank.x, e.y - tank.y);
    if (d < bestD) {
      bestD = d;
      best = e;
    }
  }

  // current player tank damage - base as in fireBullet
  const basePlayerDmg = 20 + tank.level * 3;
  const dmg = rollDamage(basePlayerDmg * 10);

  best.hp -= dmg;
  spawnDamageNumber(best.x, best.y - 18, dmg, '#ffd166');

  // effects
  spawnExplosion(best.x, best.y, 'ground');
  spawnCrater(best.x, best.y, 26);

  if (best.hp <= 0) {
    spawnExplosion(best.x, best.y, 'tank');
    addExperience(enemy.isBoss ? expBoss : expMob);
    enemyTanks.splice(enemyTanks.indexOf(best), 1);
  }
}

function pickPerkKeyForDrop() {
  const pool = Object.keys(PERKS).filter((k) => (tank.perks?.[k] || 0) <= 0);
  const list = pool.length ? pool : Object.keys(PERKS);

  // weights: artillery rarer, others roughly equal
  const weights = {
    invis: 1.0,
    shield: 1.0,
    medkit: 1.0,
    bigammo: 1.0,
    artillery: 0.6,
  };

  let sum = 0;
  for (const k of list) sum += weights[k] || 1;
  let r = Math.random() * sum;
  for (const k of list) {
    r -= weights[k] || 1;
    if (r <= 0) return k;
  }
  return list[0];
}
