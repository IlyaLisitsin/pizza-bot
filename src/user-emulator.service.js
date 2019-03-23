const puppeteer = require('puppeteer');
const fuseSearch = require('./fuse-search.service');

// Hack for "undefined" window and global variables. Fucks given: none
const getLisizzaStreetsCollection = () => JSON.parse(JSON.stringify(App.CollectionsData.Streets._byId));

// Disable metrics
const requestInterceptor = (req) => {
    if (RegExp('https://mc.yandex.ru/|https://www.facebook.com|https://www.google-analytics.com/|https://connect.facebook.net/|https://googleads.g.doubleclick.net/|https://www.google.com/|https://www.google.by/|https://stats.g.doubleclick.net/|https://vk.com/', 'g')
        .test(req.url())) {
        req.abort();
    }
    else {
        req.continue()
    }
};

const deliveryRequestsTrigger = async (size, id, street, house, name, number, flat) => {
    const sizesDictionary = {
        Большая: 'big',
        Средняя: 'medium',
        Маленькая: 'thin',
    };

    const normalizedStreet = street.split(' ').join('+');

    const requestBodyString = `name=${name}&flat=${flat}&entrance=&floor=&intercom=&comment=&preorder_date=&preorder_time=&payment=charge&renting=&phone=%2B${number}&street=${normalizedStreet}&house=${house}`;

    const test = "name=%D0%B8%D0%BB%D1%8C%D1%8F&flat=1&entrance=&floor=&intercom=&comment=&preorder_date=&preorder_time=&payment=charge&renting=&phone=%2B375293922930&street=%D0%9B%D1%8E%D0%B1%D0%B8%D0%BC%D0%BE%D0%B2%D0%B0+%D0%BF%D1%80%D0%BE%D1%81%D0%BF.&house=33"
    await fetch(`https://pzz.by/api/v1/basket/update-address`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
            body: requestBodyString,
        });

    await fetch('https://pzz.by/api/v1/basket/add-item', {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `type=pizza&id=${id}&size=${sizesDictionary[size]}&dough=thin`,
    })
        .then(res => res.json())
        .then(res => console.log('добавил ранч', res))

    await fetch("https://pzz.by/api/v1/basket/save", {
        method: 'POST',
    });

    await fetch('https://pzz.by/api/v1/basket');
};

const getLisizzaHousesCollection = async streetId => {
    const response = await fetch(`https://pzz.by/api/v1/streets/${streetId}?order=title:asc&load=region.pizzeria`);
    const result = await response.json();
    const { response: { data } } = result;
    return data;
};

const getLisizzasPizzaList = async () => {
    const response = await fetch("https://pzz.by/api/v1/pizzas?load=ingredients,filters&filter=meal_only:0&order=position:asc");
    const result = await response.json();
    const { response: { data } } = result;
    return data;
};

class UserEmulatorService {
    constructor(browser, page) {
        this.browser = browser;
        this.page = page;
    }

    static async build() {
        const browser = await puppeteer.launch({ headless: false });
        const page = await browser.newPage();

        await page.setRequestInterception(true);
        page.on('request', requestInterceptor);
        page.setViewport({ height: 1200, width: 900 });

        return new UserEmulatorService(browser, page)
    }

    async getStreetVariants(userInput) {
        await this.page.goto('https://pzz.by/');
        const streetsCollection = await this.page.evaluate(getLisizzaStreetsCollection);

        return fuseSearch(streetsCollection, userInput)
    }

    async getHousesVariants(streetId) {
        const housesCollection = await this.page.evaluate(getLisizzaHousesCollection, streetId);
        return housesCollection.map(hoseInfo => hoseInfo.title)
    }

    async getPizzasList() {
        const pizzasCollection = await this.page.evaluate(getLisizzasPizzaList);
        return pizzasCollection.map(el => {
            const { id, title, anonce, medium_price, thin_price, big_price, photo1 } = el;
            return { id, title, anonce, medium_price, thin_price, big_price, photo1 };
        });
    }

    async performOrder(orderDetails) {
        console.log(orderDetails.selectedPizza)
        const { size, selectedPizza: { id }, street: { title }, house, name, number, flat } = orderDetails;
        await this.page.evaluate(deliveryRequestsTrigger, size, id, title, house, name, number, flat);
    }

    async destroy() {
        console.log('me destroin')
        await this.browser.close();
    }
}

module.exports = UserEmulatorService