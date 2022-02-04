const { e } = require('../../../database/emojis.json')
const { g } = require('../../../Routes/Images/gifs.json')
const { f } = require('../../../database/frases.json')
const Error = require('../../../Routes/functions/errors')

module.exports = {
    name: 'kimetsu',
    aliases: ['kny'],
    category: 'animes',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.NezukoDance}`,
    usage: '<kimetsu>',
    description: 'Gifs do anime: Demon Slayer: Kimetsu no Yaiba',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
        let gif = g.KimetsuNoYaiba[Math.floor(Math.random() * g.KimetsuNoYaiba.length)]

        const KimetsuEmbed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(':tv: Anime: Demon Slayer: Kimetsu no Yaiba')
            .setImage(gif)

        return message.reply({ embeds: [KimetsuEmbed] }).then(msg => {
            sdb.set(`Request.${message.author.id}`, `${msg.url}`)
            msg.react('🔄').catch(() => { }) // Troca
            msg.react('❌').catch(() => { }) // Cancel

            const TradeFilter = (reaction, user) => { return reaction.emoji.name === '🔄' && user.id === message.author.id }
            let Collector = msg.createReactionCollector({ filter: TradeFilter, time: 40000, erros: ['time'] })

            const DenyFilter = (reaction, user) => { return reaction.emoji.name === '❌' && user.id === message.author.id }
            let Collector2 = msg.createReactionCollector({ filter: DenyFilter, max: 1, errors: ['max'] })

            i = 0
            Collector.on('collect', () => {
                i++
                KimetsuEmbed.setImage(g.KimetsuNoYaiba[Math.floor(Math.random() * g.KimetsuNoYaiba.length)])
                msg.edit({ embeds: [KimetsuEmbed] }).catch(() => { })
            })

            Collector.on('end', () => {
                sdb.delete(`Request.${message.author.id}`)
                KimetsuEmbed.setColor('RED').setTitle(`${e.Deny} Anime: Demon Slayer: Kimetsu no Yaiba`).setFooter(`Sessão Expirada | ${i} Requests solicitadas.`)
                msg.edit({ embeds: [KimetsuEmbed] }).then(() => { i = 0 }).catch(() => { })
            })

            Collector2.on('end', () => {
                sdb.delete(`Request.${message.author.id}`)
                msg.delete().then(() => { i = 0 }).catch(() => { })
            })
        }).catch(err => {
            Error(message, err)
            sdb.delete(`Request.${message.author.id}`)
            return message.reply(`${Attention} | Houve um erro ao executar este comando\n\`${err}\``)
        })
    }
}