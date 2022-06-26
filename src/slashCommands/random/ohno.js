const { Canvas } = require('canvacord')
const { MessageAttachment } = require('discord.js')

module.exports = {
    name: 'ohno',
    description: '[random] Oh no... It\'s stupid!',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'text',
            description: 'Texto da imagem',
            type: 3,
            required: true
        }
    ],
    async execute({ interaction: interaction, emojis: e }) {

        await interaction.deferReply()

        const { options } = interaction
        const text = options.getString('text')

        if (text.length > 20)
            return await interaction.editReply({
                content: `${e.Deny} | O limite de letras neste comando é de 20 caracteres.`
            })

        return await interaction.editReply({
            files: [new MessageAttachment(await Canvas.ohno(text), 'image.png')]
        })
    }
}