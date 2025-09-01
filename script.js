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

  function setupOrderPriceUpdate() {
    const quantityInput = document.querySelector('#quantity');
    const totalPriceEl = document.querySelector('#total');

    if (quantityInput && totalPriceEl) {
      function updatePrice() {
        let qty = parseInt(quantityInput.value) || 1;
        qty = Math.max(1, Math.min(10, qty));
        quantityInput.value = qty;
        totalPriceEl.textContent = qty * PRICE_PER_ITEM;
      }
      
      quantityInput.addEventListener('input', updatePrice);
      updatePrice(); // Call on page load to set initial total
    }
  }

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

  function setupOrderForm() {
    const orderForm = document.querySelector('#order-form');
    const modal = document.querySelector('#order-success');
    const modalText = document.querySelector('#order-success-text');
    const modalClose = document.querySelector('#order-success-close');

    const nameInput = document.querySelector('#name');
    const phoneInput = document.querySelector('#phone');
    const quantityInput = document.querySelector('#quantity');
    const totalElement = document.querySelector('#total');

    if (orderForm && modal && modalText && modalClose) {
      orderForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = nameInput?.value.trim() || 'клієнт';
        const phone = phoneInput?.value.trim() || '';
        const qty = quantityInput?.value || '1';
        const total = totalElement?.textContent || String((parseInt(qty) || 1) * PRICE_PER_ITEM);

        modalText.textContent = `Дякуємо, ${name}! Ваше замовлення на ${qty} шт. прийнято. Сума: ${total} ₴. Ми зв'яжемося з вами за телефоном ${phone}.`;
        modal.classList.add('show');

        orderForm.reset();
        if (quantityInput) quantityInput.value = 1;
        if (totalElement) totalElement.textContent = PRICE_PER_ITEM;
      });

      modalClose.addEventListener('click', () => {
        modal.classList.remove('show');
      });
    }
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
  setupCarousel('.hero-media');
  setupCarousel('.review-carousel');
  setupSmoothScroll();
  setupOrderPriceUpdate();
  setupMobileMenu();
  setupOrderForm();
  setupFaqAccordions();
  setupScrollAnimations();
});
