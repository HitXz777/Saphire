const util = require('../../structures/util')

module.exports = {
    name: 'prefix',
    description: '[moderation] Altere o prefixo do servidor',
    dm_permission: false,
    default_member_permissions: util.slashCommandsPermissions.ADMINISTRATOR,
    type: 1,
    options: [
        {
            name: 'new_prefix',
            description: 'Escolha o novo prefixo do bot',
            type: 3
        },
        {
            name: 'reset_prefix',
            description: 'Resete o prefixo do servidor para "-"',
            type: 5
        },
        {
            name: 'more_options',
            description: 'Opções de prefixo',
            type: 3,
            choices: [
                {
                    name: '+',
                    value: '+'
                },
                {
                    name: '!',
                    value: '!'
                },
                {
                    name: '$',
                    value: '$'
                },
                {
                    name: '*',
                    value: '*'
                },
                {
                    name: 's',
                    value: 's'
                },
                {
                    name: '&',
                    value: '&'
                },
                {
                    name: '.',
                    value: '.'
                },
                {
                    name: ',',
                    value: ','
                }
                
            ]
        }
    ],
    async execute({ interaction: interaction, emojis: e, database: Database, guildData: guildData }) {

        const { options, guild } = interaction

        const new_prefix = options.getString('new_prefix')
        const more_options = options.getString('more_options')
        const reset_prefix = options.getBoolean('reset_prefix')
        const atualPrefix = guildData?.Prefix
        const newPrefix = new_prefix || more_options

        if (reset_prefix) {

            if (!atualPrefix)
                return await interaction.reply({
                    content: `${e.Info} | O prefixo atual já é o padrão. O reset não é necessário`,
                    ephemeral: true
                })

            Database.guildDelete(guild.id, 'Prefix')

            return await interaction.reply({
                content: `${e.Check} | Prefixo resetado com sucesso para \`-\`.`
            })
        }

        if (!newPrefix)
            return await interaction.reply({
                content: `${e.Deny} | Selecione ou diga pelo menos um novo prefixo.`,
                ephemeral: true
            })

        if (newPrefix?.length > 2)
            return await interaction.reply({
                content: `${e.Deny} | O prefixo não pode conter mais que 2 caracteres.`,
                ephemeral: true
            })

        if (newPrefix === atualPrefix)
            return await interaction.reply({
                content: `${e.Deny} | Este já é o meu prefixo padrão.`,
                ephemeral: true
            })

        if (newPrefix === "<")
            return await interaction.reply({
                content: `${e.Deny} | Prefixo não permitido.`,
                ephemeral: true
            })

        Database.setPrefix(newPrefix, guild.id)

        return await interaction.reply({
            content: `${e.Check} | O prefixo foi alterado com sucesso para \`${newPrefix}\`.`
        })

    }
}