const { Canvas } = require('canvacord')
const { MessageAttachment } = require('discord.js')

module.exports = {
    name: 'olhandopratras',
    description: '[interaction] Meme do homem olhando pra mulher',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'homem',
            description: 'Quem será o homem do meme',
            type: 6,
            required: true
        },
        {
            name: 'mulher_ao_lado_do_homem',
            description: 'Mulher ao lado do homem',
            type: 6,
            required: true
        },
        {
            name: 'mulher_que_o_homem_olha',
            description: 'Mulher que o homem está olhando',
            type: 6,
            required: true
        }
    ],
    async execute({ interaction: interaction, emojis: e }) {

        await interaction.deferReply()

        const { options } = interaction
        const homem = options.getUser('homem')
        const mulher1 = options.getUser('mulher_ao_lado_do_homem')
        const mulher2 = options.getUser('mulher_que_o_homem_olha')
        const avatar1 = mulher2.displayAvatarURL({ format: 'png' })
        const avatar2 = homem.displayAvatarURL({ format: 'png' })
        const avatar3 = mulher1.displayAvatarURL({ format: 'png' })

        if (homem.id === mulher1.id || homem.id === mulher2.id || mulher1.id === mulher2.id)
            return interaction.editReply({
                content: `${e.Info} | Os usuários não podem se repetir.`
            })

        return await interaction.editReply({ files: [new MessageAttachment(await Canvas.distracted(avatar1, avatar2, avatar3), 'image.png')] }).catch(() => { })

    }
}