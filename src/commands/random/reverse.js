const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'reverse',
    aliases: ['inverter'],
    category: 'random',
    emoji: '🔄',
    usage: '<reverse> <text>',
    description: 'Inverta os textos',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let text = args.join(" ")

        if (!text)
            return message.reply(`${e.Deny} | Você precisa me dizer um texto para eu inverter.`)

        if (text.length <= 1)
            return message.reply(`${e.Deny} | O texto tem que ter mais do que 1 caracter.`)

        let reverse = text.split("").reverse().join("")

        try {
            return message.reply(reverse)
        } catch (err) {
            return message.channel.send(`${e.Warn} | Aconteceu algum erro...\n\`${err}\``)
        }
    }
}