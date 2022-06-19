const translate = require('@iamtraction/google-translate')

module.exports = {
    name: 'translate',
    description: '[util] Traduza textos através deste comando',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'language',
            description: 'Para qual lingua devo traduzir? en pt fr lt...',
            type: 3,
            required: true
        },
        {
            name: 'text',
            description: 'Texto a ser traduzido',
            type: 3,
            required: true
        }
    ],
    async execute({ interaction: interaction, client: client }) {

        await interaction.deferReply({})

        const { options } = interaction

        const Embed = {
            color: '#4295fb',
            author: { name: 'Google Tradutor', iconURL: 'https://imgur.com/9kWn6Qp.png' }
        }

        let language = options.getString('language')
        let text = options.getString('text')

        if (text.length < 2 || text.length > 1000)
            return await interaction.editReply({
                content: `${e.Deny} | O texto deve conter entre 2 e 1000 caracteres.`
            })

        translate(text, { to: language })
            .then(async res => {

                Embed.fields = [
                    {
                        name: 'Texto',
                        value: `\`\`\`txt\n${text}\n\`\`\``
                    },
                    {
                        name: 'Tradução',
                        value: `\`\`\`txt\n${res.text}\n\`\`\``
                    }
                ]

                return await interaction.editReply({ embeds: [Embed] })

            }).catch(async err => {
                
                Embed.color = client.red
                Embed.fields = [
                    {
                        name: 'Texto',
                        value: `\`\`\`txt\n${text}\n\`\`\``
                    },
                    {
                        name: 'Erro',
                        value: `\`\`\`txt\n${err}\n\`\`\``
                    }
                ]

                return await interaction.editReply({ embeds: [Embed] })
            })

    }
}