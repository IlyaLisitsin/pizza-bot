const { streetVariantsMarkupGenerator } = require('./markup.telegram');

const Scene = require('telegraf/scenes/base');
const Stage = require('telegraf/stage');
const { enter, leave } = Stage;

const ChoseStreetScene = new Scene('chose-street-scene');
ChoseStreetScene.enter(ctx => ctx.reply('Введи название улицы, куда будем доставлять'));
// ChoseStreetScene.leave((ctx) => ctx.reply('Bye'))
// ChoseStreetScene.hears('hi', enter('greeter'))

ChoseStreetScene.on('text', async ctx => {
    if (ctx.session.emulatorInstance) {
        const streetVariantList = await ctx.session.emulatorInstance.getStreetVariants(ctx.message.text);
        const markup = streetVariantsMarkupGenerator(streetVariantList.slice(0, 10)); // Only 10 first variants. Purpose - not to overload tg markup

        ctx.reply('Что-то есть в этом списке?', markup)
    }
});

// const ChoseHouseScene = new Scene('chose-street-scene');
// ChoseHouseScene.enter(ctx => {
//
//     ctx.reply('Теперь выбери номер дома')
// });
// ChoseStreetScene.leave((ctx) => ctx.reply('Bye'))
// ChoseStreetScene.hears('hi', enter('greeter'))

// ChoseHouseScene.on('text', async ctx => {
//     const streetVariantList = await ctx.session.emulatorInstance.getStreetVariants(ctx.message.text);
//     const markup = streetVariantsMarkupGenerator(streetVariantList.slice(0, 10)); // Only 10 first variants. Purpose - not to overload tg markup
//
//     ctx.reply('Что-то есть в этом списке?', markup)
// });

// const echoScene = new Scene('echo');
// echoScene.enter((ctx) => ctx.reply('echo scene'));
// echoScene.leave((ctx) => ctx.reply('exiting echo scene'));
// echoScene.command('back', leave())
// echoScene.on('text', (ctx) => ctx.reply(ctx.message.text));
// echoScene.on('message', (ctx) => ctx.reply('Only text messages please'));

module.exports = {
    ChoseStreetScene,
}