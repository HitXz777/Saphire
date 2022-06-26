const { f } = require('../../../JSON/frases.json')

module.exports = {
    name: '8ball',
    description: '[random] Pergunte ao 8Ball',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'question',
            description: 'Faça a sua grandiosa pergunta',
            type: 3,
            required: true
        }
    ],
    async execute({ interaction: interaction, emojis: e }) {

        const { options, channel, guild, user } = interaction
        let question = options.getString('question')

        if (!guild.clientPermissions('MANAGE_WEBHOOKS'))
            return await interaction.reply({
                content: `${e.Info} | Eu preciso da permissão **\`GERENCIAR WEBHOOK\`** para executar este comando.`
            })

        if (!question.endsWith('?'))
            return await interaction.reply({
                content: `${e.QuestionMark} | Isso é mesmo uma pergunta?`
            })

        if (question.length > 50)
            question = question.slice(0, 47) + '...'

        await interaction.deferReply()

        return channel.createWebhook(`8Ball`, {
            avatar: 'https://media.discordapp.net/attachments/893361065084198954/990672256084615278/pngwing.com.png?width=473&height=473'
        })
            .then(webHook => sendMessageWebHook(webHook))
            .catch(async err => {
                return await interaction.editReply({
                    content: `${e.Warn} | Houve um erro ao criar a WebHook.\n> \`${err}\``
                }).catch(() => { })
            })

        async function sendMessageWebHook(webHook) {

            const response = f['8Ball'].random()

            return webHook.send({
                content: `${user}, após pensar muito sobre isso, cheguei a uma resposta.\n${response}`
            })
                .then(async () => {
                    webHook.delete().catch(() => { })

                    return await interaction.editReply({
                        content: `🎱 | Você perguntou ao 8Ball: \`${question}\``
                    }).catch(() => { })
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