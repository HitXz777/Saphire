const { e } = require('../../../JSON/emojis.json'),
    { MessageActionRow, MessageSelectMenu } = require('discord.js')

module.exports = {
    name: 'signo',
    aliases: ['setsigno'],
    category: 'perfil',
    emoji: '♋',
    usage: '/editprofile',
    description: 'Defina seu signo no perfil',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/editprofile\``)
    }
}