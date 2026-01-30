// Система локализации для игры "Танк: Боевая зона"

const translations = {
  ru: {
    // Название игры
    gameTitle: 'ТАНК: БОЕВАЯ ЗОНА',

    // Кнопки управления
    fullscreen: 'Полноэкранный',
    menu: 'Меню',
    getAmmo: 'Получить 10 снарядов',
    getTime: 'Получить 60 секунд',
    findChests: 'Найти сундуки',
    sound: 'Звук',
    noSound: 'Без звука',
    // Тексты для расширенных кнопок рекламы
    ammoForAd: 'патроны за рекламу',
    timeForAd: 'время за рекламу',
    scoutingForAd: 'разведка за рекламу',

    // HUD
    hp: 'ХП',
    ammo: 'ПАТРОНЫ',
    level: 'УРОВЕНЬ',
    exp: 'ОПЫТ',
    enemies: 'ВРАГИ',
    chests: 'ЯЩИКИ',
    levelWord: 'УРОВЕНЬ',
    enemiesCount: (current, total) => `ВРАГИ: ${current} / ${total}`,
    chestsCount: (current, total) => `ЯЩИКИ: ${current} / ${total}`,

    // Перки
    invisibility: 'Невидимость',
    shield: 'Щит',
    artillery: 'Артиллерия',
    medkit: 'Большая аптечка',
    bigAmmo: 'Большой боекомплект',

    // Модальные окна
    levelPassed: 'УРОВЕНЬ ПРОЙДЕН',
    tasksComplete: 'Задачи выполнены.\nПерейти на следующий уровень?',
    nextLevel: 'Следующий уровень',
    restartLevel: '🔄 Уровень заново',
    urgentMission: '⏰ СРОЧНАЯ МИССИЯ!',
    urgentMissionText: (level) =>
      `Уровень №${level}: 3 МИНУТЫ НА ЗАЧИСТКУ!\nИначе прилетит авиация.`,
    accepted: 'ПРИНЯТО!',
    additionalTime: '💥 Дополнительное время!',
    additionalTimeText: '+60 секунд!',
    ok: 'Хорошо!',
    sectorScouted: '🔭 СЕКТОР РАЗВЕДАН',
    sectorScoutedText: 'Направления к сундукам будут видны 20 секунд!',
    understood: 'Понял!',
    ammunition: '💥 БОЕПРИПАСЫ!',
    ammunitionText: (ammo) => `+10 снарядов!\nБоезапас: ${ammo}`,
    letsGo: 'Поехали!',
    perkFound: 'ПЕРК НАЙДЕН',
    perkFoundText: (name) =>
      `Получен перк: ${name}\nМожно применить кнопкой справа.`,
    bestResults: 'ЛУЧШИЕ РЕЗУЛЬТАТЫ',
    close: 'Закрыть',
    noRecords: 'Рекордов пока нет. Будь первым!',
    number: '№',
    date: 'Дата',
    score: 'Счёт',
    tankDestroyed: 'ТАНК УНИЧТОЖЕН!',
    yourScore: (score) => `Ваш итоговый счёт: ${score}\n\nТАБЛИЦА РЕКОРДОВ:\n`,
    continue: 'Продолжить',
    newGame: 'Новая игра',
    timeOut: '💥 ВРЕМЯ ВЫШЛО!',
    timeOutText: 'Авиаудар уничтожил сектор!',
    newLevel: 'НОВЫЙ УРОВЕНЬ',
    greatWarrior: '🎉 ВЕЛИКИЙ ВОИН! 🎉',
    greatWarriorText: (level) =>
      `Вы достигли ${level} уровня!\nВаше имя будет вписано в историю танковых сражений!`,
    continueBtn: 'Продолжить',
    game: 'ИГРА',
    saveFound: (level) =>
      `Найдено сохранение. Уровень: ${level}\nПродолжить или начать новую игру?`,

    // Меню паузы
    pauseMenu: 'ПАУЗА',
    stats: 'Статистика',
    settings: 'Настройки',
    language: 'Язык',
    howToPlay: 'Описание игры',
    exitGame: 'Выход',
    resume: 'Продолжить',
    pauseLevel: 'Уровень:',
    pauseHealth: 'Жизнь:',
    pauseShells: 'Снаряды:',
    pauseScore: 'Счет:',

    // Туториал
    controlsMove: 'Движение',
    controlsFire: 'Огонь',

    // Другое
    radiation: '☢ РАДИАЦИЯ',
    mine: 'МИНА',
    boss: 'БОСС',
    records: 'Рекорды',

    // Уровни качества производительности
    qualityNames: ['НИЗКОЕ', 'СРЕДНЕЕ', 'ВЫСОКОЕ'],

    // Руководство
    guide: {
      title: 'КАК ИГРАТЬ',
      objective: '🎯 ЦЕЛЬ ИГРЫ',
      objectiveText:
        'Уничтожайте вражеские танки, собирайте сундуки с ресурсами и повышайте свой уровень. Каждый 10-й уровень - срочная миссия с ограниченным временем!',

      controls: '🎮 УПРАВЛЕНИЕ',
      controlsPc: '💻 На ПК:',
      controlsPcWasd: '• WASD - Движение танка',
      controlsPcSpace: '• Пробел - Выстрел',
      controlsPcEsc: '• ESC - Меню паузы',

      controlsMobile: '📱 На мобильных:',
      controlsMobileJoy: '• Джойстик (слева) - Движение',
      controlsMobileFire: '• Кнопка огня (справа) - Выстрел',

      hud: '📊 ИНТЕРФЕЙС',
      hudHp: '❤️ Здоровье - Ваши очки жизни',
      hudAmmo: '🔫 Патроны - Боезапас для стрельбы',
      hudLevel: '⭐ Уровень - Ваш прогресс',
      hudExp: '✨ Опыт - До следующего уровня',

      perks: '🎁 ПЕРКИ (УСИЛЕНИЯ)',
      perkInvis: '👤 Невидимость - Враги не видят вас 20 сек',
      perkShield: '🛡️ Щит - Неуязвимость 20 секунд',
      perkArtillery: '🚀 Артиллерия - Мощный удар по врагу (x5 урон)',
      perkMedkit: '➕ Аптечка - Восстанавливает здоровье полностью',
      perkBigAmmo: '📦 Боекомплект - Добавляет 20 снарядов',

      enemies: '👾 ВРАГИ',
      enemyTank: '🔴 Обычные танки - Стреляют с расстояния',
      enemyBoss: '💀 БОССЫ - Больше HP, точнее стреляют',
      enemyTurret: '🏰 Турели - Неподвижны, но опасны',

      objects: '🗺️ ОБЪЕКТЫ НА КАРТЕ',
      objectChest: '📦 Сундуки - Содержат патроны, здоровье или перки',
      objectMine: '💣 Мины - Взрываются при касании',
      objectWater: '💧 Вода - Замедляет движение и наносит урон',
      objectBuilding: '🏢 Здания - Можно разрушить выстрелами',
      objectTree: '🌲 Деревья - Разрушаемые препятствия',

      tips: '💡 СОВЕТЫ',
      tip1: '• Собирайте ящики с патронами - они восстанавливаются',
      tip2: '• Берегите здоровье - избегайте столкновений',
      tip3: '• Используйте укрытия (деревья, здания)',
      tip4: '• Боссы появляются на каждом уровне',
      tip5: '• Каждый 10-й уровень - срочная миссия',
      tip6: '• Смотрите рекламу для бонусов (патроны, время, жизнь)',

      progression: '📈 ПРОГРЕССИЯ',
      progLevel: '• С уровнем растут: здоровье, дальность стрельбы',
      progEnemies: '• Враги становятся сильнее и точнее',
      progPerks: '• Перки находятся в сундуках (редко)',

      goodLuck: '🎮 Удачи на поле боя, командир!',
    },
  },

  en: {
    gameTitle: 'TANK: COMBAT ZONE',

    fullscreen: 'Fullscreen',
    menu: 'Menu',
    getAmmo: 'Get 10 shells',
    getTime: 'Get 60 seconds',
    findChests: 'Find chests',
    sound: 'Sound',
    noSound: 'No sound',
    // Тексты для расширенных кнопок рекламы
    ammoForAd: 'ammo for ad',
    timeForAd: 'time for ad',
    scoutingForAd: 'scouting for ad',

    hp: 'HP',
    ammo: 'AMMO',
    level: 'LEVEL',
    exp: 'EXP',
    enemies: 'ENEMIES',
    chests: 'CHESTS',
    levelWord: 'LEVEL',
    enemiesCount: (current, total) => `ENEMIES: ${current} / ${total}`,
    chestsCount: (current, total) => `CHESTS: ${current} / ${total}`,

    invisibility: 'Invisibility',
    shield: 'Shield',
    artillery: 'Artillery',
    medkit: 'Large Medkit',
    bigAmmo: 'Big Ammo Pack',

    levelPassed: 'LEVEL PASSED',
    tasksComplete: 'Tasks complete.\nProceed to next level?',
    nextLevel: 'Next Level',
    restartLevel: '🔄 Restart Level',
    urgentMission: '⏰ URGENT MISSION!',
    urgentMissionText: (level) =>
      `Level #${level}: 3 MINUTES TO CLEAR!\nOr airstrikes will come.`,
    accepted: 'ACCEPTED!',
    additionalTime: '💥 Additional Time!',
    additionalTimeText: '+60 seconds!',
    ok: 'OK!',
    sectorScouted: '🔭 SECTOR SCOUTED',
    sectorScoutedText: 'Chest directions visible for 20 seconds!',
    understood: 'Got it!',
    ammunition: '💥 AMMUNITION!',
    ammunitionText: (ammo) => `+10 shells!\nAmmo: ${ammo}`,
    letsGo: "Let's go!",
    perkFound: 'PERK FOUND',
    perkFoundText: (name) => `Got perk: ${name}\nUse the button on the right.`,
    bestResults: 'HIGH SCORES',
    close: 'Close',
    noRecords: 'No records yet. Be the first!',
    number: '#',
    date: 'Date',
    score: 'Score',
    tankDestroyed: 'TANK DESTROYED!',
    yourScore: (score) => `Your final score: ${score}\n\nHIGH SCORES:\n`,
    continue: 'Continue',
    newGame: 'New Game',
    timeOut: '💥 TIME OUT!',
    timeOutText: 'Airstrike destroyed the sector!',
    newLevel: 'NEW LEVEL',
    greatWarrior: '🎉 GREAT WARRIOR! 🎉',
    greatWarriorText: (level) =>
      `You reached level ${level}!\nYour name will be written in tank battle history!`,
    continueBtn: 'Continue',
    game: 'GAME',
    saveFound: (level) =>
      `Save found. Level: ${level}\nContinue or start new game?`,

    pauseMenu: 'PAUSE',
    stats: 'Statistics',
    settings: 'Settings',
    language: 'Language',
    howToPlay: 'How to Play',
    exitGame: 'Exit',
    resume: 'Resume',
    pauseLevel: 'Level:',
    pauseHealth: 'Health:',
    pauseShells: 'Shells:',
    pauseScore: 'Score:',

    controlsMove: 'Move',
    controlsFire: 'Fire',

    radiation: '☢ RADIATION',
    mine: 'MINE',
    boss: 'BOSS',
    records: 'Records',

    // Уровни качества производительности
    qualityNames: ['LOW', 'MEDIUM', 'HIGH'],

    guide: {
      title: 'HOW TO PLAY',
      objective: '🎯 OBJECTIVE',
      objectiveText:
        'Destroy enemy tanks, collect chests with resources and level up. Every 10th level is an urgent mission with limited time!',

      controls: '🎮 CONTROLS',
      controlsPc: '💻 On PC:',
      controlsPcWasd: '• WASD - Tank movement',
      controlsPcSpace: '• Space - Shoot',
      controlsPcEsc: '• ESC - Pause menu',

      controlsMobile: '📱 On Mobile:',
      controlsMobileJoy: '• Joystick (left) - Movement',
      controlsMobileFire: '• Fire button (right) - Shoot',

      hud: '📊 HUD',
      hudHp: '❤️ Health - Your hit points',
      hudAmmo: '🔫 Ammo - Shells for shooting',
      hudLevel: '⭐ Level - Your progress',
      hudExp: '✨ EXP - Until next level',

      perks: '🎁 PERKS (POWER-UPS)',
      perkInvis: "👤 Invisibility - Enemies don't see you for 20 sec",
      perkShield: '🛡️ Shield - Invulnerability for 20 seconds',
      perkArtillery: '🚀 Artillery - Powerful strike (x5 damage)',
      perkMedkit: '➕ Medkit - Fully restores health',
      perkBigAmmo: '📦 Ammo Pack - Adds 20 shells',

      enemies: '👾 ENEMIES',
      enemyTank: '🔴 Regular tanks - Shoot from distance',
      enemyBoss: '💀 BOSSES - More HP, better aim',
      enemyTurret: '🏰 Turrets - Stationary but dangerous',

      objects: '🗺️ MAP OBJECTS',
      objectChest: '📦 Chests - Contain ammo, health or perks',
      objectMine: '💣 Mines - Explode on contact',
      objectWater: '💧 Water - Slows movement and deals damage',
      objectBuilding: '🏢 Buildings - Can be destroyed',
      objectTree: '🌲 Trees - Destructible obstacles',

      tips: '💡 TIPS',
      tip1: '• Collect ammo crates - they respawn',
      tip2: '• Save your health - avoid collisions',
      tip3: '• Use cover (trees, buildings)',
      tip4: '• Bosses spawn on every level',
      tip5: '• Every 10th level is urgent mission',
      tip6: '• Watch ads for bonuses (ammo, time, hp)',

      progression: '📈 PROGRESSION',
      progLevel: '• With level increases: health, shooting range',
      progEnemies: '• Enemies become stronger and more accurate',
      progPerks: '• Perks found in chests (rare)',

      goodLuck: '🎮 Good luck on the battlefield, commander!',
    },
  },

  de: {
    gameTitle: 'PANZER: KAMPFZONE',

    fullscreen: 'Vollbild',
    menu: 'Menü',
    getAmmo: '10 Granaten holen',
    getTime: '60 Sekunden holen',
    findChests: 'Kisten finden',
    sound: 'Ton',
    noSound: 'Kein Ton',
    // Тексты для расширенных кнопок рекламы
    ammoForAd: 'Munition für Werbung',
    timeForAd: 'Zeit für Werbung',
    scoutingForAd: 'Aufklärung für Werbung',

    hp: 'LP',
    ammo: 'MUNITION',
    level: 'STUFE',
    exp: 'ERF',
    enemies: 'FEINDE',
    chests: 'KISTEN',
    levelWord: 'STUFE',
    enemiesCount: (current, total) => `FEINDE: ${current} / ${total}`,
    chestsCount: (current, total) => `KISTEN: ${current} / ${total}`,

    invisibility: 'Unsichtbarkeit',
    shield: 'Schild',
    artillery: 'Artillerie',
    medkit: 'Großes Medikit',
    bigAmmo: 'Große Munitionspackung',

    levelPassed: 'STUFE BESTANDEN',
    tasksComplete: 'Aufgaben erledigt.\nZur nächsten Stufe?',
    nextLevel: 'Nächste Stufe',
    restartLevel: '🔄 Stufe neu starten',
    urgentMission: '⏰ DRINGENDE MISSION!',
    urgentMissionText: (level) =>
      `Stufe #${level}: 3 MINUTEN ZUM RÄUMEN!\nSonst kommen Luftangriffe.`,
    accepted: 'AKZEPTIERT!',
    additionalTime: '💥 Zusätzliche Zeit!',
    additionalTimeText: '+60 Sekunden!',
    ok: 'OK!',
    sectorScouted: '🔭 SEKTOR ERKUNDET',
    sectorScoutedText: 'Kistenrichtungen 20 Sekunden sichtbar!',
    understood: 'Verstanden!',
    ammunition: '💥 MUNITION!',
    ammunitionText: (ammo) => `+10 Granaten!\nMunition: ${ammo}`,
    letsGo: "Los geht's!",
    perkFound: 'VORTEIL GEFUNDEN',
    perkFoundText: (name) =>
      `Vorteil erhalten: ${name}\nNutze die Taste rechts.`,
    bestResults: 'BESTENLISTE',
    close: 'Schließen',
    noRecords: 'Noch keine Rekorde. Sei der Erste!',
    number: '#',
    date: 'Datum',
    score: 'Punktzahl',
    tankDestroyed: 'PANZER ZERSTÖRT!',
    yourScore: (score) => `Deine Endpunktzahl: ${score}\n\nBESTENLISTE:\n`,
    continue: 'Weiter',
    newGame: 'Neues Spiel',
    timeOut: '💥 ZEIT ABGELAUFEN!',
    timeOutText: 'Luftangriff zerstörte den Sektor!',
    newLevel: 'NEUE STUFE',
    greatWarrior: '🎉 GROSSER KRIEGER! 🎉',
    greatWarriorText: (level) =>
      `Du hast Stufe ${level} erreicht!\nDein Name wird in die Geschichte eingehen!`,
    continueBtn: 'Weiter',
    game: 'SPIEL',
    saveFound: (level) =>
      `Speicherstand gefunden. Stufe: ${level}\nFortsetzen oder neu starten?`,

    pauseMenu: 'PAUSE',
    stats: 'Statistiken',
    settings: 'Einstellungen',
    language: 'Sprache',
    howToPlay: 'Spielanleitung',
    exitGame: 'Beenden',
    resume: 'Fortsetzen',
    pauseLevel: 'Stufe:',
    pauseHealth: 'Leben:',
    pauseShells: 'Granaten:',
    pauseScore: 'Punktzahl:',

    controlsMove: 'Bewegen',
    controlsFire: 'Feuer',

    radiation: '☢ STRAHLUNG',
    mine: 'MINE',
    boss: 'BOSS',
    records: 'Rekorde',

    // Уровни качества производительности
    qualityNames: ['NIEDRIG', 'MITTEL', 'HOCH'],

    guide: {
      title: 'SPIELANLEITUNG',
      objective: '🎯 ZIEL',
      objectiveText:
        'Zerstöre feindliche Panzer, sammle Kisten mit Ressourcen und steige auf. Jede 10. Stufe ist eine dringende Mission mit begrenzter Zeit!',
      controls: '🎮 STEUERUNG',
      controlsPc: '💻 Am PC:',
      controlsPcWasd: '• WASD - Panzerbewegung',
      controlsPcSpace: '• Leertaste - Schießen',
      controlsPcEsc: '• ESC - Pausenmenü',
      controlsMobile: '📱 Auf Mobilgeräten:',
      controlsMobileJoy: '• Joystick (links) - Bewegung',
      controlsMobileFire: '• Feuertaste (rechts) - Schießen',

      hud: '📊 OBERFLÄCHE',
      hudHp: '❤️ Gesundheit - Deine Lebenspunkte',
      hudAmmo: '🔫 Munition - Granaten zum Schießen',
      hudLevel: '⭐ Stufe - Dein Fortschritt',
      hudExp: '✨ Erfahrung - Bis zur nächsten Stufe',
      perks: '🎁 VORTEILE',
      perkInvis: '👤 Unsichtbarkeit - Feinde sehen dich 20 Sek. nicht',
      perkShield: '🛡️ Schild - Unverwundbarkeit 20 Sekunden',
      perkArtillery: '🚀 Artillerie - Mächtiger Schlag (x5 Schaden)',
      perkMedkit: '➕ Medikit - Stellt Gesundheit voll wieder her',
      perkBigAmmo: '📦 Munitionspaket - Fügt 20 Granaten hinzu',
      enemies: '👾 FEINDE',
      enemyTank: '🔴 Normale Panzer - Schießen aus der Ferne',
      enemyBoss: '💀 BOSSE - Mehr LP, besseres Zielen',
      enemyTurret: '🏰 Türme - Stationär aber gefährlich',
      objects: '🗺️ KARTENOBJEKTE',
      objectChest: '📦 Kisten - Enthalten Munition, Gesundheit oder Vorteile',
      objectMine: '💣 Minen - Explodieren bei Kontakt',
      objectWater: '💧 Wasser - Verlangsamt Bewegung und verursacht Schaden',
      objectBuilding: '🏢 Gebäude - Können zerstört werden',
      objectTree: '🌲 Bäume - Zerstörbare Hindernisse',
      tips: '💡 TIPPS',
      tip1: '• Sammle Munitionskisten - sie erscheinen wieder',
      tip2: '• Spare deine Gesundheit - vermeide Kollisionen',
      tip3: '• Nutze Deckung (Bäume, Gebäude)',
      tip4: '• Bosse erscheinen auf jeder Stufe',
      tip5: '• Jede 10. Stufe ist dringende Mission',
      tip6: '• Sieh dir Werbung für Boni an (Munition, Zeit, Gesundheit)',
      progression: '📈 FORTSCHRITT',
      progLevel: '• Mit Stufe steigen: Gesundheit, Schussreichweite',
      progEnemies: '• Feinde werden stärker und genauer',
      progPerks: '• Vorteile in Kisten gefunden (selten)',
      goodLuck: '🎮 Viel Glück auf dem Schlachtfeld, Kommandant!',
    },
  },

  es: {
    gameTitle: 'TANQUE: ZONA DE BATALLA',

    fullscreen: 'Pantalla completa',
    menu: 'Menú',
    getAmmo: 'Obtener 10 proyectiles',
    getTime: 'Obtener 60 segundos',
    findChests: 'Encontrar cofres',
    sound: 'Sonido',
    noSound: 'Sin sonido',
    // Тексты для расширенных кнопок рекламы
    ammoForAd: 'munición por anuncio',
    timeForAd: 'tiempo por anuncio',
    scoutingForAd: 'exploración por anuncio',

    hp: 'PV',
    ammo: 'MUNICIÓN',
    level: 'NIVEL',
    exp: 'EXP',
    enemies: 'ENEMIGOS',
    chests: 'COFRES',
    levelWord: 'NIVEL',
    enemiesCount: (current, total) => `ENEMIGOS: ${current} / ${total}`,
    chestsCount: (current, total) => `COFRES: ${current} / ${total}`,

    invisibility: 'Invisibilidad',
    shield: 'Escudo',
    artillery: 'Artillería',
    medkit: 'Botiquín Grande',
    bigAmmo: 'Munición Grande',

    levelPassed: 'NIVEL SUPERADO',
    tasksComplete: 'Tareas completadas.\n¿Ir al siguiente nivel?',
    nextLevel: 'Siguiente Nivel',
    restartLevel: '🔄 Reiniciar Nivel',
    urgentMission: '⏰ ¡MISIÓN URGENTE!',
    urgentMissionText: (level) =>
      `Nivel #${level}: ¡3 MINUTOS PARA DESPEJAR!\nO vendrán ataques aéreos.`,
    accepted: '¡ACEPTADO!',
    additionalTime: '💥 ¡Tiempo Adicional!',
    additionalTimeText: '¡+60 segundos!',
    ok: '¡OK!',
    sectorScouted: '🔭 SECTOR EXPLORADO',
    sectorScoutedText: '¡Direcciones de cofres visibles 20 segundos!',
    understood: '¡Entendido!',
    ammunition: '💥 ¡MUNICIÓN!',
    ammunitionText: (ammo) => `¡+10 proyectiles!\nMunición: ${ammo}`,
    letsGo: '¡Vamos!',
    perkFound: 'VENTAJA ENCONTRADA',
    perkFoundText: (name) =>
      `Ventaja obtenida: ${name}\nUsa el botón de la derecha.`,
    bestResults: 'MEJORES RESULTADOS',
    close: 'Cerrar',
    noRecords: 'Aún no hay récords. ¡Sé el primero!',
    number: '#',
    date: 'Fecha',
    score: 'Puntuación',
    tankDestroyed: '¡TANQUE DESTRUIDO!',
    yourScore: (score) =>
      `Tu puntuación final: ${score}\n\nMEJORES RESULTADOS:\n`,
    continue: 'Continuar',
    newGame: 'Nuevo Juego',
    timeOut: '💥 ¡TIEMPO AGOTADO!',
    timeOutText: '¡El ataque aéreo destruyó el sector!',
    newLevel: 'NUEVO NIVEL',
    greatWarrior: '🎉 ¡GRAN GUERRERO! 🎉',
    greatWarriorText: (level) =>
      `¡Alcanzaste el nivel ${level}!\n¡Tu nombre será escrito en la historia!`,
    continueBtn: 'Continuar',
    game: 'JUEGO',
    saveFound: (level) =>
      `Guardado encontrado. Nivel: ${level}\n¿Continuar o empezar nuevo?`,

    pauseMenu: 'PAUSA',
    stats: 'Estadísticas',
    settings: 'Configuración',
    language: 'Idioma',
    howToPlay: 'Cómo Jugar',
    exitGame: 'Salir',
    resume: 'Reanudar',
    pauseLevel: 'Nivel:',
    pauseHealth: 'Vida:',
    pauseShells: 'Proyectiles:',
    pauseScore: 'Puntuación:',

    controlsMove: 'Mover',
    controlsFire: 'Disparar',

    radiation: '☢ RADIACIÓN',
    mine: 'MINA',
    boss: 'JEFE',
    records: 'Récords',

    // Уровни качества производительности
    qualityNames: ['BAJO', 'MEDIO', 'ALTO'],

    guide: {
      title: 'CÓMO JUGAR',
      objective: '🎯 OBJETIVO',
      objectiveText:
        '¡Destruye tanques enemigos, recoge cofres con recursos y sube de nivel. Cada nivel 10 es misión urgente con tiempo limitado!',
      controls: '🎮 CONTROLES',
      controlsPc: '💻 En PC:',
      controlsPcWasd: '• WASD - Movimiento del tanque',
      controlsPcSpace: '• Espacio - Disparar',
      controlsPcEsc: '• ESC - Menú de pausa',
      controlsMobile: '📱 En móviles:',
      controlsMobileJoy: '• Joystick (izquierda) - Movimiento',
      controlsMobileFire: '• Botón de fuego (derecha) - Disparar',

      hud: '📊 INTERFAZ',
      hudHp: '❤️ Salud - Tus puntos de vida',
      hudAmmo: '🔫 Munición - Proyectiles para disparar',
      hudLevel: '⭐ Nivel - Tu progreso',
      hudExp: '✨ EXP - Hasta siguiente nivel',
      perks: '🎁 VENTAJAS',
      perkInvis: '👤 Invisibilidad - Enemigos no te ven 20 seg',
      perkShield: '🛡️ Escudo - Invulnerabilidad 20 segundos',
      perkArtillery: '🚀 Artillería - Golpe poderoso (x5 daño)',
      perkMedkit: '➕ Botiquín - Restaura salud completamente',
      perkBigAmmo: '📦 Munición grande - Añade 20 proyectiles',
      enemies: '👾 ENEMIGOS',
      enemyTank: '🔴 Tanques normales - Disparan a distancia',
      enemyBoss: '💀 JEFES - Más PV, mejor puntería',
      enemyTurret: '🏰 Torretas - Inmóviles pero peligrosas',
      objects: '🗺️ OBJETOS DEL MAPA',
      objectChest: '📦 Cofres - Contienen munición, salud o ventajas',
      objectMine: '💣 Minas - Explotan al contacto',
      objectWater: '💧 Agua - Ralentiza movimiento y causa daño',
      objectBuilding: '🏢 Edificios - Pueden ser destruidos',
      objectTree: '🌲 Árboles - Obstáculos destruibles',
      tips: '💡 CONSEJOS',
      tip1: '• Recoge cajas de munición - reaparecen',
      tip2: '• Cuida tu salud - evita colisiones',
      tip3: '• Usa cobertura (árboles, edificios)',
      tip4: '• Los jefes aparecen en cada nivel',
      tip5: '• Cada nivel 10 es misión urgente',
      tip6: '• Mira anuncios para bonos (munición, tiempo, salud)',
      progression: '📈 PROGRESIÓN',
      progLevel: '• Con nivel aumentan: salud, alcance de disparo',
      progEnemies: '• Enemigos se vuelven más fuertes y precisos',
      progPerks: '• Ventajas en cofres (raras)',
      goodLuck: '🎮 ¡Buena suerte en el campo de batalla, comandante!',
    },
  },

  it: {
    gameTitle: 'CARRO ARMATO: ZONA DI BATTAGLIA',

    fullscreen: 'Schermo intero',
    menu: 'Menu',
    getAmmo: 'Ottieni 10 proiettili',
    getTime: 'Ottieni 60 secondi',
    findChests: 'Trova casse',
    sound: 'Suono',
    noSound: 'Senza suono',
    // Тексты для расширенных кнопок рекламы
    ammoForAd: 'munizioni per pubblicità',
    timeForAd: 'tempo per pubblicità',
    scoutingForAd: 'ricognizione per pubblicità',

    hp: 'PV',
    ammo: 'MUNIZIONI',
    level: 'LIVELLO',
    exp: 'ESP',
    enemies: 'NEMICI',
    chests: 'CASSE',
    levelWord: 'LIVELLO',
    enemiesCount: (current, total) => `NEMICI: ${current} / ${total}`,
    chestsCount: (current, total) => `CASSE: ${current} / ${total}`,

    invisibility: 'Invisibilità',
    shield: 'Scudo',
    artillery: 'Artiglieria',
    medkit: 'Kit Medico Grande',
    bigAmmo: 'Munizioni Grandi',

    levelPassed: 'LIVELLO SUPERATO',
    tasksComplete: 'Compiti completati.\nPassare al livello successivo?',
    nextLevel: 'Livello Successivo',
    restartLevel: '🔄 Ricomincia Livello',
    urgentMission: '⏰ MISSIONE URGENTE!',
    urgentMissionText: (level) =>
      `Livello #${level}: 3 MINUTI PER LIBERARE!\nO arriveranno attacchi aerei.`,
    accepted: 'ACCETTATO!',
    additionalTime: '💥 Tempo Aggiuntivo!',
    additionalTimeText: '+60 secondi!',
    ok: 'OK!',
    sectorScouted: '🔭 SETTORE ESPLORATO',
    sectorScoutedText: 'Direzioni casse visibili per 20 secondi!',
    understood: 'Capito!',
    ammunition: '💥 MUNIZIONI!',
    ammunitionText: (ammo) => `+10 proiettili!\nMunizioni: ${ammo}`,
    letsGo: 'Andiamo!',
    perkFound: 'VANTAGGIO TROVATO',
    perkFoundText: (name) =>
      `Vantaggio ottenuto: ${name}\nUsa il pulsante a destra.`,
    bestResults: 'MIGLIORI RISULTATI',
    close: 'Chiudi',
    noRecords: 'Nessun record ancora. Sii il primo!',
    number: '#',
    date: 'Data',
    score: 'Punteggio',
    tankDestroyed: 'CARRO ARMATO DISTRUTTO!',
    yourScore: (score) =>
      `Il tuo punteggio finale: ${score}\n\nMIGLIORI RISULTATI:\n`,
    continue: 'Continua',
    newGame: 'Nuova Partita',
    timeOut: '💥 TEMPO SCADUTO!',
    timeOutText: "L'attacco aereo ha distrutto il settore!",
    newLevel: 'NUOVO LIVELLO',
    greatWarrior: '🎉 GRANDE GUERRIERO! 🎉',
    greatWarriorText: (level) =>
      `Hai raggiunto il livello ${level}!\nIl tuo nome sarà scritto nella storia!`,
    continueBtn: 'Continua',
    game: 'GIOCO',
    saveFound: (level) =>
      `Salvataggio trovato. Livello: ${level}\nContinuare o iniziare nuovo?`,

    pauseMenu: 'PAUSA',
    stats: 'Statistiche',
    settings: 'Impostazioni',
    language: 'Lingua',
    howToPlay: 'Come Giocare',
    exitGame: 'Esci',
    resume: 'Riprendi',
    pauseLevel: 'Livello:',
    pauseHealth: 'Salute:',
    pauseShells: 'Proiettili:',
    pauseScore: 'Punteggio:',

    controlsMove: 'Muovi',
    controlsFire: 'Spara',

    radiation: '☢ RADIAZIONE',
    mine: 'MINA',
    boss: 'CAPO',
    records: 'Record',

    // Уровни качества производительности
    qualityNames: ['BASSO', 'MEDIO', 'ALTO'],

    guide: {
      title: 'COME GIOCARE',
      objective: '🎯 OBIETTIVO',
      objectiveText:
        'Distruggi carri armati nemici, raccogli casse con risorse e sali di livello. Ogni 10° livello è missione urgente con tempo limitato!',
      controls: '🎮 CONTROLLI',
      controlsPc: '💻 Su PC:',
      controlsPcWasd: '• WASD - Movimento carro armato',
      controlsPcSpace: '• Spazio - Sparare',
      controlsPcEsc: '• ESC - Menu pausa',
      controlsMobile: '📱 Su dispositivi mobili:',
      controlsMobileJoy: '• Joystick (sinistra) - Movimento',
      controlsMobileFire: '• Pulsante fuoco (destra) - Sparare',

      hud: '📊 INTERFACCIA',
      hudHp: '❤️ Salute - I tuoi punti vita',
      hudAmmo: '🔫 Munizioni - Proiettili per sparare',
      hudLevel: '⭐ Livello - Il tuo progresso',
      hudExp: '✨ ESP - Fino al prossimo livello',
      perks: '🎁 VANTAGGI',
      perkInvis: '👤 Invisibilità - I nemici non ti vedono per 20 sec',
      perkShield: '🛡️ Scudo - Invulnerabilità per 20 secondi',
      perkArtillery: '🚀 Artiglieria - Colpo potente (x5 danni)',
      perkMedkit: '➕ Kit medico - Ripristina completamente la salute',
      perkBigAmmo: '📦 Munizioni grandi - Aggiunge 20 proiettili',
      enemies: '👾 NEMICI',
      enemyTank: '🔴 Carri armati normali - Sparano a distanza',
      enemyBoss: '💀 BOSS - Più PV, mira migliore',
      enemyTurret: '🏰 Torrette - Immobili ma pericolose',
      objects: '🗺️ OGGETTI SULLA MAPPA',
      objectChest: '📦 Casse - Contengono munizioni, salute o vantaggi',
      objectMine: '💣 Mine - Esplodono al contatto',
      objectWater: '💧 Acqua - Rallenta movimento e causa danni',
      objectBuilding: '🏢 Edifici - Possono essere distrutti',
      objectTree: '🌲 Alberi - Ostacoli distruggibili',
      tips: '💡 CONSIGLI',
      tip1: '• Raccogli casse di munizioni - riappaiono',
      tip2: '• Risparmia la salute - evita collisioni',
      tip3: '• Usa copertura (alberi, edifici)',
      tip4: '• I boss appaiono ad ogni livello',
      tip5: '• Ogni 10° livello è missione urgente',
      tip6: '• Guarda annunci per bonus (munizioni, tempo, salute)',
      progression: '📈 PROGRESSIONE',
      progLevel: '• Con livello aumentano: salute, portata di tiro',
      progEnemies: '• I nemici diventano più forti e precisi',
      progPerks: '• Vantaggi nelle casse (rari)',
      goodLuck: '🎮 Buona fortuna sul campo di battaglia, comandante!',
    },
  },

  fr: {
    gameTitle: 'CHAR: ZONE DE BATAILLE',

    fullscreen: 'Plein écran',
    menu: 'Menu',
    getAmmo: 'Obtenir 10 obus',
    getTime: 'Obtenir 60 secondes',
    findChests: 'Trouver coffres',
    sound: 'Son',
    noSound: 'Sans son',
    // Тексты для расширенных кнопок рекламы
    ammoForAd: 'munitions pour pub',
    timeForAd: 'temps pour pub',
    scoutingForAd: 'reconnaissance pour pub',

    hp: 'PV',
    ammo: 'MUNITIONS',
    level: 'NIVEAU',
    exp: 'EXP',
    enemies: 'ENNEMIS',
    chests: 'COFFRES',
    levelWord: 'NIVEAU',
    enemiesCount: (current, total) => `ENNEMIS: ${current} / ${total}`,
    chestsCount: (current, total) => `COFFRES: ${current} / ${total}`,

    invisibility: 'Invisibilité',
    shield: 'Bouclier',
    artillery: 'Artillerie',
    medkit: 'Grande Trousse',
    bigAmmo: 'Grandes Munitions',

    levelPassed: 'NIVEAU RÉUSSI',
    tasksComplete: 'Tâches terminées.\nPasser au niveau suivant?',
    nextLevel: 'Niveau Suivant',
    restartLevel: '🔄 Recommencer Niveau',
    urgentMission: '⏰ MISSION URGENTE!',
    urgentMissionText: (level) =>
      `Niveau #${level}: 3 MINUTES POUR NETTOYER!\nSinon les frappes aériennes arriveront.`,
    accepted: 'ACCEPTÉ!',
    additionalTime: '💥 Temps Supplémentaire!',
    additionalTimeText: '+60 secondes!',
    ok: 'OK!',
    sectorScouted: '🔭 SECTEUR EXPLORÉ',
    sectorScoutedText: 'Directions des coffres visibles 20 secondes!',
    understood: 'Compris!',
    ammunition: '💥 MUNITIONS!',
    ammunitionText: (ammo) => `+10 obus!\nMunitions: ${ammo}`,
    letsGo: 'Allons-y!',
    perkFound: 'AVANTAGE TROUVÉ',
    perkFoundText: (name) =>
      `Avantage obtenu: ${name}\nUtilise le bouton à droite.`,
    bestResults: 'MEILLEURS RÉSULTATS',
    close: 'Fermer',
    noRecords: 'Pas encore de records. Sois le premier!',
    number: '#',
    date: 'Date',
    score: 'Score',
    tankDestroyed: 'CHAR DÉTRUIT!',
    yourScore: (score) => `Ton score final: ${score}\n\nMEILLEURS RÉSULTATS:\n`,
    continue: 'Continuer',
    newGame: 'Nouvelle Partie',
    timeOut: '💥 TEMPS ÉCOULÉ!',
    timeOutText: 'La frappe aérienne a détruit le secteur!',
    newLevel: 'NOUVEAU NIVEAU',
    greatWarrior: '🎉 GRAND GUERRIER! 🎉',
    greatWarriorText: (level) =>
      `Tu as atteint le niveau ${level}!\nTon nom sera inscrit dans l\'histoire!`,
    continueBtn: 'Continuer',
    game: 'JEU',
    saveFound: (level) =>
      `Sauvegarde trouvée. Niveau: ${level}\nContinuer ou commencer nouveau?`,

    pauseMenu: 'PAUSE',
    stats: 'Statistiques',
    settings: 'Paramètres',
    language: 'Langue',
    howToPlay: 'Comment Jouer',
    exitGame: 'Quitter',
    resume: 'Reprendre',
    pauseLevel: 'Niveau:',
    pauseHealth: 'Santé:',
    pauseShells: 'Obus:',
    pauseScore: 'Score:',

    controlsMove: 'Déplacer',
    controlsFire: 'Tirer',

    radiation: '☢ RADIATION',
    mine: 'MINE',
    boss: 'BOSS',
    records: 'Records',

    // Уровни качества производительности
    qualityNames: ['FAIBLE', 'MOYEN', 'ÉLEVÉ'],

    guide: {
      title: 'COMMENT JOUER',
      objective: '🎯 OBJECTIF',
      objectiveText:
        'Détruisez les chars ennemis, collectez les coffres avec des ressources et montez de niveau. Chaque 10ème niveau est mission urgente avec temps limité!',
      controls: '🎮 CONTRÔLES',
      controlsPc: '💻 Sur PC:',
      controlsPcWasd: '• WASD - Déplacement du char',
      controlsPcSpace: '• Espace - Tirer',
      controlsPcEsc: '• ESC - Menu pause',
      controlsMobile: '📱 Sur mobile:',
      controlsMobileJoy: '• Joystick (gauche) - Déplacement',
      controlsMobileFire: '• Bouton de tir (droite) - Tirer',

      hud: '📊 INTERFACE',
      hudHp: '❤️ Santé - Vos points de vie',
      hudAmmo: '🔫 Munitions - Obus pour tirer',
      hudLevel: '⭐ Niveau - Votre progression',
      hudExp: "✨ EXP - Jusqu'au prochain niveau",
      perks: '🎁 AVANTAGES',
      perkInvis:
        '👤 Invisibilité - Les ennemis ne vous voient pas pendant 20 sec',
      perkShield: '🛡️ Bouclier - Invulnérabilité pendant 20 secondes',
      perkArtillery: '🚀 Artillerie - Frappe puissante (x5 dégâts)',
      perkMedkit: '➕ Trousse médicale - Restaure complètement la santé',
      perkBigAmmo: '📦 Grosse munition - Ajoute 20 obus',
      enemies: '👾 ENNEMIS',
      enemyTank: '🔴 Chars normaux - Tirent à distance',
      enemyBoss: '💀 BOSS - Plus de PV, meilleure visée',
      enemyTurret: '🏰 Tourelles - Immobiles mais dangereuses',
      objects: '🗺️ OBJETS SUR LA CARTE',
      objectChest: '📦 Coffres - Contiennent munitions, santé ou avantages',
      objectMine: '💣 Mines - Explosent au contact',
      objectWater: '💧 Eau - Ralentit mouvement et inflige des dégâts',
      objectBuilding: '🏢 Bâtiments - Peuvent être détruits',
      objectTree: '🌲 Arbres - Obstacles destructibles',
      tips: '💡 CONSEILS',
      tip1: '• Collectez caisses de munitions - elles réapparaissent',
      tip2: '• Économisez votre santé - évitez les collisions',
      tip3: '• Utilisez couverture (arbres, bâtiments)',
      tip4: '• Les boss apparaissent à chaque niveau',
      tip5: '• Chaque 10ème niveau est mission urgente',
      tip6: '• Regardez publicités pour bonus (munitions, temps, santé)',
      progression: '📈 PROGRESSION',
      progLevel: '• Avec niveau augmentent: santé, portée de tir',
      progEnemies: '• Les ennemis deviennent plus forts et précis',
      progPerks: '• Avantages dans coffres (rares)',
      goodLuck: '🎮 Bonne chance sur le champ de bataille, commandant!',
    },
  },
};

// Текущий язык (по умолчанию русский)
let currentLanguage = 'ru';

// Определение языка браузера
function detectBrowserLanguage() {
  const browserLang = (navigator.language || navigator.userLanguage).split(
    '-',
  )[0];
  return translations[browserLang] ? browserLang : 'ru';
}

// Получение языка из Яндекс SDK
function getYaSDKLanguage() {
  try {
    // Проверяем наличие yaSDK и его свойства environment.i18n.lang
    if (typeof yaSDK !== 'undefined' && yaSDK && yaSDK.environment && yaSDK.environment.i18n) {
      const sdkLang = yaSDK.environment.i18n.lang;
      if (sdkLang && translations[sdkLang]) {
        return sdkLang;
      }
      // Если язык из SDK не поддерживается, пробуем взять только код языка (ru, en и т.д.)
      const langCode = sdkLang ? sdkLang.split('-')[0] : null;
      if (langCode && translations[langCode]) {
        return langCode;
      }
    }
  } catch (e) {
    console.log('Ошибка при получении языка из Яндекс SDK:', e);
  }
  return null;
}

// Загрузка сохраненного языка или определение по браузеру/Яндекс SDK
function initLanguage() {
  try {
    // Сначала проверяем сохраненный язык (приоритет у пользовательского выбора)
    const saved = localStorage.getItem('tankBattle_language');
    if (saved && translations[saved]) {
      currentLanguage = saved;
      return;
    }
    
    // Если сохраненного языка нет, проверяем язык из Яндекс SDK (если SDK уже инициализирован)
    const sdkLang = getYaSDKLanguage();
    if (sdkLang) {
      currentLanguage = sdkLang;
      saveLanguage(currentLanguage);
      return;
    }
    
    // Если ничего не найдено, используем язык браузера (временно, будет обновлено из SDK после инициализации)
    currentLanguage = detectBrowserLanguage();
    // Не сохраняем язык браузера сразу, чтобы дать возможность SDK установить правильный язык
  } catch (e) {
    currentLanguage = detectBrowserLanguage();
  }
}

// Обновление языка из Яндекс SDK (вызывается после инициализации SDK)
function updateLanguageFromYaSDK() {
  const sdkLang = getYaSDKLanguage();
  if (sdkLang) {
    // Проверяем, был ли язык выбран пользователем вручную
    const saved = localStorage.getItem('tankBattle_language');
    
    // Если сохраненного языка нет или он совпадает с языком браузера (первый запуск)
    // используем язык из Яндекс SDK
    if (!saved || saved === detectBrowserLanguage()) {
      if (setLanguage(sdkLang)) {
        // Обновляем интерфейс если функция доступна
        if (typeof updateUILanguage === 'function') {
          updateUILanguage();
        }
        console.log('✅ Язык установлен из Яндекс SDK:', sdkLang);
      }
    } else if (saved !== sdkLang) {
      // Язык был выбран пользователем вручную, не перезаписываем
      console.log('ℹ️ Язык из Яндекс SDK игнорирован, используется сохраненный пользователем:', saved);
    }
  }
}

// Сохранение выбранного языка
function saveLanguage(lang) {
  try {
    localStorage.setItem('tankBattle_language', lang);
  } catch (e) {
    console.error('Failed to save language:', e);
  }
}

// Получение перевода
function t(key, ...args) {
  const translation = translations[currentLanguage][key];

  if (typeof translation === 'function') {
    return translation(...args);
  }

  return translation || key;
}

// Смена языка
function setLanguage(lang) {
  if (translations[lang]) {
    currentLanguage = lang;
    saveLanguage(lang);
    return true;
  }
  return false;
}

// Получение текущего языка
function getCurrentLanguage() {
  return currentLanguage;
}

// Получение списка доступных языков
function getAvailableLanguages() {
  return {
    ru: 'Русский',
    en: 'English',
    de: 'Deutsch',
    es: 'Español',
    it: 'Italiano',
    fr: 'Français',
  };
}

// Инициализация при загрузке
initLanguage();
