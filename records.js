/**
 * СИСТЕМА СОХРАНЕНИЙ И РЕКОРДОВ
 *
 * В игре используется 2 независимые системы:
 *
 * 1. СОХРАНЕНИЕ ПРОГРЕССА (SAVE_KEY):
 *    - Сохраняет текущий прогресс игры (уровень танка, опыт, патроны, перки)
 *    - Записывается при переходе на следующий уровень
 *    - Записывается при поражении (для возможности продолжить с предыдущего уровня)
 *    - Удаляется при создании новой игры (clearSave)
 *
 * 2. ТАБЛИЦА РЕКОРДОВ (RECORDS_KEY):
 *    - Хранит топ-10 лучших результатов игрока за все время
 *    - Записывается ТОЛЬКО при поражении (addRecord с isDefeat=true)
 *    - НЕ удаляется при создании новой игры!
 *    - Может быть очищена только вручную через настройки (clearRecords)
 */

// (1) SAVE/LOAD
const SAVE_KEY = 'tankBattle_save_v1';

function buildSaveData() {
  return {
    version: 1,
    score: currentScore,
    savedAt: Date.now(),
    tankLevel: tank.level,
    tankExp: tank.exp,
    tankExpForNextLevel: tank.expForNextLevel,
    gameLevel: gameLevel, // Текущий уровень игры
    ammo: ammo,
    tankHP: tank.hp,
    perks: tank.perks || {}, // на будущее; если перков пока нет — будет []
  };
}

// Инициализация таблицы рекордов
function initRecords() {
  try {
    const saved = localStorage.getItem(RECORDS_KEY);
    if (saved) {
      records = JSON.parse(saved);
      // проверяем валидность (только положительные числа)
      records = records.filter(
        (r) =>
          r &&
          Number.isFinite(r.level) &&
          r.level > 0 &&
          Number.isFinite(r.score) &&
          r.score >= 0,
      );
      // убираем дубликаты и сортируем по убыванию (лучшие сверху)
      records = records
        .sort((a, b) => b.score - a.score || b.level - a.level)
        .slice(0, 10);
    }
  } catch (e) {
    records = [];
  }
}

// Добавление нового рекорда (если попал в топ-10)
// isDefeat = true означает, что игра закончилась поражением (только тогда сохраняем в рекорды)
function addRecord(level, isDefeat = false) {
  currentScore = currentScore; // Автоматический расчет итогового счета
  const score = Math.floor(currentScore);

  console.log(
    `Попытка рекорда: Уровень ${level}, Счёт ${score}, Поражение: ${isDefeat}`,
  ); // Для отладки

  // Записываем в таблицу рекордов ТОЛЬКО при поражении
  if (!isDefeat) {
    console.log(
      'Переход на следующий уровень - запись в таблицу рекордов пропущена',
    );
    return false;
  }

  // Форматируем дату с временем (дата + часы:минуты)
  const now = new Date();
  const dateStr = now.toLocaleDateString('ru-RU');
  const timeStr = now.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const dateTime = `${dateStr} ${timeStr}`;

  // Проверяем, попадает ли новый результат в топ-10
  const newRecord = { level, score, date: dateTime };

  records.push(newRecord);
  records.sort((a, b) => b.score - a.score || b.level - a.level);
  records = records.slice(0, 10);

  // Сохраняем в localStorage
  try {
    localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    console.log('Рекорды сохранены:', records); // Отладка
  } catch (e) {
    console.error('Ошибка сохранения рекордов:', e);
  }

  return score > (records[9]?.score || 0);
}

// Очистка рекордов (только для кнопки "Очистить рекорды" в настройках, НЕ при новой игре!)
function clearRecords() {
  records = [];
  try {
    localStorage.removeItem(RECORDS_KEY);
  } catch (e) {}
}

function alertClear() {
  showModal({
    title: '📜 ➤ 🗑️',
    message: '',
    buttons: [
      { text: '✔', variant: 'danger', onClick: () => clearRecords() },
      { text: '✖', variant: 'primary', onClick: () => {} },
    ],
  });
}

function applySaveData(data) {
  //console.log('#1', data);
  currentScore = data.score || 0;
  tank.level = Number(data.tankLevel) || 1;
  tank.exp = Number(data.tankExp) || 0;
  tank.expForNextLevel =
    Number(data.tankExpForNextLevel) || getExpForLevel(tank.level);
  tank.hp = Math.floor(Number(data.tankHP));

  gameLevel = Number(data.gameLevel) || 1; // Восстанавливаем уровень игры

  ammo = Number(data.ammo);
  if (!Number.isFinite(ammo) || ammo < 0) ammo = 30;

  tank.perks =
    data.perks && typeof data.perks === 'object'
      ? data.perks
      : { invis: 0, shield: 0, artillery: 0, medkit: 0, bigammo: 0 };
  // гарантируем ключи
  for (const k of Object.keys(PERKS)) {
    if (!Number.isFinite(tank.perks[k])) tank.perks[k] = 0;
    tank.perks[k] = Math.min(1, Math.max(0, tank.perks[k])); // максимум 1 каждого
  }
  updatePerkButtons();
  // согласуем производные параметры уровня
  tank.bulletRange = baseRange * Math.pow(1.01, Math.max(0, tank.level - 1)); // чтобы дальность не "сбрасывалась"
  restoreHpAccordingToLevel(true);
}

function hasSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    //return !!data && data.version === 1;
    if (!!data && data.version === 1) return data.gameLevel;
  } catch (e) {
    //return false;
    return 0;
  }
}

function loadGame() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;
  const data = JSON.parse(raw);
  applySaveData(data);
  return true;
}

function getRecordsHTML() {
  if (records.length === 0)
    return `<p style="text-align:center;opacity:0.8;">${t('noRecords')}</p>`;

  let html = `<table class="record-table"><thead><tr><th>${t('number')}</th><th>${t('date')}</th><th>${t('level')}</th><th>${t('score')}</th></tr></thead><tbody>`;
  records.forEach((rec, index) => {
    const isCurrent =
      rec.level === tank.level &&
      Math.abs(rec.score - (currentScore + tank.level * 100)) < 10;
    const rowClass = isCurrent ? 'record-row-highlight' : '';
    const medal =
      index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';

    html += `<tr class="${rowClass}">
          <td>${medal} ${index + 1}</td>
          <td>${rec.date}</td>
          <td>${rec.level}</td>
          <td><strong>${rec.score}</strong></td>
      </tr>`;
  });
  html += '</tbody></table>';
  return html;
}

function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(buildSaveData()));
  } catch (e) {
    // молча: может быть запрещён storage
  }
}

function clearSave() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (e) {}
}
