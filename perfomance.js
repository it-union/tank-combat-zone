let lastTime = 0;
let deltaTime = 1 / 60; // базовая дельта для 60 FPS
const isMobile =
  /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
let mobileOptimizationLevel = isMobile ? 2 : 0;
let mobileMoveSensitivity = isMobile ? 1.5 : 1.0;

const PLAYER_TANK_SPEEDUP = 0.78; // -22% скорости танка игрока (очень комфортно)
const ENEMY_TANK_SPEEDUP = 1.5; // +150% скорости танков врагов (динамично)
const MOBILE_BULLET_SPEEDUP = 1.2; // +20% скорости снарядов (видна траектория)
const MOBILE_FIRE_RATE = 0.85; // +15% частоты стрельбы врагов
const MOBILE_SOUND_REDUCTION = 20; // звук двигателя каждые 4 кадра вместо каждого

// ============================================
// СИСТЕМА АДАПТИВНОЙ ПРОИЗВОДИТЕЛЬНОСТИ
// ============================================
const performanceMonitor = {
  fpsHistory: [],
  maxHistorySize: 60,
  averageFPS: 60,
  qualityLevel: 2, // 0=низкое, 1=среднее, 2=высокое
  lastAdjustTime: 0,
  adjustInterval: 2000, // 2 секунды между проверками

  adaptiveSpeedMultiplier: 1.0,
  adaptiveParticleLimit: 100,
  notificationTimeout: null,

  update(currentFPS, currentTime) {
    if (!isMobile) return; // Только для мобильных

    this.fpsHistory.push(currentFPS);
    if (this.fpsHistory.length > this.maxHistorySize) {
      this.fpsHistory.shift();
    }

    // Вычисляем средний FPS за последние кадры
    if (this.fpsHistory.length >= 30) {
      this.averageFPS = Math.round(
        this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length,
      );

      // Проверяем, нужна ли адаптация
      if (currentTime - this.lastAdjustTime > this.adjustInterval) {
        this.adjustQuality();
        this.lastAdjustTime = currentTime;
      }
    }
  },

  adjustQuality() {
    const oldLevel = this.qualityLevel;

    // Снижаем качество при низком FPS
    if (this.averageFPS < 20 && this.qualityLevel > 0) {
      this.qualityLevel--;
      this.applyQualitySettings();
      this.showNotification(`📉 Качество снижено (FPS: ${this.averageFPS})`);
    }
    // Повышаем качество при стабильном FPS
    else if (this.averageFPS > 50 && this.qualityLevel < 2) {
      this.qualityLevel++;
      this.applyQualitySettings();
      this.showNotification(`📈 Качество повышено (FPS: ${this.averageFPS})`);
    }
    // Плавная адаптация множителей без смены уровня
    else {
      this.smoothAdapt();
    }
  },

  applyQualitySettings() {
    switch (this.qualityLevel) {
      case 0: // Низкое - максимальная производительность
        this.adaptiveSpeedMultiplier = 1.8;
        this.adaptiveParticleLimit = 30;
        mobileOptimizationLevel = 3;
        console.log('🔴 Качество: НИЗКОЕ (максимальная производительность)');
        break;

      case 1: // Среднее - баланс
        this.adaptiveSpeedMultiplier = 1.3;
        this.adaptiveParticleLimit = 70;
        mobileOptimizationLevel = 2;
        console.log('🟡 Качество: СРЕДНЕЕ (баланс)');
        break;

      case 2: // Высокое - качество
        this.adaptiveSpeedMultiplier = 1.0;
        this.adaptiveParticleLimit = 120;
        mobileOptimizationLevel = 1;
        console.log('🟢 Качество: ВЫСОКОЕ (качество графики)');
        break;
    }

    // Применяем лимит частиц
    if (particles.length > this.adaptiveParticleLimit) {
      particles.length = this.adaptiveParticleLimit;
    }
  },

  smoothAdapt() {
    // Плавная адаптация множителя скорости в пределах текущего уровня
    const targetMultiplier = this.getTargetMultiplier();
    this.adaptiveSpeedMultiplier +=
      (targetMultiplier - this.adaptiveSpeedMultiplier) * 0.1;
  },

  getTargetMultiplier() {
    // Целевой множитель на основе текущего FPS
    if (this.averageFPS < 15) return 2.0;
    if (this.averageFPS < 25) return 1.6;
    if (this.averageFPS < 35) return 1.4;
    if (this.averageFPS < 45) return 1.2;
    return 1.0;
  },

  showNotification(text) {
    console.log(`[Performance] ${text}`);

    // Визуальное уведомление на экране
    if (fpsDisplay) {
      const originalText = fpsDisplay.textContent;
      fpsDisplay.style.backgroundColor = 'rgba(255, 165, 0, 0.8)';
      fpsDisplay.textContent = text;

      clearTimeout(this.notificationTimeout);
      this.notificationTimeout = setTimeout(() => {
        fpsDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        fpsDisplay.textContent = originalText;
      }, 2000);
    }
  },

  getQualityName() {
    const qualityNames = t('qualityNames');
    return qualityNames && qualityNames[this.qualityLevel] 
      ? qualityNames[this.qualityLevel] 
      : ['НИЗКОЕ', 'СРЕДНЕЕ', 'ВЫСОКОЕ'][this.qualityLevel];
  },
};
