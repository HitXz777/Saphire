const { Canvas } = require('canvacord')
const { MessageAttachment } = require('discord.js')

module.exports = {
    name: 'changemymind',
    description: '[random] Can you change my mind?',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'text',
            description: 'Texto do change my mind',
            type: 3,
            required: true
        }
    ],
    async execute({ interaction: interaction, emojis: e }) {

        await interaction.deferReply()

        const { options } = interaction
        const text = options.getString('text')

        if (text.length > 30)
            return await interaction.editReply({
                content: `${e.Deny} | O limite de texto no change my mind é de 30 caracteres.`
            })

        return await interaction.editReply({
            files: [new MessageAttachment(await Canvas.changemymind(text), 'changemymind.png')]
        })

    }
}