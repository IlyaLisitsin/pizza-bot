const tgToken = '829401034:AAF6WgoZMD_dYMMKUuI9bEGZvpqniRRLzzg';
const Telegraf = require('telegraf');
const session = require('telegraf/session');

const UserEmulatorService = require('./user-emulator.service');
// const { InputStreetScene, InputFlatScene, InputNameScene, InputNumberScene } = require('./telegram/scenes.telegram');
const { create, InputInfoPart1Scene } = require('./telegram/scenes.telegram');
const { startingMarkup } = require('./telegram/markup.telegram');
const router = require('./telegram/router.telegram');

const Stage = require('telegraf/stage');

const bot = new Telegraf(tgToken);
// const stage = new Stage([InputStreetScene, InputFlatScene, InputNameScene, InputNumberScene], { ttl: 10 });
const stage = new Stage([create, InputInfoPart1Scene], { ttl: 10 });
bot.use(session());
bot.use(stage.middleware());

// bot.use(session({ ttl: 10 }))

bot.start(async (ctx) => {
    // console.log(ctx.session)
    await ctx.session.emulatorInstance && ctx.session.emulatorInstance.destroy();
    console.log('starrt', ctx.session.emulatorInstance)
    ctx.session = {};

    ctx.session.emulatorInstance = await UserEmulatorService.build();
    await ctx.scene.leave()
    // return ctx.reply(`Value: <b>${ctx.session.value}</b>`, startingMarkup)
    await ctx.reply('Привет! Откуда закажем хрючево?', startingMarkup)
});

bot.on('callback_query', router);
// bot.on('text', ctx => ctx.reply('ты гнида ебучая'))
// bot.command('greeter', enter('greeter'))
// bot.command('echo', enter('echo'))
bot.launch();

