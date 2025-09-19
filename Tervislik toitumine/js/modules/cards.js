import {getResource} from '../services/services';

function cards() {
    class MenuCard {
        constructor(src, alt, title, descr, price, parentSelector, ...classes) {
            this.src = src;
            this.alt = alt;
            this.title = title;
            this.descr = descr;
            this.price = price; // Цена в евро из db.json
            this.classes = classes;
            this.parent = document.querySelector(parentSelector);
            this.exchangeRateEUR = 1; // Коэффициент, если нужна конвертация
            this.convertToEUR();
        }

        convertToEUR() {
            this.price = this.price * this.exchangeRateEUR;
        }

        render() {
            const element = document.createElement('div');

            if (this.classes.length === 0) {
                this.element = 'menu__item';
                element.classList.add(this.element);
            } else {
                this.classes.forEach(className => element.classList.add(className));
            }

            // Форматируем цену для Эстонии (et-EE), чтобы отображался символ €
            const formattedPrice = new Intl.NumberFormat('et-EE', {
                style: 'currency',
                currency: 'EUR'
            }).format(this.price);

            element.innerHTML = `
                <img src=${this.src} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.descr}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${formattedPrice}</span>/день</div>
                </div>
            `;
            this.parent.append(element);
        }
    }

    getResource('http://localhost:3000/menu')
        .then(data => {
            data.forEach(({img, altimg, title, descr, price}) => {
                new MenuCard(img, altimg, title, descr, price, ".menu .container").render();
            });
        });
}

export default cards;