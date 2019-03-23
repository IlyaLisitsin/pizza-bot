const Extra = require('telegraf/extra');

const sizesDictionary = {
    medium: 'Средняя',
    big: 'Большая',
    thin: 'Маленькая',
};

const startingMarkup = Extra
    .HTML()
    .markup(m => m.inlineKeyboard([
        m.callbackButton('ПиццаЛисицца', 'chose-delivery-action:pzz.by'),
    ], { columns: 2 }));

const numberMaurkupGenerator = actionType => Extra
    .HTML()
    .markup(m => m.inlineKeyboard([
        m.callbackButton('1', `${actionType}:1`),
        m.callbackButton('2', `${actionType}:2`),
        m.callbackButton('3', `${actionType}:3`),
        m.callbackButton('4', `${actionType}:4`),
        m.callbackButton('5', `${actionType}:5`),
        m.callbackButton('6', `${actionType}:6`),
        m.callbackButton('7', `${actionType}:7`),
        m.callbackButton('8', `${actionType}:8`),
        m.callbackButton('9', `${actionType}:9`),
        m.callbackButton('0', `${actionType}:0`),
        m.callbackButton('удалить', `${actionType}:удалить`),
        m.callbackButton('готово', `${actionType}:готово`),
    ], { columns: 5 }));

// TODO: обработать ветку "в списке ничего нет" + пусой список!!
// TODO: экранировать скобки тире и проч!
const streetVariantsMarkupGenerator = streetVariantList => Extra
    .HTML()
    .markup(m => {
        console.log(streetVariantList)
        return m.inlineKeyboard(streetVariantList.map(street => m.callbackButton(street.title, `chose-street-action:${street.title}+${street.id}`)), { columns: 1 })
    });

const houseVariantsMarkupGenerator = houseVariantList => Extra
    .HTML()
    .markup(m => m.inlineKeyboard(houseVariantList.map(house => m.callbackButton(house, `chose-house-action:${house}`)), { columns: 5 }));

const pizzaListMarkupGenerator = pizzaList => Extra
    .HTML()
    .markup(m => m.inlineKeyboard(pizzaList.map(pizza => m.callbackButton(pizza.title, `chose-pizza-type-action:${pizza.id}`)), { columns: 2 }));

const pizzaSizeMarkupGenerator = sizes => Extra
    .HTML()
    .markup(m => m.inlineKeyboard(sizes
        .filter(el => Object.values(el)[0] !== 0)
        .map(size => {
            const title = sizesDictionary[Object.keys(size)[0]];
            const priceValue = Object.values(size)[0];
            return m.callbackButton(title, `chose-pizza-size-action:${title}+${priceValue}`)
        }),
        { columns: 2 }));

const paymentTypeMarkup = Extra
    .HTML()
    .markup(m => m.inlineKeyboard([
        m.callbackButton('Наличными', 'chose-payment-action:cash'),
        m.callbackButton('Картой', 'chose-payment-action:charge'),
    ], { columns: 2 }));

module.exports = {
    startingMarkup,
    paymentTypeMarkup,
    streetVariantsMarkupGenerator,
    houseVariantsMarkupGenerator,
    pizzaListMarkupGenerator,
    pizzaSizeMarkupGenerator,
    numberMaurkupGenerator,
};