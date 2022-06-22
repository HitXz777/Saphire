const { getEmoji, registerCollectionID } = require('../../../modules/functions/plugins/eventPlugins')
const blockPerms = ['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_GUILD', 'MANAGE_MESSAGES', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'ADMINISTRATOR', 'MODERATE_MEMBERS']
const util = require('../../structures/util')

module.exports = {
    name: 'reactionrole',
    description: '[moderation] Gerencie o Reaction Role',
    dm_permission: false,
    default_member_permissions: util.slashCommandsPermissions.MANAGE_ROLES,
    type: 1,
    options: [
        {
            name: 'mais_opções',
            description: '[moderation] Mais funções do reaction role aqui',
            type: 1,
            options: [
                {
                    name: 'funções',
                    description: 'Escolha uma função a ser executada',
                    type: 3,
                    required: true,
                    choices: [
                        {
                            name: 'Informações',
                            value: 'info'
                        },
                        {
                            name: 'Nova Coleção',
                            value: 'nova_coleção'
                        },
                        {
                            name: 'Editar Reaction Role',
                            value: 'editar'
                        },
                        {
                            name: 'Deletar Cargo ou Coleção',
                            value: 'deletar'
                        }
                    ]

                }
            ]
        },
        {
            name: 'lançar_coleção',
            description: '[moderation] Crie uma nova coleção de reaction roles',
            type: 1,
            options: [
                {
                    name: 'canal',
                    description: 'Canal de lançamento do reaction role',
                    type: 7,
                    required: true
                }
            ]
        },
        {
            name: 'novo_cargo',
            description: '[moderation] Crie e adicione um novo cargo a uma coleção de reaction roles.',
            type: 1,
            options: [
                {
                    name: 'cargo',
                    description: 'Cargo a ser adicionado',
                    type: 8,
                    required: true
                },
                {
                    name: 'título',
                    description: 'Título para o cargo',
                    type: 3,
                    required: true
                },
                {
                    name: 'descrição',
                    description: 'Descrição do cargo',
                    type: 3
                }
            ]
        }
    ],
    async execute({ interaction: interaction, client: client, database: Database, guildData: guildData, emojis: e, modals: modals, member: member }) {

        const { options, user, guild } = interaction
        const { Config: config } = Database

        let subCommand = options.getSubcommand()
        let func = options.getString('funções')
        let role = options.getRole('cargo')
        let data = {}
        let collections = guildData?.ReactionRole || []
        let channel = options.getChannel('canal')

        if (subCommand === 'novo_cargo') return newReactionRole()
        if (subCommand === 'lançar_coleção') return throwReactionRole()

        switch (func) {
            case 'info': reactionRoleInfo(); break;
            case 'nova_coleção': newCollection(); break;
            case 'deletar': deleteReactionRole(); break;
            case 'editar': editReactionRole(); break;
        }

        return

        async function newReactionRole() {

            let title = options.getString('título')
            let description = options.getString('descrição')
            let roleArray = guildData?.ReactionRole || []

            data = { title: title, description: description }

            if (title.length > 25)
                title = title.slice(0, 22) + '...'

            if (description && description.length > 50)
                description = description.slice(0, 47) + '...'

            let overRole = role.comparePositionTo(member.roles.highest) > -1 && guild.ownerId !== user.id

            if (overRole)
                return await interaction.reply({
                    content: `❌ |  O cargo ${role} é superior ao seu cargo mais alto, portanto você não tem acesso a ele.`,
                    ephemeral: true
                })

            for (let collection of roleArray)
                if (collection?.rolesData?.find(d => d.roleId === role.id))
                    return await interaction.reply({
                        content: `❌ | O cargo ${role} já foi configurado como reaction role.`,
                        ephemeral: true
                    })

            if (!role.editable)
                return await interaction.reply({
                    content: `❌ | Eu não consigo adicionar o cargo ${role} por entrar acima de mim no ranking de cargos. Suba meu cargo para cima dele que tudo dará certo.`,
                    ephemeral: true
                })

            const RolePermissions = role?.permissions.toArray() || []

            for (const perm of RolePermissions)
                if (blockPerms.includes(perm))
                    return await interaction.reply({
                        content: `❌ | O cargo ${role} possui a permissão **${config.Perms[perm]}** ativada. Não vou prosseguir com a adição deste cargo, isso pode prejudicar o seu servidor.`,
                        ephemeral: true
                    })

            let msg = await interaction.reply({
                content: `${e.Loading} | Qual emoji você quer para este cargo?\n> **\`Reaja nesta mensagem com um emoji do Discord ou DESTE SERVIDOR.\`**\n> *Clique no ❌ caso não queria nenhum emoji.*`,
                fetchReply: true
            }), collected = false
            msg.react('❌').catch(() => { })

            let collector = msg.createReactionCollector({
                filter: (r, u) => u.id === user.id,
                time: 120000,
                errors: ['time']
            })
                .on('collect', (reaction) => {

                    let { emoji } = reaction

                    if (emoji.name === '❌') return chooseColletion(null, msg, roleArray)

                    let emojiData = emoji.id || emoji.name

                    if (emoji.id && !guild.emojis.cache.get(emoji.id))
                        return msg.edit(`${msg.content}\n \n❌ | Este emoji não pertence a este servidor. Por favor, escolha um emoji deste servidor ou do Discord.`).catch(() => { })

                    collected = true
                    collector.stop()
                    return chooseColletion(emojiData, msg, roleArray)
                })
                .on('end', () => {
                    if (collected) return
                    return msg.edit(`${e.Deny} | Criação do Reaction Role cancelado por falta de respota.`).catch(() => { })
                })
        }

        async function chooseColletion(emojiData = null, msg, roleArray) {

            let selectMenuObject = {
                type: 1,
                components: [{
                    type: 3,
                    maxValues: 1,
                    minValues: 1,
                    custom_id: 'registerReactionRole',
                    placeholder: 'Escolher uma seleção',
                    options: []
                }]
            }, collected = false
            await build()

            msg.edit({
                content: `${e.Loading} | Para qual seleção é este cargo?`,
                embeds: [],
                components: [selectMenuObject]
            })

            let collector = msg.createMessageComponentCollector({
                filter: int => int.user.id === user.id,
                idle: 60000,
                errors: ['idle']
            })
                .on('collect', async int => {

                    let collections = int.values,
                        collectionName = collections[0]

                    let collection = roleArray.find(d => d.name === collectionName)

                    if (!collection)
                        return msg.edit({
                            content: '❌ | Coleção não encontrada.',
                            components: [selectMenuObject]
                        }).catch(() => { })

                    if (collection?.rolesData?.length >= 24)
                        return msg.edit({
                            content: '❌ | O limite é de 24 Reaction Roles por coleção.',
                            components: [selectMenuObject]
                        }).catch(() => { })

                    collected = true
                    collector.stop()
                    return registerReactionRole(emojiData, msg, collectionName)
                })
                .on('end', () => {
                    if (collected) return
                    return msg.edit({
                        content: `${e.Deny} | Comando cancelado por falta de respota.`,
                        embeds: [],
                        components: []
                    }).catch(() => { })
                })

            function build() {
                for (let d of roleArray)
                    selectMenuObject.components[0].options.push({
                        label: d.name,
                        description: `Cargos registrados: ${d.rolesData.length}`,
                        emoji: e.Database,
                        value: d.name
                    })

                return
            }

        }

        async function registerReactionRole(emoji = null, msg, collectionName) {
            msg.reactions.removeAll().catch(() => { })

            let { title, description } = data

            let objData = { roleId: role.id, title: title }

            if (emoji)
                objData.emoji = emoji

            if (description)
                objData.description = description

            await Database.Guild.updateOne(
                { id: guild.id, ['ReactionRole.name']: collectionName },
                { $push: { [`ReactionRole.$.rolesData`]: objData } }
            )

            let count = 0, collectionsCount = collections.length

            for (let collection of collections)
                count += collection?.rolesData?.length || 0

            return msg.edit({
                content: `${e.Check} | O cargo ${role} foi adicionado com sucesso na coleção **${collectionName}**!\n${e.Info} | Para executar o novo reaction role, use o comando \`/reactionrole throw\`.\n${e.QuestionMark} | Configurou o cargo errado? Delete ele usando o comando \`/reactionrole delete\`.\n${e.Stonks} | Agora, ${guild.name} possui ${count + 1} reaction roles em ${collectionsCount} coleções!`,
                components: []
            }).catch(() => { })
        }

        async function newCollection() {

            if (collections?.length >= 20)
                return await interaction.reply({
                    content: `${e.Deny} | O limite é de 20 coleções de reaction roles por servidor. *(Por enquanto)*`,
                    ephemeral: true
                })

            return await interaction.showModal(modals.newCollection)
        }

        async function throwReactionRole() {

            if (channel.type !== 'GUILD_TEXT')
                return await interaction.reply({
                    content: `${e.Deny} | Apenas canais de textos são permitidos por aqui.`,
                    ephemeral: true
                })

            if (!collections || collections.length === 0)
                return await interaction.reply({
                    content: `${e.Deny} | Este servidor não tem nenhuma coleção de reaction role configurada.`,
                    ephemeral: true
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

            for (collection of collections) {
                selectMenuObjectCollections.components[0].options.push({
                    label: collection.name,
                    emoji: e.Database,
                    description: `Cargos na coleção: ${collection.rolesData.length || 0}`,
                    value: collection.collectionID || collection.name
                })
            }

            selectMenuObjectCollections.components[0].options.push({
                label: 'Cancel Throwing',
                emoji: '❌',
                description: `Force o cancelamento do Throw Collection`,
                value: 'cancel'
            })

            let msg = await interaction.reply({
                content: `${e.Loading} | Qual coleção você quer lançar?`,
                embeds: [],
                components: [selectMenuObjectCollections],
                fetchReply: true
            }).catch(() => { })

            collector = msg.createMessageComponentCollector({
                filter: int => int.user.id === user.id,
                idle: 60000,
            })
                .on('collect', async int => {

                    const { values } = int,
                        value = values[0]

                    if (value === 'cancel') return collector.stop()

                    int.deferUpdate().catch(() => { })

                    let collection = collections.find(coll => coll.collectionID === value || coll.name === value)

                    if (!collection)
                        return msg.edit({
                            content: `${e.Deny} | Coleção não encontrada.`
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

            async function selectRolesInCollection(collection) {

                let selectMenuObject = {
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: 'reactionRole',
                        placeholder: `Escolher cargos da coleção ${collection.name}`,
                        options: []
                    }]
                }

                if (!collection.uniqueSelection)
                    selectMenuObject.components[0].minValues = 1

                if (collection.rolesData.length > 0)
                    for (let data of collection.rolesData) {
                        let objData = { label: data.title, value: data.roleId }

                        if (data.emoji)
                            objData.emoji = data.emoji

                        if (data.description)
                            objData.description = data.description

                        selectMenuObject.components[0].options.push(objData)
                    }

                let collectionID = collection.collectionID || await registerCollectionID(Database, collection, guild)

                selectMenuObject.components[0].options.push({
                    label: 'Refresh',
                    emoji: '🔄',
                    description: 'Atualize o reaction role',
                    value: `refreshReactionRole ${collectionID}`
                })

                msg.edit({
                    content: `${e.Check} | Lançamento efetuado.`,
                    embeds: [],
                    components: []
                }).catch(() => { })

                let embed = { color: client.blue, title: collection.embedTitle || `Cargos da Coleção ${collection.name}` }

                let mapResult = collection.rolesData.map(data => `${getEmoji(data.emoji, guild)}${guild.roles.cache.get(data.roleId) || 'Not Found'}` || '\`Cargo não encontrado\`').join('\n')

                embed.description = mapResult || '> *Esta coleção não possui nenhum cargo*'

                return channel.send({ components: [selectMenuObject], embeds: [embed] })
                    .then(() => {
                        return msg.edit({
                            content: `${e.Check} | Lançamento efetuado com sucesso!`,
                            components: []
                        }).catch(() => { })
                    })
                    .catch(err => {
                        return msg.edit({
                            content: `${e.Deny} | Erro ao efetuar o lançamento.\n> \`${err}\``,
                            components: []
                        }).catch(() => { })
                    })
            }

        }

        async function deleteReactionRole() {

            if (!collections || collections.length === 0)
                return await interaction.reply({
                    content: `${e.Deny} | Este servidor não tem nenhuma coleção de reaction roles.`,
                    ephemeral: true
                }).catch(() => { })

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

            let msg = await interaction.reply({
                content: `${e.Loading} | Eai, vai querer deletar o que?`,
                fetchReply: true,
                components: buttons
            }).catch(() => { })

            let collector = msg.createMessageComponentCollector({
                filter: int => int.user.id === user.id,
                time: 60000
            })
                .on('collect', int => {

                    const { customId } = int

                    if (customId === 'cancel') return collector.stop()
                    int.deferUpdate().catch(() => { })

                    collected = true
                    collector.stop()
                    switch (customId) {
                        case 'collection': chooseACollectionToDelete(); break;
                        case 'role': deleteRole(); break;
                        case 'all': deleteAll(); break;

                        default: msg.edit({
                            content: `${e.Deny} | Comando não reconhecido.`,
                            components: []
                        }).catch(() => { });
                            break;
                    }

                })
                .on('end', () => {
                    if (collected) return
                    return msg.edit({
                        content: `${e.Deny} | Comando cancelado.`,
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
                    filter: int => int.user.id === user.id,
                    time: 60000,
                    errors: ['time', 'max']
                })
                    .on('collect', int => {
                        int.deferUpdate().catch(() => { })

                        const { customId } = int

                        if (customId === 'no') return collector.stop()

                        collected = true
                        return deleteAllData()

                    })
                    .on('end', () => {
                        if (collected) return
                        return msg.edit({
                            content: `${e.Deny} | Exclusão cancelada.`,
                            components: []
                        }).catch(() => { })
                    })

                async function deleteAllData() {

                    await Database.Guild.updateOne(
                        { id: guild.id },
                        {
                            $unset: { ReactionRole: 1 }
                        }
                    )

                    return msg.edit({
                        content: `${e.Check} | Todo o sistema de reaction role foi deletado com sucesso! Por favor, clique em "Refresh" em todos os reactions roles ativados neste servidor. *(se tiver algum)*`,
                        components: []
                    }).catch(() => { })
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

                for (let collection of collections)
                    selectMenuObject.components[0].options.push({
                        label: collection.name,
                        emoji: e.Database,
                        description: `Esta coleção possui ${collection.rolesData.length} cargos`,
                        value: collection.name
                    })

                selectMenuObject.components[0].options.push({
                    label: 'Cancelar',
                    emoji: e.Deny,
                    description: `Cancelar a exclusão de cargos`,
                    value: 'cancel'
                })

                msg = await msg.edit({
                    content: `${e.QuestionMark} | De qual coleção é o cargo que você quer deletar?`,
                    embeds: [],
                    components: [selectMenuObject]
                }).catch(() => { })

                let collector = msg.createMessageComponentCollector({
                    filter: int => int.user.id === user.id,
                    time: 60000
                })
                    .on('collect', int => {

                        const { values } = int,
                            value = values[0]

                        if (value === 'cancel') return collector.stop()
                        int.deferUpdate().catch(() => { })

                        let collection = collections.find(d => d.name === value)

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
                    }).catch(() => { })

                    let collector = msg.createMessageComponentCollector({
                        filter: int => int.user.id === user.id,
                        time: 60000
                    })
                        .on('collect', int => {

                            const { values } = int,
                                value = values[0]

                            if (value === 'cancel') return collector.stop()
                            int.deferUpdate().catch(() => { })

                            collected = true

                            if (!collection.rolesData.find(r => r.roleId === value))
                                return msg.edit({ content: `${e.Deny} | Cargo não encontrado nesta coleção.` }).catch(() => { })

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

                    await Database.Guild.updateOne(
                        { id: guild.id, ['ReactionRole.name']: collection.name },
                        { $pull: { [`ReactionRole.$.rolesData`]: { roleId: roleId } } }
                    )

                    let role = guild.roles.cache.get(roleId) || '`Not Found`'
                    return msg.edit({
                        content: `${e.Check} | O cargo ${role} - \`${roleId}\` foi deletado com sucesso da coleção **${collection.name}**. Possuindo assim, ${collection.rolesData.length - 1} ${(collection.rolesData.length - 1) === 1 ? 'cargo disponível' : 'cargos disponíveis'}.`,
                        embeds: [], components: []
                    }).catch(() => { })
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

                for (let collection of collections)
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
                }).catch(() => { })

                let collector = msg.createMessageComponentCollector({
                    filter: int => int.user.id === user.id,
                    time: 60000
                })
                    .on('collect', int => {

                        const { values } = int,
                            value = values[0]

                        if (value === 'cancel') return collector.stop()
                        int.deferUpdate().catch(() => { })

                        let collection = collections.find(d => d.name === value)

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
                    }).catch(() => { })

                    let emojis = ['✅', '❌'], coll = false

                    for (let i of emojis) msg.react(i).catch(() => { })

                    return msg.createReactionCollector({
                        filter: (r, u) => emojis.includes(r.emoji.name) && u.id === user.id,
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
                            }).catch(() => { })
                        })
                }

                async function deleteCollection(collectionName) {

                    await Database.Guild.findOneAndUpdate(
                        { id: guild.id },
                        { $pull: { ReactionRole: { name: collectionName } } }
                    )

                    return msg.edit({ content: `${e.Check} | A coleção **${collectionName}** foi deletada com sucesso!` }).catch(() => { })
                }

            }
        }

        async function editReactionRole() {

            let reactionData = guildData?.ReactionRole || []

            if (!reactionData || reactionData.length === 0)
                return await interaction.reply({
                    content: `${e.Deny} | Este servidor não possui nenhuma coleção criada. Portanto, a função *editar* está bloqueada.`,
                    ephemeral: true
                }).catch(() => { })

            let buttons = [{
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Uma Coleção',
                        emoji: e.Database,
                        custom_id: 'collection',
                        style: 'PRIMARY'
                    },
                    {
                        type: 2,
                        label: 'Um Cargo',
                        emoji: '💠',
                        custom_id: 'role',
                        style: 'PRIMARY'
                    },
                    {
                        type: 2,
                        label: 'Cancelar',
                        emoji: '❌',
                        custom_id: 'cancel',
                        style: 'DANGER'
                    }
                ]
            }], collected = false

            let msg = await interaction.reply({
                content: `${e.Loading} | Ok, editar. O que você quer editar?`,
                components: buttons,
                fetchReply: true
            }).catch(() => { })

            let collector = msg.createMessageComponentCollector({
                filter: int => int.user.id === user.id,
                time: 60000,
                errors: ['time']
            })
                .on('collect', int => {

                    const { customId } = int

                    collector.stop()
                    if (customId === 'cancel') return

                    collected = true

                    int.deferUpdate().catch(() => { })
                    if (customId === 'collection') return chooseCollectionToEdit()
                    if (customId === 'role') return chooseCollectionToEditRole()
                    return
                })
                .on('end', () => {
                    if (collected) return
                    return msg.edit({
                        content: `${e.Deny} | Edição cancelada.`,
                        components: []
                    }).catch(() => { })
                })

            return

            async function chooseCollectionToEdit() {

                let selectMenu = await buildSelectMenu(), collected = false

                msg.edit({
                    content: `${e.QuestionMark} | Qual coleção você quer editar?`,
                    components: [selectMenu]
                }).catch(() => { })

                let collector = msg.createMessageComponentCollector({
                    filter: int => int.user.id === user.id,
                    time: 60000,
                    errors: ['time']
                })
                    .on('collect', int => {

                        const { values } = int,
                            value = values[0]

                        collector.stop()
                        if (value === 'cancel') return

                        collected = true

                        if (collections.find(d => d.collectionID === value))
                            return msg.edit({
                                content: `${e.Check} | Request aceita!`, components: [], embeds: []
                            }).catch(() => { })

                        return msg.edit({
                            content: `${e.Deny} | Nenhuma coleção foi encontrada. \`Collection ID: ${value}\``, components: [], embeds: []
                        }).catch(() => { })
                    })
                    .on('end', () => {
                        if (collected) return
                        return msg.edit({
                            content: `${e.Deny} | Edição de coleção cancelada.`,
                            components: []
                        }).catch(() => { })
                    })

                async function buildSelectMenu() {

                    let selectMenuObject = {
                        type: 1,
                        components: [{
                            type: 3,
                            custom_id: 'collectionEdit',
                            placeholder: 'Coleções',
                            options: []
                        }]
                    }

                    for (let collection of reactionData)
                        selectMenuObject.components[0].options.push({
                            label: collection.name,
                            emoji: e.Database,
                            description: `${collection.rolesData.length} Cargos | Reação única: ${collection.uniqueSelection ? 'Sim' : 'Não'}`,
                            value: collection.collectionID || await registerCollectionID(Database, collection, guild)
                        })

                    selectMenuObject.components[0].options.push({
                        label: 'Cancelar',
                        emoji: '❌',
                        description: 'Cancelar edição',
                        value: 'cancel'
                    })

                    return selectMenuObject
                }

                return
            }

            async function chooseCollectionToEditRole() {

                let selectMenu = {
                    type: 1,
                    components: [{
                        type: 3,
                        custom_id: 'editARole',
                        placeholder: 'Escolher coleção do cargo',
                        options: []
                    }]
                }, collected = false

                for (let collection of collections)
                    selectMenu.components[0].options.push({
                        label: collection.name,
                        emoji: e.Database,
                        description: `Esta coleção possui ${collection.rolesData.length} cargos`,
                        value: collection.name
                    })

                selectMenu.components[0].options.push({
                    label: 'Cancelar',
                    emoji: e.Deny,
                    description: 'Cancelar a exclusão de cargos',
                    value: 'cancel'
                })

                msg.edit({
                    content: `${e.QuestionMark} | Em qual coleção o cargo que você quer editar está?`,
                    components: [selectMenu]
                }).catch(() => { })

                return msg.createMessageComponentCollector({
                    filter: int => int.user.id === user.id,
                    time: 60000,
                    max: 1,
                    errors: ['time']
                })
                    .on('collect', int => {

                        const { values } = int,
                            value = values[0]

                        if (value === 'cancel') return

                        collected = true
                        int.deferUpdate().catch(() => { })

                        let collection = collections.find(d => d.name === value)

                        if (!collection)
                            return msg.edit({
                                content: `${e.Deny} | Esta coleção é estranha... Eu não achei ela.`,
                                components: []
                            }).catch(() => { })

                        return editRole(collection)

                    })
                    .on('end', () => {
                        if (collected) return
                        return msg.edit({ content: `${e.Deny} | Edição de cargo cancelada.`, components: [] }).catch(() => { })
                    })

                async function editRole(collection) {

                    let selectMenuObject = {
                        type: 1,
                        components: [{
                            type: 3,
                            maxValues: 1,
                            custom_id: 'toEdit',
                            placeholder: 'Escolher um cargo para editar',
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
                        description: 'Cancelar edição',
                        value: 'cancel'
                    })

                    msg.edit({
                        content: `${e.QuestionMark} | Qual cargo você deseja editar?`,
                        emebds: [], components: [selectMenuObject]
                    }).catch(() => { })

                    let collector = msg.createMessageComponentCollector({
                        filter: int => int.user.id === user.id,
                        time: 60000
                    })
                        .on('collect', int => {

                            const { values } = int,
                                value = values[0]

                            if (value === 'cancel') return collector.stop()

                            collected = true

                            if (!collection.rolesData.find(r => r.roleId === value))
                                return msg.edit({ content: `${e.Deny} | Cargo não encontrado nesta coleção.`, components: [] }).catch(() => { })

                            collector.stop()
                            return msg.edit({ content: `${e.Check} | Solicitação aceita.`, components: [] }).catch(() => { })
                        })
                        .on('end', () => {
                            if (collected) return
                            return msg.edit({
                                content: `${e.Deny} | Edição de cargo cancelado.`,
                                embeds: [], components: []
                            }).catch(() => { })
                        })
                    return
                }

            }

        }

        async function reactionRoleInfo(msg) {

            let infoSelectMenu = {
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'infoSelectMenu',
                    placeholder: 'Tipos de informações',
                    options: [
                        {
                            label: 'What is this?',
                            emoji: e.QuestionMark,
                            description: 'Afinal, o que é Reaction Role?',
                            value: 'whatIsThis',
                        },
                        {
                            label: 'Create',
                            emoji: '🆕',
                            description: 'Como faço isso? Dá um help!',
                            value: 'create',
                        },
                        {
                            label: 'Collection',
                            emoji: e.Database,
                            description: 'Coleção? O que é isso?',
                            value: 'collection',
                        },
                        {
                            label: 'Throw',
                            emoji: '📨',
                            description: 'O que caralhos é Throw?',
                            value: 'throw',
                        },
                        {
                            label: 'Edit',
                            emoji: '📝',
                            description: 'Quero editar, como faço isso?',
                            value: 'edit',
                        },
                        {
                            label: 'Delete',
                            emoji: e.Trash,
                            description: 'Quero deletar! Socorro!',
                            value: 'delete',
                        },
                        {
                            label: 'Security',
                            emoji: e.ModShield,
                            description: 'Relaxa que a Saph protege.',
                            value: 'security',
                        },
                        {
                            label: 'Cancel',
                            emoji: '❌',
                            description: 'Deixa pra lá. Cancela tudo.',
                            value: 'cancel',
                        },
                        {
                            label: 'Beginning',
                            emoji: '🔄',
                            description: 'Espera. Volta tudo do começo.',
                            value: 'beginning',
                        }
                    ]
                }]
            }

            infoSelectMenu.components[0].options.push()

            msg = msg ?
                await msg.edit({
                    content: `${e.QuestionMark} | Qual tipo de informação sobre o reaction role você quer?`,
                    components: [infoSelectMenu]
                }).catch(() => { })
                : await interaction.reply({
                    content: `${e.QuestionMark} | Qual tipo de informação sobre o reaction role você quer?`,
                    components: [infoSelectMenu],
                    fetchReply: true
                }).catch(() => { })

            let collector = msg.createMessageComponentCollector({
                filter: int => int.user.id === user.id && int.customId === 'infoSelectMenu',
                idle: 120000,
                errors: ['idle']
            })
                .on('collect', int => {

                    const { values } = int,
                        value = values[0],
                        embed = { color: client.blue, title: `${e.Stonks} ${client.user.username}'s Reaction Role Interative Information` }

                    if (value === 'cancel') return collector.stop()
                    if (value === 'beginning') {
                        msg.delete().catch(() => { })
                        return initReactionRoleCommand()
                    }

                    int.deferUpdate().catch(() => { })

                    switch (value) {
                        case 'whatIsThis':
                            embed.description = `> Reaction Role é um termo criado pelos desenvolvedores de bot para um sistema de entrega de cargos automático para membros do servidor atráves de cliques em emojis. Você reage a um emoji e o bot te entrega o cargo configurado para aquele emoji. Por isso o nome, "Reaction Role -> Cargo por Reação".\n \n${e.SaphireOk} Porém, aqui não tem nada de emojis. Você ganha seus cargos atráves de interações, selecionando o cargo ou os cargos que você quer por meio da barrinha de seleção.`
                            embed.image = { url: 'https://media.discordapp.net/attachments/893361065084198954/984256307378929704/unknown.png' }
                            break;
                        case 'create':
                            embed.description = 'Você cria um cargo clicando na opção **"🆕 Create"**. Após a seleção, irá aparecer o painel abaixo para você.'
                            embed.fields = [
                                {
                                    name: '📝 *ID OU NOME EXATO DO CARGO (1 - 100 Caracteres)',
                                    value: `Neste campo, você escreve o ID ou o nome cargo que você quer adicionar ao reaction role.\n*Se você não sabe pegar o ID das coisas, veja este [artigo do Discord](${'https://support.discord.com/hc/pt-br/articles/206346498-Onde-posso-encontrar-minhas-IDs-de-Usu%C3%A1rio-Servidor-Mensagem-'}).*`
                                },
                                {
                                    name: '📝 *TÍTULO PARA O CARGO (1 - 25 Caracteres)',
                                    value: 'Este é o título do seu cargo dentro da seleção de cargos. O que você colocar neste campo, é como eu apresentarei o cargo para todo mundo.'
                                },
                                {
                                    name: '📝 DESCRIÇÃO DA REACTION ROLE (1 - 50 Caracteres)',
                                    value: 'Fale em poucas palavras para o que é o cargo, para que os demais saibam o motivo para o cargo estar disponível.'
                                },
                            ]
                            embed.footer = { text: '* Campos obrigatórios ' }
                            embed.image = { url: 'https://media.discordapp.net/attachments/893361065084198954/984257986908262450/unknown.png' }
                            break;
                        case 'collection':
                            embed.description = `As coleções são um tipo de "caixinha" onde você coloca os cargos para os outros pegarem. As coleções estão limitas em **24 por servidor** e cada coleção suporta um total de **24 cargos**, totalizando, **576 cargos** possíveis no reaction role. No Discord, o limite é de 250 cargos dentro do servidor, logo, você pode colocar todos os cargos dentro do meu sistema que ainda vai sobrar muito espaço ${e.SaphireOk}\n \nJá ia esquecendo. Na criação da sua coleção, você também pode escolher se eu posso ou não entregar vários cargos de uma só vez.`
                            embed.image = { url: 'https://media.discordapp.net/attachments/893361065084198954/984264241064345650/unknown.png' }
                            break;
                        case 'throw':
                            embed.description = 'A função **📨 Throw** não é nada mais que pegar uma das suas coleções criadas e lançar no chat.\nThrow, vem do inglês "lançar". E com essa opção fica simples e fácil de ativar de vez o seu reaction role. Legal, né?\nClique no throw e escolha a sua coleção. Se não tiver nenhuma, crie a sua.'
                            embed.image = { url: 'https://media.discordapp.net/attachments/893361065084198954/984266928090664981/unknown.png' }
                            break;
                        case 'edit':
                            embed.description = 'A função **📝 Edit** permite você editar as informações já criadas. Dando total liberdade para alterar o *Nome, Título, Descrição e Mult-Cargos* das coleções e *Nome, Emoji, Descrição e Coleção* dos cargos.'
                            embed.image = { url: 'https://media.discordapp.net/attachments/893361065084198954/984268001320787988/unknown.png' }
                            break;
                        case 'delete':
                            embed.description = 'Esse aqui é tão simples que nem precisa de ajuda. Você apenas escolhe o que quer ser deletado. Uma coleção ou um cargo.'
                            embed.image = { url: 'https://media.discordapp.net/attachments/893361065084198954/984273312832184330/unknown.png' }
                            break;
                        case 'security':
                            embed.description = 'Desde a criação até a adição do cargo no membro. Todos os passos são analisados e checados pelos meus sistemas de seguraça de cargos impedindo que algo de errado aconteça.'
                            embed.fields = [
                                {
                                    name: `${e.Reference} Permissões Negadas`,
                                    value: `${blockPerms.map(perm => `\`${config.Perms[perm]}\``).join(', ')}`
                                }
                            ]
                            break;
                        default:
                            embed.description = 'Nenhum dado foi reconhecido.'
                            break;
                    }

                    return msg.edit({ embeds: [embed] }).catch(() => { })
                })
                .on('end', () => {
                    return msg.edit({
                        content: `${e.Deny} | O painel interativo do reaction role foi desativado.`,
                        embeds: [], components: []
                    })
                })

        }
    }
}