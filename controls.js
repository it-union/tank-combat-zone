// Динамический джойстик для всех устройств с сенсорным экраном

// Определяем устройство для базовых настроек (чувствительность, оптимизация)
// Проверяем как User Agent, так и наличие сенсорного экрана
const isMobileDevice =
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  ) ||
  'ontouchstart' in window ||
  navigator.maxTouchPoints > 0;

// Переменные для отслеживания состояния кнопки стрельбы
let fireButtonActive = false;
let fireButtonTouchId = null;
let joystickActive = false,
  joystickX = 0,
  joystickY = 0;
const joystickRadius = 30;

// Переменные для отслеживания состояния джойстика
let joystickTouchId = null;

// Сырые цели от пальца и сглаженные значения
let targetJoyX = 0,
  targetJoyY = 0;
let joyX = 0,
  joyY = 0;

// Параметры сглаживания
const SMOOTH = 0.25; // 0.15..0.35 обычно ок
const RESPONSE = 25; // Увеличено для более быстрой реакции на мобильных устройствах //регулирует “вязкость”: меньше — плавнее, но с задержкой; больше — резче.
const DEAD = 0.05; // Уменьшена мёртвая зона для лучшей чувствительности // мёртвая зона
const PIXEL_FILTER = 1.2; // Игнорировать микро-дрожание пальца менее 1.2 пикселя

let lastClientX = null;
let lastClientY = null;
const PIXEL_DEADBAND = 0.3; // Еще больше уменьшено для максимальной чувствительности на мобильных устройствах

// Переменные для отслеживания начальной позиции касания (для предотвращения pull-to-refresh)
let touchStartY = null;

// --- Вспомогательные функции (заглушки, если нет в основном коте) ---
const safeInitAudio = () => {
  if (typeof initAudio === 'function') initAudio();
};
const safeFire = () => {
  if (typeof fireBullet === 'function') fireBullet();
};

// ВАЖНО: предполагается, что эти переменные/элементы объявлены у вас выше:
// let modalOpen, tutorialDismissed, firstTouchShown;
// let joystickActive, joystickX, joystickY;
// const joystickContainer, joystick, fireButton;
// const joystickRadius, mobileMoveSensitivity;
// function initAudio(), fireBullet()

const joystick = document.getElementById('joystick');
const joystickContainer = document.getElementById('joystickContainer');
const fireButton = document.getElementById('fireButton');

// Элементы отладочной панели
let debugPanel = null;
let debugEventCount = 0;
let lastDebugUpdate = 0;

// Инициализация отладочной панели после загрузки DOM
function initDebugPanel() {
  if (typeof document !== 'undefined') {
    debugPanel = document.getElementById('joystickDebugPanel');
    if (debugPanel && isMobileDevice) {
      debugPanel.style.display = 'block';
    }
  }
}

// Инициализируем панель сразу, если DOM уже загружен
// if (typeof document !== 'undefined') {
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', initDebugPanel);
//   } else {
//     initDebugPanel();
//   }
// }

let lastTick = performance.now();
let lastRawX = 0,
  lastRawY = 0; // Для фильтрации входящего шума

function joystickTick(now) {
  const dt = Math.min(0.05, (now - lastTick) / 1000);
  lastTick = now;

  const a = 1 - Math.exp(-RESPONSE * dt);

  joyX += (targetJoyX - joyX) * a;
  joyY += (targetJoyY - joyY) * a;

  const outX = Math.abs(joyX) < DEAD ? 0 : joyX;
  const outY = Math.abs(joyY) < DEAD ? 0 : joyY;

  // ВАЖНО: Проверяем, определена ли mobileMoveSensitivity, иначе используем значение по умолчанию
  const sensitivity =
    typeof mobileMoveSensitivity !== 'undefined'
      ? mobileMoveSensitivity
      : isMobileDevice
        ? 1.5
        : 1.0;
  joystickX = outX * sensitivity;
  joystickY = outY * sensitivity;

  // Обновляем визуал джойстика здесь же — синхронно со сглаженными значениями
  if (joystick && joystick.style) {
    try {
      joystick.style.transform = `translate3d(${joyX * joystickRadius}px, ${joyY * joystickRadius}px, 0)`;
    } catch (e) {
      console.warn('Error updating joystick transform:', e);
    }
  }

  // Обновляем отладочную панель
  //updateDebugPanel();

  requestAnimationFrame(joystickTick);
}
requestAnimationFrame(joystickTick);

// Обработчик начала касания для динамического джойстика
const dynamicJoystickStart = (touch, originalEvent) => {
  if (modalOpen) return;

  const target = originalEvent.target;

  // Игнорируем касания по UI
  if (
    target.closest('#fireButton') ||
    target.closest('.menu-btn') ||
    target.closest('.perk-btn') ||
    target.closest('#hud') ||
    target.closest('#pauseOverlay') ||
    target.closest('#timerHud') ||
    target.closest('#perkHud') ||
    target.closest('#enemyPanel')
  ) {
    return;
  }

  // Джойстик только на левой 2/3 экрана
  const screenWidth = window.innerWidth;
  if (touch.clientX > screenWidth * 0.66) return;

  // ВАЖНО: preventDefault должен вызываться на самом событии, а не на originalEvent
  if (originalEvent.cancelable) {
    originalEvent.preventDefault();
  }
  initAudio();
  showTouchTutorial();

  // Позиционируем джойстик в месте касания
  if (!joystickContainer || !joystick) {
    console.error('Joystick elements not found!');
    return;
  }

  const leftPos = touch.clientX - 60;
  const topPos = touch.clientY - 60;
  joystickContainer.style.left = `${leftPos}px`;
  joystickContainer.style.top = `${topPos}px`;

  // ВАЖНО: включаем события, иначе на мобилках это часто ломает работу
  joystickContainer.style.pointerEvents = 'auto';
  // Также включаем события на самом джойстике для надежности
  joystick.style.pointerEvents = 'auto';

  joystickContainer.style.transform = 'scale(0.8)';
  joystickContainer.style.opacity = '1';

  requestAnimationFrame(() => {
    joystickContainer.style.transform = 'scale(1)';
  });

  // Сбрасываем значения джойстика перед началом нового касания
  targetJoyX = 0;
  targetJoyY = 0;
  joyX = 0;
  joyY = 0;

  // Сбрасываем фильтр микродвижений при новом касании
  lastClientX = null;
  lastClientY = null;

  joystickActive = true;
  joystickTouchId = touch.identifier;
  debugEventCount++;

  // ВАЖНО: Обновляем позицию джойстика СРАЗУ при касании для немедленной реакции
  // Используем сохраненные координаты контейнера, если layout еще не обновлен
  const initialX = touch.clientX;
  const initialY = touch.clientY;

  // Сразу обновляем позицию с текущими координатами касания
  updateJoystickPosition(touch);

  // Также обновляем через requestAnimationFrame для гарантии, что layout обновлен
  requestAnimationFrame(() => {
    if (joystickActive && joystickTouchId === touch.identifier) {
      updateJoystickPosition(touch);
    }
  });

  // Обновляем отладочную панель
  //updateDebugPanel();
};

// Обработчик начала касания для динамической кнопки стрельбы
const dynamicFireButtonStart = (touch, originalEvent) => {
  if (modalOpen) return;

  const target = originalEvent.target;

  // Игнорируем UI (кроме самого fireButton — он динамический)
  if (
    target.closest('.menu-btn') ||
    target.closest('.perk-btn') ||
    target.closest('#hud') ||
    target.closest('#pauseOverlay') ||
    target.closest('#timerHud') ||
    target.closest('#perkHud') ||
    target.closest('#enemyPanel')
  ) {
    return;
  }

  // Кнопка стрельбы только на правой 1/3 экрана
  const screenWidth = window.innerWidth;
  if (touch.clientX <= screenWidth * 0.66) return;

  // ВАЖНО: preventDefault должен вызываться на самом событии, а не на originalEvent
  if (originalEvent.cancelable) {
    originalEvent.preventDefault();
  }
  initAudio();
  showTouchTutorial();

  fireButton.style.left = `${touch.clientX - 35}px`;
  fireButton.style.top = `${touch.clientY - 35}px`;
  fireButton.style.transform = 'scale(0.8)';
  fireButton.style.opacity = '1';
  fireButton.style.pointerEvents = 'auto';

  requestAnimationFrame(() => {
    fireButton.style.transform = 'scale(1)';
  });

  fireButtonActive = true;
  fireButtonTouchId = touch.identifier;

  fireBullet();
};

// Изначально скрываем
joystickContainer.style.opacity = '0';
joystickContainer.style.pointerEvents = 'none';
fireButton.style.opacity = '0';
fireButton.style.pointerEvents = 'none';

// move
document.addEventListener(
  'touchmove',
  (e) => {
    // Если модальное окно открыто, предотвращаем прокрутку и pull-to-refresh
    if (modalOpen) {
      const target = e.target;
      // Разрешаем прокрутку только внутри модального окна (если там есть прокручиваемый контент)
      if (
        !target.closest('#modalOverlay') &&
        !target.closest('#pauseOverlay')
      ) {
        if (e.cancelable) {
          e.preventDefault();
        }
      } else {
        // Даже внутри модального окна предотвращаем pull-to-refresh при движении вниз от верхнего края
        const touches = Array.from(e.changedTouches || []);
        touches.forEach((touch) => {
          if (
            touchStartY !== null &&
            touch.clientY > touchStartY &&
            touchStartY < 100
          ) {
            // Движение вниз от верхнего края - предотвращаем pull-to-refresh
            if (e.cancelable) {
              e.preventDefault();
            }
          }
        });
      }
      return;
    }

    // Во время игры также предотвращаем pull-to-refresh (swipe to refresh)
    // Если касание началось от верхнего края экрана и пользователь тянет вниз
    if (touchStartY !== null && touchStartY < 100) {
      const touches = Array.from(e.changedTouches || []);
      touches.forEach((touch) => {
        // Если движение вниз от верхнего края - предотвращаем pull-to-refresh
        if (touch.clientY > touchStartY + 10) {
          if (e.cancelable) {
            e.preventDefault();
          }
        }
      });
    }

    let shouldPreventDefault = false;

    // Обрабатываем джойстик, если он активен
    if (joystickActive) {
      const touches = Array.from(e.touches);

      // Сначала пытаемся найти касание по сохраненному identifier
      let joystickTouch = touches.find((t) => t.identifier === joystickTouchId);

      if (joystickTouch) {
        updateJoystickPosition(joystickTouch);
        debugEventCount++;
        // предотвращаем прокрутку/зум, пока тащим джойстик
        shouldPreventDefault = true;
      } else if (joystickTouchId !== null && joystickTouchId !== -1) {
        // Улучшено: на некоторых устройствах touch.identifier может измениться
        // Попробуем найти касание по позиции, если оно близко к джойстику
        if (touches.length > 0) {
          const rect = joystickContainer.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          // Ищем касание в радиусе джойстика (увеличен радиус для надежности)
          const nearbyTouch = touches.find((t) => {
            const dist = Math.hypot(t.clientX - centerX, t.clientY - centerY);
            return dist < joystickRadius * 4; // Увеличен радиус поиска
          });

          if (nearbyTouch) {
            // Обновляем touchId и продолжаем работу
            joystickTouchId = nearbyTouch.identifier;
            updateJoystickPosition(nearbyTouch);
            shouldPreventDefault = true;
          } else {
            // Если касание действительно потеряно, деактивируем джойстик
            joystickActive = false;
            joystickTouchId = null;
            targetJoyX = 0;
            targetJoyY = 0;
            joyX = 0;
            joyY = 0;
            joystickX = 0;
            joystickY = 0;
            joystickContainer.style.transform = 'scale(0.8)';
            joystickContainer.style.opacity = '0';
            joystickContainer.style.pointerEvents = 'none';
            joystick.style.pointerEvents = 'none';
          }
        } else {
          // Нет активных касаний - деактивируем джойстик
          joystickActive = false;
          joystickTouchId = null;
          targetJoyX = 0;
          targetJoyY = 0;
          joyX = 0;
          joyY = 0;
          joystickX = 0;
          joystickY = 0;
          joystickContainer.style.transform = 'scale(0.8)';
          joystickContainer.style.opacity = '0';
          joystickContainer.style.pointerEvents = 'none';
          joystick.style.pointerEvents = 'none';
        }
      } else {
        // Если joystickTouchId равен -1 (мышь) или null, но джойстик активен
        // Это не должно происходить для touch событий, но на всякий случай
        if (touches.length > 0) {
          // Пытаемся найти касание в области джойстика
          const rect = joystickContainer.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          const nearbyTouch = touches.find((t) => {
            const dist = Math.hypot(t.clientX - centerX, t.clientY - centerY);
            return dist < joystickRadius * 4;
          });

          if (nearbyTouch) {
            joystickTouchId = nearbyTouch.identifier;
            updateJoystickPosition(nearbyTouch);
            shouldPreventDefault = true;
          }
        }
      }
    }

    // Также предотвращаем прокрутку, когда активна кнопка стрельбы
    if (fireButtonActive && fireButtonTouchId !== null) {
      const touches = Array.from(e.touches);
      const fireTouch = touches.find((t) => t.identifier === fireButtonTouchId);
      if (fireTouch) {
        shouldPreventDefault = true;
      }
    }

    if (shouldPreventDefault && e.cancelable) {
      e.preventDefault();
    }
  },
  { passive: false },
);

document.addEventListener('mousedown', (e) => {
  // Джойстик только для мобильных устройств
  if (!isMobileDevice) return;

  if (modalOpen) return;

  const target = e.target;

  // Игнорируем касания по UI
  if (
    target.closest('#fireButton') ||
    target.closest('.menu-btn') ||
    target.closest('.perk-btn') ||
    target.closest('#hud') ||
    target.closest('#pauseOverlay') ||
    target.closest('#timerHud') ||
    target.closest('#perkHud') ||
    target.closest('#enemyPanel')
  ) {
    return;
  }

  // Джойстик только на левой 2/3 экрана
  const screenWidth = window.innerWidth;
  if (e.clientX > screenWidth * 0.66) return;

  e.preventDefault();
  initAudio();
  showTouchTutorial();

  // Позиционируем джойстик в месте клика
  const leftPos = e.clientX - 60;
  const topPos = e.clientY - 60;
  joystickContainer.style.left = `${leftPos}px`;
  joystickContainer.style.top = `${topPos}px`;

  joystickContainer.style.pointerEvents = 'auto';
  joystickContainer.style.transform = 'scale(0.8)';
  joystickContainer.style.opacity = '1';

  requestAnimationFrame(() => {
    joystickContainer.style.transform = 'scale(1)';
  });

  lastClientX = null;
  lastClientY = null;

  // Сбрасываем значения джойстика перед началом нового касания
  targetJoyX = 0;
  targetJoyY = 0;
  joyX = 0;
  joyY = 0;

  joystickActive = true;
  // Для мыши используем специальный идентификатор
  joystickTouchId = -1; // -1 означает мышь

  // Используем двойной requestAnimationFrame для гарантии обновления layout
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      updateJoystickPosition(e);
    });
  });
});

document.addEventListener('mousemove', (e) => {
  // Джойстик только для мобильных устройств
  if (!isMobileDevice) return;

  if (joystickActive && !modalOpen && joystickTouchId === -1) {
    updateJoystickPosition(e);
    if (e.cancelable) {
      e.preventDefault();
    }
  }
});

// end/cancel
const endTouchLike = (e) => {
  const touches = Array.from(e.changedTouches || []);

  touches.forEach((touch) => {
    // Кнопка стрельбы
    if (fireButtonActive && touch.identifier === fireButtonTouchId) {
      fireButtonActive = false;
      fireButtonTouchId = null;
      fireButton.style.transform = 'scale(0.8)';
      fireButton.style.opacity = '0';
      fireButton.style.pointerEvents = 'none';
    }

    // Джойстик
    if (joystickActive && touch.identifier === joystickTouchId) {
      joystickActive = false;
      joystickTouchId = null;
      lastClientX = lastClientY = null;

      targetJoyX = 0;
      targetJoyY = 0;
      joyX = 0;
      joyY = 0;

      joystickX = 0;
      joystickY = 0;

      joystickContainer.style.transform = 'scale(0.8)';
      joystickContainer.style.opacity = '0';
      // ВАЖНО: возвращаем обратно
      joystickContainer.style.pointerEvents = 'none';
      joystick.style.pointerEvents = 'none';
    }
  });

  // Сбрасываем начальную позицию касания
  touchStartY = null;
};

document.addEventListener('touchend', endTouchLike, { passive: true });
document.addEventListener('touchcancel', endTouchLike, { passive: true });

document.addEventListener('mouseup', (e) => {
  // Джойстик только для мобильных устройств
  if (!isMobileDevice) return;

  if (joystickActive && joystickTouchId === -1) {
    joystickActive = false;
    joystickTouchId = null;
    lastClientX = lastClientY = null;

    targetJoyX = 0;
    targetJoyY = 0;
    joyX = 0;
    joyY = 0;

    joystickX = 0;
    joystickY = 0;

    joystickContainer.style.transform = 'scale(0.8)';
    joystickContainer.style.opacity = '0';
    joystickContainer.style.pointerEvents = 'none';
    joystick.style.pointerEvents = 'none';
  }
});

function updateJoystickPosition(touchOrEvent) {
  // Проверяем, что джойстик активен
  if (!joystickActive) {
    return;
  }

  // Проверяем, что у события есть координаты
  if (
    !touchOrEvent ||
    typeof touchOrEvent.clientX !== 'number' ||
    typeof touchOrEvent.clientY !== 'number'
  ) {
    return;
  }

  // Проверяем, что элементы джойстика существуют
  if (!joystickContainer || !joystick) {
    console.warn('Joystick elements not found!');
    return;
  }

  const clientX = touchOrEvent.clientX;
  const clientY = touchOrEvent.clientY;

  // Фильтр микродвижений (только если это не первое обновление)
  // Улучшено: не блокируем первое движение, даже если оно маленькое
  if (lastClientX !== null && lastClientY !== null) {
    const md = Math.hypot(clientX - lastClientX, clientY - lastClientY);
    // Игнорируем только очень маленькие движения (меньше 0.5 пикселя)
    // Но разрешаем все движения больше этого порога
    if (md < PIXEL_DEADBAND) {
      // Не обновляем lastClientX/Y, чтобы следующее движение могло пройти
      return;
    }
  }
  lastClientX = clientX;
  lastClientY = clientY;

  // Получаем позицию контейнера джойстика
  let rect = joystickContainer.getBoundingClientRect();

  // Проверяем, что джойстик видим и имеет размеры
  // Если джойстик еще не отрендерен или имеет нулевые размеры, используем сохраненную позицию
  if (
    !rect ||
    rect.width === 0 ||
    rect.height === 0 ||
    (rect.left === 0 && rect.top === 0)
  ) {
    // Используем сохраненную позицию из стилей
    const savedLeft = parseFloat(joystickContainer.style.left) || 0;
    const savedTop = parseFloat(joystickContainer.style.top) || 0;
    const centerX = savedLeft + 60; // 60 = половина ширины контейнера (120/2)
    const centerY = savedTop + 60; // 60 = половина высоты контейнера (120/2)

    let dx = clientX - centerX;
    let dy = clientY - centerY;

    const dist = Math.hypot(dx, dy);
    if (dist > joystickRadius) {
      dx = (dx * joystickRadius) / dist;
      dy = (dy * joystickRadius) / dist;
    }

    targetJoyX = dx / joystickRadius;
    targetJoyY = dy / joystickRadius;
    return;
  }

  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  let dx = clientX - centerX;
  let dy = clientY - centerY;

  const dist = Math.hypot(dx, dy);
  if (dist > joystickRadius) {
    dx = (dx * joystickRadius) / dist;
    dy = (dy * joystickRadius) / dist;
  }

  // Только целевые значения, визуал обновляется в joystickTick
  targetJoyX = dx / joystickRadius;
  targetJoyY = dy / joystickRadius;
}

// Функция обновления отладочной панели
function updateDebugPanel() {
  // Инициализируем панель, если еще не инициализирована
  if (!debugPanel) {
    initDebugPanel();
  }

  if (!debugPanel || !isMobileDevice) return;

  // Обновляем не чаще 10 раз в секунду для производительности
  const now = performance.now();
  if (now - lastDebugUpdate < 100) return;
  lastDebugUpdate = now;

  try {
    const activeEl = document.getElementById('debugActive');
    const touchIdEl = document.getElementById('debugTouchId');
    const targetJoyEl = document.getElementById('debugTargetJoy');
    const joyEl = document.getElementById('debugJoy');
    const joystickXYEl = document.getElementById('debugJoystickXY');
    const magnitudeEl = document.getElementById('debugMagnitude');
    const positionEl = document.getElementById('debugPosition');
    const eventsEl = document.getElementById('debugEvents');

    if (activeEl) {
      activeEl.textContent = joystickActive ? 'ДА' : 'нет';
      activeEl.style.color = joystickActive ? '#0f0' : '#f00';
    }

    if (touchIdEl) {
      touchIdEl.textContent =
        joystickTouchId !== null ? joystickTouchId.toString() : '-';
    }

    if (targetJoyEl) {
      targetJoyEl.textContent = `${targetJoyX.toFixed(2)}, ${targetJoyY.toFixed(2)}`;
    }

    if (joyEl) {
      joyEl.textContent = `${joyX.toFixed(2)}, ${joyY.toFixed(2)}`;
    }

    if (joystickXYEl) {
      const sensitivity =
        typeof mobileMoveSensitivity !== 'undefined'
          ? mobileMoveSensitivity
          : isMobileDevice
            ? 1.5
            : 1.0;
      joystickXYEl.textContent = `${joystickX.toFixed(2)}, ${joystickY.toFixed(2)}`;
      joystickXYEl.style.color =
        Math.abs(joystickX) > 0.01 || Math.abs(joystickY) > 0.01
          ? '#0f0'
          : '#888';
    }

    if (magnitudeEl) {
      const mag = Math.hypot(joystickX, joystickY);
      magnitudeEl.textContent = mag.toFixed(3);
      magnitudeEl.style.color = mag > 0.1 ? '#0f0' : '#888';
    }

    if (positionEl && joystickContainer) {
      const rect = joystickContainer.getBoundingClientRect();
      if (rect && rect.width > 0) {
        positionEl.textContent = `${Math.round(rect.left)}, ${Math.round(rect.top)}`;
      } else {
        const left = parseFloat(joystickContainer.style.left) || 0;
        const top = parseFloat(joystickContainer.style.top) || 0;
        positionEl.textContent = `${Math.round(left)}, ${Math.round(top)}`;
      }
    }

    if (eventsEl) {
      eventsEl.textContent = debugEventCount.toString();
    }
  } catch (e) {
    // Игнорируем ошибки в отладочной панели
    console.warn('Debug panel update error:', e);
  }
}

// (8) Мобильные туториалы
function showTouchTutorial() {
  if (tutorialDismissed || firstTouchShown) return;

  firstTouchShown = true;
  setTimeout(() => {
    const labels = document.querySelectorAll('.controls-label');
    labels.forEach((label) => {
      label.style.opacity = '1';
      label.style.transform = 'scale(1.2)';
    });
  }, 500);
}

function dismissTouchTutorial() {
  const labels = document.querySelectorAll('.controls-label');
  labels.forEach((label) => {
    label.style.transition = 'all 0.4s';
    label.style.opacity = '0.5';
    label.style.transform = 'scale(1)';
  });
  fireButton.style.animation = '';
  tutorialDismissed = true;
}

// Универсальный обработчик touchstart
document.addEventListener(
  'touchstart',
  (e) => {
    const target = e.target;

    // Сохраняем начальную позицию касания для отслеживания pull-to-refresh (swipe to refresh)
    const touches = Array.from(e.changedTouches || []);
    if (touches.length > 0) {
      touchStartY = touches[0].clientY;
    }

    // Если модальное окно открыто, предотвращаем прокрутку и pull-to-refresh
    if (modalOpen) {
      // Разрешаем нормальную работу элементов внутри модального окна
      if (target.closest('#modalOverlay') || target.closest('#pauseOverlay')) {
        // Разрешаем клики по кнопкам внутри модального окна
        return;
      }
      // Для всех остальных касаний предотвращаем прокрутку и pull-to-refresh
      // Особенно важно предотвращать касания от верхнего края экрана
      const shouldPrevent = touches.some((touch) => {
        // Предотвращаем если касание от верхнего края (pull-to-refresh) или в любом месте вне модального окна
        return touch.clientY < 100 || !target.closest('#modalOverlay');
      });
      if (shouldPrevent && e.cancelable) {
        e.preventDefault();
      }
      return;
    }

    // Во время игры предотвращаем pull-to-refresh при касании от верхнего края экрана
    // (касания от верхних 100px экрана могут вызвать pull-to-refresh)
    if (touches.some((touch) => touch.clientY < 100)) {
      // Предотвращаем pull-to-refresh, если касание не по UI элементам
      if (
        !target.closest('.menu-btn') &&
        !target.closest('.perk-btn') &&
        !target.closest('#hud') &&
        !target.closest('#pauseOverlay') &&
        !target.closest('#timerHud') &&
        !target.closest('#perkHud') &&
        !target.closest('#enemyPanel') &&
        !target.closest('#perkButtons')
      ) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    }

    // ВАЖНО: Сразу выходим, если касание по UI кнопкам - они должны работать нормально
    if (
      target.closest('.menu-btn') ||
      target.closest('.perk-btn') ||
      target.closest('#hud') ||
      target.closest('#pauseOverlay') ||
      target.closest('#timerHud') ||
      target.closest('#perkHud') ||
      target.closest('#enemyPanel') ||
      target.closest('#perkButtons')
    ) {
      return; // Позволяем кнопкам обрабатывать события самим
    }

    const screenWidth = window.innerWidth;

    let handled = false;
    touches.forEach((touch) => {
      if (touch.clientX > screenWidth * 0.66) {
        if (!fireButtonActive) {
          dynamicFireButtonStart(touch, e);
          handled = true;
        }
      } else {
        // Если джойстик уже активен, но с другим touchId, деактивируем старый и начинаем новый
        if (
          joystickActive &&
          joystickTouchId !== touch.identifier &&
          joystickTouchId !== null
        ) {
          // Деактивируем старый джойстик
          joystickActive = false;
          joystickTouchId = null;
          targetJoyX = 0;
          targetJoyY = 0;
          joyX = 0;
          joyY = 0;
          joystickX = 0;
          joystickY = 0;
          joystickContainer.style.transform = 'scale(0.8)';
          joystickContainer.style.opacity = '0';
          joystickContainer.style.pointerEvents = 'none';
          joystick.style.pointerEvents = 'none';
        }
        // Активируем джойстик для нового касания
        if (!joystickActive) {
          dynamicJoystickStart(touch, e);
          handled = true;
        } else if (joystickActive && joystickTouchId === touch.identifier) {
          // Если джойстик уже активен с этим touchId, обновляем позицию
          updateJoystickPosition(touch);
          handled = true;
        }
      }
    });

    // Если обработали касание для джойстика или кнопки, предотвращаем поведение по умолчанию
    if (handled && e.cancelable) {
      e.preventDefault();
    }

    // Закрываем туториал при касании
    if (
      firstTouchShown &&
      !tutorialDismissed &&
      (!joystickActive || !e.target.closest('#joystickContainer')) &&
      !e.target.closest('#fireButton')
    ) {
      dismissTouchTutorial();
    }
  },
  { passive: false },
);
