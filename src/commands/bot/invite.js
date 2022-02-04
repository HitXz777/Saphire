const { Permissions } = require('discord.js')
const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'invite',
    aliases: ['inv', 'convite'],
    category: 'util',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: '📨',
    usage: '<invite>',
    description: 'Me convide para seu servidor',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const invite = client.generateInvite({ scopes: ['bot', 'applications.commands'], permissions: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.USE_EXTERNAL_EMOJIS, Permissions.FLAGS.ADD_REACTIONS, Permissions.FLAGS.ADMINISTRATOR, Permissions.FLAGS.USE_APPLICATION_COMMANDS] })
        const embed = new MessageEmbed().setColor('GREEN').setDescription(`${e.SaphireHi} [Clique aqui pra me convidar no seu servidor](${invite})`)

        return message.reply({ embeds: [embed] })
    }
}