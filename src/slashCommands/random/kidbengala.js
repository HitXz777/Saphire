module.exports = {
    name: 'kidbengala',
    description: '[random] Faça o Kid Bengala dizer alguma coisa.',
    dm_permission: false,
    type: 1,
    options: [],
    async execute({ interaction: interaction, emojis: e }) {

        await interaction.deferReply({ ephemeral: true })

        let text = [
            'Um dia... Serei apenas eu e você.',
            'E aí, bora?',
            'Caminhos se abrem quando eu chego...',
            'Doeu... Não aguento... Eu escuto muita coisas desse tipo.',
            'Outro dia fui comprar uma cueca, a vendedora disse que não tinha meu tamanho, é mole?'
        ].random()

        return interaction.channel.createWebhook("Kid Bengala", {
            avatar: "https://media.discordapp.net/attachments/893361065084198954/989689839962177536/unknown.png?width=473&height=473",
        })
            .then(webHook => sendMessageWebHook(webHook))
            .catch(async err => {
                return await interaction.editReply({
                    content: `${e.Warn} | Erro ao criar a WebHook.\n> \`${err}\``,
                    ephemeral: true
                })
            })

        async function sendMessageWebHook(webHook) {

            return webHook.send({ content: text })
                .then(async () => {
                    webHook.delete().catch(() => { })

                    return await interaction.editReply({
                        content: `${e.SaphireOk} | Não vou dizer pra ninguém que você curte o Kid.`,
                        ephemeral: true
                    }).catch(() => { })
                })
                .catch(async err => {

                    webHook.delete().catch(() => { })
                    return await interaction.editReply({
                        content: `${e.Warn} | Erro ao enviar a mensagem.\n> \`${err}\``,
                        ephemeral: true
                    })
                })

        }
    }
}