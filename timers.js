function updateLevelTimer() {
  if (gamePaused || modalOpen) return;

  // 1) Финальный отсчёт уровня (приоритетнее)
  if (levelEndCountdownActive) {
    const now = Math.floor(Date.now() / 1000);
    if (now !== levelEndCountdownLastTick) {
      levelEndCountdownLeft -= 1;
      levelEndCountdownLastTick = now;
      if (levelEndCountdownLeft < 0) levelEndCountdownLeft = 0;

      document.getElementById('timerDisplay').textContent =
        `00:${String(levelEndCountdownLeft).padStart(2, '0')}`;

      if (levelEndCountdownLeft <= 0) {
        levelEndCountdownActive = false;
        modalOpen = true;
        // показываем модалку перехода
        pauseAllSounds();
        updateHUD();

        // Формируем кнопки в зависимости от уровня
        const buttons = [];

        // Кнопка "Уровень заново" (не для первого уровня)
        if (gameLevel > 1) {
          buttons.push({
            text: t('restartLevel'),
            variant: '',
            onClick: () => restartCurrentLevel(),
          });
        }

        // Кнопка "Следующий уровень"
        buttons.push({
          text: t('nextLevel'),
          variant: 'primary',
          onClick: () => goToNextLevel(),
        });

        showModal({
          title: t('levelPassed'),
          message: t('tasksComplete'),
          buttons: buttons,
        });
      }
    }
    return;
  }

  // 2) Обычный таймер срочной миссии
  if (!timeTrialActive) return;

  const now = Math.floor(Date.now() / 1000);

  if (now !== lastTimerUpdate) {
    levelTimeLeft -= 1;
    lastTimerUpdate = now;

    if (levelTimeLeft < 0) levelTimeLeft = 0;

    const mins = Math.floor(levelTimeLeft / 60);
    const secs = Math.floor(levelTimeLeft % 60);

    document.getElementById('timerDisplay').textContent =
      `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    if (levelTimeLeft <= 0) {
      tank.hp = 0;
      timeTrialActive = false; // ← ОСТАНОВИТЬ ТАЙМЕР!
    }
  }
}

function startLevelTimer() {
  // Только для уровней, кратных 10
  if (gameLevel % baseTimerLevel === 0) {
    timeTrialActive = true;
    levelTimeLeft = 180;
    document.getElementById('timerHud').style.display = 'flex';
    document.getElementById('addTimeButton').style.display = 'flex';

    showModal({
      title: t('urgentMission'),
      message: t('urgentMissionText', gameLevel),
      buttons: [{ text: t('accepted'), variant: 'primary' }],
    });
  } else {
    // Для обычных уровней скрываем таймер
    timeTrialActive = false;
    document.getElementById('timerHud').style.display = 'none';
    document.getElementById('addTimeButton').style.display = 'none';
  }
}

function startLevelEndCountdown(seconds = 10) {
  levelEndCountdownActive = true;
  levelEndCountdownLeft = seconds;
  levelEndCountdownLastTick = Math.floor(Date.now() / 1000);

  // показываем верхний таймер-худ даже на обычных уровнях
  document.getElementById('timerHud').style.display = 'flex';
  document.getElementById('addTimeButton').style.display = 'none';

  document.getElementById('timerDisplay').textContent =
    `00:${String(levelEndCountdownLeft).padStart(2, '0')}`;
}

function stopLevelEndCountdown() {
  levelEndCountdownActive = false;
  levelEndCountdownLeft = 0;
}

function updateTimerButtonCooldown() {
  const btn = document.getElementById('addTimeButton');
  if (timeButtonCooldown > 0) {
    btn.title = t('getTime');
    btn.style.opacity = '0.5';
    btn.style.background = 'radial-gradient(circle, #777, #555)';
  } else {
    btn.title = t('getTime');
    btn.style.opacity = '0.8';
    btn.style.background = '';
  }
}

function resetFindChestsButton() {
  findChestsUsedThisLevel = false;
  document.getElementById('findChestsButton').style.display = 'flex';
}

function updateAmmoButtonCooldown() {
  const btn = document.getElementById('ammoButton');
  if (ammoButtonCooldown > 0) {
    btn.title = t('getAmmo');
    btn.style.opacity = '0.5';
    btn.style.background = 'radial-gradient(circle, #777, #555)';
  } else {
    btn.title = t('getAmmo');
    btn.style.opacity = '0.8';
    btn.style.background = '';
  }
}

function formatMMSS(totalSec) {
  totalSec = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function updatePerkHud() {
  const hud = document.getElementById('perkHud');
  const icon = document.getElementById('perkHudIcon');
  const timer = document.getElementById('perkHudTimer');

  // показываем только один активный “длительный” перк (у вас это invis/shield)
  if (invisTimer > 0) {
    hud.style.display = 'flex';
    icon.textContent = '👤';
    timer.textContent = formatMMSS(invisTimer / 60);
    return;
  }
  if (shieldTimer > 0) {
    hud.style.display = 'flex';
    icon.textContent = '🛡️';
    timer.textContent = formatMMSS(shieldTimer / 60);
    return;
  }

  hud.style.display = 'none';
}
