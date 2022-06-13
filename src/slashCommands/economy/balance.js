module.exports = {
    name: 'balance',
    description: 'Confira suas finanças',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Veja as finanças de alguém',
            type: 6
        },
        {
            name: 'search',
            description: 'Pesquise alguém pelo nome ou ID',
            type: 3
        }
    ],
    async execute({ interaction: interaction, client: client, database: Database, guildData: guildData, emojis: e }) {

        let MoedaCustom = guildData?.Moeda || `${e.Coin} Safiras`

        const { options } = interaction

        let user = await getUser(options.getString('search')) || client.users.cache.get(options.getMember('user')?.id) || interaction.user

        if (user.id === client.user.id)
            return await interaction.reply({
                content: `👝 | ${user.username} possui **∞ ${MoedaCustom}**`,
                ephemeral: true
            })

        let userData = await Database.User.findOne({ id: user.id }, 'Balance Perfil')

        if (!userData) return await interaction.reply({
            content: `${e.Database} | DATABASE | Não foi possível obter os dados de **${user?.tag}** *\`${user.id}\`*`,
            ephemeral: true
        })

        let bal = parseInt(userData?.Balance) || 0,
            oculto = userData?.Perfil?.BalanceOcult,
            balance = oculto ? `||oculto ${MoedaCustom}||` : `${bal} ${MoedaCustom}`,
            NameOrUsername = user.id === interaction.user.id ? 'O seu saldo é de' : `${user?.tag} possui`

        return await interaction.reply({
            content: `👝 | ${NameOrUsername} **${balance}**`,
            ephemeral: true
        })

        function getUser(dataResource) {
            if (!dataResource) return null
            return client.users.cache.find(data => {
                return data.username?.toLowerCase() === dataResource?.toLowerCase()
                    || data.tag?.toLowerCase() === dataResource?.toLowerCase()
                    || data.discriminator === dataResource?.toLowerCase()
                    || data.id === dataResource?.toLowerCase()
            })
        }
    }
}