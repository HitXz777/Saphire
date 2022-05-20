const { DatabaseObj: { e, config } } = require("../../../modules/functions/plugins/database")

module.exports = {
    name: 'ideiasaphire',
    aliases: ['sendideia', 'sugerir', 'sendsugest', 'sugest'],
    category: 'bot',
    emoji: '📨',
    usage: '<sugerir>',
    description: 'Sugira algo para que meu criador insira no meu sistema',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.SaphireFeliz} | Você pode mandar suas ideias no meu formulário! Aqui está o link: ${config.GoogleForm}`)
    }
}