const
    data = require('../../modules/functions/plugins/data'),
    { MessageEmbed, Permissions } = require('discord.js'),
    client = require('../../index'),
    { config } = require('../../JSON/config.json'),
    { e } = require('../../JSON/emojis.json'),
    xp = require('../../modules/functions/public/experience'),
    AfkSystem = require('../../modules/functions/public/AfkSystem'),
    Error = require('../../modules/functions/config/errors'),
    Notify = require('../../modules/functions/plugins/notify'),
    Database = require('../../modules/classes/Database'),
    disableAntLinkSystem = require('../../modules/functions/plugins/disableAntLinkSystem')

client.on('messageCreate', async message => {

    if (!message || !message.inGuild() || !message.guild || !message.guild?.id || !message.channel.permissionsFor(message.guild.me).has(Permissions.FLAGS.SEND_MESSAGES) || !message.channel.permissionsFor(message.guild.me).has(Permissions.FLAGS.VIEW_CHANNEL) || !message.guild.me.permissions.has(Permissions.FLAGS.SEND_MESSAGES) || !message.guild.me.permissions.has(Permissions.FLAGS.VIEW_CHANNEL))
        return

    let guild = await Database.Guild.findOne({ id: message.guild.id }, 'Prefix Blockchannels AntLink CommandBlocks'),
        prefix = guild?.Prefix || client.prefix,
        clientData = await Database.Client.findOne({ id: client.user.id }, 'Moderadores Administradores Blacklist Rebooting ComandosBloqueados PremiumServers')

    if (clientData?.Blacklist?.Guilds?.some(data => data?.id === message.guild.id)) {
        message.channel.send(`${e.Deny} | Este servidor está na blacklist. Bye bye, estou me retirando.`)
        message.guild.leave().catch(() => { })
        return
    }

    if (guild?.AntLink && !clientData.PremiumServers?.includes(message.guild.id))
        disableAntLinkSystem(message, true)

    if (guild?.AntLink && !message.member?.permissions?.toArray()?.includes('ADMINISTRATOR') && message.content.replace(/ /g, '').includes('discord.gg')) {

        message.delete().catch(() => {
            return disableAntLinkSystem(message)
        })

        return message.channel.send(`${e.antlink} | ${message.author}, o sistema de antilink está ativado neste servidor.`).then(msg => {
            setTimeout(() => msg.delete().catch(() => { }), 4500)
        })
    }

    if (clientData?.Blacklist?.Users?.some(data => data?.id === message.author.id)) return

    if (message.content.startsWith(prefix) && clientData.Rebooting?.ON)
        return message.reply(`${e.Loading} | Reiniciando em breve...\n${e.BookPages} | ${clientData.Rebooting?.Features || 'Nenhum dado fornecido'}`)

    BlockCommandsBot(message, client.user.id, guild?.Blockchannels)

    if (message.author.bot) return

    if (!guild) Database.registerServer(message.guild, client)
    Database.registerUser(message.author)
    xp(message)
    AfkSystem(message)

    if (message.content?.toLowerCase() === '@saphire' || message.content?.toLowerCase() === 'saphire' || message.content === `<@${client.user.id}>` || message.content === `<@&${client.user.id}>`)
        message.channel.send(`${e.SaphireHi} | \`${prefix}help\`ou \`/\``)

    const
        args = message.content.slice(prefix.length).trim().split(/ +/g),
        cmd = args.shift().toLowerCase()

    if (!message.content.startsWith(prefix) || cmd.length == 0) return
    if (args.join(' ').length > 1500) return message.reply(`${e.Deny} | O limite máximo de caracteres nas mensagens são de 1500 caracteres.`)

    if (!/^[A-Za-z0-9áàâãéèêíïóôõöúçñÁÀÂÃÉÈÍÏÓÔÕÖÚÇÑ ]+$/i.test(cmd))
        return message.reply(`${e.Deny} | Este comando contém caracteres bloqueados pelo meu sistema.`)

    let command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd))

    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) && guild?.Blockchannels?.Channels?.includes(message.channel.id))
        return message.reply(`${e.Deny} | Meus comandos foram bloqueados neste canal.`).then(msg => setTimeout(() => msg.delete().catch(() => { }), 4500))

    if (!command) {
        let didYouMean = await cmd.didYouMean(client.commandsNames()) // Credits: JackSkelt#3063 - 904891162362519562
        let resposta = [`Eu não tenho esse comando não... Que tal usar o \`${prefix}help\` ou o \`/search\` ?`, `Olha... Eu não tenho esse comando não, sabe? Tenta usar o \`${prefix}help\` ou o \`/search\`, lá tem todos os meus comandos.`, `Viiiish, comando desconhecido, foi mal. Usa o \`/search\`, quem sabe?`, `Conheço esse comando aí não... Verifica a ortografia e tenta novamente. Ou pesquise usando o \`/search\``, `Huuum, quer usar o \`${prefix}help\` ou o \`/search\` não?`].random()

        return didYouMean
            ? message.reply(`${e.Info} | Eu acho que você quis dizer \`${prefix}${didYouMean}\`. Mas se não for, tente usar o comando \`/search\``)
            : message.reply(`${e.Deny} | ${resposta}`)
    }

    for (const perm of ['READ_MESSAGE_HISTORY', 'USE_EXTERNAL_EMOJIS', 'EMBED_LINKS', 'ADD_REACTIONS'])
        if (!message.guild.me.permissions.has(Permissions.FLAGS[perm]))
            return message.channel.send(`\`${config.Perms[perm] || 'Mas o que é isso?'}\` | Eu não tenho permissão suficiente para executar este comando.\nPode conferir se eu tenho as 4 permissões básicas? **\`Ler histórico de mensagens, Usar emojis externos, Enviar links (Necessário para enviar gifs e coisas do tipo), Adicionar reações\`**`).catch(() => { })

    let comandosBloqueados = clientData?.ComandosBloqueados || [],
        cmdBlocked = comandosBloqueados?.find(Cmd => Cmd.cmd === command?.name)
    if (cmdBlocked)
        return message.reply(`${e.BongoScript} | Este comando foi bloqueado por algum Bug/Erro ou pelos meus administradores.\n> Quer fazer algúm reporte? Use o comando \`${prefix}bug\`\n> Motivo do bloqueio: ${cmdBlocked?.error || 'Motivo não informado.'}`)

    let commandBlock = guild?.CommandBlocks?.filter(data => data.cmd === command?.name) || []
    if (commandBlock.length > 1) {

        if (commandBlock.some(data => data.all))
            return message.reply(`${e.Deny} | Esse comando foi bloqueado em todos os canais deste servidor.\n${e.Info} | Para mais informações use o comando \`${prefix}blockcommands status\``)

        if (commandBlock?.some(data => data.channel === message.channel.id))
            return message.reply(`${e.Deny} | Esse comando foi bloqueado nesse canal.\n${e.Info} | Para mais informações use o comando \`${prefix}blockcommands status\``)
    }

    let ClientPermisitonsRequired = command.ClientPermissions || [],
        UserPermitionsRequired = command.UserPermissions || []

    if (command.category === 'premium' && !clientData.PremiumServers?.includes(message.guild.id))
        return message.reply(`${e.Deny} | Este é um recurso de servidores premium. Use \`${prefix}premium\` para saber mais detalhes.`)

    if (!message.member.permissions.has(UserPermitionsRequired))
        return message.reply(`${e.Hmmm} | Você não tem permissão para usar este comando.\n${e.Info} | Permissão*(ões)* necessária*(s)*: **\`${UserPermitionsRequired.map(perm => config.Perms[perm]).join(', ')}\`**`)

    if (!message.guild.me.permissions.has(ClientPermisitonsRequired))
        return message.reply(`${e.SadPanda} | Eu preciso da*s* permissão*(ões)* **\`${ClientPermisitonsRequired.map(perm => config.Perms[perm]).join(', ')}\`** para continuar com este comando.`)

    if (command.owner && message.author.id !== config.ownerId)
        return message.reply(`${e.OwnerCrow} | Este é um comando restrito da classe: Owner/Desenvolvedor`)

    if (command.admin && (!clientData?.Administradores.includes(message.author.id) && message.author.id !== config.ownerId))
        return message.reply(`${e.Admin} | Este é um comando restrito da classe: Saphire's Team Administrator`)

    if (command.category === 'economy' && clientData?.Blacklist?.Economy?.some(data => data.id === message.author.id))
        return message.reply(`${e.Deny} | Você está na blacklist da Economia Global.`)

    let timeout = parseInt(Database.Cache.get(`Timeouts.${command.name}.${message.author.id}.Time`)) || 0

    if (client.Timeout(command.cooldown || 1500, timeout)) {

        if (Database.Cache.get(`Timeouts.${command.name}.${message.author.id}.TimesTried`) > 5) return

        if (Database.Cache.get(`Timeouts.${command.name}.${message.author.id}.Tried`))
            Database.Cache.add(`Timeouts.${command.name}.${message.author.id}.Time`, 3000)

        Database.Cache.add(`Timeouts.${command.name}.${message.author.id}.TimesTried`, 1)
        Database.Cache.set(`Timeouts.${command.name}.${message.author.id}.Tried`, true)

        let timeResponse = client.GetTimeout(command.cooldown || 1500, Database.Cache.get(`Timeouts.${command.name}.${message.author.id}.Time`), true)

        if (timeResponse === 'Invalid Cooldown Acess Bad Formated') timeResponse = 0
        return message.reply(`⏱️ | Calma, calma! Você ainda tem mais **\`${timeResponse}\`** para usar este comando novamente.`)
    }

    Database.Cache.set(`Timeouts.${command.name}.${message.author.id}`, { Time: Date.now() })

    Database.newCommandRegister(message, data(), client.user.id, command.name)
    return await command.execute(client, message, args, prefix, MessageEmbed, Database).catch(err => Error(message, err))

})

async function BlockCommandsBot(message, clientId, Blockchannels) {

    if (!message || !Blockchannels) return

    if (!Blockchannels?.Bots?.includes(message.channel?.id)) return

    if (message.author.id !== clientId && message.author.bot) {

        message.delete().catch(async () => {

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $unset: { 'Blockchannels.Bots': 1 } }
            )

            Notify(message.guild.id, 'Recurso Desabilitado', `Aparentemente eu estou **sem permissão** para apagar mensagens de outros bots. Para evitar conflitos e estresse, a configuração **${prefix}lockcommands bots** foi desativada no servidor.`)
            return message.channel.send(`${e.Warn} | Estou sem permissão para executar o bloqueio de comandos de outros bots neste canal. Sistema desativado.`)
        })

        return message.channel.send(`${e.Deny} | Comandos de bots foram bloqueados neste canal.`).then(msg => setTimeout(() => msg.delete().catch(() => { }), 4500))

    }

    return
}