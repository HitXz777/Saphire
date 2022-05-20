const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'id',
    aliases: [],
    category: 'util',


    emoji: `${e.Info}`,
    usage: '<id> <@user>',
    description: 'Confira o ID de qualquer um',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.members.first() || message.member || message.mentions.repliedUser

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setAuthor({
                        name: user.user.username,
                        iconURL: user.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 })
                    })
                    .setDescription(`🆔 \`${user.id}\``)
            ]
        })
    }
}