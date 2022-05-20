const { DatabaseObj: { e, config } } = require('../../../modules/functions/plugins/database')

module.exports = {
    name: 'gif',
    aliases: ['sendgif', 'enviargif', 'gifs'],
    category: 'bot',
    emoji: '📨',
    usage: '<gifs> <tema> <linkdogif>',
    description: 'Envie gifs para serem adicionados ao meu package',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.SaphireFeliz} | Você pode mandar gifs no meu formulário! Aqui está o link: ${config.GoogleForm}`)
    }
}