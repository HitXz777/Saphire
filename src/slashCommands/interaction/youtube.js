const { Canvas } = require('canvacord')
const { MessageAttachment } = require('discord.js')

module.exports = {
    name: 'youtube',
    description: '[interaction] Apenas um comentário no youtube',
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
        },
        {
            name: 'darkmode',
            description: 'O youtube é no modo escuro?',
            type: 5
        }
    ],
    async execute({ interaction: interaction, emojis: e }) {

        await interaction.deferReply()

        const { options } = interaction
        const text = options.getString('text')
        const user = options.getUser('user')
        const darkmode = options.getBoolean('darkmode')
        const avatar = user.displayAvatarURL({ format: 'png' })

        if (text.length > 60)
            return await interaction.editReply({
                content: `${e.Deny} | O limite deste comando é de 50 caracteres.`
            })

        return await interaction.editReply({
            files: [new MessageAttachment(await Canvas.youtube({ username: user.username, content: text, avatar: avatar, dark: darkmode }), 'youtube.png')]
        })

    }
}