module.exports = {
    name: 'search',
    description: '[bot] Pesquise por comandos',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'command',
            description: 'Comando que você procura',
            type: 3,
            required: true
        }
    ],
    async execute({ interaction: interaction, client: client, emojis: e, guildData: guildData }) {

        const { options } = interaction

        let commandSearch = options.getString('command').toLowerCase()
        let prefix = guildData?.Prefix || client.prefix
        let commands = client.commands.map(cmd => cmd.name)
        let aliases = client.aliases.map((a, b) => b)
        let slashCommands = client.slashCommands.map(cmd => cmd.name)
        let COMMANDS, ALIASES, SLASHCOMMANDS

        if (commandSearch.length < 1 || commandSearch.length > 20)
            return await interaction.reply({
                content: `${e.Deny} | Pesquise comandos entre 1 e 20 caracteres`,
                ephemeral: true
            })

        let resultCommands = commands.filter(data => data.toLowerCase().includes(commandSearch)) || []
        let resultAliases = aliases.filter(data => data.toLowerCase().includes(commandSearch)) || []
        let resultSlashCommands = slashCommands.filter(data => data.toLowerCase().includes(commandSearch)) || []

        if (resultCommands.length > 0) {
            COMMANDS = resultCommands.map(cmd => `\`${prefix}${cmd}\``).join(', ')
            if (COMMANDS.length > 1024)
                COMMANDS = '`Muitos resultados. Diga um valor mais preciso`'
        }

        if (resultAliases.length > 0) {
            ALIASES = resultAliases.map(alias => `\`${prefix}${alias}\``).join(', ')
            if (ALIASES.length > 1024)
                ALIASES = '`Muitos resultados. Diga um valor mais preciso`'
        }

        if (resultSlashCommands.length > 0) {
            SLASHCOMMANDS = resultSlashCommands.map(slash => `\`/${slash}\``).join(', ')
            if (SLASHCOMMANDS.length > 1024)
                SLASHCOMMANDS = '`Muitos resultados. Diga um valor mais preciso`'
        }

        return await interaction.reply({
            embeds: [
                {
                    color: client.blue,
                    title: `${e.SaphireOk} ${client.user.username}'s Commands in Search`,
                    fields: [
                        {
                            name: '🔍 Search',
                            value: `\`${commandSearch}\``
                        },
                        {
                            name: `${e.Gear} Comandos - ${resultCommands.length}`,
                            value: COMMANDS || '`Nenhum comando encontrado`'
                        },
                        {
                            name: `${e.Commands} Atalhos - ${resultAliases.length}`,
                            value: ALIASES || '`Nenhum atalho encontrado`'
                        },
                        {
                            name: `✨ Slash Commands - ${resultSlashCommands.length}`,
                            value: SLASHCOMMANDS || '`Nenhum slash command encontrado`'
                        }
                    ]
                }
            ]
        })
    }
}