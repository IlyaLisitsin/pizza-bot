const WizardScene = require("telegraf/scenes/wizard");

const { streetVariantsMarkupGenerator, paymentTypeMarkup } = require('./markup.telegram');

const InputInfoPart1Scene = new WizardScene(
    'input-info-1-scene',
    (ctx) => {
        ctx.reply('Введи название улицы, куда будем доставлять');
        return ctx.wizard.next();
    },
    async (ctx) => {
        if (ctx.session.emulatorInstance) {
            const streetVariantList = await ctx.session.emulatorInstance.getStreetVariants(ctx.message.text);
            ctx.session.streetVariantList = streetVariantList.slice(0, 7);
            const markup = streetVariantsMarkupGenerator(ctx.session.streetVariantList);
            await ctx.reply('Что-то есть в этом списке?', markup);
            return ctx.scene.leave();
        }
    },
);

const create = new WizardScene(
    'create',
    (ctx) => {
        ctx.reply('Назови свое имя');
        return ctx.wizard.next();
    },

    async (ctx) => {
        ctx.session.name = ctx.message.text;

        await ctx.reply(`Оукей, ${ctx.session.name}, теперь я знаю, где ты живешь!`);
        await ctx.reply('Ладно, это shootka');

        await ctx.reply('Давай сверим данные');
        const { size, selectedPizza, street, house, name, number, price, flat } = ctx.session;
        await ctx.reply(`Человек по имени ${name} заказал ${size} ${selectedPizza.title} по адресу ${street.title} дом ${house}, квартира ${flat}`);
        await ctx.reply(`Телефон для связи ${number}`);
        await ctx.reply(`Сумма заказа составляет ${price}`);
        await ctx.reply('Расплачиваться будем наличными или картой?', paymentTypeMarkup)
        return ctx.scene.leave();
    },
);

module.exports = {
    create,
    InputInfoPart1Scene,
};