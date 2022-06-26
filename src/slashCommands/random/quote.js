const { Canvas } = require('canvacord')
const { MessageAttachment } = require('discord.js')
const util = require('../../structures/util')

const ColorsData = {
    name: 'color',
    description: 'Cor da quote',
    type: 3,
    required: true,
    choices: []
}

let colors = Object.keys(util.EmbedColors)

for (let data of colors)
    ColorsData.choices.push({
        name: util.ColorsTranslate[data],
        value: data
    })

module.exports = {
    name: 'quote',
    description: '[random] Uma fake quote',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Usuário do quote',
            type: 6,
            required: true
        },
        {
            name: 'text',
            description: 'Texto da quote',
            type: 3,
            required: true
        },
        ColorsData
    ],
    async execute({ interaction: interaction, emojis: e }) {

        await interaction.deferReply()

        const { options } = interaction
        const user = options.getUser('user')
        const text = options.getString('text')
        const color = options.getString('color')
        const avatar = user.displayAvatarURL({ format: 'png' })

        if (text.length > 49)
            return await interaction.editReply({
                content: `${e.Deny} | O limite máximo para este comando é de 49 caracteres.`
            })

        return await interaction.editReply({
            files: [
                new MessageAttachment(await Canvas.quote({
                    image: avatar,
                    message: text,
                    username: user.username,
                    color: color
                }), 'image.png')]
        }).catch(() => { })

    }
}