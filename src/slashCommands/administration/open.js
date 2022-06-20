module.exports = {
    name: 'open',
    description: '[administration] Liberar comandos bloqueados',
    dm_permission: false,
    admin: true,
    type: 1,
    options: [
        {
            name: 'command',
            description: 'Nome do comando',
            type: 3
        },
        {
            name: 'all',
            description: 'Liberar todos os comandos',
            type: 5
        }
    ],
    async execute({ interaction: interaction, client: client, database: Database, emojis: e, clientData: clientData }) {

        const comandosBloqueados = clientData?.ComandosBloqueadosSlash || []

        if (comandosBloqueados.length === 0)
            return await interaction.reply({
                content: `${e.Deny} | Não há nenhum comando bloqueado.`,
                ephemeral: true
            })

        const { options } = interaction

        let commandName = options.getString('command')
        let all = options.getBoolean('all')

        if (!commandName && !all)
            return await interaction.reply({
                content: `${e.Deny} | Selecione pelo menos uma das opções`,
                ephemeral: true
            })

        if (all) {

            await Database.Client.updateOne(
                { id: client.user.id },
                { $unset: { ComandosBloqueadosSlash: 1 } }
            )

            return await interaction.reply({
                content: `${e.Check} | Todos os comandos foram desbloqueados.`
            })
        }

        let cmd = client.slashCommands.get(commandName)

        if (!cmd)
            return await interaction.reply({
                content: `${e.Deny} | Esse comando não existe.`,
                ephemeral: true
            })

        const CommandSearch = comandosBloqueados?.find(Cmd => Cmd.cmd === commandName)

        if (!CommandSearch)
            return await interaction.reply({
                content: `${e.Deny} | Comando não encontrado na lista de comandos bloqueados.`,
                ephemeral: true
            })

        await Database.Client.updateOne(
            { id: client.user.id },
            { $pull: { ComandosBloqueadosSlash: { cmd: cmd.name } } }
        )

        return await interaction.reply({
            content: `${e.Check} | O comando \`${cmd.name}\` foi desbloqueado com sucesso!`
        })

    }
}