module.exports = {
    name: 'pig',
    description: '[economy] Aposte e tente a sorte no pig',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'options',
            description: 'O que fazer por aqui?',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'Tentar a sorte no pig (1000 Safiras)',
                    value: 'try'
                },
                {
                    name: 'Ver o status atual do pig',
                    value: 'status'
                }
            ]
        }
    ],
    async execute({ interaction: interaction, client: client, database: Database, guildData: guildData, clientData: clientData, emojis: e }) {


        const { options, user: author } = interaction

        let option = options.getString('options')

        let authorData = await Database.User.findOne({ id: author.id }, 'Timeouts Balance'),
            porquinho = clientData?.Porquinho,
            PorquinhoMoney = porquinho?.Money || 0,
            LastWinner = porquinho?.LastWinner || 'Ninguém por enquanto',
            LastPrize = porquinho?.LastPrize || 0,
            moeda = guildData?.Moeda || `${e.Coin} Safiras`,
            timeOut = authorData?.Timeouts.Porquinho

        if (option === 'status')
            return await interaction.reply({
                embeds: [
                    {
                        color: '#BA49DA',
                        title: `${e.Pig} Status`,
                        description: `Tente quebrar o Pig e ganhe todo o dinheiro dele`,
                        fields: [
                            {
                                name: 'Último ganhador',
                                value: `${LastWinner}\n${LastPrize}${moeda}`,
                                inline: true
                            },
                            {
                                name: 'Montante',
                                value: `${PorquinhoMoney} ${moeda}`,
                                inline: true
                            }
                        ]
                    }
                ]
            })

        if (client.Timeout(30000, timeOut))
            return await interaction.reply({
                content: `${e.Deny} | Tente quebrar o ${e.Pig} novamente em: \`${client.GetTimeout(30000, timeOut)}\``,
                ephemeral: true
            })

        let money = authorData?.Balance || 0

        if (money < 1000) return await interaction.reply({
            content: `${e.Deny} | Você não possui dinheiro pra apostar no pig. Quantia mínima: 1000 ${moeda}.`,
            ephemeral: true
        })

        await Database.Client.updateOne(
            { id: client.user.id },
            { $inc: { 'Porquinho.Money': 1000 } }
        )

        return Math.floor(Math.random() * 100) === 1 ? PigBroken() : lose()

        async function lose() {
            Database.SetTimeout(author.id, 'Timeouts.Porquinho')
            Database.subtract(author.id, 1000)

            Database.PushTransaction(author.id, `${e.loss} Apostou 1000 Safiras no porquinho.`)
            return await interaction.reply({
                content: `${e.Deny} | Não foi dessa vez! Veja o status: \`/pig options:Ver o status atual do pig\`\n-1000 ${moeda}!`
            })
        }

        async function PigBroken() {
            PorquinhoMoney += 1000
            Database.add(author.id, PorquinhoMoney)
            Database.PushTransaction(author.id, `${e.gain} Ganhou ${PorquinhoMoney} quebrando o porquinho.`)

            await interaction.reply({
                content: `${e.Check} | ${author} quebrou o porquinho e conseguiu +${PorquinhoMoney} ${moeda}!`
            })

            await Database.Client.updateOne(
                { id: client.user.id },
                {
                    Porquinho: {
                        LastPrize: PorquinhoMoney,
                        LastWinner: `${author.tag}\n*${author.id}*`,
                        Money: 0
                    }
                }
            )

            return
        }

    }
}