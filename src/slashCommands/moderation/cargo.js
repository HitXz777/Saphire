const client = require('../../../index')
const util = require('../../structures/util')

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
        },
        {
            name: 'visivel',
            description: 'Deixar o cargo visível para todos',
            type: 4,
            choices: [
                {
                    name: 'Mostrar este cargo para todos',
                    value: 1
                },
                {
                    name: 'Deixa esse cargo escondido',
                    value: 2
                }
            ]
        },
        {
            name: 'delete_permissions',
            description: 'Desative todas as permissões',
            type: 4,
            choices: [
                {
                    name: 'Sim, deletar todas as permissões',
                    value: 1
                },
                {
                    name: 'Melhor não, deixa pra lá',
                    value: 2
                }
            ]
        },
        {
            name: 'mencionavel',
            description: 'Deixar ou não qualquer um marcar este cargo?',
            type: 4,
            choices: [
                {
                    name: 'YEP! Todos podem marcar este cargo',
                    value: 1
                },
                {
                    name: 'Nop, nop! Não é para ninguém marcar este cargo.',
                    value: 2
                }
            ]
        },
    ]
}

const createRole = {
    name: 'create',
    description: '[moderation] Crie as novas informações do cargo',
    type: 1,
    options: [
        {
            name: 'nome',
            description: 'Novo nome para o cargo',
            required: true,
            type: 3
        },
        {
            name: 'cor',
            description: 'Escolha um cor irada para o novo cargo',
            type: 3,
            choices: []
        },
        {
            name: 'visivel',
            description: 'Deixar o cargo visível para todos',
            type: 4,
            choices: [
                {
                    name: 'Mostrar este cargo para todos',
                    value: 1
                },
                {
                    name: 'Deixa esse cargo escondido',
                    value: 2
                }
            ]
        },
        {
            name: 'delete_permissions',
            description: 'Desative todas as permissões',
            type: 4,
            choices: [
                {
                    name: 'Sim, deletar todas as permissões',
                    value: 1
                },
                {
                    name: 'Melhor não, deixa pra lá',
                    value: 2
                }
            ]
        },
        {
            name: 'mencionavel',
            description: 'Deixar ou não qualquer um marcar este cargo?',
            type: 4,
            choices: [
                {
                    name: 'YEP! Todos podem marcar este cargo',
                    value: 1
                },
                {
                    name: 'Nop, nop! Não é para ninguém marcar este cargo.',
                    value: 2
                }
            ]
        },
    ]
}

let colors = Object.keys(util.Colors)
colors.length = 25

for (let data of colors) {
    editObject.options[2].choices.push({
        name: util.ColorsTranslate[data],
        value: data
    })
    createRole.options[1].choices.push({
        name: util.ColorsTranslate[data],
        value: data
    })
}

module.exports = {
    name: 'cargo',
    description: '[moderation] Adicione ou remova um cargo de um membro',
    dm_permission: false,
    default_member_permissions: util.slashCommandsPermissions.MANAGE_ROLES,
    type: 1,
    options: [
        createRole,
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
                            name: 'Deletar um cargo',
                            value: 'delete'
                        },
                        {
                            name: 'Ver as informações de um cargo',
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
                            name: 'Apenas eu quero ver a mensagem',
                            value: 'sim'
                        },
                        {
                            name: 'Todos no chat podem ver a mensagem',
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
                content: `${e.Deny} | Para prosseguir com este comando, eu preciso da permissão **\`GERENCIAR CARGOS\`**`,
                ephemeral: true
            })

        let requestSubCommand = options.getSubcommand()
        let subCommand = requestSubCommand === 'options' ? options.getString('function') : requestSubCommand
        let role = options.getRole('cargo')
        let member = options.getMember('membro')
        let hide = options.getString('hide') === 'sim' ? true : false

        if (subCommand === 'info') return roleInfo()
        if (subCommand === 'create') return createRole()

        if (!role.editable)
            return await interaction.reply({
                content: `${e.Deny} | Eu não tenho permissão para gerenciar o cargo ${role}. Se este cargo não for **Servers Booster** ou de **outros bots**, Suba o meu cargo para cima dele que tudo dará certo.`,
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

        async function createRole() {

            let newName = options.getString('nome')
            let newColor = util.Colors[options.getString('cor')]
            let hoist = options.getInteger('visivel')
            let delPermissions = options.getInteger('delete_permissions')
            let mentionable = options.getInteger('mencionavel')
            let edited = []

            if (newName?.length > 100)
                return await interaction.reply({
                    content: `${e.Deny} | O limite permitido em nomes de cargos são de 100 caracteres.`,
                    ephemeral: true
                })

            let newData = { name: newName }
            edited.push(`Nome: ${newName}`)

            if (hoist !== null) {
                newData.hoist = hoist === 1 ? true : false
                edited.push(`Exibir para outros membros: \`${newData.hoist ? 'Ativado' : 'Desativado'}\``)
            }

            if (delPermissions !== null) {
                if (delPermissions === 1)
                    newData.permissions = []
                edited.push(`Permissões deletadas: \`${delPermissions === 1 ? 'Sim' : 'Não'}\``)
            }

            if (newColor !== null) {
                newData.color = newColor
                edited.push(`Cor: \`${util.ColorsTranslate[options.getString('cor')] || 'Padrão'}\``)
            }

            if (mentionable !== null) {
                newData.mentionable = mentionable === 1 ? true : false
                edited.push(`Cargo mencionável: \`${newData.mentionable ? 'Sim' : 'Não'}\``)
            }

            return guild.roles.create(newData)
                .then(async () => {
                    return await interaction.reply({
                        content: `${e.Check} | O cargo foi criado com sucesso!\n${edited.map(x => `> ${x}`).join('\n')}`,
                        ephemeral: true
                    })
                })
                .catch(async err => {
                    return await interaction.reply({
                        content: `${e.Warn} | Houve uma falha ao criar o cargo.\n> \`${err}\``,
                        ephemeral: true
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
            let newColor = util.Colors[options.getString('cor')]
            let hoist = options.getInteger('visivel')
            let delPermissions = options.getInteger('delete_permissions')
            let mentionable = options.getInteger('mencionavel')
            let edited = []

            if (newName?.length > 100)
                return await interaction.reply({
                    content: `${e.Deny} | O limite permitido em nomes de cargos são de 100 caracteres.`,
                    ephemeral: true
                })

            if (!newName && !newColor && !hoist && !delPermissions && !mentionable)
                return await interaction.reply({
                    content: `${e.Deny} | Você deve dizer pelo menos um item das opções para efetuar a edição do cargo.`,
                    ephemeral: true
                })

            let newData = {}

            if (newName !== null && newName !== role.name) {
                newData.name = newName
                edited.push(`Nome: ${newName}`)
            }

            if (hoist !== null) {
                newData.hoist = hoist === 1 ? true : false
                edited.push(`Exibir para outros membros: \`${newData.hoist ? 'Ativado' : 'Desativado'}\``)
            }

            if (delPermissions !== null) {
                if (delPermissions === 1)
                    newData.permissions = []
                edited.push(`Permissões deletadas: \`${delPermissions === 1 ? 'Sim' : 'Não'}\``)
            }

            if (newColor !== null) {
                newData.color = newColor
                edited.push(`Cor: \`${util.ColorsTranslate[options.getString('cor')]}\``)
            }

            if (mentionable !== null) {
                newData.mentionable = mentionable === 1 ? true : false
                edited.push(`Cargo mencionável: \`${newData.mentionable ? 'Sim' : 'Não'}\``)
            }

            return role.edit(newData)
                .then(async () => {
                    return await interaction.reply({
                        content: `${e.Check} | O cargo foi atualizado com sucesso! Itens atualizados:\n${edited.map(x => `> ${x}`).join('\n')}`,
                        ephemeral: true
                    })
                })
                .catch(async err => {
                    return await interaction.reply({
                        content: `${e.Warn} | Houve uma falha ao tentar editar o cargo.\n> \`${err}\``,
                        ephemeral: true
                    })
                })

        }

        async function roleInfo() {
            await interaction.deferReply({ ephemeral: hide })

            let permissions = role.permissions.toArray() || [],
                PermissionsFormated = permissions.map(perm => `\`${util.Permissions[perm]}\``) || false,
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