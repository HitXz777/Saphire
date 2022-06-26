const { Canvas } = require('canvacord')
const { MessageAttachment } = require('discord.js')

module.exports = {
    name: 'phub',
    description: '[interaction] Apenas um comentário de um site muito conhecido',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'user',
            description: 'Usuário do comentário',
            type: 6,
            required: true
        },
        {
            name: 'text',
            description: 'Comentário',
            type: 3,
            required: true
        }
    ],
    async execute({ interaction: interaction, emojis: e }) {

        await interaction.deferReply()

        const { options } = interaction
        const text = options.getString('text')
        const user = options.getUser('user')
        const avatar = user.displayAvatarURL({ format: 'png' })

        if (text.length > 50)
            return await interaction.editReply({
                content: `${e.Deny} | O limite deste comando é de 50 caracteres.`
            })

        return await interaction.editReply({
            files: [new MessageAttachment(await Canvas.phub({ username: user.username, message: text, image: avatar }), 'phub.png')]
        })

    }
}