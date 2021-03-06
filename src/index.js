const tgToken = '829401034:AAF6WgoZMD_dYMMKUuI9bEGZvpqniRRLzzg';
const Telegraf = require('telegraf');
const session = require('telegraf/session');

const UserEmulatorService = require('./user-emulator.service');
const { create, InputInfoPart1Scene } = require('./telegram/scenes.telegram');
const { startingMarkup } = require('./telegram/markup.telegram');
const router = require('./telegram/router.telegram');

const Stage = require('telegraf/stage');

const bot = new Telegraf(tgToken);
const stage = new Stage([create, InputInfoPart1Scene], { ttl: 10 });
bot.use(session());
bot.use(stage.middleware());

bot.start(async (ctx) => {
    await ctx.session.emulatorInstance && ctx.session.emulatorInstance.destroy();
    ctx.session = {};
    ctx.session.number = '+375';
    ctx.session.flat = '';

    ctx.session.emulatorInstance = await UserEmulatorService.build();
    await ctx.scene.leave();
    await ctx.reply('Привет! Откуда закажем хрючево?', startingMarkup)
});

bot.on('callback_query', router);
bot.launch();

