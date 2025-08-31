// === Допоміжні функції ===

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

    if (diff < 0) diff = 0;

    const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const seconds = String(diff % 60).padStart(2, '0');

    display.textContent = `${hours}:${minutes}:${seconds}`;
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/**
 * Обробляє плавну появу елементів при скролінгу за допомогою IntersectionObserver.
 */
function setupScrollAnimations() {
  const elementsToAnimate = document.querySelectorAll('.card, .faq-item, .review');
  if (!elementsToAnimate.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // Одноразова анімація
        }
      });
    }, {
      threshold: 0.1
    });

    elementsToAnimate.forEach(el => observer.observe(el));
  } else {
    // Fallback для старих браузерів
    elementsToAnimate.forEach(el => el.classList.add('visible'));
  }
}

/**
 * Оновлює загальну суму замовлення на основі кількості товару.
 */
function setupOrderPriceUpdate() {
  const quantityInput = document.querySelector('#quantity');
  const totalPriceEl = document.querySelector('#total');
  const pricePerItem = 1499;

  if (quantityInput && totalPriceEl) {
    quantityInput.addEventListener('input', () => {
      let qty = parseInt(quantityInput.value) || 1;
      qty = Math.max(1, Math.min(10, qty)); // Обмеження від 1 до 10
      quantityInput.value = qty;
      totalPriceEl.textContent = qty * pricePerItem;
    });
  }
}

/**
 * Показ спливаючого вікна "покупок" з імітацією активності.
 */
function setupPurchasesPopup() {
  const popup = document.querySelector('#purchases-popup');
  if (!popup) return;

  function showPopup(text) {
    popup.textContent = text;
    popup.classList.add('show');
    setTimeout(() => popup.classList.remove('show'), 3000);
  }

  setInterval(() => {
    const bought = Math.floor(Math.random() * 3) + 1;
    showPopup(`Тільки що купили ${bought} шт!`);
  }, 15000);
}

/**
 * Налаштовує плавний скролінг до секцій з урахуванням висоти шапки.
 */
function setupSmoothScroll() {
  const headerOffset = document.querySelector('.site-header')?.offsetHeight || 0;

  document.querySelectorAll('.tab-link').forEach(tab => {
    tab.addEventListener('click', function(e) {
      e.preventDefault();

      document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
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

// Логіка для розкривних FAQ
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
  question.addEventListener('click', () => {
    const answer = question.nextElementSibling;

    // Перевіряємо, чи активне вже питання
    const isActive = question.classList.contains('active');

    // Закриваємо всі питання та повертаємо стрілочки вниз
    faqQuestions.forEach(q => {
      q.classList.remove('active');
      q.nextElementSibling.style.display = 'none';
    });

    // Якщо питання не було активним, відкриваємо його та повертаємо стрілочку вгору
    if (!isActive) {
      question.classList.add('active');
      answer.style.display = 'block';
    }
  });
});

/**
 * Обробляє відправку форми та відображає модальне вікно підтвердження.
 */
function setupOrderForm() {
  const orderForm = document.querySelector('#order-form');
  const modal = document.querySelector('#order-success');
  const modalText = document.querySelector('#order-success-text');
  const modalClose = document.querySelector('#order-success-close');
  const pricePerItem = 1499;

  if (orderForm && modal && modalText && modalClose) {
    orderForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameEl = document.querySelector('#name');
      const phoneEl = document.querySelector('#phone');
      const qtyEl = document.querySelector('#quantity');
      const totalEl = document.querySelector('#total');

      const name = nameEl ? nameEl.value.trim() : '';
      const phone = phoneEl ? phoneEl.value.trim() : '';
      const qty = qtyEl ? qtyEl.value : '1';
      const total = totalEl ? totalEl.textContent : String((parseInt(qty) || 1) * pricePerItem);

      modalText.textContent = `Дякуємо, ${name || 'клієнт'}! Ваше замовлення на ${qty} шт. прийнято. Сума: ${total} ₴. Ми зв'яжемося з вами за телефоном ${phone}.`;
      modal.classList.add('show');

      orderForm.reset();
      if (qtyEl) qtyEl.value = 1;
      if (totalEl) totalEl.textContent = pricePerItem;
    });

    modalClose.addEventListener('click', () => {
      modal.classList.remove('show');
    });
  }
}

/**
 * Налаштовує перемикання мобільного меню.
 */
function setupMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const mainNav = document.querySelector('#main-nav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true' || false;
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      mainNav.classList.toggle('active');
    });
  }
}


// === Ініціалізація всіх скриптів після завантаження DOM ===
document.addEventListener('DOMContentLoaded', () => {
  const timerDisplay = document.querySelector('#timer');
  if (timerDisplay) {
    startTimer(timerDisplay);
  }

  setupScrollAnimations();
  setupOrderPriceUpdate();
  setupPurchasesPopup();
  setupSmoothScroll();
  setupFaqAccordions();
  setupOrderForm();
  setupMobileMenu();
});