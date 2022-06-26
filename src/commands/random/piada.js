const { f } = require('../../../JSON/frases.json')

module.exports = {
    name: 'piada',
    aliases: ['piadas'],
    category: 'random',
    emoji: '📨',
    usage: '<piada>',
    description: 'Vai uma piadinha aí?',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = f.Piadas.random()
        return message.reply(rand)
    }
}