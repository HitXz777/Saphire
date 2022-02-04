const { emojis, DatabaseObj: { config } } = require('../../../Routes/functions/database'),
    e = emojis.get('e')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'emojis',
    aliases: ['setemoji'],
    category: 'random',
    emoji: `${e.SaphireFeliz}`,
    usage: '<setemoji> <add/remove> <emoji>',
    description: 'Permite meu criador adicionar ou emojis emojis do meu banco de dados',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const owner = message.author.id === config.ownerId

        if (!args[0]) return AllEmojis()

        if (!owner) return message.reply(`${e.OwnerCrow} | Acesso privado ao meu criador.`)
        if (['get', 'tem'].includes(args[0]?.toLowerCase())) return GetEmoji(args[1])
        if (['set', 'new', 'novo', 'add'].includes(args[0]?.toLowerCase())) return SetNewEmoji()
        if (['delete', 'del', 'remove', 'tirar', 'excluir'].includes(args[0]?.toLowerCase())) return DeleteEmoji(args[1])

        return message.reply(`${e.Info} | Argumentos: \`get, new, delete, all\``)

        function SetNewEmoji() {

            let Nome = args[1],
                Emoji = args[2]

            if (args[3])
                return message.reply(`${e.Info} | Comando: \`${prefix}emojis new NomeDoEmoji Emoji\`. Nada além disso.`)

            if (!Nome || !Emoji)
                return message.reply(`${e.Info} | Comando: \`${prefix}emojis new NomeDoEmoji Emoji\``)

            if (emojis.get(`e.${Nome}`))
                return message.reply(`${e.Info} | Este emojis já existe no meu banco de dados.`)

            if (Nome.startsWith('<'))
                return message.reply(`${e.Info} | Comando: \`${prefix}emojis new NomeDoEmoji Emoji\``)

            emojis.set(`e.${Nome}`, Emoji)
            return message.reply(`${e.Check} | Novo emoji inserido com sucesso no banco de dados! Emoji in DB: ${emojis.get(`e.${Nome}`)}`)
        }

        async function AllEmojis() {

            let EmojisName = Object.keys(emojis.get('e') || {})

            if (EmojisName.length === 0)
                return message.reply(`${e.Deny} | Nenhum emoji na database.`)

            function EmbedGenerator() {

                let amount = 15,
                    Page = 1,
                    embeds = [],
                    length = EmojisName.length / 15 <= 1 ? 1 : parseInt((EmojisName.length / 15) + 1)

                for (let i = 0; i < EmojisName.length; i += 15) {

                    let current = EmojisName.slice(i, amount),
                        description = current.map(emoji => `> \`${emoji}\`: ${e[emoji] || 'Não encontrado'}`).join("\n")

                    if (current.length > 0) {

                        embeds.push({
                            color: 'GREEN',
                            title: `${client.user.username} Emoji List - ${Page}/${length}`,
                            description: `${description}`,
                            footer: {
                                text: `${EmojisName.length} Emojis contabilizados`
                            },
                        })

                        Page++
                        amount += 15

                    }

                }

                return embeds;
            }

            let Embeds = EmbedGenerator(),
                msg = await message.channel.send({ embeds: [Embeds[0]] }),
                Control = 0,
                Emojis = ['⏮️', '⬅️', '➡️', '⏭️', '❌']

            if (Embeds.length > 1)
                for (const emoji of Emojis)
                    msg.react(emoji).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => Emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 30000
            })

                .on('collect', (reaction) => {

                    if (reaction.emoji.name === Emojis[4])
                        return collector.stop()

                    if (reaction.emoji.name === Emojis[0]) {
                        if (Control === 0) return
                        Control = 0
                        return msg.edit({ embeds: [Embeds[Control]] }).catch(() => { })
                    }

                    if (reaction.emoji.name === Emojis[3]) {
                        if (Control === Embeds.length - 1) return
                        Control = Embeds.length - 1
                        return msg.edit({ embeds: [Embeds[Control]] }).catch(() => { })
                    }

                    return reaction.emoji.name === Emojis[1]
                        ? (() => {

                            Control--
                            return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control++

                        })()
                        : (() => {

                            Control++
                            return Embeds[Control] ? msg.edit({ embeds: [Embeds[Control]] }).catch(() => { }) : Control--

                        })()
                })

                .on('end', () => {
                    return msg.edit({ content: `${e.Deny} Comando cancelado` }).catch(() => { })
                })

        }

        function GetEmoji(Emoji) {

            if (!Emoji) return message.reply(`${e.Info} | Faltou o nome do emoji.`)

            let emoji = emojis.get(`e.${Emoji}`)
            emoji ? message.reply(`${emoji}`) : message.reply(`${e.Deny} | Emoji não encontrado.`)
        }

        function DeleteEmoji(Name) {
            if (!emojis.get(`e.${Name}`))
                return message.reply(`${e.Deny} | Emoji não encontrado.`)

            emojis.delete(`e.${Name}`)
            return message.reply(`${e.Check} | Emoji apagado com sucesso!`)
        }

    }
}