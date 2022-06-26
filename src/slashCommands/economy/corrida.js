/*
ESTE COMANDO FOI IDEALIZADO POR 942070026519847002 ꨄ𝑚𝑜𝑜𝑛 𝑎𝑛𝑜𝑛𝑖𝑚𝑎ꨄ#3597
ESCRITO POR: 451619591320371213 Rody#1000
*/

module.exports = {
    name: 'corrida',
    description: '[economy] Aposte no seu animal e boa sorte',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'value',
            description: 'Valor a ser apostado',
            type: 4,
            min_value: 1,
            required: true
        },
        {
            name: 'players',
            description: 'Quantos jogadores pode entrar na corrida',
            type: 4,
            min_value: 2,
            max_value: 24,
            required: true
        }
    ],
    async execute({ interaction: interaction, client: client, database: Database, emojis: e, guildData: guildData }) {

        const { options, user: author, channel } = interaction

        if (Database.Cache.get('corrida')?.includes(channel.id))
            return await interaction.reply({
                content: `${e.Deny} | Já tem uma corrida rolando neste chat. Espere ela acabar para iniciar outra, ok?`,
                ephemeral: true
            })

        let emojis = ['🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🙈', '🐵', '🐸', '🐨', '🐒', '🦁', '🐯', '🐮', '🐔', '🐧', '🐦', '🐤', '🦄', '🐴', '🐗', '🐺', '🦇', '🦉', '🦅', '🦤', '🦆', '🐛', '🦋', '🐌', '🐝', '🪳', '🪲', '🦗', '🦂', '🐢']
        let buttons = await getButtons()
        let value = options.getInteger('value')
        let players = options.getInteger('players')
        let authorData = await Database.User.findOne({ id: author.id }, 'Color')
        let color = authorData?.Color?.Set || client.blue
        let moeda = guildData?.Moeda || `${e.Coin} Safiras`
        let total = 0
        let iniciated = false

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

        let embed = {
            color: color,
            title: `${author.username} iniciou uma Corrida de Animais`,
            description: `Valor da corrida: ${value} ${moeda}`,
            fields: [
                {
                    name: 'Prêmio acumulado',
                    value: `0 ${moeda}`
                },
                {
                    name: 'Participantes e seus animais',
                    value: 'Nenhum participante'
                }
            ],
            footer: { text: `Máximo de jogadores: ${players}` }
        }

        let usersJoined = []

        Database.Cache.push('corrida', channel.id)
        let msg = await interaction.reply({
            embeds: [embed],
            components: buttons,
            fetchReply: true
        })

        let collector = msg.createMessageComponentCollector({
            filter: int => true,
            idle: 30000
        })
            .on('collect', async int => {

                const { customId, user } = int

                if (user.id === author.id && customId === 'init') {
                    iniciated = true
                    collector.stop()
                    msg.edit({ components: [] })
                    return await initCorrida()
                }

                if (customId === 'init')
                    return await int.reply({
                        content: `${e.Deny} | Apenas ${author} pode iniciar esta corrida.`,
                        ephemeral: true
                    })

                if (usersJoined.find(u => u.id === user.id))
                    return int.reply({
                        content: `${e.Info} | Você já entrou na corrida.`,
                        ephemeral: true
                    })

                let userData = await Database.User.findOne({ id: user.id }, 'Balance'),
                    userMoney = userData?.Balance || 0

                if (!userMoney || userMoney < value)
                    return await int.reply({
                        content: `${e.Deny} | Você não tem dinheiro o suficiente para entrar neste corrida.`,
                        ephemeral: true
                    })

                Database.subtract(user.id, value)
                Database.PushTransaction(
                    user.id,
                    `${e.loss} Apostou ${value} Safiras em uma corrida de animais`
                )

                int.deferUpdate().catch(() => { })
                let buttonsCommand = allButtons()
                let button = buttonsCommand.find(b => b.custom_id === customId)
                let animal = button.emoji

                total += value
                button.disabled = true
                button.style = 'PRIMARY'

                usersJoined.push({
                    id: user.id,
                    animal: animal,
                    distance: 0.0,
                    dots: ''
                })

                embed.fields[0].value = `${total} ${moeda}`
                embed.fields[1].value = usersJoined.map(data => `${data.animal} <@${data.id}>`).join('\n')

                if (usersJoined.length >= players) {
                    iniciated = true
                    collector.stop()
                    msg.edit({ embeds: [embed], components: [] })
                    return await initCorrida()
                }

                return msg.edit({ embeds: [embed], components: buttons })
            })
            .on('end', async (i, r) => {
                if (iniciated) return
                Database.Cache.pull('corrida', channel.id)
                if (r === 'idle')
                    return msg.edit({
                        content: `${e.Deny} | Corrida cancelada por falta de resposta.`,
                        embeds: [],
                        components: []
                    })
                return
            })

        async function initCorrida() {

            if (usersJoined.length < 2) {
                Database.Cache.push('corrida', channel.id)

                for (let player of usersJoined) {
                    Database.add(player.id, value)
                }

                return channel.send({
                    content: `${e.Deny} | A corrida foi iniciada com menos de 2 jogadores.`
                })
            }

            let data = () => usersJoined.map(d => `${d.distance.toFixed(2)} ${d.dots}${d.animal}`).join('\n')
            let limitToReach = 4.0

            let MessageRunning = await channel.send({
                content: data(),
                fetchReply: true
            })

            let atualize = setInterval(() => {

                for (let player of usersJoined) {

                    let distancePoints = [0.1, 0.4, 0.3, 0.2, 0.1, 0.1, 0.1, 0.5, 0.1]
                    let distanceIndex = Math.floor(Math.random() * distancePoints.length)
                    let dots = ['.', '....', '...', '..', '.', '.', '.', '.....', '.'][distanceIndex]

                    player.distance += distancePoints[distanceIndex]
                    player.dots += dots
                }

                let rank = usersJoined.sort((a, b) => b.distance - a.distance)

                if (rank[0].distance >= limitToReach)
                    return newWinner(atualize, MessageRunning, rank[0], data())

                MessageRunning.edit({
                    content: data()
                })

            }, 2500)

            return
        }

        async function newWinner(atualize, MessageRunning, winnerData, result) {

            clearInterval(atualize)
            MessageRunning.delete()

            Database.Cache.push('corrida', channel.id)
            Database.add(winnerData.id, total)
            Database.PushTransaction(
                winnerData.id,
                `${e.gain} Ganhou ${total} Safiras em uma corrida de animais`
            )

            embed.fields[1].value = usersJoined.map(data => {
                let crown = data.id === winnerData.id ? '👑' : ''
                return `${data.animal} <@${data.id}> ${crown}`
            }).join('\n')

            embed.fields[2] = {
                name: 'Resultado',
                value: result
            }

            return channel.send({
                embeds: [embed]
            })

        }

        function getButtons() {

            let choosenEmojis = emojis.random(25)

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

            for (let i = 0; i < 5; i++)
                aButtons.components.push({ type: 2, emoji: choosenEmojis[i], custom_id: `a${i}`, style: 'SECONDARY' })

            choosenEmojis.splice(0, 5)
            for (let i = 0; i < 5; i++)
                bButtons.components.push({ type: 2, emoji: choosenEmojis[i], custom_id: `b${i}`, style: 'SECONDARY' })

            choosenEmojis.splice(0, 5)
            for (let i = 0; i < 5; i++)
                cButtons.components.push({ type: 2, emoji: choosenEmojis[i], custom_id: `c${i}`, style: 'SECONDARY' })

            choosenEmojis.splice(0, 5)
            for (let i = 0; i < 5; i++)
                dButtons.components.push({ type: 2, emoji: choosenEmojis[i], custom_id: `d${i}`, style: 'SECONDARY' })

            choosenEmojis.splice(0, 5)
            for (let i = 0; i < 4; i++)
                eButtons.components.push({ type: 2, emoji: choosenEmojis[i], custom_id: `e${i}`, style: 'SECONDARY' })

            eButtons.components.push({ type: 2, label: 'Start', custom_id: 'init', style: 'SUCCESS' })

            return [aButtons, bButtons, cButtons, dButtons, eButtons]
        }
    }
}