const puppeteer = require('puppeteer');

const pageEvalueteCb = () => {
    const elements = document.querySelectorAll('.pizzas h3 a');
    return Array.from(elements).map(el => el.innerText);
};

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    page.setViewport({ height: 1200, width: 1200 });


    await page.goto('https://pzz.by/');

    const pizzasTitleCollection = await page.evaluate(pageEvalueteCb);

    await page.setRequestInterception(true);

    page.on('request', (req) => {
        if (req.resourceType() === 'xhr') {
            console.log(req)
        }
        // if (req.resourceType() === 'image') {
        //     // req.abort();
        // } else {
        //     req.continue();
        // }

        req.continue()
    });

    
    // console.log(pizzasTitleCollection)


    await page.screenshot({ path: 'example.png' });

    // await browser.close();
})();