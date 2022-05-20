const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'dono',
    aliases: ['owner', 'lider'],
    category: 'util',


    emoji: `${e.Info}`,
    usage: '<dono>',
    description: 'Veja o dono do servidor',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let owner = message.guild.ownerId
        let avatar = message.guild.iconURL({ dynamic: true })

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setAuthor({ name: message.guild.name })
            .setDescription(`${e.OwnerCrow} Dono/a: <@${owner}>\n:id: \`${owner}\``)

        if (avatar) { embed.setThumbnail(avatar) }

        return message.reply({ embeds: [embed] })
    }
}