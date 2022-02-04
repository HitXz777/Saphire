const { DatabaseObj, ServerDb, db } = require('../../Routes/functions/database'),
    { e, config } = DatabaseObj,
    { MessageEmbed, Permissions } = require('discord.js'),
    { RegisterServer } = require('../../Routes/functions/register'),
    client = require('../../index')

client.on("guildCreate", async (guild) => {

    let blacklistServers = db.get(`BlacklistServers_${guild.id}`)
    if (blacklistServers) {
        SendAdder()
        return guild.leave().catch(async err => {
            return await client.cache.get(config.owner).send(`${e.Deny} | Não foi possível sair da ${guild.id} \`${guild.id}\` que está na blacklist.\n\`${err}\``).catch(() => { })
        })
    }

    // Envia uma mensagem no primeiro canal que tem permissão
    Hello();

    // Avisa no servidor principal o nome/id/link do servidor em que foi adicionada
    WarnGuildCreate();

    // Manda uma mensagem pra quem adicionou o bot
    SendAdder();

    // Registra o servidor no banco de dados
    if (!ServerDb.get(`Servers.${guild.id}`)) RegisterServer(guild)

    async function Hello() {
        let FirstMessageChannel = await guild.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me).has(Permissions.FLAGS.SEND_MESSAGES))
        FirstMessageChannel ? FirstMessageChannel.send(`${e.NezukoDance} | Oooie, eu sou a ${client.user.username}.\n${e.SaphireObs} | Meu prefiro padrão é \`-\`, mas pode muda-lo usando \`-prefix NewPrefix\`\n${e.Menhera} | Dá uma olhadinha no \`-help\``).catch(() => { }) : ''
    }

    async function WarnGuildCreate() {
        let owner = await guild.fetchOwner(),
            CanalDeConvite = await guild.channels.cache.find(channel => channel.type === 'GUILD_TEXT' && channel.permissionsFor(guild.me).has(Permissions.FLAGS.CREATE_INSTANT_INVITE)),
            channel = await client.channels.cache.get(config.guildCreateChannelId),
            Register

        if (!channel) return await client.users.cache.get(`${config.ownerId}`).send(`${e.Deny} | Um servidor me adicionou, porém não tem o canal de envio. Servidor: ${guild.name} \`${guild.id}\`.\n\`Linha Code: 32\``).catch(err => { })

        !ServerDb.get(`Servers.${guild.id}`)
            ? Register = `${e.Deny} | Registro no banco de dados indefinido.`
            : Register = `${e.Check} | Registro no banco de dados concluido!`

        const Embed = new MessageEmbed().setColor('GREEN').setTitle(`${e.Loud} Um servidor me adicionou`).setDescription(`${Register}`).addField('Status', `**Dono:** ${owner.user.tag} *\`(${owner.user.id})\`*\n**Membros:** ${guild.memberCount}`)

        async function WithChannel() {
            if (guild.me.permissions.toArray().includes('CREATE_INSTANT_INVITE')) {
                CanalDeConvite.createInvite({ maxAge: 0 }).then(ChannelInvite => {
                    Embed.addField('Servidor', `[${guild.name}](${ChannelInvite.url}) *\`(${guild.id})\`*`)
                    channel.send({ embeds: [Embed] }).catch(async err => {
                        return client.users.cache.get(`${config.ownerId}`).send(`${e.Deny} | Erro ao registrar um servidor no canal definido. Servidor: ${guild.id} \`${guild.id}\`.\n\`${err}\`Linha Code: 47`).catch(err => { })
                    })
                })
            } else {
                return WithoutChannel()
            }
        }

        async function WithoutChannel() {
            Embed.addField('Servidor', `${guild.name} *\`(${guild.id})\`*`)
            channel.send({ embeds: [Embed] }).catch(async err => {
                await client.users.cache.get(`${config.ownerId}`).send(`${e.Deny} | Erro ao registrar um servidor no canal definido. Servidor: ${guild.id} \`${guild.id}\`.\n\`${err}\`Linha Code: 55`).catch(err => { })
            })
        }

        CanalDeConvite ? WithChannel() : WithoutChannel()
    }

    async function SendAdder() {
        if (!guild.me.permissions.has(Permissions.FLAGS.VIEW_AUDIT_LOG))
            return

        const fetchedLogs = await guild.fetchAuditLogs({ limit: 1, type: 'BOT_ADD', })
        const guildLog = fetchedLogs.entries.first()
        const { executor, target } = guildLog
        if (!guildLog) return

        if (target.id !== client.user.id || !executor)
            return

        executor.send(`${e.SaphireHi} Oiiee.\n \nJá que foi você que me adicionou no servidor ${guild.name}, quero dizer que você pode personalizar e ativar vários comandos indo no painel \`${config.prefix}help\` na sessão **Configurações** e também em **Servidor**.\n \nQualquer problema, você pode entrar no meu servidor que a Saphire's Team vai te ajudar em tudo.\n \n*Obs: Caso eu tenha saído do servidor, isso quer dizer que o servidor "${guild.name}" está na blacklist.*\n${config.ServerLink}`).catch(() => { })
    }
})