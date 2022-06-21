const util = require('../../structures/util')

const colorOption = {
    name: 'color',
    description: 'Selecione a cor da embed',
    type: 3,
    choices: []
}

const Colors = Object.keys(util.EmbedColors || {})

for (const color of Colors)
    colorOption.choices.push({
        name: util.ColorsTranslate[color],
        value: util.EmbedColors[color]
    })

module.exports = {
    name: 'anunciar',
    description: '[moderation] Anúncie em canais atráves de mim',
    dm_permission: false,
    default_member_permissions: util.slashCommandsPermissions.MANAGE_CHANNELS,
    type: 1,
    options: [
        {
            name: 'embed',
            description: '[moderation] Anúncie usando uma embed simples',
            type: 1,
            options: [
                {
                    name: 'channel',
                    description: 'Canal em que o anúncio será enviado',
                    type: 7,
                    required: true
                },
                {
                    name: 'message',
                    description: 'Qual a mensagem do anúncio?',
                    type: 3,
                    required: true
                },
                {
                    name: 'title',
                    description: 'Qual o título do anúncio?',
                    type: 3
                },
                colorOption,
            ]
        },
        {
            name: 'message',
            description: '[moderation] Anúncie usando uma mensagem',
            type: 1,
            options: [
                {
                    name: 'channel',
                    description: 'Canal em que o anúncio será enviado',
                    type: 7,
                    required: true
                },
                {
                    name: 'message',
                    description: 'Qual a mensagem do anúncio?',
                    type: 3,
                    required: true
                }
            ]
        }
    ],

    async execute({ interaction: interaction, emojis: e, client: client }) {

        const { options } = interaction

        let subCommand = options.getSubcommand()
        let message = options.getString('message')
        let channel = options.getChannel('channel')
        let color = options.getString('color')
        let title = options.getString('title') || 'Novo anúncio'

        if (channel.type !== 'GUILD_TEXT')
            return await interaction.reply({
                content: `${e.Deny} | Apenas canais de textos são válidos neste comando.`,
                ephemeral: true
            })

        if (message.length > 4096)
            message = message.slice(4093) + '...'

        if (title.length > 256)
            title = title.slice(253) + '...'

        switch (subCommand) {
            case 'embed': embed(); break;
            case 'message': normal(); break;
        }
        return

        function embed() {
            return channel.send({
                embeds: [
                    {
                        color: color || util.EmbedColors.DEFAULT,
                        title: title,
                        description: message,
                        footer: { text: `${client.user.username}'s Announcement Command` }
                    }
                ]
            })
                .then(async () => {
                    return await interaction.reply({
                        content: `${e.Check} | Prontinho, o anúncio com a forma **Embed** foi enviado para o canal ${channel}`
                    })
                })
                .catch(async err => {
                    return await interaction.reply({
                        content: `${e.Warn} | Houve um erro ao enviar o anúncio em ${channel}.\n> \`${err}\``
                    })
                })
        }

        function normal() {
            return channel.send({
                content: `**${title}**\n${message}\n \n*${client.user.username}'s Announcement Command*`
            })
                .then(async () => {
                    return await interaction.reply({
                        content: `${e.Check} | Prontinho, o anúncio com a forma **Mensagem** foi enviado para o canal ${channel}`
                    })
                })
                .catch(async err => {
                    return await interaction.reply({
                        content: `${e.Warn} | Houve um erro ao enviar o anúncio em ${channel}.\n> \`${err}\``
                    })
                })
        }
    }
}