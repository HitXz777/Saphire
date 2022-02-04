const { g } = require('../../../Routes/Images/gifs.json')
const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')

module.exports = {
    name: 'cutucar',
    aliases: ['poke'],
    category: 'interactions',
    
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '👉',
    usage: '<cutucar> <@user>',
    description: 'Cutucar irrita, faz isso não',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        let NoReactAuthor = sdb.get(`Users.${message.author.id}.NoReact`)
        if (NoReactAuthor) return message.reply(`${e.Deny} | Você está com o \`${prefix}noreact\` ativado.`)

        let rand = g.Cutucar[Math.floor(Math.random() * g.Cutucar.length)]
        let user = message.mentions.users.first() || message.member

        if (user.id === client.user.id)
            return message.reply(`Não me cutuca não, sai ${e.MaikaAngry}`)

        if (user.id === message.author.id) return message.reply(`${e.Deny} | Marca alguém lerdinho(a)`)

        let NoReact = sdb.get(`Users.${user.id}.NoReact`)
        if (NoReact) return message.reply(`${e.Deny} | Este usuário está com o \`${prefix}noreact\` ativado.`)

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setDescription(`👉 | ${message.author} está te cutucando ${user}`)
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
                    const TradeEmbed = new MessageEmbed().setColor('RED').setDescription(`👉 ${message.author} e ${user} estão se cutucando 👈`).setFooter(`${message.author.id}/${user.id}`).setImage(g.Cutucar[Math.floor(Math.random() * g.Cutucar.length)])
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