const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'jokeoverhead',
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: 'J',
    usage: '/image',
    description: 'jokeoverhead meme',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/image\``)
    }
}