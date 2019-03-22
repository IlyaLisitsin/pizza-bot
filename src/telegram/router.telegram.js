const Router = require('telegraf/router');

const { houseVariantsMarkupGenerator, pizzaListMarkupGenerator, pizzaSizeMarkupGenerator } = require('./markup.telegram');

const replyWithPhoto = (ctx, path) => {
    ctx.replyWithChatAction('upload_photo');
    return ctx.replyWithPhoto({ url: path })
};

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

router.on('chose-delivery-action', async ctx => {
    ctx.session.deliveryService = ctx.state.value;
    // ctx.scene.enter('input-street-scene');
    await ctx.reply(`Выбрано ${ctx.session.deliveryService}`)
    return ctx.scene.enter('input-info-1-scene');
});

router.on('chose-street-action', async ctx => {
    const streetParts = ctx.state.value.split('+');
    ctx.session.street = { title: streetParts[0], id: streetParts[1]};
    if (ctx.session.emulatorInstance) {
        const housesVariantList = await ctx.session.emulatorInstance.getHousesVariants(ctx.session.street.id);
        const housesListMarkup = houseVariantsMarkupGenerator(housesVariantList);
        await ctx.reply('Теперь выбери номер дома', housesListMarkup);
    }
});

router.on('chose-house-action', async ctx => {
    ctx.session.house = ctx.state.value;
    if (ctx.session.emulatorInstance) {
        const pizzasList = await ctx.session.emulatorInstance.getPizzasList();
        const pizzasListMarkup = pizzaListMarkupGenerator(pizzasList);

        ctx.session.pizzasCollection = pizzasList.reduce((acc, next) => {
            const { title, anonce, photo1, medium_price, thin_price, big_price } = next;
            acc[next.id] = { title, anonce, sizes: [{ medium: medium_price }, { thin: thin_price }, { big: big_price }], photo1 };
            return acc
        }, {});

        await ctx.reply('Отличный выбор, пока идем неплохо!');
        await ctx.reply('Выбирай пиццу, и продолжим ХЕНДЛИТЬ ТВОИ ИНПУТЫ', pizzasListMarkup)
    }
});

router.on('chose-pizza-type-action', async ctx => {
    if (ctx.session.pizzasCollection) {
        ctx.session.selectedPizza = ctx.session.pizzasCollection[ctx.state.value];

        const pizzaTypeMarkup = pizzaSizeMarkupGenerator(ctx.session.selectedPizza.sizes)

        await ctx.reply('Хорошая');
        await replyWithPhoto(ctx, ctx.session.selectedPizza.photo1);
        await ctx.reply('Какого размера?', pizzaTypeMarkup)
    }
});

router.on('chose-pizza-size-action', async ctx => {
    const pizzaSizeParts = ctx.state.value.split('+');
    ctx.session.size = pizzaSizeParts[0];
    ctx.session.price = pizzaSizeParts[1];

    if (ctx.session.selectedPizza) {
        await ctx.reply(`Выбрана ${ctx.session.size} ${ctx.session.selectedPizza.title}`);
        await ctx.reply('Осталось записать еще немного твоих данных, и все будет готово к заказу!');
        // await ctx.scene.enter('input-name-scene');
        // await ctx.scene.enter('create');
        await ctx.scene.enter('create');
    }
});

router.on('chose-payment-action', async ctx => {
    ctx.session.payment = ctx.state.value;
    if (ctx.session.emulatorInstance) {
        await ctx.session.emulatorInstance.performOrder(ctx.session);
        // await ctx.reply('Отличный выбор, пока идем неплохо!');
        // await ctx.reply('Выбирай пиццу, и продолжим ХЕНДЛИТЬ ТВОИ ИНПУТЫ', pizzasListMarkup)
    }
});

module.exports = router;