
const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: `serverinfo`,
    aliases: ['si', 'infoserver', 'guildinfo', 'guildstats', 'serverstats'],
    category: 'servidor',
    ClientPermissions: ['VIEW_GUILD_INSIGHTS', 'MANAGE_GUILD'],
    emoji: `${e.Info}`,
    usage: 'serverinfo',
    description: "Informações sobre o servidor",

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let guild = client.guilds.cache.get(args[0]) || message.guild

        if (args[0] && !client.guilds.cache.get(args[0]))
            return message.reply(`${e.Deny} | Eu não achei nenhum servidor com esse ID.`)

        let icon = guild.iconURL({ dynamic: true })
        let AfkChannel = `<#${guild.afkChannelId}>`
        if (AfkChannel === `<#null>` || AfkChannel === undefined) AfkChannel = "Não possui"

        let data = guild.createdAt
        let DataFormatada = ((data.getDate())) + "/" + ((data.getMonth() + 1)) + "/" + data.getFullYear() + " ás " + data.getHours() + "h " + data.getMinutes() + 'm e ' + data.getSeconds() + 's'

        let DataDoBot = guild.joinedAt
        let BotEntrou = ((DataDoBot.getDate())) + "/" + ((DataDoBot.getMonth() + 1)) + "/" + DataDoBot.getFullYear() + " as " + data.getHours() + "h " + data.getMinutes() + 'm e ' + data.getSeconds() + 's'

        let Notifications = guild.defaultMessageNotifications
        if (Notifications === 'ONLY_MENTIONS') Notifications = 'Apenas @menções'
        if (Notifications === 'ALL_MESSAGES') Notifications = 'Todas as mensagens'

        let Emojis = guild.emojis.cache.size
        if (Emojis === 0) Emojis = 0

        let ConteudoExplicito = guild.explicitContentFilter
        if (ConteudoExplicito === 'DISABLED') ConteudoExplicito = 'Desativado'
        if (ConteudoExplicito === 'ALL_MEMBERS') ConteudoExplicito = 'Ativo para todos os membros'
        if (ConteudoExplicito === 'MEMBERS_WITHOUT_ROLES') ConteudoExplicito = 'Ativo para membros sem cargos'

        let LevelVerification = guild.verificationLevel
        if (LevelVerification === 'NONE') LevelVerification = 'Nenhum'
        if (LevelVerification === 'LOW') LevelVerification = 'Baixo'
        if (LevelVerification === 'MEDIUM') LevelVerification = 'Médio'
        if (LevelVerification === 'HIGH') LevelVerification = 'Alta'
        if (LevelVerification === 'VERY_HIGH') LevelVerification = 'Mais Alta'

        let LevelNSFW = guild.nsfwLevel
        if (LevelNSFW === 'DEFAULT') LevelNSFW = 'Padrão'
        if (LevelNSFW === 'EXPLICIT') LevelNSFW = 'Explícito'
        if (LevelNSFW === 'SAFE') LevelNSFW = 'Seguro'
        if (LevelNSFW === 'AGE_RESTRICTED') LevelNSFW = 'Restrição de Idade'

        let parceiro = guild.partnered
        if (parceiro === false) parceiro = 'Não'
        if (parceiro === true) parceiro = 'Sim'

        let Tier = guild.premiumTier
        if (Tier === 'NONE') Tier = 'Nenhum'
        if (Tier === 'TIER_1') Tier = 'Tier 1'
        if (Tier === 'TIER_2') Tier = 'Tier 2'
        if (Tier === 'TIER_3') Tier = 'Tier 3'

        let Description = guild.description
        if (Description === null) Description = 'Não há descrição'

        let CanalDeUpdates = `<#${guild.publicUpdatesChannelId}>`
        if (CanalDeUpdates === `<#null>`) CanalDeUpdates = 'Não possui'

        let CanalDeRegras = `<#${guild.rulesChannelId}>`
        if (CanalDeRegras === `<#null>`) CanalDeRegras = 'Não possui'

        let CanalDoSistema = `<#${guild.systemChannelId}>`
        if (CanalDoSistema === `<#null>`) CanalDoSistema = 'Não possui'

        let Verificado = guild.verified
        if (Verificado === false) Verificado = 'Não'
        if (Verificado === true) Verificado = 'Sim'

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`${e.Info} Servidor: ${guild.name}`)
            .addFields(
                {
                    name: `${e.OwnerCrow} Dono(a)`,
                    value: `<@${guild.ownerId}> *\`${guild.ownerId}\`*`
                },
                {
                    name: `💬 Canais`,
                    value: `Updates Público: ${CanalDeUpdates}\nRegras: ${CanalDeRegras}\nMensagem do Sistema: ${CanalDoSistema}\nAFK: ${AfkChannel}\nTempo para AFK: ${guild.afkTimeout / 60} Minutos`
                },
                {
                    name: `${e.Info} Informações`,
                    value: `Criado em: ${DataFormatada}\nID: *\`${guild.id}\`*\nNivel de Verificação: ${LevelVerification}\nVerificado: ${Verificado}\nNotificações: ${Notifications}\nFiltro de Conteúdo Explícito: ${ConteudoExplicito}\nEu entrei em: ${BotEntrou}\nFiltro NSFW: ${LevelNSFW}\nParceiro: ${parceiro}\nBoosts: ${guild.premiumSubscriptionCount}\nTier: ${Tier}`
                },
                {
                    name: `📊 Contagem`,
                    value: `${guild.channels.cache.size} Canais\n${guild.memberCount} Membros\n${Emojis} Emojis\n${guild.roles.cache.size} Cargos\n${guild.bans.cache.size} Banidos\nSuporte até: ${guild.maximumMembers} Membros`
                },
                {
                    name: `📝 Descrição do Servidor`,
                    value: `${Description}`
                }
            )

        if (icon) { embed.setThumbnail(`${guild.iconURL({ dynamic: true })}`) }

        message.reply({ embeds: [embed] })
    }
}