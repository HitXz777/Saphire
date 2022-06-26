module.exports = {
    name: 'medidor',
    description: '[random] Pode deixar que eu faço as medidas',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Usuário a ser medido',
            type: 6,
            required: true
        },
        {
            name: 'medida',
            description: 'Escolha a únidade de medida',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'Gaydar',
                    value: 'gay'
                },
                {
                    name: 'Chifre do Corno',
                    value: 'corno'
                },
                {
                    name: 'Gado Muuuu',
                    value: 'gado'
                },
                {
                    name: 'Safadin',
                    value: 'safado'
                },
                {
                    name: 'Sonso de tonto',
                    value: 'sonso'
                },
                {
                    name: 'Brotheragem?',
                    value: 'brotheragem'
                },
            ]
        }
    ],
    async execute({ interaction: interaction, emojis: e }) {

        const { options } = interaction
        const user = options.getUser('user')
        const medida = options.getString('medida')
        const num = Math.floor(Math.random() * 100) + 1

        const choices = [
            {
                name: 'gado',
                message: `$emoji | Pelo histórico de ${user}, posso afirmar que é ${num}% gado.`,
                emoji: num > 70 ? e.GadoDemais : '🐂'
            },
            {
                name: 'gay',
                message: `$emoji | Analisando o jogo de cintura de ${user}, meu gaydar é de ${num}%.`,
                emoji: num > 60 ? e.PepeLgbt : '🏳️‍🌈'
            },
            {
                name: 'safado',
                message: `$emoji | Pelo histórico de vida de ${user}, eu diria que a safadeza está em ${num}%.`,
                emoji: '😏'
            },
            {
                name: 'sonso',
                message: `$emoji | Pelas bobeiras que ${user} diz, eu afirmo que é ${num}% sonso.`,
                emoji: '🙃'
            },
            {
                name: 'brotheragem',
                message: `$emoji | Eu sei que ${user} tem umas tendências estrenhas, por isso, eu sei que o nível de brotheragem é de ${num}%.`,
                emoji: e.Nagatoro
            },
            {
                name: 'corno',
                message: `$emoji | Pelo chifre de ${user}, posso dizer que é ${num}% corno.`,
                emoji: num > 70 ? e.Corno : '🦌'
            }
        ]

        let result = choices.find(data => data.name === medida)
        result.message = result.message.replace('$emoji', result.emoji)

        // if (user.id === client.user.id) return message.reply(`${e.SaphireTimida} | Eu não sou gada, sai pra lá.`)

        return await interaction.reply({
            content: result.message
        })
    }
}