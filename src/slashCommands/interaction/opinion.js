const { Canvas } = require('canvacord')
const { MessageAttachment } = require('discord.js')

module.exports = {
    name: 'opinion',
    description: '[interaction]',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'text',
            description: 'Texto do comando',
            type: 3,
            required: true
        },
        {
            name: 'member',
            description: 'Membro para o comando',
            type: 6
        }
    ],
    async execute({ interaction: interaction, emojis: e }) {

        await interaction.deferReply()

        const { options, user } = interaction
        const text = options.getString('text')
        const member = options.getUser('member') || user
        const avatar = member.displayAvatarURL({ format: 'png', size: 1024 })

        if (text.length > 25)
            return await interaction.editReply({
                content: `${e.Deny} | O texto deste comando é limitado em 20 caracteres.`
            })

        return await interaction.editReply({
            files: [new MessageAttachment(await Canvas.opinion(avatar, text), 'opinion.png')]
        })

    }
}