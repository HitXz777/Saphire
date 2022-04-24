const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'ideiachannel',
    aliases: ['setideiachannel', 'canaldeideias'],
    category: 'config',
    UserPermissions: ['MANAGE_GUILD'],
    ClientPermissions: ['ADD_REACTIONS', 'EMBED_LINKS'],
    emoji: `${e.ModShield}`,
    usage: '<ideichannel> [#channel]',
    description: 'Selecione um canal para envio de ideias',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        const guildData = await Database.Guild.findOne({ id: message.guild.id }, 'IdeiaChannel'),
            atual = guildData?.IdeiaChannel

        if (['desligar', 'off'].includes(args[0]?.toLowerCase())) return turnOff()

        let channel = message.mentions.channels.first() || message.channel

        if (channel.id === atual) return message.reply(`${e.Info} | Este já é o canal de ideias atual`)

        let msg = await message.reply(`${e.QuestionMark} | Deseja autenticar o canal ${channel} como canal de ideias?`),
            emojis = ['✅', '❌'],
            validate = false

        for (let i of emojis) msg.react(i).catch(() => { })

        const collector = msg.createReactionCollector({
            filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
            time: 30000,
            errors: ['time']
        })

            .on('collect', async (reaction, user) => {

                if (reaction.emoji.name === '✅') {

                    await Database.Guild.updateOne(
                        { id: message.guild.id },
                        { IdeiaChannel: channel.id },
                        { upsert: true }
                    )

                    validate = true
                    msg.edit(`${e.SaphireFeliz} | Prontinho, sistema de ideias ativado! Para mandar alguma ideia, só usar o comando: \`${prefix}ideia a sua ideia em diante...\``).catch(() => { })
                }

                return collector.stop()

            })

            .on('end', () => {

                if (!validate)
                    return message.channel.send(`${e.Deny} | Request cancelada.`)

                return

            })

        async function turnOff() {

            if (!atual) return message.reply(`${e.Deny} | O sistema de ideias já está desativado`)

            let channel = message.guild.channels.cache.get(atual)

            if (!channel && atual) {
                deleteChannel()
                return message.reply(`${e.Deny} | O sistema de ideias já está desativado`)
            }

            let msg = await message.channel.send(`${e.QuestionMark} | Deseja desativar o sistema de ideias? Canal atual: ${channel}`),
                emojis = ['✅', '❌'],
                validate = false

            for (let i of emojis) msg.react(i).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

                .on('collect', (reaction, user) => {

                    if (reaction.emoji.name === '✅') {
                        deleteChannel()
                        validate = true
                        msg.edit(`${e.SaphireFeliz} | Prontinho, sistema de ideias desativado.`).catch(() => { })
                    }

                    return collector.stop()

                })

                .on('end', () => {

                    if (!validate)
                        return message.channel.send(`${e.Deny} | Request cancelada.`)

                    return

                })

            return

        }

        async function deleteChannel() {

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $unset: { IdeiaChannel: 1 } }
            )
            return
        }

    }
}