let yaSDK = null;
let adLoading = false;

// Константы для причин показа рекламы
const AD_REASONS = {
  START: 'start_game',
  NEXT_LEVEL: 'next_level',
  GAME_OVER: 'game_over',
  GET_AMMO: 'get_ammo',
  GET_TIME: 'get_time',
  GET_LABEL: 'get_label',
};

async function initYaSDK() {
  try {
    // Проверяем наличие глобального объекта Яндекс SDK
    if (typeof YaGames !== 'undefined') {
      yaSDK = await YaGames.init();
      console.log('✅ YaGames SDK инициализирован');
      
      // Обновляем язык из Яндекс SDK после инициализации
      if (typeof updateLanguageFromYaSDK === 'function') {
        updateLanguageFromYaSDK();
      }
    } else {
      console.log('❌ YaGames SDK недоступен в окружении');
    }
  } catch (e) {
    console.log('❌ Ошибка инициализации YaGames SDK:', e);
  }
}

// Функция для уведомления Яндекс SDK о готовности игры
let gameReadyNotified = false;
function notifyGameReady() {
  // Вызываем только один раз
  if (gameReadyNotified) return;
  
  if (yaSDK && yaSDK.features && yaSDK.features.LoadingAPI) {
    try {
      yaSDK.features.LoadingAPI.ready();
      gameReadyNotified = true;
      console.log('✅ Игра уведомила Яндекс SDK о готовности');
    } catch (e) {
      console.log('❌ Ошибка при вызове LoadingAPI.ready():', e);
    }
  }
}

async function showAd(reason = AD_REASONS.START) {
  if (!yaSDK || adLoading) return false;
  adLoading = true;

  return new Promise((resolve) => {
    // Внутренняя переменная для отслеживания награды
    let isRewarded = false;

    switch (reason) {
      case AD_REASONS.GET_LABEL:
      case AD_REASONS.GET_TIME:
        yaSDK.adv.showRewardedVideo({
          callbacks: {
            onOpen: () => {
              // Игра должна быть уже на паузе (устанавливается перед вызовом showAd)
              console.log('Video open');
            },
            onRewarded: () => {
              isRewarded = true; // Фиксируем успех!
              console.log('Video showing');
            },
            onClose: () => {
              adLoading = false;
              resolve(isRewarded); // Возвращаем именно статус награды
              console.log('Video close');
            },
            onError: (e) => {
              console.log('Error:', e);
              adLoading = false;
              isRewarded = true;
              resolve(isRewarded);
              console.log('Video error');
            },
          },
        });
        break;

      default:
        // Для обычной межстраничной рекламы
        yaSDK.adv.showFullscreenAdv({
          callbacks: {
            onClose: () => {
              adLoading = false;
              isRewarded = true;
              resolve(isRewarded);
              console.log('Adv close');
            },
            onError: () => {
              adLoading = false;
              isRewarded = true;
              resolve(isRewarded);
              console.log('Adv error');
            },
          },
        });
        break;
    }
  });
}

// Эмуляция для тестирования (только если SDK не инициализирован)
if (!yaSDK) {
  // Не перезаписываем функцию сразу, а только после попытки инициализации
  window.fallbackShowAd = async function (reason) {
    console.log('📱 Эмуляция рекламы для тестирования');
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`📱 Показана реклама по причине: ${reason}`);
        resolve(Math.random() < 0.9);
      }, 2000);
    });
  };
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  initYaSDK().then(() => {
    if (!yaSDK) {
      // Только если SDK не инициализировался, используем эмуляцию
      window.showAd = window.fallbackShowAd;
    }
  });
});
