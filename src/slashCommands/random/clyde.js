module.exports = {
    name: 'clyde',
    description: '[random] Faça o Clyde Bot dizer algo',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'text',
            description: 'Texto que o Clyde vai dizer',
            type: 3,
            required: true
        }
    ],
    async execute({ interaction: interaction, emojis: e }) {

        await interaction.deferReply({})

        if (!interaction.guild.clientPermissions('MANAGE_WEBHOOKS'))
            return await interaction.editReply({
                content: `${e.Info} | Eu preciso da permissão \`GERENCIAR WEBHOOKS\` para continuar com este comando.`
            })

        const { options } = interaction
        const text = options.getString('text')

        if (text.length > 2000)
            return await interaction.editReply({
                content: `${e.Deny} | O limite de máximo neste comando é de 20000 caracteres.`
            })

        return interaction.channel.createWebhook('Clydizinho', {
            avatar: 'https://media.discordapp.net/attachments/893361065084198954/990640741053251584/unknown.png'
        })
            .then(webHook => sendMessageWebHook(webHook))
            .catch(async err => {
                return await interaction.editReply({
                    content: `${e.Warn} | Houve um erro ao criar a WebHook.\n> \`${err}\``
                }).catch(() => { })
            })

        async function sendMessageWebHook(webHook) {

            return webHook.send({ content: text })
                .then(async () => {
                    webHook.delete().catch(() => { })

                    return await interaction.deleteReply().catch(() => { })
                })
                .catch(async err => {

                    webHook.delete().catch(() => { })
                    return await interaction.editReply({
                        content: `${e.Warn} | Erro ao enviar a mensagem.\n> \`${err}\``
                    }).catch(() => { })
                })

        }
    }
}