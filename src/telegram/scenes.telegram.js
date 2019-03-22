const Scene = require('telegraf/scenes/base');
const WizardScene = require("telegraf/scenes/wizard");

const { streetVariantsMarkupGenerator, paymentTypeMarkup } = require('./markup.telegram');

const InputStreetScene = new Scene('input-street-scene');
InputStreetScene.enter(ctx => ctx.reply('Введи название улицы, куда будем доставлять'));
InputStreetScene.on('text', async ctx => {
    if (ctx.session.emulatorInstance) {
        const streetVariantList = await ctx.session.emulatorInstance.getStreetVariants(ctx.message.text);
        const markup = streetVariantsMarkupGenerator(streetVariantList.slice(0, 3)); // Only 10 first variants. Purpose - not to overload tg markup
        await ctx.reply('Что-то есть в этом списке?', markup)
    }
});

const InputInfoPart1Scene = new WizardScene(
    'input-info-1-scene',
    (ctx) => {
        ctx.reply(`Сначала укажи свой номер телефона.`);
        // await ctx.reply('Напиши его в формате 375ХХХХХХХХХ');
        // await ctx.reply('Без плюсика!');
        // await ctx.reply('И без пробелов');
        // console.log(ctx.wizard.steps)
        return ctx.wizard.next();
    },
    (ctx) => {
        ctx.session.number = ctx.message.text;

        ctx.reply('Введи название улицы, куда будем доставлять');
        return ctx.wizard.next();
    },
    (ctx) => {
        console.log(324324)
        return (async () => {
            if (ctx.session.emulatorInstance) {
                const streetVariantList = await ctx.session.emulatorInstance.getStreetVariants(ctx.message.text);
                const markup = streetVariantsMarkupGenerator(streetVariantList.slice(0, 3)); // Only 10 first variants. Purpose - not to overload tg markup
                await ctx.reply('Что-то есть в этом списке?', markup);
                return ctx.scene.leave();
            } else {
                console.log('(((((((324324)))))))')
            }
        })()
    },
// asyn (ctx) => {
    //     ctx.session.number = ctx.message.text;
    //
    //     console.log(ctx.session.number)
    //     await ctx.reply('Ок, на связи!');
    //     await ctx.reply('Мы уже близко. Какой номер квартиры?');
    //     return ctx.wizard.next();
    // },
)

// const InputNameScene = new Scene('input-name-scene');
// InputNameScene.enter(ctx => ctx.reply('Назови свое имя'));
// InputNameScene.on('text', async ctx => {
//     ctx.session.name = ctx.message.text;
//     await ctx.scene.enter('input-number-scene');
// });
//
// const InputNumberScene = new Scene('input-number-scene');
// InputNumberScene.enter(async ctx => {
//     console.log('number scene triggered')
//
//     await ctx.reply(`Оукей, ${ctx.session.name}. Теперь нужен твой номер телефона.`);
//     await ctx.reply('Напиши его в формате 375ХХХХХХХХХ');
//     await ctx.reply('Без плюсика!');
//     await ctx.reply('И без пробелов');
// });
//
// InputNameScene.on('message', ctx => console.log('smth happened'))
//
// InputNumberScene.on('text', async ctx => {
//     console.log('number sent')
//     ctx.session.number = ctx.message.text;
//     await ctx.scene.enter('input-flat-scene');
// });
//
// const InputFlatScene = new Scene('input-flat-scene');
// InputFlatScene.enter(async ctx => {
//     console.log('flat scene triggered')
//     await ctx.reply('Ок, на связи!');
//     await ctx.reply('Мы уже близко. Какой номер квартиры?');
// });
//
// InputFlatScene.on('text', async ctx => {
//     ctx.session.flat = ctx.message.text;
//     await ctx.reply('Теперь я знаю, где ты живешь!');
//     await ctx.reply('Ладно, это shootka');
//
//     await ctx.reply('Давай сверим данные');
//     const { size, selectedPizza, street, house, name, number, price } = ctx.session;
//     await ctx.reply(`Человек по имени ${name} заказал ${size} ${selectedPizza.title} по адресу ${street.title} дом ${house}`);
//     await ctx.reply(`Телефон для связи ${number}`);
//     await ctx.reply(`Сумма заказа составляет ${price}`);
//     await ctx.reply('Расплачиваться будем наличными или картой?', paymentTypeMarkup)
// });

const create = new WizardScene(
    "create",
    (ctx) => {
        ctx.reply('Назови свое имя');
        return ctx.wizard.next();
    },
    async (ctx) => {
        ctx.session.name = ctx.message.text;
        await ctx.reply(`Оукей, ${ctx.session.name}. Теперь нужен номер твоей квартиры.`);
        return ctx.wizard.next();
    },
    async (ctx) => {
        ctx.session.flat = ctx.message.text;

        await ctx.reply('Теперь я знаю, где ты живешь!');
        await ctx.reply('Ладно, это shootka');

        await ctx.reply('Давай сверим данные');
        const { size, selectedPizza, street, house, name, number, price } = ctx.session;
        await ctx.reply(`Человек по имени ${name} заказал ${size} ${selectedPizza.title} по адресу ${street.title} дом ${house}`);
        await ctx.reply(`Телефон для связи ${number}`);
        await ctx.reply(`Сумма заказа составляет ${price}`);
        await ctx.reply('Расплачиваться будем наличными или картой?', paymentTypeMarkup)
        return ctx.scene.leave();
    },
);

module.exports = {
    InputStreetScene,
    create,
    InputInfoPart1Scene,
    // InputFlatScene,
    // InputNameScene,
    // InputNumberScene,
};