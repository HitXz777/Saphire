const { g } = require('../../../modules/Images/gifs.json')
const { e } = require('../../../JSON/emojis.json')

const gifData = [
    { name: 'Chorar', JSON: 'Chorar', defaultMessage: `$user está chorando` },
    { name: 'Bater palmas', JSON: 'Palmas', defaultMessage: `$user batendo palmas` },
    { name: 'Fazer birra', JSON: 'Birra', defaultMessage: `$user fazendo birra` },
    { name: 'Chateado(a)', JSON: 'Chateado', defaultMessage: `$user está chateado*(a)*` },
    { name: 'Sair correndo', JSON: 'Correr', defaultMessage: `$user está correndo` },
    { name: 'Dançar', JSON: 'Dance', defaultMessage: `$user está dançando` },
    { name: 'Fazer deboche', JSON: 'Deboche', defaultMessage: `$user está de deboche` },
    { name: 'Morrer', JSON: 'Morrer', defaultMessage: `$user morreu` },
    { name: 'Dormir', JSON: 'Dormir', defaultMessage: `$user dormiu` },
    { name: 'Fazer drama', JSON: 'Drama', defaultMessage: `$user está fazendo drama` },
    { name: 'Facepalm', JSON: 'Facepalm', defaultMessage: `$user lançou um facepalm` },
    { name: 'Risada', JSON: 'Risada', defaultMessage: `$user está dando risada` },
    { name: 'Felicidade', JSON: 'Happy', defaultMessage: `$user está feliz` },
    { name: 'FURIOSO(A)', JSON: 'Fury', defaultMessage: `$user ESTÁ FURIOSO*(A)*` },
    { name: 'Raiva', JSON: 'Raiva', defaultMessage: `$user está com raiva` },
    { name: 'Pensando', JSON: 'Pensando', defaultMessage: `$user está pensando` },
    { name: 'Bico', JSON: 'Bico', defaultMessage: `$user está fazendo bico` },
    { name: 'Que', JSON: 'Que', defaultMessage: `?????` },
    { name: 'Vergonha', JSON: 'Vergonha', defaultMessage: `$user está com vergonha` },
    { name: 'Estou surpreso*(a)*', JSON: 'Surprise', defaultMessage: `$user está surpreso` },
    { name: 'Pézinho', JSON: 'Feet', defaultMessage: `$user mandou um pézinho no chat` },
    { name: 'Ficar de olho', JSON: 'Olhando', defaultMessage: `$user está de olho` },
    { name: 'Implorar', JSON: 'Onegai', defaultMessage: `$user está implorando` },
    { name: 'Dar de ombros', JSON: 'Shrug', defaultMessage: `$user deu de ombros` },
]

gifData.sort((a, b) => b.name > a.name ? -1 : true)

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
        name: gif.name,
        value: gif.JSON
    })
}

module.exports = {
    ...data,
    async execute({ interaction: interaction, client: client }) {

        const { options, user } = interaction

        let gifRequest = options.getString('reaction')
        let text = options.getString('text')
        let option = gifData.find(g => g.JSON === gifRequest)
        let gif = g[option.JSON][Math.floor(Math.random() * g[option.JSON].length)]

        if (text?.length >= 2000)
            return await interaction.reply({
                content: `${e.Deny} | O limite máximo são de 2000 caracteres neste comando. Foi mal.`,
                ephemeral: true
            })

        return await interaction.reply({
            embeds: [{
                color: client.blue,
                image: { url: gif },
                description: text || option.defaultMessage.replace('$user', user)
            }], fetchReply: true
        })

    }
}