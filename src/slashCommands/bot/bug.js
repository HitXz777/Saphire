module.exports = {
    name: 'bug',
    description: '[bot] Report bugs para o meu criador',
    dm_permission: false,
    type: 1, // 'CHAT_INPUT',
    options: [
        {
            name: 'report',
            description: 'Descrição do bug',
            type: 3,
            required: true
        },
        {
            name: 'command',
            description: 'Qual foi o comando/sistema que bugou?',
            type: 3
        }
    ],
    async execute({ interaction: interaction, client: client, database: Database, emojis: e }) {

        const { options, channel, guild, user } = interaction

        let userData = await Database.User.findOne({ id: user.id }, 'Timeouts.Bug'),
            timeout = userData?.Timeouts?.Bug || 0

        if (client.Timeout(120000, timeout))
            return await interaction.reply({
                content: `${e.Loading} | Espere mais \`${client.GetTimeout(120000, timeout)}\` para fazer um novo report.`,
                ephemeral: true
            })

        const textExplain = options.getString('report')
        const commandWithError = options.getString('command') || 'Nenhum'
        let ChannelInvite = await channel.createInvite({ maxAge: 0 }).catch(() => { }) || null
        let guildName = ChannelInvite?.url ? `[${guild.name}](${ChannelInvite.url})` : guild.name

        const embed = {
            color: client.red,
            title: '📢 Report de Bug/Erro Recebido',
            url: ChannelInvite?.url || null,
            description: `> Reporte enviado de: ${guildName}\n> ${user.username} - \`${user.id}\`\n\`\`\`txt\n${textExplain || 'Nenhum dado coletado.'}\n\`\`\``,
            fields: [
                {
                    name: 'ℹ️ | Comando reportado',
                    value: `\`${commandWithError || 'Nenhum'}\``,
                }
            ],
            timestamp: new Date()
        }

        const { Config } = Database

        const guildChannel = client.channels.cache.get(Config.BugsChannelId)

        if (!guildChannel)
            return await interaction.reply({
                content: `❌ | Houve um erro ao encontrar o canal designado para recebimento de reports. Por favor, fale diretamente com meu criador: ${client.users.cache.get(Config.ownerId)?.tag || 'Não encontrado'}`,
                embeds: [embed],
                ephemeral: true
            })

        await guildChannel.send({ embeds: [embed] }).catch(async err => {
            return await interaction.reply({
                content: `❌ | Houve um erro ao enviar o reporte para o canal designado. Por favor, fale diretamente com meu criador: ${client.users.cache.get(Config.OwnerId)?.tag || 'Não encontrado'}\n${err}`,
                embeds: [embed],
                ephemeral: true
            })
        })

        Database.SetTimeout(user.id, 'Timeouts.Bug')
        return await interaction.reply({
            content: `✅ | Reporte enviado com sucesso! Muito obrigada pelo seu apoio.`,
            embeds: [embed],
            ephemeral: true
        })

    }
}