const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'patnezuko',
    aliases: ['nezukopat'],
    category: 'random',
    ClientPermissions: ['USE_EXTERNAL_EMOJIS'],
    emoji: `${e.PatNezuko}`,
    usage: '<patnezuko>',
    description: 'Carinho na Nezuko-chan',

    run: async (client, message, args, prefix, MessageEmbed, Database) => message.reply(e.PatNezuko)
}