const { DatabaseObj } = require("../../../Routes/functions/database")
const { e, config } = DatabaseObj

module.exports = {
    name: 'ideiasaphire',
    aliases: ['sendideia', 'sugerir', 'sendsugest', 'sugest'],
    category: 'bot',
    emoji: '📨',
    usage: '<sugerir>',
    description: 'Sugira algo para que meu criador insira no meu sistema',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        return message.reply(`${e.SaphireFeliz} | Você pode mandar suas ideias no meu formulário! Aqui está o link: ${config.GoogleForm}`)
    }
}