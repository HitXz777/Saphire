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
            type: 3,
            autocomplete: true
        },
        {
            name: 'bots',
            description: 'Desbloquear comandos de bots?',
            type: 5
        },
        {
            name: 'select_channel_manually',
            description: 'Selecione um canal manualmente',
            type: 7
        }
    ],
    async execute({ interaction: interaction, database: Database, emojis: e, guildData: guildData, guild: guild }) {

        const { options, user } = interaction

        let channelId = options.getString('channel')
        let blockBots = options.getBoolean('bots')
        let channel = guild.channels.cache.get(channelId) || options.getChannel('select_channel_manually')
        let channelsBlocked = guildData.Blockchannels?.Channels || []

        if (!channel)
            return await interaction.reply({
                content: `${e.Deny} | Nenhum canal não encontrado`,
                ephemeral: true
            })

        if (!channelsBlocked.includes(channel.id))
            return await interaction.reply({
                content: `${e.Deny} | Este canal não está bloqueado.`,
                ephemeral: true
            })

        if (!['GUILD_TEXT', 'GUILD_NEWS'].includes(channel.type))
            return await interaction.reply({
                content: `${e.Deny} | Apenas canais de texto e anúncios estão disponíveis neste comando.`,
                ephemeral: true
            })

        if (blockBots) return BloquearBots()

        const msg = await interaction.reply({
            content: `${e.QuestionMark} | Você deseja desbloquear todos os meus comandos no canal ${channel}?`,
            fetchReply: true
        }),
            emojis = ['✅', '❌']

        for (const i of emojis) msg.react(i).catch(() => { })

        return msg.awaitReactions({
            filter: (reaction, u) => ['✅', '❌'].includes(reaction.emoji.name) && u.id === user.id,
            max: 1,
            time: 15000,
            errors: ['time']
        }).then(async collected => {
            const reaction = collected.first()

            if (reaction.emoji.name === emojis[0]) {

                await Database.Guild.updateOne(
                    { id: guild.id },
                    { $pull: { 'Blockchannels.Channels': channelId } },
                    { upsert: true }
                )

                return msg.edit({
                    content: `✅ | ${user} desbloqueou todos os meus comandos no canal ${channel}.`
                }).catch(() => { })

            } else
                return msg.edit(`${e.Deny} | Request cancelada por: ${user}`).catch(() => { })

        }).catch(() => msg.edit(`${e.Deny} | Request cancelada por: Tempo expirado.`).catch(() => { }))

        async function BloquearBots() {

            if (!guildData?.Blockchannels.Bots?.includes(channel.id))
                return await interaction.reply({
                    content: `${e.Check} | ${channel} já está desbloqueado para bots.`
                })

            const msg = await interaction.reply({
                content: `${e.QuestionMark} | ${user}, você quer desbloquear todos os comandos de todos os bots neste canal?\n${e.SaphireObs} | Vale lembrar que Administradores **NÃO** são imunes a esse bloqueio.`,
                fetchReply: true
            }),
                emojis = ['✅', '❌'],
                filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === user.id

            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            return msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(async collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === emojis[0]) {

                    await Database.Guild.updateOne(
                        { id: guild.id },
                        { $pull: { 'Blockchannels.Bots': channel.id } },
                        { upsert: true }
                    )
                    return msg.edit(`✅ | ${user} desbloqueou todos comandos de todos os bots canal ${channel}.`).catch(() => { })

                } else return msg.edit(`${e.Deny} | Request cancelada por: ${user}`).catch(() => { })
            }).catch(() => msg.edit(`${e.Deny} | Request cancelada por: Tempo expirado.`).catch(() => { }))
        }

    }
}