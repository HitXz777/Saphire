const util = require('../../structures/util')

const colorOption = {
    name: 'color',
    description: 'Selecione a cor da embed',
    type: 3,
    choices: []
}

const Colors = Object.keys(util.Colors || {})
Colors.length = 25 // Limit of options in choices

for (const color of Colors)
    colorOption.choices.push({
        name: util.ColorsTranslate[color],
        value: color
    })

module.exports = {
    name: 'embed',
    description: '[moderation] Crie embeds facilmente',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'create',
            description: '[moderation] Crie uma nova embed',
            type: 1,
            options: [
                colorOption,
                {
                    name: 'title',
                    description: 'Título da embed',
                    type: 3
                },
                {
                    name: 'description',
                    description: 'Descrição da Embed',
                    type: 3
                },
                {
                    name: 'url',
                    description: 'Link da embed',
                    type: 3
                },
                {
                    name: 'thumbnail',
                    description: 'Thumbnail da embed',
                    type: 3
                },
                {
                    name: 'image',
                    description: 'Imagem da embed',
                    type: 3
                },
                {
                    name: 'timestamp',
                    description: 'Ativar Timestamp',
                    type: 5
                },
                {
                    name: 'footer',
                    description: 'Mensagem do footer',
                    type: 3
                },
                {
                    name: 'footer_icon_url',
                    description: 'Icone do footer',
                    type: 3
                }
            ]
        },
        {
            name: 'add_field',
            description: '[moderation] Adicione um novo campo a uma embed',
            type: 1,
            options: [
                {
                    name: 'message_id',
                    description: 'ID da minha mensagem com uma embed',
                    type: 3,
                    required: true
                },
                {
                    name: 'field_name',
                    description: 'Nome do novo campo',
                    type: 3,
                    required: true
                },
                {
                    name: 'field_value',
                    description: 'Text do novo campo',
                    type: 3,
                    required: true
                }
            ]
        },
    ],
    async execute({ interaction: interaction, client: client, emojis: e }) {

        return await interaction.reply({
            content: `${e.Loading} | Este comando está sob construção.`,
            ephemeral: true
        })

        const { options, channel } = interaction

        let subCommand = options.subCommand()

        if (subCommand === 'add_field') return addNewField()
        if (subCommand === 'create') return createNewEmbed()

        async function createNewEmbed() {

            let color = util.Colors[options.getString('color')]
            let title = options.getString('title')
            let description = options.getString('description')
            let url = options.getString('url')
            let thumbnail = options.getString('thumbnail')
            let image = options.getString('image')
            let timestamp = options.getBoolean('timestamp')
            let footer = options.getString('footer')
            let footer_icon_url = options.getString('footer_icon_url')

            if (title?.length > 256)
                title = `${title?.slice(0, 253)}...`

            if (description?.length > 4096)
                description = `${description?.slice(0, 4093)}...`

            if (footer?.length > 2048)
                footer = `${footer?.slice(0, 2045)}...`

            const embed = {
                color: color,
                title: title,
                url: url,
                description: description,
                thumbnail: { url: thumbnail },
                image: { url: image },
                timestamp: timestamp ? new Date() : null,
                footer: {
                    text: footer,
                    icon_url: footer_icon_url,
                },
            }

            return channel.send({
                embeds: [embed]
            }).catch(async err => {
                return await interaction.reply({
                    content: `${e.Warn} | Houve um erro ao lançar a embed.\n> \`${err}\``,
                    ephemeral: true
                })
            })
        }

        async function addNewField() {

            let messageId = options.get('message_id')
            let fieldName = options.get('field_name')
            let fieldValue = options.get('field_value')

            let message = channel.messages.fetch(messageId)

            if (!message)
                return await interaction.reply({
                    content: `${e.Deny} | Eu não achei nenhuma mensagem com o ID fornecido.\n${e.Info} | Verifique se o comando está sendo dado no mesmo canal em que a embed se encontra.`,
                    ephemeral: true
                })

            let embed = message?.embeds[0]

            if (message.author.id !== client.user.id)
                return await interaction.reply({
                    content: `${e.Deny} | A mensagem foi encontrada, porém, não foi eu que enviou esta mensagem. Por favor, forneça o ID de uma mensagem que contenha uma embed e que foi eu a enviar.`,
                    ephemeral: true
                })

            if (!embed)
                return await interaction.reply({
                    content: `${e.Deny} | A mensagem foi encontrada, porém não existe nenhuma embed.`,
                    ephemeral: true
                })


        }
    }
}