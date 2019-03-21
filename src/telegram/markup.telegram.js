const Extra = require('telegraf/extra');

const sizesDictionary = {
    medium_price: 'Средняя',
    big_price: 'Большая',
    thin_price: 'Маленькая',
};

const startingMarkup = Extra
    .HTML()
    .markup(m => m.inlineKeyboard([
        m.callbackButton('ПиццаЛисицца', 'chose-delivery-action:pzz.by'),
    ], { columns: 2 }));

// TODO: обработать ветку "в списке ничего нет" + пусой список!!
const streetVariantsMarkupGenerator = streetVariantList => Extra
    .HTML()
    .markup(m => m.inlineKeyboard(streetVariantList.map(street => m.callbackButton(street.title, `chose-street-action:${street.title}+${street.id}`)), { columns: 1 }));

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
        .map(size => m.callbackButton(sizesDictionary[Object.keys(size)[0]],
                `chose-pizza-size-action:${Object.values(size)[0]}`))),
        { columns: 2 });

module.exports = {
    startingMarkup,
    streetVariantsMarkupGenerator,
    houseVariantsMarkupGenerator,
    pizzaListMarkupGenerator,
    pizzaSizeMarkupGenerator,
}