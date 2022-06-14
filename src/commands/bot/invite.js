const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'invite',
    aliases: ['inv', 'convite'],
    category: 'util',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: '📨',
    usage: '<invite>',
    description: 'Me convide para seu servidor',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        const invite = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=2146958847`

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('GREEN')
                    .setDescription(`${e.SaphireFeliz} | [Clique aqui pra me convidar no seu servidor](${invite})`)
            ]
        })
    }
}