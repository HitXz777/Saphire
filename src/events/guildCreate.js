const { DatabaseObj: { e, config } } = require('../../modules/functions/plugins/database'),
    { MessageEmbed, Permissions } = require('discord.js'),
    client = require('../../index'),
    Database = require('../../modules/classes/Database')

client.on("guildCreate", async (guild) => {

    let clientData = await Database.Client.findOne({ id: client.user.id }, 'Blacklist'),
        blacklistServers = clientData?.Blacklist?.Guilds || []

    if (blacklistServers.some(data => data?.id === guild.id))
        return guild.leave().catch(async err => client.users.cache.get(config.ownerId).send(`${e.Deny} | Não foi possível sair da ${guild.id} \`${guild.id}\` que está na blacklist.\n\`${err}\``).catch(() => { }))

    let server = await Database.Guild.findOne({ id: guild.id })
    if (!server) await Database.registerServer(guild, client)

    Hello()
    WarnGuildCreate()
    SendAdder()

    async function Hello() {
        let FirstMessageChannel = await guild.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me).has(Permissions.FLAGS.SEND_MESSAGES))
        FirstMessageChannel ? FirstMessageChannel.send(`${e.NezukoDance} | Oooie, eu sou a ${client.user.username}.\n${e.SaphireObs} | Meu prefiro padrão é \`-\`, mas pode muda-lo usando \`-prefix NewPrefix\`\n${e.Menhera} | Dá uma olhadinha no \`-help\``).catch(() => { }) : ''
    }

    async function WarnGuildCreate() {

        let owner = await guild.fetchOwner(),
            CanalDeConvite = guild.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me).has(Permissions.FLAGS.CREATE_INSTANT_INVITE)),
            channel = client.channels.cache.get(config.guildCreateChannelId),
            Register,
            databaseGuilds = await Database.Guild.find({})

        if (!channel) return client.users.cache.get(`${config.ownerId}`).send(`${e.Deny} | Um servidor me adicionou, porém não tem o canal de envio. Servidor: ${guild.name} \`${guild.id}\`.\n\`Linha Code: 32\``).catch(err => { })

        Register = databaseGuilds.some(g => g.id === guild.id)
            ? `${e.Database} | DATABASE | Registro no banco de dados concluido!`
            : `${e.Database} | DATABASE | Registro no banco de dados indefinido.`

        const Embed = new MessageEmbed().setColor('GREEN').setTitle(`${e.Loud} Um servidor me adicionou`).setDescription(`${Register}`).addField('Status', `**Dono:** ${owner.user.tag} *\`(${owner.user.id})\`*\n**Membros:** ${guild.memberCount}`)

        async function WithChannel() {
            CanalDeConvite.createInvite({ maxAge: 0 }).then(ChannelInvite => {
                Embed.addField('Servidor', `[${guild.name}](${ChannelInvite.url}) *\`(${guild.id})\`*`)
                channel.send({ embeds: [Embed] }).catch(async err => {
                    await client.users.cache.get(`${config.ownerId}`).send(`${e.Deny} | Erro ao registrar um servidor no canal definido. Servidor: ${guild.id} \`${guild.id}\`.\n\`${err}\`Linha Code: 47`).catch(err => { })
                })
            }).catch(() => { WithoutChannel() })
        }

        async function WithoutChannel() {
            Embed.addField('Servidor', `${guild.name} *\`(${guild.id})\`*`)
            channel.send({ embeds: [Embed] }).catch(async err => {
                await client.users.cache.get(`${config.ownerId}`).send(`${e.Deny} | Erro ao registrar um servidor no canal definido. Servidor: ${guild.id} \`${guild.id}\`.\n\`${err}\`Linha Code: 55`).catch(err => { })
            })
        }

        return CanalDeConvite ? WithChannel() : WithoutChannel()
    }

    async function SendAdder() {
        if (!guild.me.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG))
            return

        const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type: 'BOT_ADD', }),
            guildLog = fetchedLogs.entries.first()

        if (!guildLog) return

        let { executor, target } = guildLog


        if (target.id !== client.user.id || !executor)
            return

        return executor.send(`${e.SaphireHi} Oiiee.\n \nJá que foi você que me adicionou no servidor ${guild.name}, quero dizer que você pode personalizar e ativar vários comandos indo no painel \`${config.prefix}help\` na sessão **Configurações** e também em **Servidor**.\n \nQualquer problema, você pode entrar no meu servidor que a Saphire's Team vai te ajudar em tudo.\n \n*Obs: Caso eu tenha saído do servidor, isso quer dizer que o servidor "${guild.name}" está na blacklist.*\n${config.SupportServerLink}`).catch(() => { })
    }
})