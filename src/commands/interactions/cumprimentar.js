const { g } = require('../../../Routes/Images/gifs.json')
const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')

module.exports = {
    name: 'cumprimentar',
    aliases: ['bv', 'bemvindo', 'bemvinda', 'bem-vindo', 'bem-vinda', 'welcome', 'saudar', 'acenar', 'oi'],
    category: 'interactions',
    
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '👋',
    usage: '<cumprimentar> <@user>',
    description: 'Cumprimente alguém',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        let NoReactAuthor = sdb.get(`Users.${message.author.id}.NoReact`)
        if (NoReactAuthor) return message.reply(`${e.Deny} | Você está com o \`${prefix}noreact\` ativado.`)

        let rand = g.Cumprimentar[Math.floor(Math.random() * g.Cumprimentar.length)]
        let user = message.mentions.users.first() || message.member

        if (user.id === client.user.id) {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#246FE0')
                        .setDescription(`👋 | Oieee`)
                        .setImage(rand)
                ]
            })
        }
        if (user.id === message.author.id) return message.reply(`${e.Deny} | Só faltou @alguém`)

        let NoReact = sdb.get(`Users.${user.id}.NoReact`)
        if (NoReact) return message.reply(`${e.Deny} | Este usuário está com o \`${prefix}noreact\` ativado.`)

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`👋 | ${message.author} está acenando pra você ${user}`)
            .setImage(rand)
            .setFooter('🔁 retribuir')

        return message.reply({ embeds: [embed] }).then(msg => {
            sdb.set(`Request.${message.author.id}`, `${msg.url}`)
            msg.react('🔁').catch(() => { }) // Check

            const filter = (reaction, u) => { return ['🔁'].includes(reaction.emoji.name) && u.id === user.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '🔁') {
                    sdb.delete(`Request.${message.author.id}`)
                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`👋 ${user} acenou de volta ${message.author} 👋`).setFooter(`${message.author.id}/${user.id}`).setImage(g.Cumprimentar[Math.floor(Math.random() * g.Cumprimentar.length)])
                    msg.edit({ embeds: [TradeEmbed] }).catch(() => { })
                }

            }).catch(() => {
                sdb.delete(`Request.${message.author.id}`)
                embed.setColor('RED').setFooter(`${message.author.id}/${user.id}`)
                msg.edit({ embeds: [embed] }).catch(() => { })
            })
        })
    }
}