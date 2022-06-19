const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'aniversario',
    aliases: ['aniversário', 'setniver', 'niver', 'setaniversario'],
    category: 'perfil',
    emoji: '🎉',
    usage: '/editprofile',
    description: 'Configure seu aniversário no seu perfil',

    execute: async (client, message, args, prefix, MessageEmbed, Database) =>  {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/editprofile\``)
    }
}