
const { e } = require('../../../database/emojis.json')

module.exports = {
    name: `serverinfo`,
    aliases: ['si', 'infoserver', 'guildinfo', 'guildstats', 'serverstats'],
    category: 'servidor',
    ClientPermissions: ['VIEW_GUILD_INSIGHTS', 'MANAGE_GUILD'],
    emoji: `${e.Info}`,
    usage: 'serverinfo',
    description: "Informações sobre o servidor",

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let icon = message.guild.iconURL({ dynamic: true })
        let AfkChannel = `<#${message.guild.afkChannelId}>`
        if (AfkChannel === `<#null>` || AfkChannel === undefined) AfkChannel = "Não possui"

        let data = message.guild.createdAt
        let DataFormatada = ((data.getDate())) + "/" + ((data.getMonth() + 1)) + "/" + data.getFullYear() + " ás " + data.getHours() + "h " + data.getMinutes() + 'm e ' + data.getSeconds() + 's'

        let DataDoBot = message.guild.joinedAt
        let BotEntrou = ((DataDoBot.getDate())) + "/" + ((DataDoBot.getMonth() + 1)) + "/" + DataDoBot.getFullYear() + " as " + data.getHours() + "h " + data.getMinutes() + 'm e ' + data.getSeconds() + 's'

        let Notifications = message.guild.defaultMessageNotifications
        if (Notifications === 'ONLY_MENTIONS') Notifications = 'Apenas @menções'
        if (Notifications === 'ALL_MESSAGES') Notifications = 'Todas as mensagens'

        let Emojis = message.guild.emojis.cache.size
        if (Emojis === 0) Emojis = 0

        let ConteudoExplicito = message.guild.explicitContentFilter
        if (ConteudoExplicito === 'DISABLED') ConteudoExplicito = 'Desativado'
        if (ConteudoExplicito === 'ALL_MEMBERS') ConteudoExplicito = 'Ativo para todos os membros'
        if (ConteudoExplicito === 'MEMBERS_WITHOUT_ROLES') ConteudoExplicito = 'Ativo para membros sem cargos'

        let LevelVerification = message.guild.verificationLevel
        if (LevelVerification === 'NONE') LevelVerification = 'Nenhum'
        if (LevelVerification === 'LOW') LevelVerification = 'Baixo'
        if (LevelVerification === 'MEDIUM') LevelVerification = 'Médio'
        if (LevelVerification === 'HIGH') LevelVerification = 'Alta'
        if (LevelVerification === 'VERY_HIGH') LevelVerification = 'Mais Alta'

        let LevelNSFW = message.guild.nsfwLevel
        if (LevelNSFW === 'DEFAULT') LevelNSFW = 'Padrão'
        if (LevelNSFW === 'EXPLICIT') LevelNSFW = 'Explícito'
        if (LevelNSFW === 'SAFE') LevelNSFW = 'Seguro'
        if (LevelNSFW === 'AGE_RESTRICTED') LevelNSFW = 'Restrição de Idade'

        let parceiro = message.guild.partnered
        if (parceiro === false) parceiro = 'Não'
        if (parceiro === true) parceiro = 'Sim'

        let Tier = message.guild.premiumTier
        if (Tier === 'NONE') Tier = 'Nenhum'
        if (Tier === 'TIER_1') Tier = 'Tier 1'
        if (Tier === 'TIER_2') Tier = 'Tier 2'
        if (Tier === 'TIER_3') Tier = 'Tier 3'

        let Description = message.guild.description
        if (Description === null) Description = 'Não há descrição'

        let CanalDeUpdates = `<#${message.guild.publicUpdatesChannelId}>`
        if (CanalDeUpdates === `<#null>`) CanalDeUpdates = 'Não possui'

        let CanalDeRegras = `<#${message.guild.rulesChannelId}>`
        if (CanalDeRegras === `<#null>`) CanalDeRegras = 'Não possui'

        let CanalDoSistema = `<#${message.guild.systemChannelId}>`
        if (CanalDoSistema === `<#null>`) CanalDoSistema = 'Não possui'

        let Verificado = message.guild.verified
        if (Verificado === false) Verificado = 'Não'
        if (Verificado === true) Verificado = 'Sim'

        const embed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`${e.Info} Servidor: ${message.guild.name}`)
            .addFields(
                {
                    name: `${e.OwnerCrow} Dono(a)`,
                    value: `<@${message.guild.ownerId}> *\`${message.guild.ownerId}\`*`
                },
                {
                    name: `💬 Canais`,
                    value: `Updates Público: ${CanalDeUpdates}\nRegras: ${CanalDeRegras}\nMensagem do Sistema: ${CanalDoSistema}\nAFK: ${AfkChannel}\nTempo para AFK: ${message.guild.afkTimeout / 60} Minutos`
                },
                {
                    name: `${e.Info} Informações`,
                    value: `Criado em: ${DataFormatada}\nID: *\`${message.guild.id}\`*\nNivel de Verificação: ${LevelVerification}\nVerificado: ${Verificado}\nNotificações: ${Notifications}\nFiltro de Conteúdo Explícito: ${ConteudoExplicito}\nEu entrei em: ${BotEntrou}\nFiltro NSFW: ${LevelNSFW}\nParceiro: ${parceiro}\nBoosts: ${message.guild.premiumSubscriptionCount}\nTier: ${Tier}`
                },
                {
                    name: `📊 Contagem`,
                    value: `${message.guild.channels.cache.size} Canais\n${message.guild.memberCount} Membros\n${Emojis} Emojis\n${message.guild.roles.cache.size} Cargos\n${message.guild.bans.cache.size} Banidos\nSuporte até: ${message.guild.maximumMembers} Membros`
                },
                {
                    name: `📝 Descrição do Servidor`,
                    value: `${Description}`
                }
            )

        if (icon) { embed.setThumbnail(`${message.guild.iconURL({ dynamic: true })}`) }

        message.reply({ embeds: [embed] })
    }
}