const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'dono',
    aliases: ['owner', 'lider'],
    category: 'util',
    
    
    emoji: `${e.Info}`,
    usage: '<dono>',
    description: 'Veja o dono do servidor',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let owner = message.guild.ownerId
        let avatar = message.guild.iconURL({ dynamic: true })

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setAuthor(`${message.guild.name}`)
            .setDescription(`${e.OwnerCrow} Dono/a: <@${owner}>\n:id: \`${owner}\``)

        if (avatar) { embed.setThumbnail(avatar) }

        return message.reply({ embeds: [embed] })
    }
}