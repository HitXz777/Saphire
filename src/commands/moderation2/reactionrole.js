module.exports = {
    name: 'reactionrole',
    aliases: ['reaction', 'rr'],
    category: 'moderation',
    UserPermissions: ['MANAGE_ROLES'],
    ClientPermissions: ['MANAGE_ROLES', 'ADD_REACTIONS'],
    emoji: '⚒️',
    usage: '<reactionRole>',
    description: 'Automatize até 25 cargos para os membros',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        const { Emojis: e } = Database

        let data = await Database.Guild.findOne({ id: message.guild.id }, 'ReactionRole'),
            ReactionRoleData = data?.ReactionRole || []

        let msg = await message.reply({
            embeds: [{
                color: client.blue,
                title: `${e.Stonks} ${client.user.username}'s Reaction Role`,
                description: `${e.Info} Antes de tudo. Você sabe o que é Reaction Role?\n> *Reaction Role é um metódo criados pelos criadores de Bots para automatizar a entrega de cargos para os membros. O membro reage e ganha um cargo pré-selecionado pela Staff do servidor.*`,
                fields: [
                    {
                        name: `${e.QuestionMark} Como usar esse sistema?`,
                        value: `Aqui, você faz tudo pela barrinha de opções. De um jeito fácil e intuitivo.`
                    },
                    {
                        name: `${e.QuestionMark} Adicionei um cargo, como ativo?`,
                        value: 'Clique na barrinha de opções e escolha a opção "\`Throw\`". Eu vou jogar a barra de reaction role no chat.'
                    },
                    {
                        name: `${e.QuestionMark} Adicionei/Deletei um cargo, como atualizar?`,
                        value: `Dentro do reaction role lançado pelo "\`Throw\`", existe uma opção chamada "\`Refresh\`". Alí, você pode atualizar todas as alterações feitas.`
                    },
                    {
                        name: `${e.QuestionMark} A nãão! Adicionei errado, e agora? (Construindo)`,
                        value: `Você pode usar a função "\`Edit\`" para alterar o título, emoji e a descrição do reaction role.`
                    }
                ],
                footer: { text: 'Limite de 24 cargos por servidor' }
            }],
            components: [{
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'createNewReactionRole',
                    placeholder: 'Escolha uma opção',
                    options: [
                        {
                            label: 'Create',
                            emoji: '🆕',
                            description: 'Criar um novo reaction role',
                            value: 'newReactionRole',
                        },
                        {
                            label: 'Throw',
                            emoji: '📨',
                            description: 'Lançe o sistema de reaction role neste chat',
                            value: 'throwReactionRole',
                        },
                        {
                            label: 'Edit',
                            emoji: '📝',
                            description: 'Edite um reaction role',
                            value: 'editReactionRole',
                        },
                        {
                            label: 'Delete',
                            emoji: e.Trash,
                            description: 'Delete um ou mais reaction roles',
                            value: 'delete',
                        },
                        {
                            label: 'Cancelar',
                            emoji: '❌',
                            description: 'Force o encerramento deste comando',
                            value: 'cancel',
                        }
                    ]
                }]
            }]
        }), collected = true

        let collector = msg.createMessageComponentCollector({
            filter: int => int.user.id === message.author.id,
            time: 60000
        })
            .on('collect', interaction => {

                const { values, customId } = interaction,
                    value = values[0]

                if (customId !== 'createNewReactionRole') return

                if (value === 'newReactionRole') {
                    collected = true
                    return msg.edit({
                        content: `${e.Check} | Request aceita!`,
                        embeds: [],
                        components: []
                    }).catch(() => { })
                }

                interaction.deferUpdate().catch(() => { })

                if (value === 'editReactionRole') return msg.edit({
                    content: `${e.Loading} | Esta recurso está em construção.`,
                    embeds: [],
                    components: []
                }).catch(() => { })
                if (value === 'delete') return deleteReactionRole(msg)
                if (value === 'cancel') return collector.stop()
                if (value === 'throwReactionRole') return throwReactionRole()
            })
            .on('end', () => {
                if (collected) return
                return msg.edit({
                    content: `${e.Deny} | Comando encerrado.`,
                    embeds: [],
                    components: []
                }).catch(() => { })
            })

        async function throwReactionRole() {

            if (!ReactionRoleData || ReactionRoleData.length === 0)
                return msg.edit({
                    content: `${e.Deny} | Este servidor não tem nenhuma reaction role configurada.`,
                    embeds: []
                }).catch(() => { })

            let selectMenuObject = {
                type: 1,
                components: [{
                    type: 3,
                    minValues: 1,
                    custom_id: 'reactionRole',
                    placeholder: 'Escolher cargos',
                    options: []
                }]
            }

            for (let data of ReactionRoleData) {

                let objData = { label: data.title, value: data.roleId }

                if (data.emoji)
                    objData.emoji = data.emoji

                if (data.description)
                    objData.description = data.description

                selectMenuObject.components[0].options.push(objData)
            }

            selectMenuObject.components[0].options.push({
                label: 'Refresh',
                emoji: '🔄',
                description: 'Atualize o reaction role',
                value: 'refreshReactionRole'
            })

            return message.channel.send({ components: [selectMenuObject] })
                .then(() => {
                    return msg.edit({
                        content: `${e.Check} | Lançamento efetuado com sucesso!`,
                        embeds: [],
                        components: []
                    }).catch(() => { })
                })
                .catch(err => {
                    return msg.edit({
                        content: `${e.Deny} | Erro ao efetuar o lançamento.\n> \`${err}\``,
                        embeds: [],
                        components: []
                    }).catch(() => { })
                })
        }

        async function deleteReactionRole(msg) {

            if (!ReactionRoleData || ReactionRoleData.length === 0)
                return message.reply(`${e.Deny} | Este servidor não tem nenhum reaction role ativado.`)

            let selectMenu = build()

            msg.edit({
                content: `${e.Loading} | Informe os cargos que você quer retirar do Reaction Role.`,
                embeds: [],
                components: [selectMenu]
            }).catch(() => { }), collected = false

            let collector = msg.createMessageComponentCollector({
                filter: int => int.user.id === message.author.id && int.customId === 'reactionRoleDelete',
                time: 60000,
                max: 1,
                errors: ['time', 'max']
            })
                .on('collect', interaction => {
                    interaction.deferUpdate().catch(() => { })

                    const { values } = interaction,
                        value = values[0]

                    if (value === 'cancelDelete') return collector.stop()

                    collected = true
                    for (let id of values)
                        deleteReaction(id.substring(0, 18))

                    let beaut = values.length === 1
                        ? '1 cargo foi deletado do reaction role.'
                        : `Todos os ${values.length} cargos foram deletados do reaction role.`

                    return msg.edit({
                        content: `${e.Check} | ${beaut}`,
                        components: []
                    }).catch(() => { })
                })
                .on('end', () => {
                    if (collected) return
                    return msg.edit(`${e.Deny} | Comando encerrado.`).catch(() => { })
                })

            async function deleteReaction(roleId) {
                return await Database.Guild.updateOne(
                    { id: message.guild.id },
                    {
                        $pull: {
                            ReactionRole: {
                                roleId: roleId
                            }
                        }
                    }
                )
            }

            function build() {
                let selectMenuObject = {
                    type: 1,
                    components: [{
                        type: 3,
                        minValues: 1,
                        custom_id: 'reactionRoleDelete',
                        placeholder: 'Escolher cargos',
                        options: []
                    }]
                }

                for (let data of ReactionRoleData) {

                    let objData = { label: data.title, value: `${data.roleId}0` }

                    if (data.emoji)
                        objData.emoji = data.emoji

                    if (data.description)
                        objData.description = data.description

                    selectMenuObject.components[0].options.push(objData)
                }

                selectMenuObject.components[0].options.push({
                    label: 'Cancelar',
                    emoji: '❌',
                    description: 'Cancelar exclução',
                    value: 'cancelDelete'
                })

                return selectMenuObject
            }
            return
        }

        return
    }
}