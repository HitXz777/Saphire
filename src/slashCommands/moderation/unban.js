const util = require('../../structures/util')

module.exports = {
    name: 'unban',
    description: '[moderation] Efetue o desban em usuários banidos',
    dm_permission: false,
    default_member_permissions: util.slashCommandsPermissions.BAN_MEMBERS,
    type: 1,
    options: [
        {
            name: 'users_banned',
            description: 'Usuário a ser desbanido',
            type: 3,
            required: true,
            autocomplete: true
        }
    ],
    async execute({ interaction: interaction, emojis: e }) {

        const { options, guild } = interaction

        if (!guild.clientPermissions('BAN_MEMBERS'))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **BANIR MEMBROS** para executar este comando.`
            })

        let userId = options.getString('users_banned')
        return guild.bans.fetch(userId)
            .then(() => {

                return guild.bans.remove(userId)
                    .then(async ban => {
                        return await interaction.reply({
                            content: `${e.Check} | O usuário **${ban.tag} - \`${ban.id}\`** foi desbanido com sucesso.`
                        })
                    })
                    .catch(async err => {
                        return await interaction.reply({
                            content: `${e.Warn} | O desban falhou! Caso você não saiba resolver o problema, use \`/bug\` e reporte o problema.\n\`${err}\``
                        })
                    })
            })
            .catch(async () => {
                return await interaction.reply({
                    content: `${e.Deny} | Nenhum usuário banido foi encontrado com as informações passadas.`,
                    ephemeral: true
                })
            })

    }
}