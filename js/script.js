/**
 * Свадебный лендинг: Сергей & Валерия (31.10.2026)
 * Клиентский модуль интерактивности:
 * - Полноэкранный просмотр изображений (Lightbox) с блокировкой скролла
 * - Плавный якорный скролл по кнопке-стрелке первого экрана
 * - Прецизионный секундный таймер обратного отсчета (UTC+3)
 * - Скролл-анимации проявления блоков (IntersectionObserver API)
 * - Изолированные табы карт маршрута (Яндекс / Google)
 * - Интерактивный аккордеон карточек палитры дресс-кода
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     1. ПОЛНОЭКРАННЫЙ LIGHTBOX ДЛЯ ПРОСМОТРА ФОТОГРАФИЙ
     ========================================================================== */
  const lightboxModal = document.getElementById('image-lightbox');
  const lightboxImage = document.getElementById('lightbox-img');
  const lightboxCloseBtn = document.getElementById('lightbox-close');
  const zoomablePhotos = document.querySelectorAll('.zoomable-photo');

  /**
   * Открывает модальное окно с выбранной фотографией и блокирует фоновый скролл.
   * @param {string} imageSrc - Путь к изображению.
   * @param {string} imageAlt - Альтернативный текст.
   */
  function openLightbox(imageSrc, imageAlt) {
    if (!lightboxModal || !lightboxImage) return;

    lightboxImage.src = imageSrc;
    lightboxImage.alt = imageAlt || 'Фотография в полном размере';
    lightboxModal.classList.add('is-open');
    lightboxModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Защита от скролла страницы под модалкой
  }

  /**
   * Закрывает модальное окно и возвращает естественный скролл страницы.
   */
  function closeLightbox() {
    if (!lightboxModal || !lightboxImage) return;

    lightboxModal.classList.remove('is-open');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Очищаем источник изображения после завершения анимации затухания
    setTimeout(() => {
      if (!lightboxModal.classList.contains('is-open')) {
        lightboxImage.src = '';
      }
    }, 300);
  }

  // Привязка клика ко всем зумируемым фотографиям
  zoomablePhotos.forEach(photo => {
    photo.addEventListener('click', (event) => {
      event.stopPropagation();
      openLightbox(photo.currentSrc || photo.src, photo.alt);
    });
  });

  // Закрытие по клику на крестик
  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      closeLightbox();
    });
  }

  // Закрытие по клику на темную область вокруг фотографии
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (event) => {
      if (event.target === lightboxModal || event.target.classList.contains('lightbox-content-box')) {
        closeLightbox();
      }
    });
  }

  // Доступность: закрытие по клавише Escape
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('is-open')) {
      closeLightbox();
    }
  });


  /* ==========================================================================
     2. ПЛАВНЫЙ СКРОЛЛ ПО СТРЕЛКЕ ПЕРВОГО ЭКРАНА
     ========================================================================== */
  const scrollCueBtn = document.querySelector('.scroll-cue-btn');

  if (scrollCueBtn) {
    scrollCueBtn.addEventListener('click', (event) => {
      const targetHash = scrollCueBtn.getAttribute('href');
      if (!targetHash || targetHash === '#') return;

      const targetSection = document.querySelector(targetHash);
      if (targetSection) {
        event.preventDefault();
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }


  /* ==========================================================================
     3. ПРЕЦИЗИОННЫЙ СЕКУНДНЫЙ ТАЙМЕР ОБРАТНОГО ОТСЧЕТА
     ========================================================================== */
  // Фиксируем целевую точку: 31 октября 2026 года, 16:00:00 (МСК / UTC+3)
  const WEDDING_TIMESTAMP = new Date('2026-10-31T16:00:00+03:00').getTime();

  const elDays = document.getElementById('cd-days');
  const elHours = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');
  const elCountdown = document.getElementById('countdown');

  function updateCountdown() {
    if (!elDays || !elHours || !elMinutes || !elSeconds) return;

    const now = Date.now();
    const distance = WEDDING_TIMESTAMP - now;

    // Граничное условие: праздник наступил
    if (distance <= 0) {
      if (elCountdown) {
        elCountdown.innerHTML = `
          <div style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--color-bordeaux); padding: 8px 0;">
            Праздник начался! С♥️В
          </div>
        `;
      }
      return;
    }

    const totalSeconds = Math.floor(distance / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    // Добавляем ведущие нули (формат: 04 вместо 4)
    elDays.textContent = String(days).padStart(2, '0');
    elHours.textContent = String(hours).padStart(2, '0');
    elMinutes.textContent = String(minutes).padStart(2, '0');
    elSeconds.textContent = String(seconds).padStart(2, '0');
  }

  updateCountdown();
  const countdownIntervalId = setInterval(updateCountdown, 1000);


  /* ==========================================================================
     4. ПЛАВНЫЕ СКРОЛЛ-АНИМАЦИИ (INTERSECTION OBSERVER API)
     ========================================================================== */
  const animatedElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window) {
    const scrollObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Отключаем наблюдение после первого проявления для разгрузки CPU
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    animatedElements.forEach(el => scrollObserver.observe(el));
  } else {
    // Фоллбэк для устаревших мобильных браузеров
    animatedElements.forEach(el => el.classList.add('is-visible'));
  }


  /* ==========================================================================
     5. ИЗОЛИРОВАННЫЕ ТАБЫ ПЕРЕКЛЮЧЕНИЯ КАРТ (ЯНДЕКС / GOOGLE)
     ========================================================================== */
  const mapBlocks = document.querySelectorAll('.interactive-map-block');

  mapBlocks.forEach(mapBlock => {
    const tabButtons = mapBlock.querySelectorAll('.switcher-btn');
    const mapPanes = mapBlock.querySelectorAll('.map-pane');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetMap = button.getAttribute('data-tab-target');

        tabButtons.forEach(btn => {
          const isActive = btn === button;
          btn.classList.toggle('active', isActive);
          btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        mapPanes.forEach(pane => {
          const isTarget = pane.getAttribute('data-map-pane') === targetMap;
          pane.classList.toggle('active', isTarget);
        });
      });
    });
  });


  /* ==========================================================================
     6. ИНТЕРАКТИВНЫЙ АККОРДЕОН ПАЛИТРЫ ДРЕСС-КОДА
     ========================================================================== */
  const swatchCards = document.querySelectorAll('.swatch-square-card');

  function toggleColorCard(targetCard) {
    const isCurrentlyActive = targetCard.classList.contains('active');

    // Закрываем остальные открытые карточки
    swatchCards.forEach(c => c.classList.remove('active'));

    // Раскрываем выбранную карточку
    if (!isCurrentlyActive) {
      targetCard.classList.add('active');
    }
  }

  swatchCards.forEach(card => {
    // Клик мышью или тап по сенсорному экрану
    card.addEventListener('click', () => toggleColorCard(card));

    // Доступность с клавиатуры: клавиши Enter и Пробел
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleColorCard(card);
      }
    });
  });


  /* ==========================================================================
     7. ОЧИСТКА ПАМЯТИ
     ========================================================================== */
  window.addEventListener('beforeunload', () => {
    clearInterval(countdownIntervalId);
  });

});
