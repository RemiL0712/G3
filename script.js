document.addEventListener('DOMContentLoaded', () => {

  const PRICE_PER_ITEM = 1499;

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

  function setupCarousel(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const slides = container.querySelectorAll('.carousel-slide');
    const nextButton = container.querySelector('.carousel-button.next');
    const prevButton = container.querySelector('.carousel-button.prev');
    let currentSlideIndex = 0;
    let autoScrollInterval;

    if (!slides.length || !nextButton || !prevButton) {
      return;
    }

    function showSlide(index) {
      slides.forEach(slide => slide.classList.remove('active'));
      slides[index].classList.add('active');
    }

    function nextSlide() {
      currentSlideIndex = (currentSlideIndex + 1) % slides.length;
      showSlide(currentSlideIndex);
    }

    function startAutoScroll() {
      stopAutoScroll();
      autoScrollInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoScroll() {
      clearInterval(autoScrollInterval);
    }

    nextButton.addEventListener('click', () => {
      nextSlide();
      startAutoScroll();
    });

    prevButton.addEventListener('click', () => {
      currentSlideIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
      showSlide(currentSlideIndex);
      startAutoScroll();
    });

    showSlide(currentSlideIndex);
    startAutoScroll();
  }

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
    const quantityEl = document.querySelector('#quantity');
    const minusBtn = document.querySelector('.minus-btn');
    const plusBtn = document.querySelector('.plus-btn');
    const totalPriceEl = document.querySelector('#total');
    
    // Перевіряємо, чи існують всі елементи перед налаштуванням
    if (quantityEl && minusBtn && plusBtn && totalPriceEl) {
      function updatePrice() {
        let qty = parseInt(quantityEl.textContent) || 1;
        totalPriceEl.textContent = qty * PRICE_PER_ITEM;
      }
      
      minusBtn.addEventListener('click', () => {
        let qty = parseInt(quantityEl.textContent);
        if (qty > 1) {
          quantityEl.textContent = qty - 1;
          updatePrice();
        }
      });
      
      plusBtn.addEventListener('click', () => {
        let qty = parseInt(quantityEl.textContent);
        if (qty < 10) {
          quantityEl.textContent = qty + 1;
          updatePrice();
        }
      });
      
      updatePrice(); // Викликаємо при завантаженні сторінки, щоб встановити початкову суму
    }
  }

  /**
   * Налаштовує функціональність перемикача мобільного меню.
   */
  function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('#main-nav');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && mainNav) {
      menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        mainNav.classList.toggle('active');
      });

      // Додаємо обробник подій до кожного посилання в мобільному меню
      navLinks.forEach(link => {
        link.addEventListener('click', () => {
          // Закриваємо меню після кліку на посилання
          menuToggle.setAttribute('aria-expanded', 'false');
          mainNav.classList.remove('active');
        });
      });
    }
  }

 const NOVA_POSHTA_API_KEY = '373241c354ae171bbebf897b9dc07c5d'; // <--- ЗАМІНІТЬ НА ВАШ КЛЮЧ
  const API_URL = 'https://api.novaposhta.ua/v2.0/json/';

  /**
   * Завантажує список міст з API Нової Пошти.
   */
  async function loadCities() {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        apiKey: NOVA_POSHTA_API_KEY,
        modelName: 'Address',
        calledMethod: 'getCities',
        methodProperties: {
          "Page": "1",
          "Limit": "500"
        }
      })
    });
    const data = await response.json();
    return data.data;
  }

  /**
   * Завантажує список відділень для обраного міста.
   * @param {string} cityRef - Ref міста.
   */
  async function loadWarehouses(cityRef) {
    const response = await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        apiKey: NOVA_POSHTA_API_KEY,
        modelName: 'Address',
        calledMethod: 'getWarehouses',
        methodProperties: {
          "CityRef": cityRef
        }
      })
    });
    const data = await response.json();
    return data.data;
  }

  /**
   * Обробляє відправку форми замовлення та показує модальне вікно.
   */
function setupOrderForm() {
  const form = document.getElementById('order-form');
  const citiesSelect = document.getElementById('cities-select');
  const warehousesInput = document.getElementById('warehouses-input');
  const warehousesList = document.getElementById('warehouses-list');
  const modal = document.getElementById('order-success');
  const modalText = document.getElementById('order-success-text');
  const modalCloseBtn = document.getElementById('order-success-close');
  let allWarehouses = []; // Змінна для зберігання всіх відділень

  // Завантажуємо міста при завантаженні сторінки
  loadCities().then(cities => {
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city.Ref;
      option.textContent = city.Description;
      citiesSelect.appendChild(option);
    });
  });

  // Оновлюємо відділення при зміні міста
  citiesSelect.addEventListener('change', async (event) => {
    const cityRef = event.target.value;
    warehousesInput.value = '';
    warehousesInput.placeholder = 'Завантаження відділень...';
    warehousesInput.disabled = true;
    warehousesList.innerHTML = '';

    allWarehouses = await loadWarehouses(cityRef);

    warehousesInput.disabled = false;
    warehousesInput.placeholder = 'Почніть вводити назву відділення...';
  });

  // Обробка пошуку у полі введення
  warehousesInput.addEventListener('input', () => {
    const searchTerm = warehousesInput.value.toLowerCase();
    warehousesList.innerHTML = ''; // Очищаємо старий список

    if (searchTerm.length > 1) {
      const filteredWarehouses = allWarehouses.filter(w =>
        w.Description.toLowerCase().includes(searchTerm)
      );

      filteredWarehouses.forEach(warehouse => {
        const li = document.createElement('li');
        li.textContent = warehouse.Description;
        li.setAttribute('data-value', warehouse.Description);
        li.addEventListener('click', () => {
          warehousesInput.value = warehouse.Description;
          warehousesList.innerHTML = '';
        });
        warehousesList.appendChild(li);
      });
    }
  });

  // Обробка фокусу для відображення списку, якщо він є
  warehousesInput.addEventListener('focus', () => {
    if (warehousesInput.value === '' && allWarehouses.length > 0) {
       // Якщо поле пусте, можна показати кілька перших відділень
       const topWarehouses = allWarehouses.slice(0, 5);
       warehousesList.innerHTML = '';
       topWarehouses.forEach(warehouse => {
         const li = document.createElement('li');
         li.textContent = warehouse.Description;
         li.setAttribute('data-value', warehouse.Description);
         li.addEventListener('click', () => {
           warehousesInput.value = warehouse.Description;
           warehousesList.innerHTML = '';
         });
         warehousesList.appendChild(li);
       });
    }
  });

  // Закриття списку, якщо клік поза межами контейнера
  document.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown-container')) {
      warehousesList.innerHTML = '';
    }
  });

  if (!form || !modal || !modalText || !modalCloseBtn) return;

  form.addEventListener('submit', function(event) {
      event.preventDefault();

      const name = form.querySelector('#name').value;
      const phone = form.querySelector('#phone').value;
      const city = citiesSelect.options[citiesSelect.selectedIndex].text;
      const warehouse = warehousesInput.value;
      const quantity = document.getElementById('quantity').textContent;
      const total = document.getElementById('total').textContent;
      const paymentMethod = document.querySelector('input[name="payment-method"]:checked').value;

      console.log({
          name,
          phone,
          city,
          warehouse,
          quantity,
          total,
          paymentMethod
      });

      modalText.textContent = `Дякуємо, ${name}! Ваше замовлення прийнято. Ми зв'яжемося з вами за номером ${phone} для уточнення деталей доставки.`;
      modal.classList.add('show'); // Використовуйте 'show' клас
      form.reset();
      document.getElementById('quantity').textContent = '1';
  });

  modalCloseBtn.addEventListener('click', () => {
      modal.classList.remove('show');
  });

  modal.addEventListener('click', (e) => {
      if (e.target === modal) {
          modal.classList.remove('show');
      }
  });
}

  function setupFaqAccordions() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      if (!question || !answer) return;

      question.addEventListener('click', () => {
        const isActive = question.classList.contains('active');

        faqItems.forEach(i => {
          const q = i.querySelector('.faq-question');
          const a = i.querySelector('.faq-answer');
          if (q && a && q.classList.contains('active')) {
            q.classList.remove('active');
            a.style.display = 'none';
          }
        });

        if (!isActive) {
          question.classList.add('active');
          answer.style.display = 'block';
        }
      });
    });
  }

  function setupScrollAnimations() {
    const elementsToAnimate = document.querySelectorAll('.card, .faq-item, .review-card');
    if (!elementsToAnimate.length) return;

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, observer) => {
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
      elementsToAnimate.forEach(el => el.classList.add('visible'));
    }
  }

  function setupBackToTopButton() {
    const backToTopButton = document.querySelector('#back-to-top');
    if (!backToTopButton) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopButton.classList.add('show');
      } else {
        backToTopButton.classList.remove('show');
      }
    });
  }


   const timerDisplay = document.querySelector('#timer');
  if (timerDisplay) {
    startTimer(timerDisplay);
  }

  setupBackToTopButton();
  setupSmoothScroll();
  setupOrderPriceUpdate();
  setupMobileMenu();
  setupOrderForm(); // Тут ваша розширена функція
  setupFaqAccordions();
  setupScrollAnimations();
  setupCarousel('.hero-media');
  setupCarousel('.review-carousel');
});
