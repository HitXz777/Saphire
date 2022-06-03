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

        let selectMenuPrincipal = {
            type: 1,
            components: [{
                type: 3,
                custom_id: 'createNewReactionRole',
                placeholder: 'Escolha uma opção',
                options: [
                    {
                        label: 'Create',
                        emoji: '🆕',
                        description: 'Adicionar um cargo a uma coleção',
                        value: 'newReactionRole',
                    },
                    {
                        label: 'Collection',
                        emoji: '🆕',
                        description: 'Crie uma nova coleção de Reaction Roles',
                        value: 'newCollectionReactionRole',
                    },
                    {
                        label: 'Throw',
                        emoji: '📨',
                        description: 'Escolha uma coleção para lançar no chat',
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
                        description: 'Delete coleções ou cargos',
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
        }

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
            components: [selectMenuPrincipal]
        }), collected = true

        let collector = msg.createMessageComponentCollector({
            filter: int => int.user.id === message.author.id,
            time: 60000
        })
            .on('collect', interaction => {

                const { values, customId } = interaction,
                    value = values[0]

                if (customId !== 'createNewReactionRole') return

                if (['newReactionRole', 'newCollectionReactionRole'].includes(value)) {
                    collected = true
                    collector.stop()
                    return msg.edit({
                        content: `${e.Check} | Request aceita!`,
                        embeds: [],
                        components: []
                    }).catch(() => { })
                }

                interaction.deferUpdate().catch(() => { })

                if (value === 'editReactionRole') return msg.edit({
                    content: `${e.Loading} | Este recurso está em construção.`,
                    embeds: [],
                    components: []
                }).catch(() => { })

                if (value === 'delete') {
                    collected = true
                    collector.stop()
                    return deleteReactionRole(msg)
                }
                if (value === 'cancel') return collector.stop()
                if (value === 'throwReactionRole') {
                    collected = true
                    collector.stop()
                    return throwReactionRole()
                }
                
                return
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
                    content: `${e.Deny} | Este servidor não tem nenhuma coleção de reaction role configurada.`,
                    embeds: []
                }).catch(() => { })

            let selectMenuObjectCollections = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'collections',
                    placeholder: 'Escolher uma coleção para lançamento',
                    options: []
                }]
            }, collected = false

            for (collection of ReactionRoleData) {
                selectMenuObjectCollections.components[0].options.push({
                    label: collection.name,
                    emoji: e.Database,
                    description: `Cargos na coleção: ${collection.rolesData.length}`,
                    value: collection.name
                })
            }

            selectMenuObjectCollections.components[0].options.push({
                label: 'Cancel Throwing',
                emoji: '❌',
                description: `Force o cancelamento do Throw Collection`,
                value: 'cancel'
            })

            msg.edit({
                content: `${e.Loading} | Qual coleção você quer lançar?`,
                embeds: [],
                components: [selectMenuObjectCollections]
            }).catch(() => { })

            let collector = msg.createMessageComponentCollector({
                filter: int => int.user.id === message.author.id,
                idle: 60000,
            })
                .on('collect', async interaction => {

                    const { values } = interaction,
                        value = values[0]

                    if (value === 'cancel') return collector.stop()

                    interaction.deferUpdate().catch(() => { })

                    let collection = ReactionRoleData.find(coll => coll.name === value),
                        rolesData = collection?.rolesData || []

                    if (!collection)
                        return msg.edit({
                            content: `${e.Deny} | Coleção não encontrada.`
                        }).catch(() => { })

                    if (rolesData.length === 0)
                        return msg.edit({
                            content: `${e.Deny} | A coleção \`${value}\` não possui nenhum cargo configurado.`
                        }).catch(() => { })

                    collected = true
                    collector.stop()
                    return selectRolesInCollection(collection)
                })
                .on('end', () => {
                    if (collected) return
                    return msg.edit({
                        content: `${e.Deny} | Lançamento cancelado.`,
                        embeds: [], components: []
                    }).catch(() => { })
                })

            function selectRolesInCollection(collection) {

                let selectMenuObject = {
                    type: 1,
                    components: [{
                        type: 3,
                        minValues: 1,
                        custom_id: 'reactionRole',
                        placeholder: `Escolher cargos da coleção ${collection.name}`,
                        options: []
                    }]
                }

                for (let data of collection.rolesData) {
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
                    value: `refreshReactionRole ${collection.name}`
                })

                msg.edit({
                    content: `${e.Check} | Lançamento efetuado.`,
                    embeds: [],
                    components: []
                }).catch(() => { })

                let embed = { color: client.blue, title: collection.embedTitle || `Cargos da Coleção ${collection.name}` }

                let mapResult = collection.rolesData.map(data => `${message.guild.emojis.cache.get(data.emoji) || data.emoji} ${message.guild.roles.cache.get(data.roleId) || 'Not Found'}` || '\`Cargo não encontrado\`').join('\n')

                embed.description = mapResult || 'Nenhum cargo foi encontrado'

                return message.channel.send({ components: [selectMenuObject], embeds: [embed] })
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

        }

        async function deleteReactionRole(msg) {

            if (!ReactionRoleData || ReactionRoleData.length === 0)
                return msg.edit({
                    content: `${e.Deny} | Este servidor não tem nenhuma coleção de reaction roles.`,
                    embeds: []
                })

            let buttons = [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Uma coleção',
                            custom_id: 'collection',
                            emoji: e.Database,
                            style: 'PRIMARY'
                        },
                        {
                            type: 2,
                            label: 'Um cargo',
                            custom_id: 'role',
                            emoji: '💠',
                            style: 'PRIMARY'
                        },
                        {
                            type: 2,
                            label: 'Tudo',
                            custom_id: 'all',
                            emoji: e.Trash,
                            style: 'PRIMARY'
                        },
                        {
                            type: 2,
                            label: 'Cancelar',
                            custom_id: 'cancel',
                            emoji: '❎',
                            style: 'DANGER'
                        },
                    ]
                }
            ], collected = false

            msg.edit({
                content: `${e.Loading} | Eai, vai querer deletar o que?`,
                embeds: [],
                components: buttons
            }).catch(() => { }), collected = false

            let collector = msg.createMessageComponentCollector({
                filter: int => int.user.id === message.author.id,
                time: 60000
            })
                .on('collect', interaction => {

                    const { customId } = interaction

                    if (customId === 'cancel') return collector.stop()
                    interaction.deferUpdate().catch(() => { })

                    collected = true
                    collector.stop()
                    switch (customId) {
                        case 'collection': chooseACollectionToDelete(); break;
                        case 'role': deleteRole(); break;
                        case 'all': deleteAll(); break;

                        default: msg.edit({
                            content: `${e.Deny} | Comando não reconhecido.`,
                            embeds: [],
                            components: []
                        }).catch(() => { });
                            break;
                    }

                })
                .on('end', () => {
                    if (collected) return
                    return msg.edit({
                        content: `${e.Deny} | Comando cancelado.`,
                        embeds: [],
                        components: []
                    }).catch(() => { })
                })

            async function deleteAll() {

                let buttonsDelete = [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: 'SIM',
                                custom_id: 'yes',
                                style: 'SUCCESS'
                            },
                            {
                                type: 2,
                                label: 'NÃO',
                                custom_id: 'no',
                                style: 'DANGER'
                            }
                        ]
                    }
                ], collected = false

                msg = await msg.edit({
                    content: `${e.QuestionMark} | Você tem certeza em desativar todo o sistema de reaction role do servidor?`,
                    components: buttonsDelete
                }).catch(() => { })

                let collector = msg.createMessageComponentCollector({
                    filter: int => int.user.id === message.author.id,
                    time: 60000,
                    errors: ['time', 'max']
                })
                    .on('collect', interaction => {
                        interaction.deferUpdate().catch(() => { })

                        const { customId } = interaction

                        if (customId === 'no') return collector.stop()

                        collected = true
                        return deleteAllData()

                    })
                    .on('end', () => {
                        if (collected) return
                        return msg.edit({
                            content: `${e.Deny} | Exclusão cancelada.`,
                            components: []
                        })
                    })

                async function deleteAllData() {

                    await Database.Guild.updateOne(
                        { id: message.guild.id },
                        {
                            $unset: { ReactionRole: 1 }
                        }
                    )

                    return msg.edit({
                        content: `${e.Check} | Todo o sistema de reaction role foi deletado com sucesso! Por favor, clique em "Refresh" em todos os reactions roles ativados neste servidor. *(se tiver algum)*`,
                        components: []
                    })
                }

                return
            }

            async function deleteRole() {

                let selectMenuObject = {
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: 'menu',
                        placeholder: 'Escolher uma coleção',
                        options: []
                    }]
                }, collected = false

                for (let collection of ReactionRoleData)
                    selectMenuObject.components[0].options.push({
                        label: collection.name,
                        emoji: e.Database,
                        description: `Esta coleção possui ${collection.rolesData.length} cargos`,
                        value: collection.name
                    })

                selectMenuObject.components[0].options.push({
                    label: 'Cancelar',
                    emoji: e.Deny,
                    description: `Cancela a exclusão de cargos`,
                    value: 'cancel'
                })

                msg = await msg.edit({
                    content: `${e.QuestionMark} | De qual coleção é o cargo que você quer deletar?`,
                    embeds: [],
                    components: [selectMenuObject]
                })

                let collector = msg.createMessageComponentCollector({
                    filter: int => int.user.id === message.author.id,
                    time: 60000
                })
                    .on('collect', interaction => {

                        const { values } = interaction,
                            value = values[0]

                        if (value === 'cancel') return collector.stop()
                        interaction.deferUpdate().catch(() => { })

                        let collection = ReactionRoleData.find(d => d.name === value)

                        if (!collection)
                            return msg.edit({ content: `${e.Deny} | Coleção não encontrada.` }).catch(() => { })

                        collected = true
                        collector.stop()
                        return deleteRoleFromCollection(collection)

                    })
                    .on('end', () => {
                        if (collected) return
                        return msg.edit({
                            content: `${e.Deny} | Exclusão de coleção cancelada.`,
                            embeds: [],
                            components: []
                        }).catch(() => { })
                    })

                async function deleteRoleFromCollection(collection) {

                    let selectMenuObject = {
                        type: 1,
                        components: [{
                            type: 3,
                            maxValues: 1,
                            custom_id: 'toDelete',
                            placeholder: 'Escolher um cargo para deletar',
                            options: []
                        }]
                    }, collected = false

                    for (let data of collection.rolesData) {

                        let objData = { label: data.title, value: data.roleId }

                        if (data.emoji)
                            objData.emoji = data.emoji

                        if (data.description)
                            objData.description = data.description

                        selectMenuObject.components[0].options.push(objData)
                    }

                    selectMenuObject.components[0].options.push({
                        label: 'Cancelar',
                        emoji: e.Deny,
                        description: 'Cancelar exclusão',
                        value: 'cancel'
                    })

                    msg.edit({
                        content: `${e.QuestionMark} | Qual cargo você deseja deletar?`,
                        emebds: [], components: [selectMenuObject]
                    })

                    let collector = msg.createMessageComponentCollector({
                        filter: int => int.user.id === message.author.id,
                        time: 60000
                    })
                        .on('collect', interaction => {

                            const { values } = interaction,
                                value = values[0]

                            if (value === 'cancel') return collector.stop()
                            interaction.deferUpdate().catch(() => { })

                            collected = true

                            if (!collection.rolesData.find(r => r.roleId === value))
                                return msg.edit({ content: `${e.Deny} | Cargo não encontrado nesta coleção.` })

                            collector.stop()
                            return deleteRoleFromCollectionX(collection, value)
                        })
                        .on('end', () => {
                            if (collected) return
                            return msg.edit({
                                content: `${e.Deny} | Exclusão de cargo cancelado.`,
                                embeds: [], components: []
                            }).catch(() => { })
                        })
                }

                async function deleteRoleFromCollectionX(collection, roleId) {

                    await Database.Guild.findOneAndUpdate(
                        { id: message.guild.id, ['ReactionRole.name']: collection.name },
                        { $pull: { [`ReactionRole.$.rolesData`]: { roleId: roleId } } }
                    )

                    let role = message.guild.roles.cache.get(roleId) || '`Not Found`'
                    return msg.edit({
                        content: `${e.Check} | O cargo ${role} - \`${roleId}\` foi deletado com sucesso da coleção **${collection.name}**. Possuindo assim, ${collection.rolesData.length - 1} ${(collection.rolesData.length - 1) === 1 ? 'cargo disponível' : 'cargos disponíveis'}.`,
                        embeds: [], components: []
                    })
                }

            }

            async function chooseACollectionToDelete() {

                let selectMenuObject = {
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: 'menu',
                        placeholder: 'Escolher uma coleção',
                        options: []
                    }]
                }, collected = false

                for (let collection of ReactionRoleData)
                    selectMenuObject.components[0].options.push({
                        label: collection.name,
                        emoji: e.Database,
                        description: `Esta coleção possui ${collection.rolesData.length} cargos`,
                        value: collection.name
                    })

                selectMenuObject.components[0].options.push({
                    label: 'Cancelar',
                    emoji: e.Deny,
                    description: `Cancela a exclusão de coleção`,
                    value: 'cancel'
                })

                msg = await msg.edit({
                    content: `${e.QuestionMark} | Qual coleção você deseja deletar?`,
                    embeds: [],
                    components: [selectMenuObject]
                })

                let collector = msg.createMessageComponentCollector({
                    filter: int => int.user.id === message.author.id,
                    time: 60000
                })
                    .on('collect', interaction => {

                        const { values } = interaction,
                            value = values[0]

                        if (value === 'cancel') return collector.stop()
                        interaction.deferUpdate().catch(() => { })

                        let collection = ReactionRoleData.find(d => d.name === value)

                        if (!collection)
                            return msg.edit({ content: `${e.Deny} | Coleção não encontrada.` }).catch(() => { })

                        collected = true
                        collector.stop()
                        return deleteCollectionConfimation(collection)

                    })
                    .on('end', () => {
                        if (collected) return
                        return msg.edit({
                            content: `${e.Deny} | Exclusão de coleção cancelada.`,
                            embeds: [],
                            components: []
                        }).catch(() => { })
                    })

                async function deleteCollectionConfimation(collection) {

                    msg.edit({
                        content: `${e.QuestionMark} | Você realmente deseja deletar a coleção **${collection.name}** do sistema de Reaction Roles?`,
                        emebds: [], components: []
                    })

                    let emojis = ['✅', '❌'], coll = false

                    for (let i of emojis) msg.react(i).catch(() => { })

                    return msg.createReactionCollector({
                        filter: (r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id,
                        time: 60000,
                        max: 1,
                        errors: ['max', 'time']
                    })
                        .on('collect', (reaction) => {

                            const { emoji } = reaction

                            if (emoji.name === emojis[1]) return

                            coll = true
                            return deleteCollection(collection.name)
                        })
                        .on('end', () => {
                            if (coll) return
                            return msg.edit({
                                content: `${e.Deny} | Comando de exclusão cancelado.`
                            })
                        })
                }

                async function deleteCollection(collectionName) {

                    await Database.Guild.findOneAndUpdate(
                        { id: message.guild.id },
                        { $pull: { ReactionRole: { name: collectionName } } }
                    )

                    return msg.edit({ content: `${e.Check} | A coleção **${collectionName}** foi deletada com sucesso!` })
                }

            }
        }

        return
    }
}