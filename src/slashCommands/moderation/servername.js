const util = require('../../structures/util')

module.exports = {
    name: 'servername',
    description: '[moderation] Altere o nome do servidor',
    dm_permission: false,
    default_member_permissions: util.slashCommandsPermissions.MANAGE_GUILD,
    type: 1,
    options: [
        {
            name: 'new_name',
            description: 'Novo nome do servidor',
            type: 3,
            required: true
        }
    ],
    async execute({ interaction: interaction, emojis: e }) {

        const { options, guild, user } = interaction

        if (!guild.clientPermissions('MANAGE_GUILD'))
            return await interaction.reply({
                content: `${e.Info} | Eu preciso da permissão **GERENCIAR SERVIDOR** para alterar o nome do servidor.`
            })

        let newName = options.getString('new_name')

        if (newName.length > 100 || newName.length < 2)
            return await interaction.reply({
                content: `${e.Deny} | O nome do servidor deve estar entre **2 e 100 caracteres**.`
            })

        return guild.setName(newName, [`Comando solicitado por: ${user.tag}`])
            .then(async guild => {
                return await interaction.reply({
                    content: `${e.Check} | Nome alterado com sucesso para: **${guild.name}**`
                })
            })
            .catch(async err => {
                return await interaction.reply({
                    content: `${e.Warn} | Erro ao alterar o nome do servidor.\n> \`${err}\``
                })
            })

    }
}