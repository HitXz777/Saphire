module.exports = {
    name: 'dice',
    description: '[random] Role os dados ou aposte neles',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'rol',
            description: '[random] Apenas uma jogada de dados comum',
            type: 1,
            options: [
                {
                    name: 'number',
                    description: 'Número de dados a ser jogado',
                    type: 4,
                    min_value: 1
                }
            ]
        },
        {
            name: 'bet',
            description: 'Aposte no número dos dados',
            type: 1,
            options: [
                {
                    name: 'number',
                    description: '[random] Adivinhe o número do dado',
                    type: 4,
                    min_value: 1,
                    max_value: 6,
                    required: true
                },
                {
                    name: 'value',
                    description: 'Valor a ser apostado',
                    type: 4,
                    min_value: 1,
                    required: true
                }
            ]
        }
    ],
    async execute({ interaction: interaction, database: Database, emojis: e, guildData: guildData }) {

        const { options, user } = interaction
        const number = options.getInteger('number')
        const value = options.getInteger('value')
        const subCommand = options.getSubcommand()
        const moeda = guildData?.Moeda || `${e.Coin} Safiras`

        if (subCommand === 'rol') return simpleRol()
        if (subCommand === 'bet') return betDice()

        async function simpleRol() {

            let diceNumber = Math.floor(Math.random() * (7 * (number || 1)))

            return await interaction.reply({
                content: `🎲 | **${diceNumber++}**`
            })
        }

        async function betDice() {

            let userData = await Database.User.findOne({ id: user.id }, 'Balance'),
                money = userData?.Balance,
                diceNumber = Math.floor(Math.random() * 6) + 1,
                prize = parseInt(value / 2)

            if (!money || money < value)
                return await interaction.reply({
                    content: `${e.Deny} | Você não tem toda essa quantia.`,
                    ephemeral: true
                })

            Database.subtract(user.id, value)
            return number === diceNumber ? win() : lose()

            async function win() {

                Database.add(user.id, prize)
                Database.PushTransaction(
                    user.id,
                    `${e.gain} Ganhou ${prize} Safiras jogando *Dados*`
                )

                return await interaction.reply({
                    content: `🎲 | Parabéns! Você acertou o número **\`${number}\`** e ganhou **${prize} ${moeda}**.`
                })
            }

            async function lose() {

                Database.PushTransaction(
                    user.id,
                    `${e.loss} Perdeu ${value} Safiras jogando *Dados*`
                )

                return await interaction.reply({
                    content: `🎲 | É isso aí! Você errou o número **\`${diceNumber}\`** e perdeu o valor apostado de **${prize} ${moeda}**.`
                })
            }

        }

    }
}