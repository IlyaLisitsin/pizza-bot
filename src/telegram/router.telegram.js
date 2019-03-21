const Router = require('telegraf/router');

const { houseVariantsMarkupGenerator, pizzaListMarkupGenerator, pizzaSizeMarkupGenerator } = require('./markup.telegram');

const router = new Router(({ callbackQuery }) => {
    if (!callbackQuery.data) return;

    console.log('FROM TG ROUTER', callbackQuery.data);
    const parts = callbackQuery.data.split(':');
    return {
        route: parts[0],
        state: {
            value: parts[1],
        },
    }
});

router.on('chose-delivery-action', ctx => {
    ctx.session.deliveryService = ctx.state.value;
    ctx.scene.enter('chose-street-scene');
    return ctx.reply(`Выбрано ${ctx.session.deliveryService}`)
});

router.on('chose-street-action', async ctx => {
    const streetParts = ctx.state.value.split('+');
    ctx.session.street = { title: streetParts[0], id: streetParts[1]};
    if (ctx.session.emulatorInstance) {
        const housesVariantList = await ctx.session.emulatorInstance.getHousesVariants(ctx.session.street.id);
        const housesListMarkup = houseVariantsMarkupGenerator(housesVariantList);
        return ctx.reply('Теперь выбери номер дома', housesListMarkup);
    }
});

router.on('chose-house-action', async ctx => {
    ctx.session.house = ctx.state.value;
    if (ctx.session.emulatorInstance) {
        const pizzasList = await ctx.session.emulatorInstance.getPizzasList();
        const pizzasListMarkup = pizzaListMarkupGenerator(pizzasList);

        ctx.session.pizzasCollection = pizzasList.reduce((acc, next) => {
            const { title, anonce, photo1, medium_price, thin_price, big_price } = next;
            acc[next.id] = { title, anonce, sizes: [{medium_price}, {thin_price}, {big_price}], photo1 };
            return acc
        }, {});

        await ctx.reply('Отличный выбор, пока идем неплохо!');
        await ctx.reply('Выбирай пиццу, и продолжим ХЕНДЛИТЬ ТВОИ ИНПУТЫ', pizzasListMarkup)
    }
});

router.on('chose-pizza-type-action', async ctx => {
    if (ctx.session.pizzasCollection) {
        ctx.session.pizzaOrder = ctx.session.pizzasCollection[ctx.state.value];

        const pizzaTypeMarkup = pizzaSizeMarkupGenerator(ctx.session.pizzaOrder.sizes)

        await ctx.reply('Хорошая');
        await replyWithPhoto(ctx, ctx.session.pizzaOrder.photo1);
        await ctx.reply('Какого размера?', pizzaTypeMarkup)
    }
});

const replyWithPhoto = (ctx, path) => {
    ctx.replyWithChatAction('upload_photo');
    return ctx.replyWithPhoto({ url: path })
};

// function editText (ctx) {
//     if (ctx.session.value === 42) {
//         return ctx.answerCbQuery('Answer to the Ultimate Question of Life, the Universe, and Everything', true)
//             .then(() => ctx.editMessageText('🎆'))
//     }
//     return ctx.editMessageText(`Value: <b>${ctx.session.value}</b>`, markup).catch(() => undefined)
// }

module.exports = router;