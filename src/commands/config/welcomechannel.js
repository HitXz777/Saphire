const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'welcomechannel',
    aliases: ['setwelcome', 'setwelcomechannel'],
    category: 'config',
    emoji: `${e.Loud}`,
    usage: '/reception',
    description: 'Selecione um canal para eu avisar todos que chegarem no servidor',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command. Use \`/reception\``)
    }
}