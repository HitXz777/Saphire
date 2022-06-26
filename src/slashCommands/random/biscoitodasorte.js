const { f } = require('../../../JSON/frases.json')

module.exports = {
    name: 'biscoitodasorte',
    description: '[random] Abra um biscoito da sorte',
    dm_permission: false,
    type: 1,
    options: [],
    async execute({ interaction: interaction, emojis: e, client: client }) {

        await interaction.deferReply({})

        if (!interaction.guild.clientPermissions('MANAGE_WEBHOOKS'))
            return await interaction.editReply({
                content: `${e.Info} | Eu preciso da permissão \`GERENCIAR WEBHOOKS\` para continuar com este comando.`
            })

        return interaction.channel.createWebhook(`Biscoito da Sorte | ${client.user.username}`, {
            avatar: 'https://media.discordapp.net/attachments/893361065084198954/989696948296642560/kisspng-fortune-cookie-chinese-cuisine-biscuits-vector-gra-fortune-cookie-clipart-page-3-wordworks-co-5beb111c5249a2.1608451115421319963371.png?width=473&height=473'
        })
            .then(webHook => sendMessageWebHook(webHook))
            .catch(async err => {
                return await interaction.editReply({
                    content: `${e.Warn} | Houve um erro ao criar a WebHook.\n> \`${err}\``
                }).catch(() => { })
            })

        async function sendMessageWebHook(webHook) {

            let BiscMessage = f.BiscoitoDaSorte.random()

            return webHook.send({ content: BiscMessage })
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