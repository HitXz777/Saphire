const canvacord = require('canvacord/src/Canvacord')
const Discord = require("discord.js")
const { e } = require('../../../JSON/emojis.json')

module.exports = {
  name: 'affect',
  aliases: ['afeta'],
  category: 'images',
  ClientPermissions: ['ATTACH_FILES'],
  emoji: '🤰',
  usage: '<affect> [@user]',
  description: 'Isso não afeta o bebê',

  execute: async (client, message, args, prefix, MessageEmbed, Database) => {

    let user = message.mentions.users.first() || message.author || message.mentions.repliedUser
    let avatar = user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 })
    if (user.id === client.user.id) return message.reply('Ó, tu para!')

    const image = await canvacord.affect(avatar)
    const affect = new Discord.MessageAttachment(image, 'affect.png')
    return message.reply({ files: [affect] })
  }
}