const { Canvas } = require('canvacord')
const { MessageAttachment } = require('discord.js')

module.exports = {
    name: 'editimage',
    description: '[interaction] Edite imagens de perfis com filtros',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'effect',
            description: 'Efeito a ser usado',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'burn',
                    value: 'burn'
                },
                {
                    name: 'pixelate',
                    value: 'pixelate'
                },
                {
                    name: 'sharpen',
                    value: 'sharpen'
                },
            ]
        },
        {
            name: 'scale',
            description: 'Escala do efeito a ser aplicado <1 ~ 100>',
            type: 4,
            min_values: 1,
            max_values: 100,
            required: true
        },
        {
            name: 'user',
            description: 'Usuário a ter a foto editada',
            type: 6
        }
    ],
    async execute({ interaction: interaction }) {

        await interaction.deferReply()

        const { options, user: author } = interaction
        const effect = options.getString('effect')
        const user = options.getUser('user') || author
        const scale = options.getInteger('scale')
        const avatar = user.displayAvatarURL({ format: 'png', size: 1024 })

        return await interaction.editReply({
            files: [new MessageAttachment(await Canvas[effect](avatar, scale))]
        })

    }
}