// script.js

// Таймер акции
function startTimer(duration, display) {
    let timer = duration;
    let hours, minutes, seconds;
    setInterval(function () {
        hours = Math.floor(timer / 3600);
        minutes = Math.floor((timer % 3600) / 60);
        seconds = timer % 60;

        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        display.textContent = hours + ':' + minutes + ':' + seconds;

        if (timer > 0) {
            timer--;
        }
    }, 1000);
}

window.addEventListener('DOMContentLoaded', () => {
    const display = document.querySelector('#timer');
    const actionTime = 12 * 60 * 60; // 12 часов
    startTimer(actionTime, display);

    // Плавное появление элементов при скролле
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    // Подключаем все нужные элементы
    document.querySelectorAll('.card, .faq-item, .review').forEach(el => {
        observer.observe(el);
    });

    // Обновление итоговой суммы
    const quantityInput = document.querySelector('#quantity');
    const totalPriceEl = document.querySelector('#total');
    const pricePerItem = 1499;

    quantityInput.addEventListener('input', () => {
        let qty = parseInt(quantityInput.value);
        if (isNaN(qty) || qty < 1) qty = 1;
        if (qty > 10) qty = 10;
        quantityInput.value = qty;
        totalPriceEl.textContent = qty * pricePerItem;
    });

    // Показываем popup покупок
    function showPopup(text) {
        const popup = document.querySelector('#purchases-popup');
        popup.textContent = text;
        popup.classList.add('show');
        setTimeout(() => { popup.classList.remove('show'); }, 3000);
    }

    // Имитируем случайные покупки
    setInterval(() => {
        let bought = Math.floor(Math.random() * 3) + 1;
        showPopup(`Тільки що купили ${bought} шт!`);
    }, 15000);

    // Плавное переключение вкладок
    document.querySelectorAll('.tab-link').forEach(tab => {
    tab.addEventListener('click', function (e) {
        e.preventDefault();

        // убираем и добавляем active у ссылок
        document.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
        this.classList.add('active');

        // плавный скролл к нужной секции
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

    // Плавное открытие FAQ вопросов
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const q = item.querySelector('h3');
        const a = item.querySelector('p');
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

    // Form submit - simple confirmation (frontend only)
    const orderForm = document.querySelector('#order-form');
    if (orderForm) {
        orderForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.querySelector('#name').value.trim();
            const phone = document.querySelector('#phone').value.trim();
            const qty = document.querySelector('#quantity').value;
            const total = document.querySelector('#total').textContent;
            alert(`Дякуємо, ${name}! Ваше замовлення на ${qty} шт. прийнято. Сума: ${total} ₴. Ми зв'яжемося з вами за телефоном ${phone}.`);
            orderForm.reset();
            document.querySelector('#quantity').value = 1;
            document.querySelector('#total').textContent = pricePerItem;
        });
    }
});
