
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'reverse',
    aliases: ['inverter'],
    category: 'random',
    emoji: '🔄',
    usage: '<reverse> <text>',
    description: 'Inverta os textos',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let text = args.join(" ")

        if (!text)
            return message.reply(`${e.Deny} | Você precisa me dizer um texto para eu inverter.`)

        if (text.length <= 1)
            return message.reply(`${e.Deny} | O texto tem que ter mais do que 1 caracter.`)

        let reverse = text.split("").reverse().join("")

        return message.reply(`${reverse}\n~ Por: *${message.author.tag}*`)
    }
}