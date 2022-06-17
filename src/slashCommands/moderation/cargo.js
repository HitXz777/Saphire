const client = require('../../../index')
const { config} = require('../../../JSON/config.json')

const editObject = {
    name: 'edit',
    description: '[moderation] Edite as informações do cargo',
    type: 1,
    options: [
        {
            name: 'cargo',
            description: 'Escolha um cargo para editar',
            type: 8,
            required: true
        },
        {
            name: 'nome',
            description: 'Novo nome para o cargo',
            type: 3
        },
        {
            name: 'cor',
            description: 'Nova cor para o cargo',
            type: 3,
            choices: []
        }
    ]
}

let colors = Object.keys(client.colors)
colors.length = 25
for (let data of colors)
    editObject.options[2].choices.push({
        name: config.Colors[data],
        value: data
    })

module.exports = {
    name: 'cargo',
    description: '[moderation] Adicione ou remova um cargo de um membro',
    dm_permission: false,
    default_member_permissions: client.perms.MANAGE_ROLES,
    type: 1,
    options: [
        {
            name: 'add',
            description: '[moderation] Adicione um cargo a um membro',
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
            description: '[moderation] Remova um cargo de um membro',
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
            name: 'options',
            description: '[moderation] Mais comandos por aqui',
            type: 1,
            options: [
                {
                    name: 'function',
                    description: 'O que você quer executar?',
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: 'deletar',
                            value: 'delete'
                        },
                        {
                            name: 'info',
                            value: 'info'
                        }
                    ]
                },
                {
                    name: 'cargo',
                    description: 'Escolha um cargo',
                    type: 8,
                    required: true
                },
                {
                    name: 'hide',
                    description: 'Esconder resposta?',
                    type: 3,
                    choices: [
                        {
                            name: 'sim',
                            value: 'sim'
                        },
                        {
                            name: 'não',
                            value: 'não'
                        }
                    ]
                }
            ]
        },
        editObject
    ],
    async execute({ interaction: interaction, member: authorMember, emojis: e, database: Database, guildData: guildData }) {

        const { options, guild, user } = interaction

        if (!guild.me.permissions.toArray().includes('MANAGE_ROLES'))
            return await interaction.reply({
                content: `${e.Deny} | Para prosseguir com este comando, eu preciso do cargo **\`GERENCIAR CARGOS\`**`,
                ephemeral: true
            })

        let requestSubCommand = options.getSubcommand()
        let subCommand = requestSubCommand === 'options' ? options.getString('function') : requestSubCommand
        let role = options.getRole('cargo')
        let member = options.getMember('membro')
        let hide = options.getString('hide') === 'sim' ? true : false

        if (subCommand === 'info') return roleInfo()

        if (!role.editable)
            return await interaction.reply({
                content: `${e.Deny} | Eu não tenho permissão para gerenciar o cargo ${role}. Suba o meu cargo para cima dele que tudo dará certo.`,
                ephemeral: true
            })

        if (role.comparePositionTo(authorMember.roles.highest) >= 0 && guild.ownerId !== authorMember.id)
            return await interaction.reply({
                content: `${e.Deny} | O cargo ${role} é maior que o seu. Portanto, você não pode gerenciar este cargo.`,
                ephemeral: true
            })

        switch (subCommand) {
            case 'add': addRole(); break;
            case 'remove': removeRole(); break;
            case 'delete': deleteRole(); break;
            case 'edit': editRole(); break;
        }
        return

        async function addRole() {

            if (member.roles.cache.has(role.id))
                return await interaction.reply({
                    content: `${e.Deny} | ${member} já possui o cargo ${role}.`,
                    ephemeral: true
                })

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
        }

        async function removeRole() {

            if (!member.roles.cache.has(role.id))
                return await interaction.reply({
                    content: `${e.Deny} | ${member} não possui o cargo ${role}.`,
                    ephemeral: true
                })

            return member.roles.remove(role.id)
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

        async function deleteRole() {

            return role.delete({ reason: `${user.tag} solicitou a exclusão deste cargo.` })
                .then(async () => {
                    return await interaction.reply({
                        content: `${e.Check} | O cargo **${role.name}** foi deletado com sucesso!`,
                        ephemeral: hide
                    })
                })
                .catch(async err => {
                    if (err.code === 10011)
                        return await interaction.reply({
                            content: `${e.Deny} | Cargo Desconhecido.`,
                            ephemeral: hide
                        })

                    if (err.code === 50028)
                        return await interaction.reply({
                            content: `${e.Deny} | Cargo Inválido`,
                            ephemeral: hide
                        })

                    return await interaction.reply({
                        content: `${e.Warn} | Houve um erro ao deletar este cargo.\n\`${err}\``,
                        ephemeral: hide
                    })
                })

        }

        async function editRole() {
            
            let newName = options.getString('nome')
            let newColor = client.colors[options.getString('cor')]

            if (newName?.length > 100)
                return await interaction.reply({
                    content: `${e.Deny} | O limite permitido em nomes de cargos são de 100 caracteres.`,
                    ephemeral: true
                })

            let newData = {}

            if (newName && newName !== role.name)
                newData.name = newName

            if (newColor)
                newData.color = newColor

            if (!newName && !newColor)
                return await interaction.reply({
                    content: `${e.Deny} | Você deve dizer pelo menos o nome ou uma color para efetuar a edição do cargo.`,
                    ephemeral: true
                })

            return role.edit(newData)
                .then(async () => {
                    return await interaction.reply({
                        content: `${e.Check} | O cargo foi atualizado com sucesso!`,
                        ephemeral: true
                    })
                })
                .catch(async err => {
                    return await interaction.reply({
                        content: `${e.Warn} | Houve uma falha ao tentar editar o nome do cargo.\n> \`${err}\``
                    })
                })

        }

        async function roleInfo() {
            await interaction.deferReply({ ephemeral: hide })

            let permissions = role.permissions.toArray() || [],
                PermissionsFormated = permissions.map(perm => `\`${config.Perms[perm]}\``) || false,
                RoleSize = role.members.size || 0,
                RoleHoist = role.hoist ? `${e.Check} Sim` : `${e.Deny} Não`,
                RoleMention = role.mentionable ? `${e.Check} Sim` : `${e.Deny} Não`,
                data = role.createdAt,
                RoleData = `${data.getDate()}/${data.getMonth() + 1 < 10 ? `0${data.getMonth() + 1}` : data.getMonth() + 1}/${data.getFullYear()} ás ${data.getHours()}:${data.getMinutes()}:${data.getSeconds()}`,
                RoleEmbed = {
                    color: role.hexColor.toUpperCase(),
                    title: `${e.Info} Informações de Cargo`,
                    fields: [
                        {
                            name: '📄 Nome',
                            value: role.name
                        },
                        {
                            name: '🫂 Contagem',
                            value: `${RoleSize} membros possuem este cargo`
                        },
                        {
                            name: '🆔 ID do Cargo',
                            value: `\`${role.id}\``
                        },
                        {
                            name: '🖌️ Cor #HEX',
                            value: `\`${role.hexColor.toUpperCase()}\``
                        },
                        {
                            name: '👀 Exibir aos membros',
                            value: RoleHoist
                        },
                        {
                            name: '🔔 Mencionável',
                            value: RoleMention
                        },
                        {
                            name: '📆 Cargo criado em',
                            value: RoleData
                        },
                        {
                            name: `${e.ModShield} Permissões`,
                            value: PermissionsFormated?.join(', ') || 'Nenhuma'
                        }
                    ]
                }

            return await interaction.editReply({ embeds: [RoleEmbed] }).catch(() => { })
        }
    }
}