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


const deliveryRequestsTrigger = async () => {
    await fetch(`https://pzz.by/api/v1/basket/update-address`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        },
        body: 'street=%D0%9B%D1%8E%D0%B1%D0%B8%D0%BC%D0%BE%D0%B2%D0%B0+%D0%BF%D1%80%D0%BE%D1%81%D0%BF.&house=33',
    })
        .then(res => res.json())
        .then(res => console.log('update address', res));

    await fetch('https://pzz.by/api/v1/basket/add-item', {
        method: 'POST',
        headers: {
            'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: 'type=pizza&id=3&size=medium&dough=thin',
    })
        .then(res => res.json())
        .then(res => console.log('добавил ранч', res))

    await fetch("https://pzz.by/api/v1/basket/update-address",
        {"credentials":"include",
            "headers": {
                "accept":"application/json, text/javascript, */*; q=0.01",
                "accept-language":"en,ru;q=0.9,ru-RU;q=0.8,en-US;q=0.7",
                "cache-control":"no-cache",
                "content-type":"application/x-www-form-urlencoded; charset=UTF-8",
                "pragma":"no-cache","x-requested-with":"XMLHttpRequest"
            },
            "referrer":"https://pzz.by/cart",
            "referrerPolicy":"no-referrer-when-downgrade",
            "body":"name=%D0%B8%D0%BB%D1%8C%D1%8F&flat=1&entrance=&floor=&intercom=&comment=&preorder_date=&preorder_time=&payment=charge&renting=&phone=%2B375293922930&street=%D0%9B%D1%8E%D0%B1%D0%B8%D0%BC%D0%BE%D0%B2%D0%B0+%D0%BF%D1%80%D0%BE%D1%81%D0%BF.&house=33",
            "method":"POST",
            "mode":"cors"
        });

    await fetch("https://pzz.by/api/v1/basket/save", {"credentials":"include","headers":{"accept":"application/json, text/javascript, */*; q=0.01","accept-language":"en,ru;q=0.9,ru-RU;q=0.8,en-US;q=0.7","cache-control":"no-cache","pragma":"no-cache","x-requested-with":"XMLHttpRequest"},"referrer":"https://pzz.by/cart","referrerPolicy":"no-referrer-when-downgrade","body":null,"method":"POST","mode":"cors"});

    await fetch("https://pzz.by/api/v1/basket", {"credentials":"include","headers":{"accept":"application/json, text/javascript, */*; q=0.01","accept-language":"en,ru;q=0.9,ru-RU;q=0.8,en-US;q=0.7","cache-control":"no-cache","pragma":"no-cache","x-requested-with":"XMLHttpRequest"},"referrer":"https://pzz.by/cart","referrerPolicy":"no-referrer-when-downgrade","body":null,"method":"GET","mode":"cors"});
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
}

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


    // async initPzz() {
    //     // const browser = await puppeteer.launch({ headless: false });
    //     // const page = await browser.newPage();
    //     // await page.setRequestInterception(true);
    //     // page.on('request', requestInterceptor);
    //     // page.setViewport({ height: 1200, width: 900 });
    //     // await this.page.goto('https://pzz.by/');
    //     // const streetsCollection = await this.page.evaluate(getLisizzaStreetsCollection);
    //     // this.streetsCollection = streetsCollection;
    //
    //     // console.log(this.streetsCollection[1100])
    // }

    // init(key) {
    //     switch (key) {
    //         case 'pzz': this.initPzz()
    //     }
    // }

    // async getStreetsCollection() {
    //     const res = await this.page.evaluate(getLisizzaStreetsCollection);
    //     console.log(324, res)
    //     return res
    // }

    async getStreetVariants(userInput) {
        // return await this.streetsCollection;
        await this.page.goto('https://pzz.by/')
        const streetsCollection = await this.page.evaluate(getLisizzaStreetsCollection);

        return fuseSearch(streetsCollection, userInput)
    }

    async getHousesVariants(streetId) {
        const housesCollection = await this.page.evaluate(getLisizzaHousesCollection, streetId)
        return housesCollection.map(hoseInfo => hoseInfo.title)
    }

    async getPizzasList() {
        const pizzasCollection = await this.page.evaluate(getLisizzasPizzaList);
        return pizzasCollection.map(el => {
            const { id, title, anonce, medium_price, thin_price, big_price, photo1 } = el;
            return { id, title, anonce, medium_price, thin_price, big_price, photo1 };
        });
    }

    destroy() {
        this.browser.close();
    }
}

module.exports = UserEmulatorService