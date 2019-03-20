const tgToken = '';
const Telegraf = require('telegraf');
const session = require('telegraf/session');

const UserEmulatorService = require('./user-emulator.service');
const { ChoseStreetScene, echoScene } = require('./telegram/scenes.telegram');
const { startingMarkup } = require('./telegram/markup.telegram');
const router = require('./telegram/router.telegram');

const Stage = require('telegraf/stage');

const bot = new Telegraf(tgToken);
const stage = new Stage([ChoseStreetScene], { ttl: 10 });
bot.use(session());
bot.use(stage.middleware());

// bot.use(session({ ttl: 10 }))

bot.start(async (ctx) => {
    ctx.session = {};
    ctx.session.emulatorInstance = await UserEmulatorService.build();

    // return ctx.reply(`Value: <b>${ctx.session.value}</b>`, startingMarkup)
    return ctx.reply('Привет! Откуда закажем хрючево?', startingMarkup)
});

bot.on('callback_query', router);
// bot.on('text', ctx => ctx.reply('ты гнида ебучая'))
// bot.command('greeter', enter('greeter'))
// bot.command('echo', enter('echo'))
bot.launch();

