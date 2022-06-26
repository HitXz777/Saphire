module.exports = {
    name: 'kidbengala',
    description: '[random] Faça o Kid Bengala dizer alguma coisa.',
    dm_permission: false,
    type: 1,
    options: [],
    async execute({ interaction: interaction, emojis: e }) {

        await interaction.deferReply({})

        if (!interaction.guild.clientPermissions('MANAGE_WEBHOOKS'))
            return await interaction.editReply({
                content: `${e.Info} | Eu preciso da permissão \`GERENCIAR WEBHOOKS\` para continuar com este comando.`
            })

        let text = [
            'Um dia... Serei apenas eu e você.',
            'E aí, bora?',
            'Caminhos se abrem quando eu chego...',
            'Doeu... Não aguento... Eu escuto muitas coisas desse tipo.',
            'Outro dia fui comprar uma cueca, a vendedora disse que não tinha meu tamanho, é mole?'
        ].random()

        return interaction.channel.createWebhook("Kid Bengala", {
            avatar: "https://media.discordapp.net/attachments/893361065084198954/989689839962177536/unknown.png?width=473&height=473",
        })
            .then(webHook => sendMessageWebHook(webHook))
            .catch(async err => {
                return await interaction.editReply({
                    content: `${e.Warn} | Erro ao criar a WebHook.\n> \`${err}\``
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