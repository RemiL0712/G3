// premium_script.js

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
            if(entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .faq-item').forEach(el => {
        el.classList.add('hidden');
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
        popup.style.opacity = 1;
        setTimeout(() => { popup.style.opacity = 0; }, 3000);
    }

    setInterval(() => {
        let bought = Math.floor(Math.random() * 3) + 1;
        showPopup(`Тільки що купили ${bought} шт!`);
    }, 15000);

    // Плавный скролл и подсветка активной ссылки навигации
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target.scrollIntoView({ behavior: 'smooth' });

            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Плавное открытие FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('h3');
        const answer = item.querySelector('p');
        answer.style.maxHeight = '0';
        answer.style.overflow = 'hidden';
        answer.style.transition = 'max-height 0.5s ease-out, opacity 0.5s ease';
        answer.style.opacity = 0;

        question.addEventListener('click', () => {
            if(answer.style.maxHeight === '0px' || answer.style.maxHeight === '0'){
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.opacity = 1;
            } else {
                answer.style.maxHeight = '0';
                answer.style.opacity = 0;
            }
        });
    });

    // Вкладки характеристик, отзывов и FAQ с плавной анимацией
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => {
                content.style.display = 'none';
                content.style.opacity = 0;
            });

            const activeContent = tabContents[index];
            activeContent.style.display = 'block';
            setTimeout(() => { activeContent.style.opacity = 1; }, 50);
        });
    });

    // Инициализация первой вкладки
    if(tabs.length > 0){
        tabs[0].click();
    }
});