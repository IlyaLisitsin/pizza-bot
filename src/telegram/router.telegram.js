const Router = require('telegraf/router');

const { houseVariantsMarkupGenerator } = require('./markup.telegram');

const router = new Router(({ callbackQuery }) => {
    if (!callbackQuery.data) return;

    console.log('FROM TG ROUTER', callbackQuery.data);
    const parts = callbackQuery.data.split(':');
    return {
        route: parts[0],
        state: {
            amount: parseInt(parts[1], 10) || 0,
            key: parts[1],
        },
    }
});

router.on('chose-delivery-action', ctx => {
    ctx.session.deliveryService = ctx.state.key;
    ctx.scene.enter('chose-street-scene');
    return ctx.reply(`Выбрано ${ctx.session.deliveryService}`)
});

router.on('chose-street-action', async ctx => {
    const streetParts = ctx.state.key.split('+');
    ctx.session.street = { title: streetParts[0], id: streetParts[1]};
    if (ctx.session.emulatorInstance) {
        const housesVariantList = await ctx.session.emulatorInstance.getHousesVariants(ctx.session.street.id);
        const housesListMarkup = houseVariantsMarkupGenerator(housesVariantList);
        return ctx.reply('Теперь выбери номер дома', housesListMarkup);
    }
});

router.on('chose-house-action', async ctx => {
    ctx.session.house = ctx.state.key;
    if (ctx.session.emulatorInstance) {
        const pizzasList = await ctx.session.emulatorInstance.getPizzasList();
        console.log(pizzasList)
        // const pizzasListMarkup = pizzaListMarkupGenerator(pizzasList);
        // return [ctx.reply('Отличный выбор, пока идем неплохо!'), ctx.reply('Выбирай пиццу, и продолжим ХЕНДЛИТЬ ТВОИ ИНПУТЫ', pizzasListMarkup)];
    }
   // const confirmationMarkup = ctx.session
   //  return [ctx.reply('Отличный выбор. Чтобы выбрать пиццу, предстоит еще указать имя, телефон, номер квартиры...'), ctx.reply('Но все по порядку!')]
});

// function editText (ctx) {
//     if (ctx.session.value === 42) {
//         return ctx.answerCbQuery('Answer to the Ultimate Question of Life, the Universe, and Everything', true)
//             .then(() => ctx.editMessageText('🎆'))
//     }
//     return ctx.editMessageText(`Value: <b>${ctx.session.value}</b>`, markup).catch(() => undefined)
// }

module.exports = router;