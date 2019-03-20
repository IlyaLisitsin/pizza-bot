const Extra = require('telegraf/extra');

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

module.exports = {
    startingMarkup,
    streetVariantsMarkupGenerator,
    houseVariantsMarkupGenerator,
}