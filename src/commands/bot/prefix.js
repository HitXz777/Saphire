const { DatabaseObj: { e, config } } = require('../../../modules/functions/plugins/database')

module.exports = {
    name: 'prefix',
    aliases: ['setprefix'],
    category: 'bot',
    UserPermissions: ['ADMINISTRATOR'],
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.ModShield}`,
    usage: '<NovoPrefix> | <reset>',
    description: 'Altere o prefixo ou reset para o padrão.',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        const prefixembed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`${e.Info} Informações sobre Prefixo`)
            .setDescription(`Prefixo é o simbolo que você utiliza para executar comandos em bots no Discord.\nExemplo: \`${prefix}prefix\` ou \`${prefix}help\``)
            .addFields(
                {
                    name: '💡 Meus comandos de Prefix',
                    value: `\`${prefix}prefix [NovoPrefixo]\` Escolha meu novo prefixo\n\`${prefix}prefix reset\` Resete meu prefixo para \`-\`\``
                }
            ),
            guild = await Database.Guild.findOne({ id: message.guild.id }),
            newPrefix = args[0]

        if (!newPrefix) return message.reply({ embeds: [prefixembed] })

        if (['reset', 'resetar', 'delete', 'deletar', 'del'].includes(newPrefix?.toLowerCase())) return ResetPrefix()

        if (newPrefix.length > 2) return message.reply(`${e.Deny} | O prefixo não pode ter mais de 2 caracteres.`)
        if (!isNaN(newPrefix)) return message.reply(`${e.Deny} | O prefixo não pode ser um número.`)
        if (args[1]) return message.reply(`${e.Deny} | O prefixo não pode ter espaços.`)
        if (newPrefix === "<") return message.reply(`${e.Deny} | Prefixo não permitido.`)
        if (newPrefix === config.prefix) return message.reply(`${e.Info} | Este já é o prefixo padrão. Caso queira resetar meu prefixo, use o comando \`${prefix}prefix reset\``)

        if (newPrefix) return SetNewPrefix()

        return message.reply(`... Hum. Parece que você chegou nas profundezas do código. Que tal tentar usar o comando corretamente?`)

        async function SetNewPrefix() {

            let msg = await message.reply(`${e.QuestionMark} | Deseja alterar meu prefixo para: \`${newPrefix}\` ?`),
                emojis = ['✅', '❌'],
                control = false

            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

                .on('collect', async (reaction) => {

                    if (reaction.emoji.name === emojis[0]) {
                        msg.reactions.removeAll().catch(() => { })

                        await Database.Guild.updateOne(
                            { id: message.guild.id },
                            { Prefix: newPrefix },
                            { upsert: true }
                        )

                        control = true
                        msg.edit(`${e.Database} | DATABASE | O prefixo deste servidor foi alterado para: \`${newPrefix}\``).catch(() => { })

                    }

                    return collector.stop()

                })

                .on('end', () => {

                    if (!control) return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                    return
                })

        }

        async function ResetPrefix() {

            if (prefix === config.prefix || !guild?.Prefix)
                return message.reply(`${e.Info} | O prefixo atual é o meu padrão: \`${config.prefix}\``)

            let msg = await message.reply(`${e.QuestionMark} | Você deseja resetar meu prefix para \`${config.prefix}\`?`),
                emojis = ['✅', '❌'],
                control = false

            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            const collector = msg.createReactionCollector({
                filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                time: 30000,
                errors: ['time']
            })

                .on('collect', async (reaction) => {

                    if (reaction.emoji.name === emojis[0]) {

                        DelPrefix()

                        control = true
                        msg.edit(`${e.Database} | DATABASE | O prefixo deste servidor foi resetado com sucesso.`).catch(() => { })
                        return collector.stop()

                    } else { return collector.stop() }

                })

                .on('end', () => {

                    if (!control)
                        return message.reply(`${e.Deny} | Comando cancelado.`)

                    return

                })

        }

        async function DelPrefix() {

            return await Database.Guild.updateOne(
                { id: message.guild.id },
                { $unset: { Prefix: 1 } }
            )

        }

    }
}