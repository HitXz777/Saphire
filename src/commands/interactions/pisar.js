const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'pisar',
    aliases: ['stomp'],
    category: 'interactions',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '👞',
    usage: '<pisar> <@user>',
    description: 'Pisa, pisa, pisa!',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.Pisar[Math.floor(Math.random() * g.Pisar.length)],
            user = message.mentions.members.first() || message.mentions.repliedUser

        if (!user) return message.reply(`${e.Info} | Marca alguém.`)

        if (user.id === client.user.id) return message.reply({
            content: 'Baka, baka, baka!',
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setDescription(`${user} está pisando em ${message.author}`)
                    .setImage(rand)
            ]
        })

        if (user.id === message.author.id) { return message.reply(`${e.Deny} | Não faça isso com você!`) }

        return message.reply({
            embeds: [embed = new MessageEmbed()
                .setColor('#246FE0')
                .setDescription(`👞 ${message.author} pisou em você ${user}`)
                .setImage(rand)]
        })
    }
}