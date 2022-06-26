module.exports = {
    name: 'sequencia',
    description: '[games] Você é capaz de seguir a sequência correta?',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'numbers',
            description: 'Quantos números você quer?',
            type: 4,
            required: true,
            choices: [
                {
                    name: '5 Números',
                    value: 5
                },
                {
                    name: '6 Números',
                    value: 6
                },
                {
                    name: '7 Números',
                    value: 7
                },
                {
                    name: '8 Números',
                    value: 8
                },
                {
                    name: '9 Números',
                    value: 9
                },
                {
                    name: '10 Números',
                    value: 10
                },
            ]
        }
    ],
    async execute({ interaction: interaction, database: Database, emojis: e }) {

        const { options, user, channel } = interaction

        if (Database.Cache.get('sequencyGame')?.includes(channel.id))
            return await interaction.reply({
                content: `${e.Info} | Já tem um Sequency Game rolando neste chat, espere ele terminar para você começar o seu, ok?`,
                ephemeral: true
            })

        Database.Cache.push('sequencyGame', channel.id)

        let numbers = options.getInteger('numbers')
        let emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
        let buttons = getButtons()
        let botoesEscolhidos = []
        let click = 0

        const allButtons = () => [
            buttons[0].components[0],
            buttons[0].components[1],
            buttons[0].components[2],
            buttons[0].components[3],
            buttons[0].components[4],
            buttons[1].components[0],
            buttons[1].components[1],
            buttons[1].components[2],
            buttons[1].components[3],
            buttons[1].components[4],
            buttons[2].components[0],
            buttons[2].components[1],
            buttons[2].components[2],
            buttons[2].components[3],
            buttons[2].components[4],
            buttons[3].components[0],
            buttons[3].components[1],
            buttons[3].components[2],
            buttons[3].components[3],
            buttons[3].components[4],
            buttons[4].components[0],
            buttons[4].components[1],
            buttons[4].components[2],
            buttons[4].components[3],
            buttons[4].components[4]
        ]

        await randomizeOptions()

        msg = await interaction.reply({
            content: `${e.Info} | Clique com calma nos botões para não estragar o jogo.`,
            components: buttons,
            fetchReply: true
        })

        setTimeout(() => restartButtons(), 3500)

        let collector = msg.createMessageComponentCollector({
            filter: int => int.user.id === user.id,
            idle: 30000
        })
            .on('collect', async int => {

                const { customId } = int

                int.deferUpdate().catch(() => { })
                if (customId !== botoesEscolhidos[click]) {
                    collector.stop()
                    return await disableAllButtons()
                }

                let allButtonsCommand = allButtons()
                let button = allButtonsCommand.find(b => b.custom_id === customId)
                button.style = 'SUCCESS'
                button.emoji = emojis[click]
                click++

                if (click >= botoesEscolhidos.length) {
                    collector.stop()
                    return await disableAllButtons(true)
                }

                return msg.edit({ components: buttons }).catch(() => { })
            })
            .on('end', (i, r) => {
                Database.Cache.pull('sequencyGame', channel.id)
                if (r === 'idle') return disableAllButtons(null)
                return
            })

        function getButtons() {

            let defaultEmoji = '❔'

            /*
              A1 A2 A3 A4 A5 
              B1 B2 B3 B4 B5 
              C1 C2 C3 C4 C5 
              D1 D2 D3 D4 D5 
              E1 E2 E3 E4 E5 
             */

            let aButtons = { type: 1, components: [] }
            let bButtons = { type: 1, components: [] }
            let cButtons = { type: 1, components: [] }
            let dButtons = { type: 1, components: [] }
            let eButtons = { type: 1, components: [] }

            for (let i = 1; i < 6; i++) {
                aButtons.components.push({ type: 2, emoji: defaultEmoji, custom_id: `a${i}`, style: 'SECONDARY', disabled: true })
                bButtons.components.push({ type: 2, emoji: defaultEmoji, custom_id: `b${i}`, style: 'SECONDARY', disabled: true })
                cButtons.components.push({ type: 2, emoji: defaultEmoji, custom_id: `c${i}`, style: 'SECONDARY', disabled: true })
                dButtons.components.push({ type: 2, emoji: defaultEmoji, custom_id: `d${i}`, style: 'SECONDARY', disabled: true })
                eButtons.components.push({ type: 2, emoji: defaultEmoji, custom_id: `e${i}`, style: 'SECONDARY', disabled: true })
            }

            return [aButtons, bButtons, cButtons, dButtons, eButtons]
        }

        function randomizeOptions() {

            let allButtonsCommand = allButtons()
            let randomButtons = allButtonsCommand.random(numbers)
            let i = 0

            for (let button of randomButtons) {
                allButtonsCommand.find(b => b.custom_id === button.custom_id)
                button.emoji = emojis[i]
                botoesEscolhidos.push(button.custom_id)
                i++
            }
        }

        function restartButtons() {

            let allButtonsCommand = allButtons()
            for (let button of allButtonsCommand) {
                button.disabled = false
                if (button.emoji !== '❔')
                    button.emoji = '❔'
            }

            return msg.edit({ components: buttons }).catch(() => { })
        }

        function disableAllButtons(win) {

            let allButtonsCommand = allButtons()
            for (let button of allButtonsCommand) {
                button.disabled = true

                if (botoesEscolhidos.includes(button.custom_id)) {
                    let index = botoesEscolhidos.findIndex(d => d === button.custom_id)
                    button.emoji = emojis[index]

                    if (button.style !== 'SUCCESS')
                        button.style = 'DANGER'

                } else {
                    button.style = win ? 'PRIMARY' : 'DANGER'
                    button.emoji = win ? null : '❌'
                    button.label = win ? 'GG!' : null
                }
            }

            let finishMessage = win
                ? `${e.Check} | Boa! Você acertou uma sequência de ${numbers} números.`
                : `${e.Deny} | Que pena! Você não conseguiu acertar a sequência de ${numbers} números.`

            if (win === null)
                return msg.edit({
                    content: `${e.Deny} | Sequency Game cancelado por falta de resposta.`,
                    components: buttons
                }).catch(() => { })

            return msg.edit({
                content: finishMessage,
                components: buttons
            }).catch(() => { })
        }

    }
}