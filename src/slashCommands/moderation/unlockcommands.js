const util = require('../../structures/util')

module.exports = {
    name: 'unlockcommands',
    description: '[moderation] Desbloqueie todos os meus comandos em canais específicos',
    dm_permission: false,
    type: 1,
    default_member_permissions: util.slashCommandsPermissions.ADMINISTRATOR,
    options: [
        {
            name: 'channel',
            description: 'Canal em que os comandos serão desbloqueados',
            type: 7,
            required: true
        },
        {
            name: 'bots',
            description: 'Desbloquear comandos de bots?',
            type: 5
        }
    ],
    async execute({ interaction: interaction, database: Database, emojis: e, guildData: guildData }) {

        const { options } = interaction

        let channel = options.getChannel('channel')
        let blockBots = options.getBoolean('bots')

        if (!['GUILD_TEXT', 'GUILD_NEWS'].includes(channel.type))
            return await interaction.reply({
                content: `${e.Deny} | Apenas canais de texto e anúncios estão disponíveis neste comando.`
            })

        if (blockBots) return BloquearBots()

        if (!guildData?.Blockchannels.Channels?.includes(channel.id))
            return await interaction.reply({
                content: `${e.Info} | O canal ${channel} não está bloqueado.`
            })

        const msg = await interaction.reply({
            content: `${e.QuestionMark} | Você deseja desbloquear todos os meus comandos no canal ${channel}?`,
            fetchReply: true
        }),
            emojis = ['✅', '❌']

        for (const i of emojis) msg.react(i).catch(() => { })

        return msg.awaitReactions({
            filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === interaction.user.id,
            max: 1,
            time: 15000,
            errors: ['time']
        }).then(async collected => {
            const reaction = collected.first()

            if (reaction.emoji.name === emojis[0]) {

                await Database.Guild.updateOne(
                    { id: interaction.guild.id },
                    { $pull: { 'Blockchannels.Channels': channel.id } },
                    { upsert: true }
                )

                return msg.edit({
                    content: `✅ | ${interaction.user} desbloqueou todos os meus comandos no canal ${channel}.`
                }).catch(() => { })

            } else
                return msg.edit(`${e.Deny} | Request cancelada por: ${interaction.user}`).catch(() => { })

        }).catch(() => msg.edit(`${e.Deny} | Request cancelada por: Tempo expirado.`).catch(() => { }))

        async function BloquearBots() {

            if (!guildData?.Blockchannels.Bots?.includes(channel.id))
                return await interaction.reply({
                    content: `${e.Check} | ${channel} já está desbloqueado para bots.`
                })

            const msg = await interaction.reply({
                content: `${e.QuestionMark} | ${interaction.user}, você quer desbloquear todos os comandos de todos os bots neste canal?\n${e.SaphireObs} | Vale lembrar que Administradores **NÃO** são imunes a esse bloqueio.`,
                fetchReply: true
            }),
                emojis = ['✅', '❌'],
                filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === interaction.user.id

            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            return msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(async collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === emojis[0]) {

                    await Database.Guild.updateOne(
                        { id: interaction.guild.id },
                        { $pull: { 'Blockchannels.Bots': channel.id } },
                        { upsert: true }
                    )
                    return msg.edit(`✅ | ${interaction.user} desbloqueou todos comandos de todos os bots canal ${channel}.`).catch(() => { })

                } else return msg.edit(`${e.Deny} | Request cancelada por: ${interaction.user}`).catch(() => { })
            }).catch(() => msg.edit(`${e.Deny} | Request cancelada por: Tempo expirado.`).catch(() => { }))
        }

    }
}