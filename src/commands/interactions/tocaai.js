const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'tocaai',
    aliases: ['highfive'],
    category: 'interactions',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '🤝',
    usage: '<tocaai> <@user>',
    description: 'Cumprimentos sempre são legais',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let rand = g.Tocaai[Math.floor(Math.random() * g.Tocaai.length)],
            user = client.getUser(client, message, args, 'member')
        if (!user) return message.reply(`${e.Info} | Marca alguém.`)

        if (user.id === client.user.id) return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#246FE0')
                    .setDescription('🤝 Opa')
                    .setImage(rand)
            ]
        })

        return message.reply(`${user}, toca aí?`).then(msg => {
            
            msg.react('✅').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['✅'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '✅') {
                    
                    const TradeEmbed = new MessageEmbed().setColor('RED').setImage(g.Tocaai[Math.floor(Math.random() * g.Tocaai.length)])
                    msg.edit({ content: `${user} 🤝 ${message.author}`, embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {
                
                msg.edit('Ish... Ficou no vácuo').catch(() => { })
            })
        })
    }
}