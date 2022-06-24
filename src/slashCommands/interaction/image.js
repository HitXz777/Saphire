const { delete: deleteFile } = require('yuri-canvas'),
    { MessageAttachment } = require('discord.js'),
    { Canvas } = require('canvacord'),
    canvacord = require('canvacord/src/Canvacord')

module.exports = {
    name: 'imagem',
    description: '[Imagem] Imagens são legais',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'select',
            description: 'Selecione o tipo de imagem',
            type: 3,
            required: true,
            choices: [
                {
                    name: 'Deletar alguém (1 usuário)',
                    value: 'deletar'
                },
                {
                    name: 'Fundir 2 avatares (2 usuários)',
                    value: 'fuse'
                },
                {
                    name: 'TRIGGERED (1 usuário)',
                    value: 'triggered'
                },
                {
                    name: 'Isso não afeta o bebê (1 usuário)',
                    value: 'affect'
                },
                {
                    name: 'Ho this... this is beautiful (1 usuário)',
                    value: 'beaut'
                }
            ]
        },
        {
            name: 'user',
            description: 'Selecione um usuário',
            type: 6
        },
        {
            name: 'user2',
            description: 'Selecione um segundo usuário',
            type: 6
        }
    ],

    async execute({ interaction: interaction, client: client, emojis: e }) {

        const { options } = interaction
        let subCommand = options.getString('select')
        let user = interaction.options.getUser('user') || interaction.user
        let avatar = user.displayAvatarURL({ format: "png", size: 1024 })

        await interaction.deferReply({})

        switch (subCommand) {
            case 'deletar': deletar(); break;
            case 'fuse': fuse(); break;
            case 'triggered': trig(); break;
            case 'affect': notAffect(); break;
            case 'beaut': beaut(); break;
        }
        return

        async function deletar() {

            if (user.id === client.user.id)
                return await interaction.editReply({
                    content: `${e.Deny} | Para com essas graças... Coisa feia.`
                })

            let image = await deleteFile(avatar)

            return await interaction.editReply({
                files: [new MessageAttachment(image, "deleted.png")]
            })
        }

        async function fuse() {

            let user2 = interaction.options.getUser('user2')
            if (!user2)
                return await interaction.editReply({
                    content: `${e.Deny} | Um segundo usuário é necessário neste comando.`
                })

            let avatar2 = user2.displayAvatarURL({ format: 'png' })

            if (user.id === user2.id)
                return interaction.editReply({
                    content: `${e.Info} | Os usuários não podem ser o mesmo.`
                })

            return await interaction.editReply({ files: [new MessageAttachment(await Canvas.fuse(avatar, avatar2), 'fuse.png')] })
        }

        async function trig() {
            return await interaction.editReply({ files: [new MessageAttachment(await Canvas.trigger(avatar), 'triggered.gif')] })
        }

        async function notAffect() {

            if (user.id === client.user.id)
                return await interaction.editReply({
                    content: `${e.Deny} | Você para com isso.`
                })

            const image = await canvacord.affect(avatar)
            return await interaction.editReply({ files: [new MessageAttachment(image, 'affect.png')] })
        }

        async function beaut() {

            const image = await canvacord.beautiful(avatar)
            const beautiful = new MessageAttachment(image, 'beautiful.png')
            return await interaction.editReply({ files: [beautiful] })
        }

    }
}