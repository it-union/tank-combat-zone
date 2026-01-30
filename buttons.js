document.getElementById('fullscreenBtn').addEventListener('click', () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

// Функции для управления расширенным состоянием кнопок рекламы
let expandedButton = null;
let collapseTimeout = null;

function expandButton(button, text) {
  // Сворачиваем предыдущую кнопку, если есть
  if (expandedButton && expandedButton !== button) {
    collapseButton(expandedButton);
  }

  // Очищаем таймер сворачивания
  if (collapseTimeout) {
    clearTimeout(collapseTimeout);
    collapseTimeout = null;
  }

  expandedButton = button;
  button.classList.add('expanded');
  button.classList.add('after-hide');

  // Добавляем текст, если его еще нет
  let textElement = button.querySelector('.button-text');
  if (!textElement) {
    textElement = document.createElement('span');
    textElement.className = 'button-text';
    button.appendChild(textElement);
  }
  textElement.textContent = text;

  // Устанавливаем таймер автоматического сворачивания через 5 секунд
  collapseTimeout = setTimeout(() => {
    collapseButton(button);
  }, 5000);
}

function collapseButton(button) {
  if (!button) return;

  button.classList.remove('expanded');
  button.classList.remove('after-hide');
  const textElement = button.querySelector('.button-text');
  if (textElement) {
    textElement.remove();
  }

  if (expandedButton === button) {
    expandedButton = null;
  }

  if (collapseTimeout) {
    clearTimeout(collapseTimeout);
    collapseTimeout = null;
  }
}

// Обработчик клика вне кнопок для сворачивания
document.addEventListener('click', (e) => {
  if (expandedButton && !expandedButton.contains(e.target)) {
    collapseButton(expandedButton);
  }
});

// Кнопка времени
const addTimeButton = document.getElementById('addTimeButton');
addTimeButton.addEventListener('click', async function (e) {
  e.preventDefault();
  e.stopPropagation();

  // Если кнопка уже расширена, выполняем действие
  if (this.classList.contains('expanded')) {
    if (timeButtonCooldown > 0 || this.disabled) {
      collapseButton(this);
      return;
    }

    collapseButton(this);
    this.disabled = true;
    modalOpen = true;
    gamePaused = true; // Ставим игру на паузу перед показом рекламы
    pauseAllSounds();

    // Показать рекламу
    const rewarded = await showAd(AD_REASONS.GET_TIME);

    if (rewarded || !yaSDK) {
      updateHUD();

      showModal({
        title: t('additionalTime'),
        message: t('additionalTimeText'),
        buttons: [{ text: t('ok'), variant: 'primary' }],
      });

      levelTimeLeft += 60;
      // Обновляем отображение
      const mins = Math.floor(levelTimeLeft / 60);
      const secs = Math.floor(levelTimeLeft % 60);
      document.getElementById('timerDisplay').textContent =
        `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

      // Установить кулдаун на 60 секунд
      timeButtonCooldown = 60;
      updateTimerButtonCooldown();

      // Таймер обратного отсчета
      cooldownTimerInterval = setInterval(() => {
        timeButtonCooldown--;
        updateTimerButtonCooldown();
        if (timeButtonCooldown <= 0) {
          clearInterval(cooldownTimerInterval);
          this.disabled = false;
        }
      }, 1000);
    } else {
      this.disabled = false;
      modalOpen = false;
      gamePaused = false; // Возобновляем игру после закрытия рекламы
      resumeAllSounds();
    }
  } else {
    // Если кнопка не расширена, расширяем её
    if (timeButtonCooldown > 0 || this.disabled) return;
    expandButton(this, t('timeForAd'));
  }
});

const findChestsButton = document.getElementById('findChestsButton');
findChestsButton.addEventListener('click', async function (e) {
  e.preventDefault();
  e.stopPropagation();

  // Если кнопка уже расширена, выполняем действие
  if (this.classList.contains('expanded')) {
    if (findChestsUsedThisLevel || gamePaused || modalOpen) {
      collapseButton(this);
      return;
    }

    collapseButton(this);
    modalOpen = true;
    gamePaused = true; // Ставим игру на паузу перед показом рекламы
    pauseAllSounds();
    const rewarded = await showAd(AD_REASONS.GET_LABEL); // Используем стандартный вызов рекламы

    if (rewarded || !yaSDK) {
      // Если реклама прошла или мы в режиме теста
      chestPointersTimer = 60 * 60; // 60 секунд при 60 FPS
      tank.hp += tank.maxHp * 0.33;
      findChestsUsedThisLevel = true;
      this.style.display = 'none'; // Скрываем до конца уровня

      showModal({
        title: t('sectorScouted'),
        message: t('sectorScoutedText'),
        buttons: [{ text: t('understood'), variant: 'primary' }],
      });
    } else {
      modalOpen = false;
      gamePaused = false; // Возобновляем игру после закрытия рекламы
      resumeAllSounds();
    }
  } else {
    // Если кнопка не расширена, расширяем её
    if (findChestsUsedThisLevel || gamePaused || modalOpen) return;
    expandButton(this, t('scoutingForAd'));
  }
});

document.getElementById('perk_invis')?.addEventListener('click', () => {
  if (!spendPerk('invis')) return;
  addExperience(expPerk);
  invisTimer = PERKS.invis.duration;
  updatePerkButtons();
  updatePerkHud();
});

document.getElementById('perk_shield')?.addEventListener('click', () => {
  if (!spendPerk('shield')) return;
  addExperience(expPerk);
  shieldTimer = PERKS.shield.duration;
  updatePerkButtons();
  updatePerkHud();
});

document.getElementById('perk_medkit')?.addEventListener('click', () => {
  if (!spendPerk('medkit')) return;
  addExperience(expPerk);
  tank.hp = tank.maxHp;
  updateHUD();
});

document.getElementById('perk_bigammo')?.addEventListener('click', () => {
  if (!spendPerk('bigammo')) return;
  addExperience(expPerk);
  ammo += 15;
  //ammo = Math.min(ammo, maxAmmo); // не больше лимита
  updateHUD();
});

document.getElementById('perk_artillery')?.addEventListener('click', () => {
  if (artilleryCooldown > 0) return;
  if (!spendPerk('artillery')) return;
  addExperience(expPerk);
  callArtilleryStrike();
  artilleryCooldown = 2 * 60; // 2 секунды страховка
  updatePerkButtons();
});

const ammoButton = document.getElementById('ammoButton');
ammoButton.addEventListener('click', async function (e) {
  e.preventDefault();
  e.stopPropagation();

  // Если кнопка уже расширена, выполняем действие
  if (this.classList.contains('expanded')) {
    if (ammoButtonCooldown > 0 || this.disabled) {
      collapseButton(this);
      return;
    }

    collapseButton(this);
    this.disabled = true;
    modalOpen = true;
    gamePaused = true; // Ставим игру на паузу перед показом рекламы
    pauseAllSounds();
    // Показать рекламу
    const rewarded = await showAd(AD_REASONS.GET_AMMO);

    if (rewarded || !yaSDK) {
      ammo += 10;
      updateHUD();

      showModal({
        title: t('ammunition'),
        message: t('ammunitionText', ammo),
        buttons: [{ text: t('letsGo'), variant: 'primary' }],
      });

      // Установить кулдаун на 60 секунд
      ammoButtonCooldown = 60;
      updateAmmoButtonCooldown();

      // Таймер обратного отсчета
      cooldownInterval = setInterval(() => {
        ammoButtonCooldown--;
        updateAmmoButtonCooldown();
        if (ammoButtonCooldown <= 0) {
          clearInterval(cooldownInterval);
          this.disabled = false;
        }
      }, 1000);
    } else {
      this.disabled = false;
      modalOpen = false;
      gamePaused = false; // Возобновляем игру после закрытия рекламы
      resumeAllSounds();
    }
  } else {
    // Если кнопка не расширена, расширяем её
    if (ammoButtonCooldown > 0 || this.disabled) return;
    expandButton(this, t('ammoForAd'));
  }
});

document.getElementById('recordsBtn').addEventListener('click', () => {
  let btn = [{ text: t('close'), variant: 'primary', onClick: () => {} }];
  if (records.length > 0) {
    btn.push({
      text: '🗑️',
      onClick: () => alertClear(),
    });
  }

  showModal({
    title: t('bestResults'),
    message: '',
    buttons: btn,
  });
  document.getElementById('modalText').innerHTML = getRecordsHTML();
});

document
  .getElementById('soundToggleBtn')
  .addEventListener('click', toggleSound);

document.addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (modalOpen) return;
  initAudio();
  keys[e.code] = true;
  if (
    [
      'KeyW',
      'KeyA',
      'KeyS',
      'KeyD',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'Space',
    ].includes(e.code)
  ) {
    e.preventDefault();
  }
  if (e.code === 'Space') {
    e.preventDefault();
    fireBullet();
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// (6) Меню паузы
menuBtn.addEventListener('click', () => {
  gamePaused = !gamePaused;
  pauseOverlay.classList.toggle('show', gamePaused);
  if (gamePaused) {
    pauseAllSounds();
    updatePauseStats();
  } else {
    resumeAllSounds();
  }
});

continueBtn.addEventListener('click', () => {
  gamePaused = false;
  pauseOverlay.classList.remove('show');
});

// привязать также клавишу ESC
document.addEventListener('keydown', (e) => {
  if (e.code === 'Escape') {
    e.preventDefault();
    if (modalOpen) return;
    menuBtn.click();
  }
});

newGameBtn.addEventListener('click', () => {
  gamePaused = false;
  pauseOverlay.classList.remove('show');
  startNewGame();
});

closeGameBtn.addEventListener('click', () => {
  clearSave(); // выход = очистка сохранения
  window.close(); // попробуем закрыть окно/вкладку
});

window.addEventListener('blur', () => {
  Object.keys(keys).forEach((key) => (keys[key] = false));
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    Object.keys(keys).forEach((key) => (keys[key] = false));
  }
});
