module.exports = {
    name: 'User Info',
    dm_permission: false,
    type: 2,
    async execute({ interaction: interaction, client: client, database: Database, emojis: e }) {

        const { targetId, guild, user: author } = interaction,
            Data = require('../../../modules/functions/plugins/data'),
            { Config: config } = Database,
            Colors = require('../../../modules/functions/plugins/colors')

        let user = client.users.cache.get(targetId),
            member = guild.members.cache.get(user.id),
            userData = {},
            memberData = {},
            flags = {
                DISCORD_EMPLOYEE: 'Empregado do Discord',
                DISCORD_PARTNER: 'Parceiro do Discord',
                HYPESQUAD_EVENTS: 'HypeSquad Events',
                HOUSE_BRAVERY: 'House of Bravery',
                HOUSE_BRILLIANCE: 'House of Brilliance',
                HOUSE_BALANCE: 'House of Balance',
                EARLY_SUPPORTER: 'Apoiador inicial',
                TEAM_USER: 'Usuário de Time',
                SYSTEM: 'Sistema',
                VERIFIED_BOT: 'Bot Verificado',
                VERIFIED_DEVELOPER: 'Verified Bot Developer',
                BOT_HTTP_INTERACTIONS: 'Bot de Interação HTTP'
            }

        let userflags = user?.flags?.toArray() || []
        userData.Bandeiras = `${userflags.length > 0 ? userflags.map(flag => `\`${flags[flag] ? flags[flag] : flag}\``).join(', ') : 'Nenhuma'}`
        userData.system = user.system ? '\n🧑‍💼 `\`Usuário do Sistema\``' : ''
        userData.avatar = user.avatarURL({ dynamic: true, format: "png", size: 1024 })
        userData.bot = user.bot ? '\`Sim\`' : '\`Não\`'
        userData.createAccount = Data(user.createdAt.getTime(), false, false)
        userData.timeoutAccount = client.formatTimestamp(user.createdAt.getTime())

        if (member) {
            memberData.joinedAt = Data(member.joinedAt.getTime(), false, false)
            memberData.joinedTimestamp = client.formatTimestamp(member.joinedAt.getTime())
            memberData.onwer = (guild.ownerId === user.id) ? '\`Sim\`' : '\`Não\`'
            memberData.adm = member.permissions.toArray().includes('ADMINISTRATOR') ? '\`Sim\`' : '\`Não\`'
            memberData.associado = member.pending ? '\`Não\`' : '\`Sim\`'
            memberData.premiumSince = member.premiumSinceTimestamp ? `\n${e.Boost} Booster há: \`${client.formatTimestamp(member.premiumSinceTimestamp)}\`` : ''
            memberData.roles = member.roles.cache.filter(r => r.name !== '@everyone').map(r => `\`${r.name}\``).join(', ') || '\`Nenhum cargo\`'
            memberData.permissions = (() => {

                if (user.id === guild.ownerId) return `${user.username} é o dono*(a)* do servidor. Possui todas as permissões.`

                return member.permissions.toArray().map(perm => `\`${config.Perms[perm]}\``).join(', ')
            })()
        }

        let colorData = member ? await Colors(user.id) : client.blue,
            whoIs = user.id === author.id ? 'Suas Informações' : `Informações de ${user.username}`

        let embeds = [
            {
                color: colorData,
                title: `${e.Info} ${whoIs}`,
                description: `Resultado: ${member ? user : user.username}`,
                fields: [
                    {
                        name: '👤 Usuário',
                        value: `✏️ Nome: ${user.tag} | \`${user.id}\`\n🤖 Bot: ${userData.bot}\n🏳️ Bandeiras: ${userData.Bandeiras}${userData.system}\n📆 Criou a conta em: \`${userData.createAccount}\`\n⏱️ Criou a conta faz: \`${userData.timeoutAccount}\``
                    }
                ],
                thumbnail: { url: userData.avatar }
            },
            {
                color: colorData,
                title: `${e.Info} ${guild.name} | ${whoIs}`,
                fields: [
                    {
                        name: '🔰 Servidor',
                        value: `✏️ Nome no servidor: ${member?.displayName}\n${e.OwnerCrow} Dono: ${memberData?.onwer}\n${e.ModShield} Administrador: ${memberData?.adm}\n🎨 Cor: \`${member?.displayHexColor}\`\n🤝 Associado: ${memberData?.associado}${memberData?.premiumSince}\n📅 Entrou em: \`${memberData?.joinedAt}\`\n⏱️ Entrou no servidor faz: \`${memberData?.joinedTimestamp}\``
                    },
                    {
                        name: '@ Cargos',
                        value: memberData?.roles
                    }
                ]
            },
            {
                color: colorData,
                title: `${e.Info} ${whoIs}`,
                fields: [
                    {
                        name: '⚙️ Permissões',
                        value: `${memberData?.permissions}`
                    }
                ]
            }
        ]

        return await interaction.reply({ embeds: embeds, ephemeral: true })

    }
}