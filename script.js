document.addEventListener('DOMContentLoaded', () => {

  // Константа для ціни товару
  const PRICE_PER_ITEM = 1499;

  /**
   * Запускає таймер зворотного відліку до кінця дня.
   * @param {HTMLElement} display - Елемент для відображення таймера.
   */
  function startTimer(display) {
    function updateTimer() {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      let diff = Math.floor((endOfDay - now) / 1000);

      if (diff < 0) {
        diff = 0;
      }

      const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const seconds = String(diff % 60).padStart(2, '0');

      display.textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  /**
   * Налаштовує карусель із кнопками навігації та автопрокруткою.
   */
  function setupCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const nextButton = document.querySelector('.carousel-button.next');
    const prevButton = document.querySelector('.carousel-button.prev');
    let currentSlideIndex = 0;
    let autoScrollInterval;

    if (!slides.length) {
      return;
    }

    const showSlide = (index) => {
      slides.forEach(slide => slide.classList.remove('active'));
      slides[index].classList.add('active');
    };

    const nextSlide = () => {
      currentSlideIndex = (currentSlideIndex + 1) % slides.length;
      showSlide(currentSlideIndex);
    };

    const startAutoScroll = () => {
      stopAutoScroll();
      autoScrollInterval = setInterval(nextSlide, 5000);
    };

    const stopAutoScroll = () => {
      clearInterval(autoScrollInterval);
    };

    if (nextButton && prevButton) {
      nextButton.addEventListener('click', () => {
        nextSlide();
        startAutoScroll();
      });

      prevButton.addEventListener('click', () => {
        currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        showSlide(currentSlideIndex);
        startAutoScroll();
      });
    }

    showSlide(currentSlideIndex);
    startAutoScroll();
  }

  /**
   * Обробляє плавний скролінг до секцій та оновлює активний пункт меню.
   */
  function setupSmoothScroll() {
    const headerOffset = document.querySelector('.site-header')?.offsetHeight || 0;
    const navLinks = document.querySelectorAll('.tab-link');

    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();

        navLinks.forEach(item => item.classList.remove('active'));
        this.classList.add('active');

        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          const elementPosition = target.getBoundingClientRect().top + window.scrollY;
          const offsetPosition = elementPosition - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /**
   * Оновлює загальну ціну у формі замовлення на основі кількості.
   */
  function setupOrderPriceUpdate() {
    const quantityInput = document.querySelector('#quantity');
    const totalPriceEl = document.querySelector('#total');

    if (quantityInput && totalPriceEl) {
      quantityInput.addEventListener('input', () => {
        let qty = parseInt(quantityInput.value) || 1;
        qty = Math.max(1, Math.min(10, qty));
        quantityInput.value = qty;
        totalPriceEl.textContent = qty * PRICE_PER_ITEM;
      });
    }
  }

  /**
   * Налаштовує функціональність перемикача мобільного меню.
   */
  function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('#main-nav');

    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('active');
      });
    }
  }

  /**
   * Обробляє відправку форми та відображає модальне вікно підтвердження.
   */
  function setupOrderForm() {
    const orderForm = document.querySelector('#order-form');
    const modal = document.querySelector('#order-success');
    const modalText = document.querySelector('#order-success-text');
    const modalClose = document.querySelector('#order-success-close');

    if (orderForm && modal && modalText && modalClose) {
      orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.querySelector('#name')?.value.trim() || 'клієнт';
        const phone = document.querySelector('#phone')?.value.trim() || '';
        const qty = document.querySelector('#quantity')?.value || '1';
        const total = document.querySelector('#total')?.textContent || String((parseInt(qty) || 1) * PRICE_PER_ITEM);

        modalText.textContent = `Дякуємо, ${name}! Ваше замовлення на ${qty} шт. прийнято. Сума: ${total} ₴. Ми зв'яжемося з вами за телефоном ${phone}.`;
        modal.classList.add('show');

        orderForm.reset();
        document.querySelector('#quantity').value = 1;
        document.querySelector('#total').textContent = PRICE_PER_ITEM;
      });

      modalClose.addEventListener('click', () => {
        modal.classList.remove('show');
      });
    }
  }

  /**
   * Налаштовує поведінку акордеона для секції FAQ.
   */
  function setupFaqAccordions() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (!faqQuestions.length) return;

    faqQuestions.forEach(question => {
      question.addEventListener('click', () => {
        const answer = question.nextElementSibling;
        const isActive = question.classList.contains('active');

        // Закриваємо всі інші відкриті відповіді
        faqQuestions.forEach(q => {
          q.classList.remove('active');
          if (q.nextElementSibling) {
            q.nextElementSibling.style.display = 'none';
          }
        });

        // Відкриваємо відповідь, якщо вона не була активною
        if (!isActive) {
          question.classList.add('active');
          if (answer) {
            answer.style.display = 'block';
          }
        }
      });
    });
  }

  /**
   * Ініціалізує анімації на основі скролінгу.
   */
  function setupScrollAnimations() {
    const elementsToAnimate = document.querySelectorAll('.card, .faq-item, .review');
    if (!elementsToAnimate.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.1
      });

      elementsToAnimate.forEach(el => observer.observe(el));
    } else {
      // Запасний варіант для старих браузерів
      elementsToAnimate.forEach(el => el.classList.add('visible'));
    }
  }

  // === Ініціалізація всіх скриптів ===
  const timerDisplay = document.querySelector('#timer');
  if (timerDisplay) {
    startTimer(timerDisplay);
  }

  setupCarousel();
  setupSmoothScroll();
  setupOrderPriceUpdate();
  setupMobileMenu();
  setupOrderForm();
  setupFaqAccordions();
  setupScrollAnimations();
});
