const Router = require('telegraf/router');

const {
    houseVariantsMarkupGenerator,
    pizzaListMarkupGenerator,
    pizzaSizeMarkupGenerator,
    numberMaurkupGenerator
} = require('./markup.telegram');

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
    await ctx.reply(`Выбрано ${ctx.session.deliveryService}`);

    const phoneNumberMarkup = numberMaurkupGenerator('phone-number-action');
    return ctx.reply(`Номер телефона: ${ctx.session.number}`, phoneNumberMarkup);
});

router.on('phone-number-action', async ctx => {
    console.log(ctx.state.value)
    if (ctx.state.value === 'удалить') ctx.session.number = ctx.session.number.slice(0, -1);
    else if (ctx.state.value === 'готово') {
        return ctx.scene.enter('input-info-1-scene');
    }
    else ctx.session.number += ctx.state.value;
    editPhoneNumber(ctx)
});

router.on('chose-street-action', async ctx => {
    const id = ctx.state.value;

    // console.log(324, ctx.session.streetVariantList.find(el => el.id ===))
    // const streetParts = ctx.state.value.split('+');

    if (ctx.session.streetVariantList) {
        ctx.session.street = { title: ctx.session.streetVariantList.find(el => String(el.id) === String(id)).title, id};
    }

    if (ctx.session.emulatorInstance) {
        const housesVariantList = await ctx.session.emulatorInstance.getHousesVariants(ctx.session.street.id);
        const housesListMarkup = houseVariantsMarkupGenerator(housesVariantList);
        await ctx.reply('Теперь выбери номер дома', housesListMarkup);
    }
});

router.on('chose-house-action', async ctx => {
    ctx.session.house = ctx.state.value;

    const flatNumberMarkup = numberMaurkupGenerator('flat-number-action');
    await ctx.reply('Теперь набери номер квартиры (или просто нажми "готово", если это офис)', flatNumberMarkup)
});

router.on('flat-number-action', async ctx => {
    if (ctx.state.value === 'удалить') ctx.session.flat = ctx.session.flat.slice(0, -1);
    else if (ctx.state.value === 'готово') {
        if (ctx.session.emulatorInstance) {
            const pizzasList = await ctx.session.emulatorInstance.getPizzasList();
            const pizzasListMarkup = pizzaListMarkupGenerator(pizzasList);

            ctx.session.pizzasCollection = pizzasList.reduce((acc, next) => {
                const { title, anonce, photo1, medium_price, thin_price, big_price, id } = next;
                acc[next.id] = { id, title, anonce, sizes: [{ medium: medium_price }, { thin: thin_price }, { big: big_price }], photo1 };
                return acc
            }, {});

            await ctx.reply('Отличный выбор, пока идем неплохо!');
            await ctx.reply('Выбирай пиццу, и продолжим ХЕНДЛИТЬ ТВОИ ИНПУТЫ', pizzasListMarkup)
        }
    }
    else ctx.session.flat += ctx.state.value;
    editFlatNumber(ctx)
});

function editPhoneNumber (ctx) {
     return ctx.editMessageText(`Номер телефона: ${ctx.session.number}`, numberMaurkupGenerator('phone-number-action'))
}

function editFlatNumber (ctx) {
    return ctx.editMessageText(`Номер квартиры: ${ctx.session.flat}`, numberMaurkupGenerator('flat-number-action'))
}

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
        await ctx.scene.enter('create');
    }
});

router.on('chose-payment-action', async ctx => {
    ctx.session.payment = ctx.state.value;
    if (ctx.session.emulatorInstance) {
        await ctx.session.emulatorInstance.performOrder(ctx.session);
    }
});

module.exports = router;