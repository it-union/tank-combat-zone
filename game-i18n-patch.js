// ========================================
// ПАТЧ ДЛЯ GAME.JS - ЛОКАЛИЗАЦИЯ И ШАРИНГ
// ========================================
// Этот код нужно добавить в начало game.js после всех деклараций переменных

// ==================== ФУНКЦИИ ЛОКАЛИЗАЦИИ ====================

// Функция обновления всех текстов интерфейса
function updateUILanguage() {
  // Обновляем title страницы
  document.title = t('gameTitle');

  // Обновляем кнопки
  document.getElementById('fullscreenBtn').title = t('fullscreen');
  document.getElementById('ammoButton').title = t('getAmmo');
  document.getElementById('addTimeButton').title = t('getTime');
  document.getElementById('findChestsButton').title = t('findChests');
  document.getElementById('soundToggleBtn').textContent = soundEnabled
    ? '🔊 ' + t('sound')
    : '🔇 ' + t('noSound');

  // Обновляем HUD метки (можно оставить иконки, они универсальны)
  // Если нужно обновить текст внутри HUD - раскомментируйте

  // Обновляем меню паузы
  document.querySelector('.pause-title').textContent = t('gameTitle');
  document.getElementById('continueBtn').textContent = t('resume');
  document.getElementById('newGameBtn').textContent = t('newGame');
  document.getElementById('recordsBtn').textContent = t('records');
  document.getElementById('howToPlayBtn').textContent = '📖 ' + t('howToPlay');
  document.getElementById('languageBtn').textContent = '🌐 ' + t('language');
  document.getElementById('closeGameBtn').textContent = t('exitGame');

  // Обновляем метки статистики в меню паузы
  document.getElementById('pauseLevelLabel').textContent = t('pauseLevel');
  document.getElementById('pauseHealthLabel').textContent = t('pauseHealth');
  document.getElementById('pauseShellsLabel').textContent = t('pauseShells');
  document.getElementById('pauseScoreLabel').textContent = t('pauseScore');

  // Обновляем подсказку по управлению
  const controls = document.getElementById('keyboardControls');
  if (controls) {
    controls.textContent = `WASD - ${t('controlsMove')} / Space - ${t('controlsFire')}`;
  }

  // Обновляем перки
  document.getElementById('perk_invis').title = t('invisibility');
  document.getElementById('perk_shield').title = t('shield');
  document.getElementById('perk_artillery').title = t('artillery');
  document.getElementById('perk_medkit').title = t('medkit');
  document.getElementById('perk_bigammo').title = t('bigAmmo');
}

// ==================== ФУНКЦИЯ ПОКАЗА РУКОВОДСТВА ====================

function showHowToPlayModal() {
  const guide = t('guide');

  const guideHTML = `
    <style>
      p { padding: 0; margin: 0; }
      h3 { padding: 0; margin: 0; }
    </style>
    <div style="text-align: left; max-height: 60vh; overflow-y: auto; padding: 10px;">
      <h3 style="color: #667eea; margin-top: 0;">${guide.objective}</h3>
      <p>${guide.objectiveText}</p>
      
      <h3 style="color: #667eea;">${guide.controls}</h3>
      <p><strong>${guide.controlsPc}</strong><br>
      ${guide.controlsPcWasd}<br>
      ${guide.controlsPcSpace}<br>
      ${guide.controlsPcEsc}</p>
      
      <p><strong>${guide.controlsMobile}</strong><br>
      ${guide.controlsMobileJoy}<br>
      ${guide.controlsMobileFire}<br>
      
      <h3 style="color: #667eea;">${guide.hud}</h3>
      <p>${guide.hudHp}<br>
      ${guide.hudAmmo}<br>
      ${guide.hudLevel}<br>
      ${guide.hudExp}</p>
      
      <h3 style="color: #667eea;">${guide.perks}</h3>
      <p>${guide.perkInvis}<br>
      ${guide.perkShield}<br>
      ${guide.perkArtillery}<br>
      ${guide.perkMedkit}<br>
      ${guide.perkBigAmmo}</p>
      
      <h3 style="color: #667eea;">${guide.enemies}</h3>
      <p>${guide.enemyTank}<br>
      ${guide.enemyBoss}<br>
      ${guide.enemyTurret}</p>
      
      <h3 style="color: #667eea;">${guide.objects}</h3>
      <p>${guide.objectChest}<br>
      ${guide.objectMine}<br>
      ${guide.objectWater}<br>
      ${guide.objectBuilding}<br>
      ${guide.objectTree}</p>
      
      <h3 style="color: #667eea;">${guide.tips}</h3>
      <p>${guide.tip1}<br>
      ${guide.tip2}<br>
      ${guide.tip3}<br>
      ${guide.tip4}<br>
      ${guide.tip5}<br>
      ${guide.tip6}</p>
      
      <h3 style="color: #667eea;">${guide.progression}</h3>
      <p>${guide.progLevel}<br>
      ${guide.progEnemies}<br>
      ${guide.progPerks}</p>
      
      <p style="text-align: center; font-size: 18px; margin-top: 20px;"><strong>${guide.goodLuck}</strong></p>
    </div>
  `;

  showModal({
    title: guide.title,
    message: '',
    buttons: [{ text: t('close'), variant: 'primary', onClick: () => {} }],
  });

  document.getElementById('modalText').innerHTML = guideHTML;
}

// ==================== ФУНКЦИИ ВЫБОРА ЯЗЫКА ====================

function showLanguageModal() {
  const languages = getAvailableLanguages();
  const current = getCurrentLanguage();

  let buttonsHTML = '<div class="language-selector">';
  for (const [code, name] of Object.entries(languages)) {
    const activeClass = code === current ? 'active' : '';
    buttonsHTML += `
      <button class="lang-btn ${activeClass}" onclick="changeLanguage('${code}')">
        <div style="margin: 0 0 2px 0;">${name}</div>
      </button>
    `;
  }
  buttonsHTML += '</div>';

  showModal({
    title: t('language'),
    message: '',
    buttons: [{ text: t('close'), variant: 'primary', onClick: () => {} }],
  });

  document.getElementById('modalText').innerHTML = buttonsHTML;
}

function changeLanguage(lang) {
  if (setLanguage(lang)) {
    updateUILanguage();
    updateHUD();
    closeModal();

    // Показываем подтверждение
    setTimeout(() => {
      showModal({
        title: '✓',
        message: t('language') + ': ' + getAvailableLanguages()[lang],
        buttons: [{ text: t('ok'), variant: 'primary' }],
      });
    }, 100);
  }
}

// ==================== ОБРАБОТЧИКИ СОБЫТИЙ ====================

// Добавляем обработчики для новых кнопок
document.getElementById('howToPlayBtn')?.addEventListener('click', () => {
  showHowToPlayModal();
});

document.getElementById('languageBtn')?.addEventListener('click', () => {
  showLanguageModal();
});

// Инициализация языка при загрузке
window.addEventListener('DOMContentLoaded', () => {
  updateUILanguage();
});

// Обновляем язык при первой загрузке
updateUILanguage();

console.log('i18n и sharing патч загружен успешно!');
