const Database = require('../../../modules/classes/Database'),
    { Config: config } = Database,
    { newReminder, getEmoji } = require('../plugins/eventPlugins')

async function selectMenuFunctions(interaction, client) {

    const { customId, values, message, user, guild } = interaction

    let value = values[0]

    if (customId === 'reactionRole') return reactionRole()

    switch (value) {
        case 'newGiveaway': newGiveaway(); break;
        case 'newReminder': newReminder(interaction); break;
        case 'sendNewLetter': sendNewLetter(); break;
        case 'report': letterReport(); break;
        case 'reportTransactions': reportTransactions(); break;
        case 'newReactionRole': newReactionRole(); break;
        case 'newCollectionReactionRole': newCollectionReactionRole(); break;
        default: break;
    }

    return

    async function reactionRole() {

        if (value.includes('refreshReactionRole')) return refreshReactionRole(value)

        for (let val of values)
            if (val.includes('refreshReactionRole')) return refreshReactionRole(val)

        let permsArray = guild.me.permissions.toArray() || []

        if (!permsArray.includes('MANAGE_ROLES') && !permsArray.includes('ADMINISTRATOR'))
            return await interaction.reply({
                content: '❌ | Eu não tenho a permissão **Gerenciar Cargos** ativada. A adição de cargo está suspensa.',
                ephemeral: true
            })

        let msgConfirmation = 'ℹ | Feedback', collection = {}

        let data = await Database.Guild.findOne({ id: guild.id }, 'ReactionRole')
        let ReactionRole = data?.ReactionRole || []

        collection = ReactionRole.find(d => d.rolesData?.find(x => x.roleId === value))

        if (collection?.uniqueSelection) {

            let rolesId = []

            collection.rolesData.map(d => rolesId.push(d.roleId))

            rolesId = rolesId.filter(id => id !== value)

            await addRole(value, rolesId)
        }
        else
            for (let roleId of values)
                await addRole(roleId)

        async function addRole(roleId, toRemoveRolesId = []) {

            let role = guild.roles.cache.get(roleId),
                member = guild.members.cache.get(user.id)

            for (let id of toRemoveRolesId)
                if (member.roles.cache.has(id))
                    await member.roles.remove(id)
                        .then(() => msgConfirmation += `\n⚠️ | ${guild.roles.cache.get(id)} - **REMOVIDO**`)
                        .catch(() => msgConfirmation += `\n❌ | ${guild.roles.cache.get(id) || 'Not Found'} - **Erro ao remover o cargo**`)

            if (!role)
                return msgConfirmation += `\n⚠️ | ${role?.name || 'NOT FOUND'} - **ERRO**`

            if (!role.editable) {
                return msgConfirmation += `\n⚠️ | ${role?.name || 'NOT FOUND'} - **Não posso manusear este cargo.**`
            }

            const RolePermissions = role?.permissions.toArray() || [],
                BlockPermissionsArray = ['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_GUILD', 'MANAGE_MESSAGES', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'ADMINISTRATOR', 'MODERATE_MEMBERS']

            if (member.roles.cache.has(roleId)) {
                member.roles.remove(roleId)
                    .catch(() => msgConfirmation += `\n⚠️ | ${role || 'NOT FOUND'} - **ERRO**`)

                return msgConfirmation += `\n❌ | ${role || 'NOT FOUND'} - **REMOVIDO**`

            } else {

                for (const perm of RolePermissions)
                    if (BlockPermissionsArray.includes(perm)) {
                        deleteReaction(roleId, collection?.name)
                        return msgConfirmation += `\n❌ | ${role || 'NOT FOUND'} - Este cargo possui a permissão **${config.Perms[perm]}** ativada. Adição ignorada.`
                    }

                await member.roles.add(roleId)
                    .catch(() => msgConfirmation += `\n⚠️ | ${role || 'NOT FOUND'} - **ERRO**`)

                return msgConfirmation += `\n✅ | ${role || 'NOT FOUND'} - **ADICIONADO**`
            }

        }

        await interaction.update({}) // By: 793343792048635924 & 196679829800747017
        return await interaction.followUp({
            content: msgConfirmation,
            ephemeral: true
        })

    }

    async function newGiveaway() {

        let reference = message.reference,
            Message = await message.channel.messages.fetch(reference.messageId)

        if (user.id !== Message.author.id)
            return await interaction.reply({
                content: `❌ | Opa opa! Não foi você que iniciou o comando. Então, este não é o seu lugar.`,
                ephemeral: true
            })

        let data = await Database.Guild.findOne({ id: message.guild.id }, 'GiveawayChannel Prefix'),
            prefix = data?.Prefix || '-',
            ChannelId = data?.GiveawayChannel,
            Channel = message.guild.channels.cache.has(ChannelId)

        if (!ChannelId)
            return await interaction.reply({
                content: `❌ | Esse servidor não tem nenhum canal de sorteios configurado. Configure um canal usando \`${prefix}giveaway config #canalDeSorteios\`.`,
                ephemeral: true
            })

        if (ChannelId && !Channel) {

            await Database.Guild.updateOne(
                { id: guild.id },
                { $unset: { GiveawayChannel: 1 } }
            )

            return await interaction.reply({
                content: `❌ | O canal presente no meu banco de dados não condiz com nenhum canal do servidor. Por favor, configure um novo usando: \`${prefix}giveaway config #canalDeSorteios\`.`,
                ephemeral: true
            })
        }

        if (!Channel)
            return await interaction.reply({
                content: `❌ | O canal presente no meu banco de dados não condiz com nenhum canal do servidor. Por favor, configure um novo usando: \`${prefix}giveaway config #canalDeSorteios\`.`,
                ephemeral: true
            })

        const modal = {
            title: "Giveaway Central Create",
            custom_id: "createNewGiveaway",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "winners",
                            label: "Quantos vencedores?",
                            style: 1,
                            min_length: 1,
                            max_length: 2,
                            placeholder: "1, 2, 3... Max: 20",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "timing",
                            label: "Quando devo efetuar o sorteio?",
                            style: 1,
                            min_length: 1,
                            max_length: 25,
                            placeholder: "Amanhã 14:35 | 24/06/2022 14:30 | 1d 20m 30s",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "prize",
                            label: "Qual é o prêmio?",
                            style: 2,
                            min_length: 5,
                            max_length: 1024,
                            placeholder: "Uma paçoca",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "requires",
                            label: "Requisitos? Se sim, quais?",
                            style: 2,
                            min_length: 5,
                            max_length: 1024,
                            placeholder: "Dar likes para @maria e estar no servidor a 5 dias"
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "imageURL",
                            label: "Quer alguma imagem no sorteio?",
                            style: 1,
                            placeholder: "https://i.imgur.com/aGaDNeL.jpeg"
                        }
                    ]
                }
            ]
        }

        return await interaction.showModal(modal)

    }

    async function newReactionRole() {

        let member = guild.members.cache.get(user.id)
        if (!member) return

        let perms = member.permissions.toArray() || []

        if (!perms.includes('MANAGE_ROLES') && !perms.includes('ADMINISTRATOR'))
            return await interaction.reply({
                content: '❌ | Você não tem permissão para mexer no sistema de reaction roles.',
                ephemeral: true
            })

        const modal = {
            title: "Reaction Role Create",
            custom_id: "reactionRoleCreateModal",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "roleData",
                            label: "ID ou nome exato do cargo",
                            style: 1,
                            min_length: 1,
                            max_length: 100,
                            placeholder: "123456789123456789 | Cor Azul | Viajante",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "roleTitle",
                            label: "Título para o cargo",
                            style: 1,
                            min_length: 1,
                            max_length: 25,
                            placeholder: "Novidades e Notificações | Sorteios e Prêmios",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "roleDescription",
                            label: "Descrição da Reaction Role",
                            style: 1,
                            min_length: 0,
                            max_length: 50,
                            placeholder: "Novidades e Notificações | Sorteios e Prêmios"
                        }
                    ]
                }
            ]
        }

        let guildData = await Database.Guild.findOne({ id: guild.id }, 'ReactionRole'),
            collections = guildData?.ReactionRole || []

        if (!collections || collections.length === 0)
            return await interaction.reply({
                content: '❌ | Este servidor não possui nenhuma coleção de reaction role. Você pode criar uma clicando em "Collection" no menu de opções.',
                ephemeral: true
            }).catch(() => { })

        return await interaction.showModal(modal)

    }

    async function reportTransactions() {

        const modal = {
            title: "Transactions Report Center",
            custom_id: "trasactionsModalReport",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "text",
                            label: "Explique o que aconteceu",
                            style: 2,
                            min_length: 10,
                            max_length: 1024,
                            placeholder: "Na data [xx/xx/xxxx xx:xx] está escrito undefined.",
                            required: true
                        }
                    ]
                } // MAX: 5 Fields
            ]
        }

        return await interaction.showModal(modal)

    }

    async function letterReport() {

        const modal = {
            title: "Report Letter Content",
            custom_id: "lettersReport",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "letterId",
                            label: "Informe o ID da carta",
                            style: 1,
                            max_length: 7,
                            max_length: 7,
                            placeholder: "ABC1234",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "reason",
                            label: "Qual é o motivo da sua denúncia?",
                            style: 2,
                            min_length: 10,
                            max_length: 1024,
                            placeholder: "O autor da carta me xingou...",
                            required: true
                        }
                    ]
                }
            ]
        }

        return await interaction.showModal(modal)
    }

    async function sendNewLetter() {

        let data = await Database.User.findOne({ id: user.id }, 'Balance Slot.Cartas Timeouts.Letter'),
            cartas = data?.Slot?.Cartas || 0,
            Timer = data?.Timeouts?.Letter || 0

        if (!data) {
            Database.registerUser(user)

            return await interaction.reply({
                content: '❌ | Nenhum dado foi encontrado no banco de dados. Tente novamente.',
                ephemeral: true
            })
        }

        if (cartas <= 0)
            return await interaction.reply({
                content: '❌ | Você não possui nenhuma carta. Que tal comprar umas na loja?',
                ephemeral: true
            })

        if (client.Timeout(900000, Timer))
            return await interaction.reply({
                content: `⏱️ | Letters System Cooldown | Tempo restante para o envio de uma próxima carta: \`${client.GetTimeout(900000, Timer)}\``,
                ephemeral: true
            })

        const modal = {
            title: `${client.user.username}'s Letters System`,
            custom_id: "newLetter",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "username",
                            label: "Para quem é a carta?",
                            style: 1,
                            min_length: 2,
                            max_length: 37,
                            placeholder: "Nome, Nome#0000 ou ID",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "anonymous",
                            label: "Está é um carta anonima?",
                            style: 1,
                            min_length: 3,
                            max_length: 3,
                            placeholder: "Sim | Não",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "letterContent",
                            label: "Escreva sua carta",
                            style: 2,
                            min_length: 10,
                            max_length: 1024,
                            placeholder: "Em um dia, eu te vi na rua, foi quando...",
                            required: true
                        }
                    ]
                }
            ]
        }

        return await interaction.showModal(modal)

    }

    async function refreshReactionRole(val) {
        await interaction.update({})
        let member = guild.members.cache.get(user.id)
        if (!member) return

        let perms = member.permissions.toArray() || []

        if (!perms.includes('MANAGE_ROLES') && !perms.includes('ADMINISTRATOR'))
            return await interaction.followUp({
                content: '❌ | Você não tem permissão para mexer no sistema de reaction roles.',
                ephemeral: true
            })

        let value = val.replace(/refreshReactionRole /g, '')

        let data = await Database.Guild.findOne({ id: guild.id }, 'ReactionRole'),
            ReactionRoleData = data?.ReactionRole || [],
            collection = ReactionRoleData?.find(coll => coll.name === value)

        if (!ReactionRoleData || ReactionRoleData.length === 0)
            return await interaction.followUp({
                content: '❌ | Este servidor não possui nenhuma coleção de reaction role.',
                ephemeral: true
            })

        if (!collection)
            return await interaction.followUp({ content: `❌ | Coleção não encontrada` })

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
            value: `refreshReactionRole ${value}`
        })

        let embed = { color: client.blue, title: collection.embedTitle || `Cargos da Coleção ${collection.name}` }

        let mapResult = collection.rolesData.map(data => `${getEmoji(data.emoji, guild)}${guild.roles.cache.get(data.roleId) || 'Not Found'}` || '\`Cargo não encontrado\`').join('\n')

        embed.description = mapResult || '> *Esta coleção não possui nenhum cargo*'

        return message.edit({ components: [selectMenuObject], embeds: [embed] })
            .then(async () => {
                return await interaction.followUp({
                    content: '✅ | Refresh realizado com sucesso!',
                    embeds: [],
                    components: [],
                    ephemeral: true
                }).catch(() => { })
            })
            .catch(async err => {
                return await interaction.followUp({
                    content: `❌ | O lançamento falhou.\n> \`${err}\``,
                    embeds: [],
                    components: [],
                    ephemeral: true
                }).catch(() => { })
            })
    }

    async function deleteReaction(roleId, collectionName) {
        if (!collectionName || !roleId) return

        await Database.Guild.updateOne(
            { id: guild.id, ['ReactionRole.name']: collectionName },
            { $pull: { [`ReactionRole.$.rolesData`]: { roleId: roleId } } }
        )
    }

    async function newCollectionReactionRole() {

        let data = await Database.Guild.findOne({ id: guild.id }, 'ReactionRole'),
            collections = data?.ReactionRole || []

        if (collections?.length >= 20)
            return await interaction.reply({
                content: '❌ | O limite é de 20 coleções de reaction roles por servidor. *(Por enquanto)*',
                ephemeral: true
            })

        const modal = {
            title: "New Reaction Roles Collection",
            custom_id: "newCollectionReactionRoles",
            components: [
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "name",
                            label: "Qual o nome da sua nova coleção?",
                            style: 1,
                            min_length: 1,
                            max_length: 20,
                            placeholder: "Cores",
                            required: true
                        }
                    ]
                }, // MAX: 5 Fields
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "embedTitle",
                            label: "Título de apresentação",
                            style: 1,
                            min_length: 1,
                            max_length: 256,
                            placeholder: "Selecione a cor do seu nome",
                            required: true
                        }
                    ]
                },
                {
                    type: 1,
                    components: [
                        {
                            type: 4,
                            custom_id: "uniqueSelection",
                            label: "Esta coleção pode entregar mais de 1 cargo?",
                            style: 1,
                            min_length: 3,
                            max_length: 3,
                            placeholder: "sim | não",
                            required: true
                        }
                    ]
                } // MAX: 5 Fields
            ]
        }

        return await interaction.showModal(modal)
    }

}

module.exports = selectMenuFunctions