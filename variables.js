let version = 'v. 0.0.0.4';
let adsToShow = 0;
let adQueue = [];

const learnedPerks = {};

let lastTimerUpdate = 0;
let timerSeconds = 180;
let timeButtonCooldown = 0;
let timeTrialActive = false;
let levelTimeLeft = 0;
let cooldownTimerInterval = null;
let levelEndCountdownActive = false;
let levelEndCountdownLeft = 0;
let levelEndCountdownLastTick = 0;
let chestPointersTimer = 0; // Таймер отображения стрелок
let findChestsUsedThisLevel = false; // Флаг использования на уровне

let ammoButtonCooldown = 0;
let cooldownInterval = null;

// Таблица рекордов (10 лучших результатов)
const RECORDS_KEY = 'tankBattle_records_v1';
let records = []; // массив из 10 лучших результатов (уровень + очки)
let currentScore = 0; // текущий счёт игрока за попытку

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const fpsDisplay = document.getElementById('fpsDisplay');

let firstTouchShown = false;
let tutorialDismissed = false; // чтобы не показывать повторно

// HUD элементы
const hpBarInner = document.getElementById('hpBarInner');
const hpValue = document.getElementById('hpValue');
const ammoBarInner = document.getElementById('ammoBarInner');
const ammoValue = document.getElementById('ammoValue');
const levelBarInner = document.getElementById('levelBarInner');
const levelValue = document.getElementById('levelValue');
const expBarInner = document.getElementById('expBarInner');
const expValue = document.getElementById('expValue');

// (2) Inline-значения справа от слов
const hpValueInline = document.getElementById('hpValueInline');
const ammoValueInline = document.getElementById('ammoValueInline');
const levelValueInline = document.getElementById('levelValueInline');
const expValueInline = document.getElementById('expValueInline');

// Панель врагов
const enemyPanel = document.getElementById('enemyPanel');

// (2) Модальное окно
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalText = document.getElementById('modalText');
const modalButtons = document.getElementById('modalButtons');

let mapWidth, mapHeight, screenWidth, screenHeight;
const worldObjects = [];
const destroyedDebris = [];
const decorElements = [];
const chests = [];
const mines = [];
const enemyTanks = []; // Враги
const craters = [];
const particles = [];
const grassTufts = [];
const damageNumbers = []; // Цифры урона/изменения опыта
let turrets = []; // новый массив турелей
let droppedLoot = [];
const tracks = []; // массив следов

//опыт, очки
const expBoss = [40, 10]; //босс
const expMob = [15, 4]; //моб
const expTurret = [20, 5]; //турель
const expChest = [-2, 1]; //сундуки
const expDecor = [2, 1]; //объекты
const expPerk = [20, 5]; //перки

let radiationCloud = null;
let radiationTimer = 0;
const RADIATION_SPAWN_CHANCE = 1; //0.001; // 0.1% шанс каждый кадр

let tank = {
  x: 0,
  y: 0,
  angle: -Math.PI / 2,
  speed: 0,
  maxSpeed: 1,
  waterSpeedMultiplier: 0.45,
  sandSpeedMultiplier: 0.75,
  dirtSpeedMultiplier: 0.65,
  rotationSpeed: 0.0155,
  width: 40,
  height: 30,
  radius: 18,
  hp: 100,
  maxHp: 100,
  vx: 0,
  vy: 0,
  bulletRange: 250,
  level: 1,
  exp: 0,
  expForNextLevel: 100,
  prevX: 0,
  prevY: 0,
};

let ammo = 20;
const baseRange = isMobile ? 180 : 250;
const maxAmmoDisplay = 20;
let maxAmmo = 20; // Базовый лимит
let waterEffectTimer = 0;
let gameLevel = 1; // Глобальный уровень игры
const baseHP = 100; //базовый уровень здоровья танка

let levelStartedEnemies = 0; // для панели и логики окончания уровня

const chestBase = 5; //базовое количесвто ящиков
const maxchestBase = 15; //макимальное количесвто ящиков
const baseWaterMin = isMobile ? 1 : 5; //базовое количесвто озер (min)
const baseWaterMax = isMobile ? 3 : 8; //базовое количесвто озер (max)
const baseSandMin = 1; //базовое количесвто песка (min)
const baseSandMax = isMobile ? 2 : 4; //базовое количесвто песка (max)
const baseDirt = isMobile ? 5 : 15; //базовое количество грязи
const baseObjects = isMobile ? 20 : 50; //базовое количесвто объектов (деревья, здания)
const baseMineRadiusMin = isMobile ? 6 : 12; //базовый радиус мины (min)
const baseMineRadiusAdv = isMobile ? 4 : 8; //дополнение к радиусу мины (max)
const baseMineDmg = 15; //базовый урон мины (min)
const baseTurretCount = 3; // уровень кратно кторомому появляется дополнитеьная турель
const baseEnemyHp = 35; //базовое здоровье врага
const baseTimerLevel = 10; //кратно уровню на прохождение по времени
const baseColdDownLevel = 10; // время до окончания уровня после выполнения заданий
const baseLevelGreet = 11; // уровень для вывода модалки поздравления

// (6) Пауза-меню
const menuBtn = document.getElementById('menuBtn');
const pauseOverlay = document.getElementById('pauseOverlay');
const continueBtn = document.getElementById('continueBtn');
const newGameBtn = document.getElementById('newGameBtn');
const closeGameBtn = document.getElementById('closeGameBtn');
const pauseLevel = document.getElementById('pauseLevel');
const pauseHp = document.getElementById('pauseHp');
const pauseAmmo = document.getElementById('pauseAmmo');
const pauseScore = document.getElementById('pauseScore');
let gamePaused = false;

const bullets = [];
const enemyBullets = [];
const enemyBaseRange = 300;
let bulletSpeed = 8;

let camera = { x: 0, y: 0 };

let modalOpen = false;
const keys = {};
let mouseX = 0,
  mouseY = 0;

function getBaseParam() {
  //получаем базовые параметры
  ammo = 20;
  tank.level = 1;
  tank.exp = 0;
  tank.expForNextLevel = getExpForLevel(1);
  tank.bulletRange = baseRange;
  gameLevel = 1;

  // ДОБАВИТЬ СБРОС ПЕРКОВ
  tank.perks = { invis: 0, shield: 0, artillery: 0, medkit: 0, bigammo: 0 };
  invisTimer = 0;
  shieldTimer = 0;
  artilleryCooldown = 0;

  tank.x = mapWidth * 0.5;
  tank.y = mapHeight * 0.95;
  camera = { x: tank.x - screenWidth / 2, y: tank.y - screenHeight / 2 };

  bullets.length = 0;
  enemyBullets.length = 0;

  restoreHpAccordingToLevel();
}

function getExpForLevel(level) {
  //асимптотический рост опыта: 150 + (level - 1) * 140
  return 150 + (level - 1) * 140;
}

function computeMaxHpForLevel(level) {
  //максимальное здоровье увеличивается на 5% за каждый уровень
  let mhp = baseHP;
  for (let l = 2; l <= level; l++) {
    mhp += Math.floor(mhp * 0.05);
  }
  return mhp;
}

function rollDamage(base) {
  //разброс урона от 0.75 до 1.25
  const m = 0.75 + Math.random() * 0.5; // 0.75..1.25
  return Math.max(1, Math.round(base * m));
}

function restoreHpAccordingToLevel(inload = false) {
  //восстанавливаем здоровье и максимальное здоровье в зависимости от уровня
  tank.maxHp = computeMaxHpForLevel(tank.level);
  if (gameLevel === 1) {
    if (!inload) tank.hp = tank.maxHp;
  } else {
    tank.hp += tank.maxHp / 3;
  }
}

function updateMaxAmmo() {
  //максимальное количество снарядов увеличивается на 1% за каждый уровень
  const growth = Math.pow(1.01, tank.level);
  maxAmmo = 20 + (growth - 1) * 20; // максимум +20 к базовым 20
  maxAmmo = Math.floor(maxAmmo);
  updateHUD();
}

function getEnemyCountForLevel(level) {
  //получаем количество врагов для уровня
  const base = 3;
  const extraBosses = Math.floor((level - 1) / 5); // Каждые 5 уровней +1 босс
  return base + Math.floor((level - 1) / 4) + extraBosses;
}

function getEnemyViewRadius(isBoss, level) {
  //получаем радиус обзора врага
  const base = isBoss ? 260 : 220;
  const mult = Math.pow(1.02, Math.max(0, level - 1)); // +2% за уровень от базового
  return base * mult;
}

function addScore(obj) {
  //добавление очков
  currentScore += obj[1];
}

function addExperience(obj) {
  //добавляем опыт
  tank.exp += obj[0];
  // (5) показать всплывающую цифру над игроком (при любом изменении)
  spawnExpNumber(tank.x, tank.y - 34, obj[0]);

  // не даём уходить в минус бесконечно (аккуратно)
  if (tank.exp < 0) tank.exp = 0;

  while (tank.exp >= tank.expForNextLevel) {
    tank.exp -= tank.expForNextLevel;
    tank.level++;
    tank.expForNextLevel = getExpForLevel(tank.level);

    const hpBonus = tank.maxHp * 0.05;
    tank.maxHp += Math.floor(hpBonus);
    tank.hp = tank.maxHp;
    tank.bulletRange *= 1.01;
  }

  addScore(obj);
  updateMaxAmmo();
}
