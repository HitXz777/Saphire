const { DatabaseObj } = require('../../../Routes/functions/database')
const { e, config } = DatabaseObj

module.exports = {
    name: 'gif',
    aliases: ['sendgif', 'enviargif', 'gifs'],
    category: 'bot',
    emoji: '📨',
    usage: '<gifs> <tema> <linkdogif>',
    description: 'Envie gifs para serem adicionados ao meu package',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        return message.reply(`${e.SaphireFeliz} | Você pode mandar gifs no meu formulário! Aqui está o link: ${config.GoogleForm}`)
    }
}