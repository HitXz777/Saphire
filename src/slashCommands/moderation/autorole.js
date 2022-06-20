const client = require('../../../index')
const passCode = require('../../../modules/functions/plugins/PassCode')
const Database = require('../../../modules/classes/Database')
const passWord = passCode(5).toUpperCase()
const util = require('../../structures/util')

Database.Cache.set('autoroleRemovePassword', passWord)

module.exports = {
    name: 'autorole',
    description: '[moderation] Sistema de Autorole',
    dm_permission: false,
    default_member_permissions: util.slashCommandsPermissions.MANAGE_ROLES,
    type: 1,
    options: [
        {
            name: 'add',
            description: '[moderation] Adicione um cargo ao autorole',
            type: 1,
            options: [
                {
                    name: 'role',
                    description: 'Cargo a ser adicionado ao autorole',
                    required: true,
                    type: 8
                }
            ]
        },
        {
            name: 'remove',
            description: '[moderation] Remova um cargo do autorole',
            type: 1,
            options: [
                {
                    name: 'role',
                    description: 'Cargo a ser removido do autorole',
                    required: true,
                    type: 8
                }
            ]
        },
        {
            name: 'information',
            description: '[moderation] Mais informações sobre o autorole',
            type: 1,
            options: [
                {
                    name: 'select',
                    description: '[moderation] Opção de informação',
                    required: true,
                    type: 3,
                    choices: [
                        {
                            name: 'info',
                            value: 'info'
                        },
                        {
                            name: 'status',
                            value: 'status'
                        }
                    ]
                }
            ]
        },
        {
            name: 'disable',
            description: `[moderation] Desative todo o sistema de autorole`,
            type: 1,
            options: [
                {
                    name: 'password',
                    description: passWord,
                    required: true,
                    type: 3
                }
            ]
        },
    ],
    async execute({ interaction: interaction, database: Database, guildData: guildData, emojis: e }) {

        const { options, guild, user } = interaction,
            { Config: config } = Database

        if (!guild.me.permissions.toArray().includes('MANAGE_ROLES'))
            return await interaction.reply({
                content: `${e.Deny} | Eu preciso da permissão **\`GERENCIAR CARGOS\`** para continuar com este comando.`,
                ephemeral: true
            })

        let role = options.getRole('role'),
            information = options.getString('select'),
            password = options.getString('password'),
            addOrRemove = options.getSubcommand()
        rolesId = guildData?.Autorole || [],
            prefix = guildData?.Prefix || client.prefix

        if (information === 'info') return await interaction.reply({
            embeds: [
                {
                    color: client.blue,
                    title: `${e.Verify} Autorole System`,
                    description: `O Sistema ${client.user.username}'s Autorole garante até 10 cargos.`,
                    fields: [
                        {
                            name: `${e.QuestionMark} **O que é Autorole?**`,
                            value: `Autorole é um sistema automático em que todo membro que entrar no servidor, receberá um cargo (dado por mim) pré definido pela staff do servidor.`
                        },
                        {
                            name: `${e.Warn} ATENÇÃO`,
                            value: `\n1. Para perfeito funcionamento, o meu cargo **DEVE** estar **ACIMA** dos cargos definidos.\n \n2. Não é permito cargos com a permissões **administrativas** ativadas. Caso ative pós configuração, o cargo será deletado da configuração autorole na entrada de um novo membro.\n \n3. Cargos em que eu não tenho poder de manusea-los, também serão removidos.`
                        },
                        {
                            name: '• Adicione/Remova cargos',
                            value: `\`/autorole add @cargo\`\n\`/autorole remove @cargo\``,
                            inline: true
                        },
                        {
                            name: '• Comando informativos',
                            value: `\`/autorole inforamtion info\` Este painel de ajuda\n\`/autorole information status\` Status do autorole`,
                            inline: true
                        },
                        {
                            name: `${e.SaphireObs} Forte recomendação`,
                            value: `Ative a função \`${prefix}logs\`.\nLá eu mandarei relatórios se qualquer coisa der errado ou algum bobinho(a) fizer besteira com os cargos.`
                        }
                    ]
                }
            ],
            ephemeral: true
        })

        if (information === 'status') return GetAndSendAutoroleStatus()
        if (addOrRemove === 'remove') return removeAutorole()
        if (addOrRemove === 'add') return AddAutorole()
        if (password) return disableAutorole()

        async function AddAutorole() {

            if (rolesId.length >= 10)
                return await interaction.reply({
                    content: `${e.Deny} | O autorole deste servidor já atingiu o limite máximo de 10 cargos cadastrados.`,
                    ephemeral: true
                })

            if (['@here', '@everyone'].includes(role.name)) {
                const msg = await await interaction.reply({
                    content: `${e.Hmmm}`,
                    fetchReply: true
                })
                return setTimeout(() => msg.edit(`${e.Hmmm} | Olha... Eu não vou nem comentar sob tal atrocidade.`).catch(() => { }), 3000)
            }

            if (role.botRole) return await interaction.reply({
                content: `${e.Deny} | Sério que você quer configurar um cargo de bot como autorole? ${e.SaphireWhat}`,
                ephemeral: true
            })

            if (!role.editable) return await interaction.reply({
                content: `${e.Deny} | Eu não tenho permissão para gerenciar o cargo selecionado.`,
                ephemeral: true
            })

            if (rolesId.includes(role.id)) return await interaction.reply({
                content: `${e.Deny} | O cargo mencionado já foi configurado como autorole.`,
                ephemeral: true
            })

            let member = guild.members.cache.get(user.id)
            if (user.id !== guild.ownerId && role.comparePositionTo(member.roles.highest) > -1) return await interaction.reply({
                content: `${e.Deny} | Você não tem permissão para gerenciar este cargo.`,
                ephemeral
            })

            const RolePermissions = role?.permissions.toArray() || [],
                BlockPermissionsArray = ['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_GUILD', 'MANAGE_MESSAGES', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'ADMINISTRATOR', 'MODERATE_MEMBERS'],
                responsePerms = []

            for (let perm of BlockPermissionsArray)
                if (RolePermissions.includes(perm))
                    responsePerms.push(perm)

            if (responsePerms.length > 0)
                return await interaction.reply({
                    content: `${e.Deny} | O cargo ${role} possui as permissões: \`${responsePerms.map(perm => config.Perms[perm]).join(', ')}\`. Para a segurança do servidor, eu não vou adicionar este cargo no autorole.`,
                    ephemeral: true
                })

            const emojis = ['✅', '❌'],
                msg = await await interaction.reply({
                    content: `${e.QuestionMark} | Você deseja configurar o cargo "${role} *\`${role.id}\`*" como autorole?`,
                    fetchReply: true
                })

            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            return msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === user.id,
                time: 30000,
                max: 1,
                errors: ['time', 'max']
            })
                .on('collect', async (reaction) => {

                    if (reaction.emoji.name === emojis[0]) {

                        await Database.Guild.updateOne(
                            { id: guild.id },
                            { $push: { Autorole: role.id } },
                            { upsert: true }
                        )

                        return msg.edit(`${e.Check} | O cargo ${role} foi adicionado e configurado com sucesso no autorole!`).catch(() => { })

                    }

                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })

                })
                .on('end', collected => {

                    msg.reactions.removeAll().catch(() => { })
                    if (collected.size === 0)
                        return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })

                })

        }

        async function disableAutorole() {

            if (password != Database.Cache.get('autoroleRemovePassword'))
                return await interaction.reply({
                    content: `${e.Deny} | Digite o código exato na descrição do comando.`,
                    ephemeral: true
                })

            if (rolesId.length === 0)
                return await interaction.reply({
                    content: `${e.Deny} | Este servidor não possui nenhum autorole configurado.`,
                    ephemeral: true
                })

            const emojis = ['✅', '❌'],
                msg = await interaction.reply({
                    content: `${e.QuestionMark} | Você tem certeza em desativar o autorole? | \`${rolesId.length} cargos configurados\``,
                    fetchReply: true
                })

            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            return msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === user.id,
                time: 30000,
                max: 1,
                errors: ['time', 'max']
            })
                .on('collect', async (reaction) => {

                    if (reaction.emoji.name === emojis[0]) {

                        await Database.Guild.updateOne(
                            { id: guild.id },
                            { $unset: { Autorole: 1 } }
                        )

                        return msg.edit(`${e.Check} | O autorole foi desativado com sucesso!`).catch(() => { })

                    }

                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })

                })
                .on('end', collected => {

                    msg.reactions.removeAll().catch(() => { })
                    if (collected.size === 0)
                        return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                })

        }

        async function removeAutorole() {

            if (rolesId.length <= 0)
                return await interaction.reply({
                    content: `${e.Deny} | O autorole deste servidor não possui nenhum cargo definido.`,
                    ephemeral: true
                })

            if (!rolesId.includes(role.id))
                return await interaction.reply({
                    content: `${e.Deny} | Este cargo não foi configurado como autorole.`,
                    ephemeral: true
                })

            const emojis = ['✅', '❌'],
                msg = await interaction.reply({
                    content: `${e.QuestionMark} | Você deseja remover o cargo "${role} *\`${role.id}\`*" do autorole?`,
                    fetchReply: true
                })

            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            return msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === user.id,
                time: 30000,
                max: 1,
                errors: ['time', 'max']
            })
                .on('collect', async (reaction) => {

                    if (reaction.emoji.name === emojis[0]) {

                        await Database.Guild.updateOne(
                            { id: guild.id },
                            { $pull: { Autorole: role.id } }
                        )

                        return msg.edit(`${e.Check} | O cargo ${role} foi removido do autorole com sucesso!`).catch(() => { })

                    }

                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })

                })
                .on('end', collected => {
                    msg.reactions.removeAll().catch(() => { })
                    if (collected.size === 0)
                        return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                })
        }

        async function GetAndSendAutoroleStatus() {

            let validate = []

            for (const id of rolesId)
                validate.includes(id) ? DeleteRole(id) : validate.push(id)

            const RolesMapped = validate.map((roleId, i) => {

                let Cargo = guild.roles.cache.get(`${roleId}`)
                if (!Cargo) DeleteRole(roleId)

                return Cargo ? `${i + 1}. ${Cargo}` : `${i + 1} ${e.Deny} | Cargo não encontrado. (Removido da Database)`

            }).join('\n')

            return await interaction.reply({
                embeds: [
                    {
                        color: client.blue,
                        title: '📡  | Autorole System Status',
                        description: RolesMapped || 'Nenhum cargo foi configurado ainda'
                    }
                ]
            })

        }

        async function DeleteRole(roleId) {

            await Database.Guild.updateOne(
                { id: guild.id },
                { $pull: { Autorole: roleId } }
            )
            return
        }

    }
}