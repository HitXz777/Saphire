module.exports = {
    name: 'invite',
    description: '[bot] Me adicione no seu servidor',
    dm_permission: false,
    type: 1,
    options: [],
    async execute({ interaction: interaction, client: client, emojis: e }) {

        const invite = `https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot%20applications.commands&permissions=2146958847`

        return await interaction.reply({
            embeds: [{
                color: client.green,
                description: `${e.SaphireFeliz} | [Clique aqui e me convide para o seu servidor](${invite})`
            }]
        })

    }
}