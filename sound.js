

let soundEnabled = true;
let audioCtx = null;
let engineOsc = null;
let engineGain = null;
let noiseBuffer = null;
let engineSoundFrameCounter = 0; // Счётчик кадров для оптимизации звука двигателя  

function initAudio() {
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Создаем буфер белого шума для взрывов и выстрелов
    const bufferSize = audioCtx.sampleRate * 2;
    noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    setupEngineSound();
}

function setupEngineSound() {
    // Создаём два осциллятора для более реалистичного звука танкового двигателя
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    engineGain = audioCtx.createGain();
    
    // Низкий гул (основной тон двигателя)
    osc1.type = 'triangle'; // Мягче чем sawtooth
    osc1.frequency.value = 35; // Низкая частота для танкового двигателя
    
    // Дополнительный тон для глубины
    osc2.type = 'sine';
    osc2.frequency.value = 70; // Октава выше
    
    // Смешиваем осцилляторы
    const mixer = audioCtx.createGain();
    mixer.gain.value = 0.6; // osc2 тише
    
    engineGain.gain.value = 0; // Изначально тишина
    
    osc1.connect(engineGain);
    osc2.connect(mixer);
    mixer.connect(engineGain);
    engineGain.connect(audioCtx.destination);
    
    osc1.start();
    osc2.start();
    
    // Сохраняем ссылки для управления частотой
    engineOsc = osc1;
    engineOsc.osc2 = osc2;
}

function playShootSound() {
    if (!audioCtx || !soundEnabled) return;
    const now = audioCtx.currentTime;

    // Основной импульс (шум)
    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = audioCtx.createGain();

    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(now);
    noise.stop(now + 0.1);

    // Металлический лязг (осциллятор)
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);

    oscGain.gain.setValueAtTime(0.2, now);
    oscGain.gain.linearRampToValueAtTime(0, now + 0.1);

    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
}

function playExplosionSound(isBig = false) {
    if (!audioCtx || !soundEnabled) return;
    const now = audioCtx.currentTime;
    const duration = isBig ? 0.8 : 0.4;

    const noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = audioCtx.createBiquadFilter();
    const noiseGain = audioCtx.createGain();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isBig ? 400 : 800, now);
    filter.frequency.exponentialRampToValueAtTime(20, now + duration);

    noiseGain.gain.setValueAtTime(isBig ? 0.5 : 0.2, now);
    noiseGain.gain.linearRampToValueAtTime(0, now + duration);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);

    noise.start(now);
    noise.stop(now + duration);
}

function playLootPickupSound(lootType = 'ammo') {
    if (!audioCtx || !soundEnabled) return;
    const now = audioCtx.currentTime;

    // Разные звуки для разных типов лута
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Настройка звука в зависимости от типа лута
    if (lootType === 'ammo') {
        // Патроны - быстрый "клик" с металлическим оттенком
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    } else if (lootType === 'hp') {
        // Аптечка - мягкий восстанавливающий звук
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.linearRampToValueAtTime(900, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    } else if (lootType === 'perk') {
        // Перк - магический звон
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.linearRampToValueAtTime(1600, now + 0.1);
        osc.frequency.linearRampToValueAtTime(1400, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    }

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    const duration = lootType === 'perk' ? 0.2 : (lootType === 'hp' ? 0.15 : 0.08);
    osc.start(now);
    osc.stop(now + duration);
}

function updateEngineSound(speed, maxSpeed) {
    if (!engineOsc || !engineGain || !soundEnabled) return;
    
    // Оптимизация для мобильных: обновляем звук не каждый кадр
    // MOBILE_SOUND_REDUCTION определена в perfomance.js (например, 4 = каждые 4 кадра)
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const reduction = typeof MOBILE_SOUND_REDUCTION !== 'undefined' && isMobile ? MOBILE_SOUND_REDUCTION : 1;
    
    engineSoundFrameCounter++;
    if (engineSoundFrameCounter % reduction !== 0) {
        return; // Пропускаем обновление на этом кадре
    }
    
    const now = audioCtx.currentTime;

    // Нормализуем скорость относительно максимальной (0-1)
    // Это обеспечивает одинаковый звук на мобильных и десктопе
    const normalizedSpeed = Math.min(Math.abs(speed) / maxSpeed, 1);

    // Более реалистичная формула для танкового двигателя
    // Базовая частота 30Hz (холостой ход) + изменение при движении
    const baseFreq = 30;
    const maxFreq = 55;
    const freq = baseFreq + (normalizedSpeed * (maxFreq - baseFreq));
    
    engineOsc.frequency.setTargetAtTime(freq, now, 0.15);
    
    // Второй осциллятор (октава выше)
    if (engineOsc.osc2) {
      engineOsc.osc2.frequency.setTargetAtTime(freq * 2, now, 0.15);
    }

    // Громкость: тише на холостом ходу, громче при движении
    const idleVolume = 0.02; // Минимальный гул на холостом ходу
    const maxVolume = 0.08; // Максимальная громкость при движении
    const volume = idleVolume + (normalizedSpeed * (maxVolume - idleVolume));
    engineGain.gain.setTargetAtTime(volume, now, 0.15);
}

function pauseAllSounds() {
    if (!audioCtx) return;

    if (engineGain) {
      // Немедленно останавливаем звук двигателя
      engineGain.gain.cancelScheduledValues(audioCtx.currentTime);
      engineGain.gain.setValueAtTime(0, audioCtx.currentTime);
    }
}

function resumeAllSounds() {
    if (!audioCtx) return;

    if (engineGain && (Math.abs(tank.vx) > 0.01 || Math.abs(tank.vy) > 0.01)) {
      const speed = Math.hypot(tank.vx, tank.vy);
      updateEngineSound(speed, tank.maxSpeed);
    }
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const btn = document.getElementById('soundToggleBtn');
    if (btn) {
      btn.textContent = soundEnabled ? '🔊 Звук' : '🔇 Без звука';
      btn.classList.toggle('sound-off', !soundEnabled);
      if (!soundEnabled && engineGain) {
        engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1);
      }
    }
}