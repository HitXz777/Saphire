const { MessageAttachment } = require('discord.js'),
    { Canvas } = require('canvacord')

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
                    name: 'TRIGGERED (1 usuário)',
                    value: 'trigger'
                },
                {
                    name: 'Circular (1 usuário)',
                    value: 'circle'
                },
                {
                    name: 'Tudo embaçado - blur - (1 usuário)',
                    value: 'blur'
                },
                {
                    name: 'Preto e Branco - greyscale - (1 usuário)',
                    value: 'greyscale'
                },
                {
                    name: 'Rest In Peace (1 usuário)',
                    value: 'rip'
                },
                {
                    name: 'Arco-Íris na fotinha (1 usuário)',
                    value: 'rainbow'
                },
                {
                    name: 'Efeito Sepia (1 usuário)',
                    value: 'sepia'
                },
                {
                    name: 'Invertiment (1 usuário)',
                    value: 'invert'
                },
                {
                    name: 'Cadeia (1 usuário)',
                    value: 'jail'
                },
                {
                    name: 'Pior que Hitler (1 usuário)',
                    value: 'hitler'
                },
                {
                    name: 'Pisei na merda (1 usuário)',
                    value: 'shit'
                },
                {
                    name: 'Ata, é um lixo (1 usuário)',
                    value: 'trash'
                },
                {
                    name: 'Joke Over Head (1 usuário)',
                    value: 'jokeOverHead'
                },
                {
                    name: 'Isso não afeta o bebê (1 usuário)',
                    value: 'affect'
                },
                {
                    name: 'Mão no rosto - facepalm - (1 usuário)',
                    value: 'facepalm'
                },
                {
                    name: 'Ho this... this is beautiful (1 usuário)',
                    value: 'beautiful'
                },
                {
                    name: 'Deleta isso (1 usuário)',
                    value: 'delete'
                },
                {
                    name: 'WANTED (1 usuário)',
                    value: 'wanted'
                },
                {
                    name: 'WASTED (1 usuário)',
                    value: 'wasted'
                },
                {
                    name: 'Um monstro em baixo da cama (2 usuários)',
                    value: 'bed'
                },
                {
                    name: 'Bater na bunda (2 usuários)',
                    value: 'spank'
                },
                {
                    name: 'Apenas um beijo (2 usuários)',
                    value: 'kiss'
                },
                {
                    name: 'Fundir 2 avatares (2 usuários)',
                    value: 'fuse'
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
        let user2 = interaction.options.getUser('user2')
        let avatar = user.displayAvatarURL({ format: 'png', size: 1024 })
        let avatar2 = user2?.displayAvatarURL({ format: 'png', size: 1024 })

        await interaction.deferReply({})

        switch (subCommand) {
            case 'delete': deleteUser(); break;
            case 'trigger':
            case 'affect':
            case 'beautiful':
            case 'blur':
            case 'rip':
            case 'hitler':
            case 'invert':
            case 'circle':
            case 'jail':
            case 'sepia':
            case 'shit':
            case 'facepalm':
            case 'trash':
            case 'wanted':
            case 'wasted':
            case 'rainbow':
            case 'greyscale':
            case 'jokeOverHead':
                oneUser();
                break;
            case 'kiss':
            case 'bed':
            case 'spank':
            case 'fuse':
                twoUsers();
                break;
        }
        return

        async function deleteUser() {

            if (user.id === client.user.id)
                return await interaction.editReply({
                    content: `${e.Deny} | Para com essas graças... Coisa feia.`
                }).catch(() => { })

            return await interaction.editReply({
                files: [new MessageAttachment(await Canvas.delete(avatar, true), "deleted.png")]
            }).catch(() => { })
        }

        async function oneUser() {
            return await interaction.editReply({
                files: [
                    new MessageAttachment(
                        await Canvas[subCommand](avatar),
                        `image.${['trigger'].includes(subCommand) ? 'gif' : 'png'}`
                    )]
            }).catch(() => { })
        }

        async function twoUsers() {

            if (!user2)
                return await interaction.editReply({
                    content: `${e.Deny} | Um segundo usuário é necessário neste comando.`
                }).catch(() => { })

            if (user.id === user2.id)
                return interaction.editReply({
                    content: `${e.Info} | Os usuários não podem ser o mesmo.`
                }).catch(() => { })

            return await interaction.editReply({ files: [new MessageAttachment(await Canvas[subCommand](avatar, avatar2), 'image.png')] }).catch(() => { })
        }

    }
}