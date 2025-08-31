// script.js

// Таймер до конца дня с учетом коммента Артема
function startTimer(display) {
    function updateTimer() {
        const now = new Date();
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999); // конец текущего дня
        let diff = Math.floor((endOfDay - now) / 1000);

        if (diff < 0) diff = 0; // если уже конец дня

        const hours = String(Math.floor(diff / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
        const seconds = String(diff % 60).padStart(2, '0');

        display.textContent = `${hours}:${minutes}:${seconds}`;
    }

    updateTimer(); // обновить сразу при загрузке
    setInterval(updateTimer, 1000); // обновлять каждую секунду
}


window.addEventListener('DOMContentLoaded', () => {
    // Таймер
    const display = document.querySelector('#timer');
    if (display) {
        startTimer(display);
    }

    // Плавное появление элементов при скролле - с fallback'ом
    let observer = null;
    if ('IntersectionObserver' in window) {
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
    }

    // Подключаем все нужные элементы (если observer нет — делаем их видимыми сразу)
    document.querySelectorAll('.card, .faq-item, .review').forEach(el => {
        if (observer) observer.observe(el);
        else el.classList.add('visible');
    });

    // Обновление итоговой суммы
    const quantityInput = document.querySelector('#quantity');
    const totalPriceEl = document.querySelector('#total');
    const pricePerItem = 1499;

    if (quantityInput && totalPriceEl) {
        quantityInput.addEventListener('input', () => {
            let qty = parseInt(quantityInput.value);
            if (isNaN(qty) || qty < 1) qty = 1;
            if (qty > 10) qty = 10;
            quantityInput.value = qty;
            totalPriceEl.textContent = qty * pricePerItem;
        });
    }


    // Показываем popup покупок
    function showPopup(text) {
        const popup = document.querySelector('#purchases-popup');
        if (popup) {
            popup.textContent = text;
            popup.classList.add('show');
            setTimeout(() => { popup.classList.remove('show'); }, 3000);
        }
    }

    if (document.querySelector('#purchases-popup')) {
        setInterval(() => {
            let bought = Math.floor(Math.random() * 3) + 1;
            showPopup(`Тільки що купили ${bought} шт!`);
        }, 15000);
    }


    // Плавное переключение вкладок (с учётом фиксированного хедера)
    const header = document.querySelector('.site-header');
    const headerOffset = header ? header.offsetHeight : 0;


    document.querySelectorAll('.tab-link').forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();

            // убираем и добавляем active у ссылок
            document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
            this.classList.add('active');

            // плавный скролл к нужной секции
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


    // Плавное открытие FAQ вопросов (с проверками наличия h3 и p)
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const q = item.querySelector('h3');
        const a = item.querySelector('p');
        if (!q || !a) return; // если структура не та — пропускаем

        a.style.maxHeight = '0';
        a.style.overflow = 'hidden';
        a.style.transition = 'max-height 0.45s ease, opacity 0.35s ease';
        a.style.opacity = 0;

        q.addEventListener('click', () => {
            if (a.style.maxHeight === '0px' || a.style.maxHeight === '0') {
                a.style.maxHeight = a.scrollHeight + 'px';
                a.style.opacity = 1;
            } else {
                a.style.maxHeight = '0';
                a.style.opacity = 0;
            }
        });
    });

    // Form submit - красивое подтверждение через модалку (без ошибок, если поля отсутствуют)
    const orderForm = document.querySelector('#order-form');
    const modal = document.querySelector('#order-success');
    const modalText = document.querySelector('#order-success-text');
    const modalClose = document.querySelector('#order-success-close');

    if (orderForm && modal && modalText && modalClose) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameEl = document.querySelector('#name');
            const phoneEl = document.querySelector('#phone');
            const qtyEl = quantityInput || document.querySelector('#quantity');
            const totalEl = totalPriceEl || document.querySelector('#total');

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
});
