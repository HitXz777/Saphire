const client = require('../../../index')

module.exports = {
    name: 'role',
    description: '[moderation] Adicione ou remova um cargo de um membro',
    dm_permission: false,
    default_member_permissions: client.perms.MANAGE_ROLES,
    type: 1,
    options: [
        {
            name: 'add',
            description: 'Adicione um cargo a um membro',
            type: 1,
            options: [
                {
                    name: 'cargo',
                    description: 'Escolha um cargo',
                    type: 8,
                    required: true
                },
                {
                    name: 'membro',
                    description: 'Escolha o membro',
                    type: 6,
                    required: true
                }
            ]
        },
        {
            name: 'remove',
            description: 'Remova um cargo de um membro',
            type: 1,
            options: [
                {
                    name: 'cargo',
                    description: 'Escolha um cargo',
                    type: 8,
                    required: true
                },
                {
                    name: 'membro',
                    description: 'Escolha o membro',
                    type: 6,
                    required: true
                }
            ]
        }
    ],
    async execute({ interaction: interaction, member: authorMember, emojis: e }) {

        const { options, guild } = interaction

        if (!guild.me.permissions.toArray().includes('MANAGE_ROLES'))
            return await interaction.reply({
                content: `${e.Deny} | Para prosseguir com este comando, eu preciso do cargo **\`GERENCIAR CARGOS\`**`,
                ephemeral: true
            })

        let addOrRemove = options.getSubcommand()
        let role = options.getRole('cargo')
        let member = options.getMember('membro')

        if (role.comparePositionTo(authorMember.roles.highest) >= 0 && guild.ownerId !== authorMember.id)
            return await interaction.reply({
                content: `${e.Deny} | O cargo ${role} é maior que o seu, portanto, você não pode adicionar este cargo a ninguém.`,
                ephemeral: true
            })

        if (!role.editable)
            return await interaction.reply({
                content: `${e.Deny} | Eu não tenho permissão para gerenciar o cargo ${role}.`,
                ephemeral: true
            })

        if (member.roles.cache.has(role.id) && addOrRemove === 'add')
            return await interaction.reply({
                content: `${e.Deny} | ${member} já tem o possui o cargo ${role}.`,
                ephemeral: true
            })

        if (!member.roles.cache.has(role.id) && addOrRemove === 'remove')
            return await interaction.reply({
                content: `${e.Deny} | ${member} não possui o cargo ${role}.`,
                ephemeral: true
            })

        if (addOrRemove === 'add')
            return member.roles.add(role.id)
                .then(async () => {
                    return await interaction.reply({
                        content: `${e.Check} | O cargo ${role} foi adicionado em ${member} com sucesso!`
                    })
                })
                .catch(async err => {
                    return await interaction.reply({
                        content: `${e.Warn} | Erro ao adicionar o cargo.\n> ${err}`
                    })
                })
        else return member.roles.remove(role.id)
            .then(async () => {
                return await interaction.reply({
                    content: `${e.Check} | O cargo ${role} foi removido de ${member} com sucesso!`
                })
            })
            .catch(async err => {
                return await interaction.reply({
                    content: `${e.Warn} | Erro ao remover o cargo.\n> ${err}`
                })
            })
    }
}