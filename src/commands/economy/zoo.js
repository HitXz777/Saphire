const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')

module.exports = {
    name: 'zoologico',
    aliases: ['zoo', 'zoológico'],
    category: 'perfil',
    ClientPermissions: ['MANAGE_CHANNELS'],
    emoji: '🦁',
    usage: 'zoo',
    description: 'Caçe e adote bichinhos pro seu zoológico',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        return message.reply(`${e.Loading} | Código em construção.`)

    }
}
