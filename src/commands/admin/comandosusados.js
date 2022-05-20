const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'comandosusados',
    aliases: ['cmdusados', 'usedcommands', 'comandousados'],
    category: 'admin',
    Admin: true,
    emoji: e.Admin,
    usage: '<comandosusados>',
    description: 'Quantidade de comandos usados em todo o bot',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let data = await Database.Client.findOne({ id: client.user.id }, 'CommandsCount'),
            commands = data?.CommandsCount || {},
            embeds = EmbedGenerator(Object.entries(commands))

        if (!embeds || embeds.length === 0)
            return message.reply(`${e.Deny} | O gerador de embeds não conseguiu criar embeds. Ironico, não?`)

        let emojis = ['⬅️', '➡️', '❌'],
            control = 0

        let msg = await message.reply({ embeds: [embeds[control]] })

        if (embeds.length === 1) return
        for (let i of emojis) msg.react(i).catch(() => { })

        let collector = msg.createReactionCollector({
            filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
            idle: 30000
        })
            .on('collect', (reaction) => {

                if (reaction.emoji.name === emojis[0]) {
                    control--
                    if (control < 0) control = embeds.length--
                    return msg.edit({ embeds: [embeds[control]] }).catch(() => { })
                }

                if (reaction.emoji.name === emojis[1]) {
                    control++
                    if (control >= embeds.length) control = 0
                    return msg.edit({ embeds: [embeds[control]] }).catch(() => { })
                }

                return collector.stop()
            })
            .on('end', () => {
                msg.reactions.removeAll().catch(() => { })
                let cancelEmbed = embeds[control]
                cancelEmbed.color = client.red
                cancelEmbed.footer.text = 'Comando cancelado'
                return msg.edit({ embeds: [cancelEmbed] }).catch(() => { })
            })

        return

        function EmbedGenerator(dataArray) {

            let array = dataArray.sort((a, b) => b[1] - a[1])

            let amount = 10,
                page = 1,
                embeds = [],
                length = array.length / 10 <= 1 ? 1 : parseInt((array.length / 10) + 1)

            for (let i = 0; i < array.length; i += 10) {

                let current = array.slice(i, amount),
                    description = current.map(data => `\`${prefix}${data[0]}\`: ${data[1]}×`).join('\n'),
                    pageCount = length > 1 ? ` - ${page}/${length}` : ''

                embeds.push({
                    color: client.blue,
                    title: `${e.Stonks} Commands Count${pageCount}`,
                    description: `${description || 'Não foi possível gerar e analizar os dados'}`,
                    footer: {
                        text: 'Saphire\'s Database Commands Counting '
                    }
                })

                page++
                amount += 10
            }

            return embeds
        }

    }
}