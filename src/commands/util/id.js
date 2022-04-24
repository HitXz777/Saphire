const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'id',
    aliases: [],
    category: 'util',
    
    
    emoji: `${e.Info}`,
    usage: '<id> <@user>',
    description: 'Confira o ID de qualquer um',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.members.first() || message.member || message.mentions.repliedUser
        let avatar = user.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 })

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setAuthor(`${user.user.username}`, avatar)
            .setDescription(`🆔 \`${user.id}\``)

        return message.reply({ embeds: [embed] })
    }
}