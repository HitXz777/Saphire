const { MessageAttachment } = require('discord.js')
const { e } = require('../../../JSON/emojis.json')
const { Canvas } = require('canvacord')
const Error = require('../../../modules/functions/config/errors')


module.exports = {
    name: 'circle',
    aliases: ['circular'],
    category: 'images',
    ClientPermissions: ['ATTACH_FILES'],
    emoji: '⚫',
    usage: '/image',
    description: 'Foto em modo circular',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/image\``)
    }
}