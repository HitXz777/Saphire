const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

const gifData = [
    { name: 'Chorar' },
    { name: 'Birra' },
    { name: 'Chateado' },
    { name: 'Palmas' },
    { name: 'Correr' },
    { name: 'Dance' },
    { name: 'Deboche' },
    { name: 'Morrer' },
    { name: 'Dormir' },
    { name: 'Drama' },
    { name: 'Risada' },
    { name: 'Facepalm' },
    { name: 'Hapy' },
    { name: 'Fury' },
    { name: 'Raiva' },
    { name: 'Pensando' },
    { name: 'Bico' },
    { name: 'Que' },
    { name: 'Vergonha' },
    { name: 'Surprise' },
    { name: 'Feet' },
]

const data = {
    name: 'reaction',
    description: '[gifs] Reações gerais',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'reaction',
            description: 'Qual é a sua reação?',
            type: 3,
            required: true,
            choices: []
        },
        {
            name: 'text',
            description: 'Diga o que sente',
            type: 3
        }
    ]
}

for (let gif of gifData) {
    data.options[0].choices.push({
        name: gif.name.toLowerCase(),
        value: gif.name
    })
}

module.exports = {
    ...data,
    async execute({ interaction: interaction, client: client }) {

        const { options } = interaction

        let gifRequest = options.getString('reaction')
        let text = options.getString('text')
        let option = gifData.find(g => g.name === gifRequest)
        let gif = g[option.name][Math.floor(Math.random() * g[option.name].length)]

        if (text?.length >= 1000)
            return await interaction.reply({
                content: `${e.Deny} | O limite máximo são de 100 caracteres neste comando. Foi mal.`,
                ephemeral: true
            })

        const embed = {
            color: client.blue,
            image: { url: gif },
        }

        if (text)
            embed.description = text

        return await interaction.reply({ embeds: [embed], fetchReply: true })

    }
}