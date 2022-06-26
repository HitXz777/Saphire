const { e } = require('../../../JSON/emojis.json'),
    yuricanvas = require('yuri-canvas'),
    { MessageAttachment } = require('discord.js')

module.exports = {
    name: 'deletar',
    aliases: ['excluir', 'apagar'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: `${e.Deny}`,
    usage: '/image',
    description: 'Delete alguém',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/image\``)
    }
}