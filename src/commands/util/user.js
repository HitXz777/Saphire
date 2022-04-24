
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'user',
    aliases: ['tag'],
    category: 'util',
    emoji: `${e.Info}`,
    usage: '<user> <@user>',
    description: 'Veja o nome da conta de alguém',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.members.first() || message.member || message.mentions.repliedUser,
            avatar = user.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 })

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setAuthor(`${user.user.username}`, avatar)
                    .setDescription(`📇 \`${user.user.tag}\``)
            ]
        })
    }
}