module.exports = {
    name: 'forca',
    description: 'Jogo da forca com palavra personalizada',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'random',
            description: 'Palavras aleatórias',
            type: 1
        },
        {
            name: 'choose',
            description: 'Escolher uma palavra personalizada',
            type: 1,
            options: [
                {
                    name: 'palavra',
                    required: true,
                    description: 'Diga a sua palavra',
                    type: 3
                }
            ]
        }
    ],
    async execute({ interaction: interaction, client: client, database: Database, emojis: e }) {

        if (!interaction.guild.me.permissions.toArray().includes('MANAGE_MESSAGES'))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **GERENCIAR MENSAGENS** para poder jogar forca.`
            })

        const subCommand = interaction.options.getSubcommand()
        const random = subCommand === 'random' ? true : false
        const word = interaction.options.getString('palavra')?.toLowerCase()

        if (!random && !word) return forcaInfo()

        let validate = /^[a-z ]+$/i
        if (!validate.test(word))
            return await interaction.reply({
                content: '❌ | O texto informado contém acentos ou números.',
                ephemeral: true
            })

        const Forca = require('../../commands/games/classes/forca')
        return new Forca().game(client, Database, word, interaction, random)

        async function forcaInfo() {
            return await interaction.reply({
                embeds: [
                    {
                        color: client.blue,
                        title: `${e.duvida} Forca Game Info`,
                        fields: [
                            {
                                name: `${e.QuestionMark} Como mandar uma palavra?`,
                                value: `Você pode começar um jogo com qualquer palavra utilizando \`/forca\`\n> *Lembrando: Palavras com acentos e caracteres não alfabéticos não são aceitos aqui. Apenas letras de A~Z*`
                            },
                            {
                                name: `${e.Check} Comece um jogo`,
                                value: `Use apenas \`/forca\``
                            },
                            {
                                name: `${e.Info} Informações`,
                                value: 'Fale apenas uma letra por vez para sua letra ser validada. As regras são as mesma do jogo da forca que todos conhecem.\nApenas 1 jogo por canal é válido.'
                            }
                        ]
                    }
                ]
            })
        }

    }
}