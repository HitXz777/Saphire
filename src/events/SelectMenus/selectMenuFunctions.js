const Database = require('../../../modules/classes/Database'),
    { Config: config, Emojis: e } = Database,
    { newReminder } = require('../plugins/modalPlugins')

async function selectMenuFunctions(interaction, client) {

    const { customId, values, message, user, guild, channel } = interaction

    let value = values[0]

    if (customId === 'reactionRole') return reactionRole()

    switch (value) {
        case 'newGiveaway': newGiveaway(); break;
        case 'newReminder': newReminder(interaction); break;
        case 'sendNewLetter': sendNewLetter(); break;
        case 'report': letterReport(); break;
        case 'reportTransactions': reportTransactions(); break;
        case 'newReactionRole': newReactionRole(); break;
        default: break;
    }

    return

    async function reactionRole() {

        if (value === 'refreshReactionRole' || values.includes('refreshReactionRole')) return refreshReactionRole()

        let permsArray = guild.me.permissions.toArray() || []

        if (!permsArray.includes('MANAGE_ROLES') && !permsArray.includes('ADMINISTRATOR'))
            return await interaction.reply({
                content: '❌ | Eu não tenho a permissão **Gerenciar Cargos** ativada. A adição de cargo está suspensa.',
                ephemeral: true
            })

        let msgConfirmation = 'ℹ | Feedback'

        for (let roleId of values)
            await addRole(roleId)

        function addRole(roleId) {

            let role = guild.roles.cache.get(roleId),
                member = guild.members.cache.get(user.id)

            if (!role)
                return msgConfirmation += `\n⚠️ | ${role?.name || 'NOT FOUND'} - **ERRO**`

            if (!role.editable) {
                deleteReaction(roleId)
                return msgConfirmation += `\n⚠️ | ${role?.name || 'NOT FOUND'} - **Não posso manusear este cargo.**`
            }

            const RolePermissions = role?.permissions.toArray() || [],
                BlockPermissionsArray = ['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_GUILD', 'MANAGE_MESSAGES', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'ADMINISTRATOR', 'MODERATE_MEMBERS']

            if (member.roles.cache.has(roleId)) {
                member.roles.remove(role)
                    .catch(() => msgConfirmation += `\n⚠️ | ${role || 'NOT FOUND'} - **ERRO**`)

                return msgConfirmation += `\n❌ | ${role || 'NOT FOUND'} - **REMOVIDO**`

            } else {

                for (const perm of RolePermissions)
                    if (BlockPermissionsArray.includes(perm)) {
                        deleteReaction(roleId)
                        return msgConfirmation += `\n❌ | ${role || 'NOT FOUND'} - Este cargo possui a permissão **${config.Perms[perm]}** ativada. Adição ignorada.`
                    }

                member.roles.add(role)
                    .catch(() => msgConfirmation += `\n⚠️ | ${role || 'NOT FOUND'} - **ERRO**`)

                return msgConfirmation += `\n✅ | ${role || 'NOT FOUND'} - **ADICIONADO**`
            }

        }

        return await interaction.reply({
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
                }, // MAX: 5 Fields
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
                }, // MAX: 5 Fields
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
                }, // MAX: 5 Fields
            ]
        }

        let guildData = await Database.Guild.findOne({ id: guild.id }, 'ReactionRole'),
            roles = guildData?.ReactionRole || []

        if (roles.length >= 24)
            return await interaction.reply({
                content: '❌ | O limite é de 24 Reaction Roles por servidor.',
                ephemeral: true
            })

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

    async function refreshReactionRole() {

        let member = guild.members.cache.get(user.id)
        if (!member) return

        let perms = member.permissions.toArray() || []

        if (!perms.includes('MANAGE_ROLES') && !perms.includes('ADMINISTRATOR'))
            return await interaction.reply({
                content: '❌ | Você não tem permissão para mexer no sistema de reaction roles.',
                ephemeral: true
            })

        message.delete().catch(() => { })

        let data = await Database.Guild.findOne({ id: guild.id }, 'ReactionRole'),
            ReactionRoleData = data?.ReactionRole || []

        if (!ReactionRoleData || ReactionRoleData.length === 0)
            return await interaction.reply({
                content: `${e.Deny} | Este servidor não possui nenhuma reaction role configurada.`,
                ephemeral: true
            })

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

        return channel.send({ components: [selectMenuObject] })
            .then(async () => {
                return await interaction.reply({
                    content: `✅ | Reaction role atualizado com sucesso!`,
                    ephemeral: true
                })
            })
            .catch(async err => {
                return await interaction.reply({
                    content: `❌ | Erro ao atualizar o reaction role: \`${err}\``,
                    ephemeral: true
                })
            })
    }

    async function deleteReaction(roleId) {
        return await Database.Guild.updateOne(
            { id: guild.id },
            {
                $pull: {
                    ReactionRole: {
                        roleId: roleId
                    }
                }
            }
        )
    }
}

module.exports = selectMenuFunctions