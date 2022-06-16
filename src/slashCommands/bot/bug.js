module.exports = {
    name: 'bug',
    description: '[bot] Report bugs para o meu criador',
    dm_permission: false,
    type: 1,
    options: [],
    async execute({ interaction: interaction, client: client, database: Database, emojis: e, modals: modals }) {

        let userData = await Database.User.findOne({ id: interaction.user.id }, 'Timeouts.Bug'),
            timeout = userData?.Timeouts?.Bug || 0

        if (client.Timeout(120000, timeout))
            return await interaction.reply({
                content: `${e.Loading} | Espere mais \`${client.GetTimeout(120000, timeout)}\` para fazer um novo report.`,
                ephemeral: true
            })
e
        return await interaction.showModal(modals.reportBug)
    }
}