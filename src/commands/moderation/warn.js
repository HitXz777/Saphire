const { e } = require('../../../JSON/emojis.json'),
    passCode = require('../../../modules/functions/plugins/PassCode'),
    Data = require('../../../modules/functions/plugins/data')

module.exports = {
    name: 'warn',
    aliases: ['avisar', 'aviso'],
    category: 'moderation',
    UserPermissions: ['MODERATE_MEMBERS', 'KICK_MEMBERS', 'BAN_MEMBERS'],
    emoji: '⚠️',
    usage: '<warn> <info>',
    description: 'Avise membros por coisas erradas',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return warnInfo()

        let member = client.getUser(client, message, args, true),
            fill = args[0]?.startsWith('<') ? args.slice(1).join(" ") : args.slice(0).join(" "),
            reason = fill || 'Nenhuma razão definida',
            warnListControl = {}

        if (['list', 'lista'].includes(args[0]?.toLowerCase())) return warnsList(member?.id)
        if (['delete', 'del', 'excluir'].includes(args[0]?.toLowerCase())) return deleteWarn()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return warnInfo()

        if (!member)
            return message.reply(`${e.Deny} | Mencione um membro para dar warns. Dúvidas? Use o comando \`${prefix}warn info\``)

        if (member.id === message.author.id)
            return message.reply(`${e.Deny} | Qual é? Sério que você quer dar warn em você mesmo?`)

        if (member.id === client.user.id)
            return message.reply(`${e.Deny} | Você é cheio de gracinhas, né...`)

        if (member.user.bot)
            return message.reply(`${e.Deny} | Opa, opa, opa! Eu não vou dar warn nos meus amiguinhos bots.`)

        let perms = member.permissions.toArray(),
            blockedPermissions = ['ADMINISTRATOR', 'KICK_MEMBERS', 'BAN_MEMBERS', 'MODERATE_MEMBERS']

        for (let perm of blockedPermissions)
            if (perms.includes(perm)) return message.reply(`${e.Deny} | Vish... Não posso efetuar warn em uma pessoa tão forte assim...`)

        if (!member.manageable)
            return message.reply(`${e.Deny} | Opa! ${member} é muito forte, posso dar warn nele não...`)

        if (reason.length > 200)
            return message.reply(`${e.Deny} | O limite de caracteres na razão do warn deve ser menor que 200.`)

        const msg = await message.reply(`${e.QuestionMark} | Você realmente deseja efetuar um warn em ${member}?`),
            emojis = ['✅', '❌']

        for (let i of emojis) msg.react(i).catch(() => { })

        return msg.createReactionCollector({
            filter: (r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id,
            time: 60000,
            max: 1
        })
            .on('collect', async (reaction) => {

                if (reaction.emoji.name === emojis[1]) return

                msg.delete().catch(() => { })

                let warnId = passCode(5)
                await registerWarn(member.id, reason, warnId, message.author.id)
                notify(warnId, member.id)
                return member.user.send({
                    content: `⚠️ | Você recebeu um aviso no servidor **${message.guild.name}**`,
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.blue)
                            .setTitle('🛰️ | Global System Notification - Warning System')
                            .setDescription('\`Esta é uma mensagem automática do sistema GSN, categoria: WARN\`')
                            .addFields(
                                {
                                    name: '👤 Usuário',
                                    value: `${member.user.tag} - \`${member.id}\``
                                },
                                {
                                    name: `${e.ModShield} Moderador`,
                                    value: `${message.author.tag} - \`${message.author.id}\``
                                },
                                {
                                    name: '📝 Razão',
                                    value: reason
                                },
                                {
                                    name: '📅 Data',
                                    value: Data()
                                }
                            )
                            .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                            .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
                    ]
                })
            })
            .on('end', () => msg.edit(`${e.Deny} | Warn cancelado.`).catch(() => { }))

        async function notify(warnId, memberId) {

            let data = await Database.Guild.findOne({ id: message.guild.id }, 'LogChannel Warns.Users'),
                channel = message.guild.channels.cache.get(data?.LogChannel)

            if (data?.Warns?.Users)
                warns = data?.Warns.Users[memberId]?.length
            else warns = 1

            message.channel.send(`${e.Check} | Warn efetuado com sucesso! *\`Warn ID: ${warnId}\`* ${member}, é melhor você se comportar...\n⚠️ | ${member.user.tag} possui ${warns || 0} warns no servidor.${channel ? `\n${e.Info} | Enviei mais informações no canal ${channel}` : `\n${e.Deny} | Este servidor não possui o GSN ligado. Quer saber mais? Use \`${prefix}gsn\``}`)

            if (warns >= 3) sugestKickOrBan()
            if (!channel) return

            channel.send({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle('🛰️ | Global System Notification | Warn')
                        .addFields(
                            {
                                name: '👤 Usuário',
                                value: `${member.user.tag} - \`${member.id}\``
                            },
                            {
                                name: `${e.ModShield} Moderador`,
                                value: `${message.author.tag} - \`${message.author.id}\``
                            },
                            {
                                name: '📝 Razão',
                                value: reason
                            },
                            {
                                name: '📅 Data',
                                value: Data()
                            }
                        )
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .setFooter({ text: message.guild.name, iconURL: message.guild.iconURL({ dynamic: true }) })
                ]
            })

        }

        async function registerWarn(userId, reason, warnId, authorId) {

            await Database.Guild.updateOne(
                { id: message.guild.id },
                {
                    $push: {
                        [`Warns.Users.${userId}`]: {
                            id: warnId,
                            reason: reason,
                            author: authorId
                        }
                    }
                }
            )

            return

        }

        async function warnsList(memberId, msg) {

            if (!memberId) return listAllWarns()

            if (!memberId)
                return message.reply(`${e.Deny} | Mencione um membro para que eu possa pegar os warns. \`${prefix}warn list @member\``)

            let member = message.guild.members.cache.get(memberId)

            let data = await Database.Guild.findOne({ id: message.guild.id }, 'Warns.Users')

            if (!data?.Warns?.Users)
                return message.reply(`${e.Deny} | Esse servidor não tem nenhum warn.`)

            let warns = data?.Warns?.Users[memberId],
                control = 0

            if (!warns || warns.length === 0)
                return message.reply(`${e.Deny} | ${member?.user?.username || '\`NOT FOUND\`'} não tem nenhum warn.`)

            let embeds = EmbedGenerator(),
                emojis = ['⬅️', '➡️', '❌']

            msg = msg ? await msg.edit({ embeds: [embeds[control]] }).catch(() => { })
                : await message.reply({ embeds: [embeds[control]] }).catch(() => { })

            if (!embeds || embeds.length === 1) return

            for (let i of emojis) msg.react(i).catch(() => { })
            let collector = msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id,
                idle: 20000,
                erros: ['idle']
            })
                .on('collect', (r) => {

                    if (r.emoji.name === emojis[2])
                        return collector.stop()

                    if (r.emoji.name === emojis[0]) {
                        control--
                        if (control < 0) control = embeds.length - 1
                        return msg.edit({ embeds: [embeds[control]] }).catch(() => { })
                    }

                    if (r.emoji.name === emojis[1]) {
                        control++
                        if (control === embeds.length) control = 0
                        return msg.edit({ embeds: [embeds[control]] }).catch(() => { })
                    }

                    return
                })
                .on('end', () => {

                    let embed = embeds[control]
                    embed.color = client.red
                    embed.footer.text = 'Comando cancelado'
                    return msg.edit({ embeds: [embed] }).catch(() => { })
                })

            warnListControl.collector = collector
            warnListControl.emojis = ['⬅️', '➡️']

            return

            function EmbedGenerator() {

                let amount = 5,
                    Page = 1,
                    embeds = [],
                    length = warns.length / 5 <= 1 ? 1 : parseInt((warns.length / 5) + 1)

                for (let i = 0; i < warns.length; i += 5) {

                    let current = warns.slice(i, amount),
                        description = current.map(warn => `🆔 \`${warn.id}\`\n${e.Info} \`${warn.reason}\`\n${e.ModShield} ${message.guild.members.cache.get(warn.author)?.user?.tag || 'NOT FOUND.'}`).join("\n \n")

                    if (current.length > 0) {

                        embeds.push({
                            color: client.blue,
                            author: {
                                name: `${member?.user?.username || 'NOT FOUND'} Warn List - ${Page}/${length}`,
                                icon_url: member?.user?.displayAvatarURL({ dynamic: true }) || null
                            },
                            description: `${description}`,
                            footer: {
                                text: `${warns.length} Warns | ${prefix}warn delete <warnId>`
                            }
                        })

                        Page++
                        amount += 5

                    }

                }

                return embeds
            }

        }

        async function deleteWarn() {

            let data = await Database.Guild.findOne({ id: message.guild.id }, 'Warns.Users'),
                allWarns = data.Warns?.Users || {}

            if (!allWarns || allWarns.size === 0) return message.reply(`${e.Deny} | Este servidor não tem nenhum usuário com warn.`)

            let warnId = args[1]
            let warn = {}

            if (['all', 'tudo'].includes(warnId?.toLowerCase())) return deleteAllWarn(allWarns)
            if (member || warnId?.length === 18) return deleteWarnMember(allWarns, warnId)
            if (!warnId) return message.reply(`${e.Info} | Forneça um WarnID para o delete. Você pode vê-los usando \`${prefix}warn list @member\``)

            let warns = Object.keys(allWarns)

            for (let id of warns) {

                let warnsUser = allWarns[id]

                for (let w of warnsUser)
                    if (w.id === warnId) {
                        warn = w
                        warn.userId = id
                        return confirmDelete(warn)
                    }

                continue
            }

            return message.reply(`${e.Deny} | ID inválido ou Warn inexistente.`)

        }

        async function deleteWarnMember(allWarns, memberId) {

            let emojis = ['✅', '❌'],
                clicked = false,
                warnsArray = Object.entries(allWarns)

            if (!memberId || memberId?.length !== 18) memberId = member?.id

            let warns = warnsArray?.find(data => data[0] === memberId)
            if (!warns) return message.reply(`${e.Deny} | ${member || `\`${memberId}\``} não possui nenhum warn.`)

            let total = warns[1].length

            let msg = await message.reply(`${e.QuestionMark} | Você tem certeza em deletar todos os warns de ${member || `\`${memberId}\``}? (${total} warns)`)
            for (let i of emojis) msg.react(i).catch(() => { })

            let collector = msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id,
                time: 60000,
                erros: ['time']
            })
                .on('collect', async (reaction) => {
                    if (reaction.emoji.name === emojis[1])
                        return collector.stop()

                    clicked = true
                    await Database.Guild.updateOne(
                        { id: message.guild.id },
                        {
                            $unset: { [`Warns.Users.${memberId}`]: 1 }
                        }
                    )

                    return msg.edit(`${e.Check} | Todos os **${total} warns** de ${member || `\`${memberId}\``} foram deletados com sucesso!`).catch(() => { })
                })
                .on('end', () => {
                    if (clicked) return
                    return msg.edit(`${e.Deny} | Member Warn Delete cancelado.`).catch(() => { })
                })

            return
        }

        async function confirmDelete(warn) {

            let author = message.guild.members.cache.get(warn.author),
                memberWarn = message.guild.members.cache.get(warn.userId),
                emojis = ['✅', '❌'],
                clicked = false

            let msg = await message.reply(`${e.QuestionMark} Você tem certeza em deletar o Warn \`${warn.id}\`?\n${e.Info} Razão: \`${warn.reason}\`\n${e.ModShield} ${author?.user?.tag || 'NOT FOUND'} - \`${author?.id || '0'}\`\n👤 ${memberWarn?.user?.tag || 'NOT FOUND'} - \`${memberWarn?.id || '0'}\``)

            for (let i of emojis) msg.react(i).catch(() => { })
            let collector = msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id,
                time: 60000,
                erros: ['time']
            })
                .on('collect', async (reaction) => {
                    if (reaction.emoji.name === emojis[1])
                        return collector.stop()

                    clicked = true
                    await Database.Guild.updateOne(
                        { id: message.guild.id },
                        {
                            $pull: {
                                [`Warns.Users.${warn.userId}`]: { id: warn.id }
                            }
                        }
                    )

                    return msg.edit(`${e.Check} | Warn \`${warn.id}\` foi deletado com sucesso!`).catch(() => { })
                })
                .on('end', () => {
                    if (clicked) return
                    return msg.edit(`${e.Deny} | Warn Delete cancelado.`).catch(() => { })
                })

            return
        }

        async function deleteAllWarn(allWarns = {}) {

            let emojis = ['✅', '❌'],
                clicked = false,
                warns = Object.values(allWarns),
                total = 0

            for (let w of warns)
                total += w.length

            let msg = await message.reply(`${e.QuestionMark} | Você tem certeza em deletar todos os warns? (${total} warns)`)

            for (let i of emojis) msg.react(i).catch(() => { })
            let collector = msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id,
                time: 60000,
                erros: ['time']
            })
                .on('collect', async (reaction) => {
                    if (reaction.emoji.name === emojis[1])
                        return collector.stop()

                    clicked = true
                    await Database.Guild.updateOne(
                        { id: message.guild.id },
                        {
                            $unset: { ['Warns.Users']: 1 }
                        }
                    )

                    return msg.edit(`${e.Check} | Todos os ${total} warns foram deletados com sucesso!`).catch(() => { })
                })
                .on('end', () => {
                    if (clicked) return
                    return msg.edit(`${e.Deny} | Total Warn Delete cancelado.`).catch(() => { })
                })

            return
        }

        function warnInfo() {
            return message.reply(
                {
                    embeds: [
                        new MessageEmbed()
                            .setColor(client.blue)
                            .setTitle(`⚠️ ${client.user.username} Warn System`)
                            .setDescription(`Aproveite ao máximo o sistema de warns que eu tenho a te oferecer para avisar membros que quebram as regras.`)
                            .addFields(
                                {
                                    name: '1. Dê warn',
                                    value: `\`${prefix}warn @member [razão do warn]\``
                                },
                                {
                                    name: '2. Veja os warns',
                                    value: `\`${prefix}warn list [@member]\``
                                },
                                {
                                    name: '3. Delete warns',
                                    value: `\`${prefix}warn delete <warnId>\` - Delete um único warn usando o Warn ID\n\`${prefix}warn delete <all>\` - Delete todos os warns do servidor\n\`${prefix}warn delete <@Member/ID>\` - Delete todos os warns de um membro`
                                },
                                {
                                    name: '🛰️ Global System Notification',
                                    value: `Este comando é integrado ao meu sistema global de notificações. Ative-o usando \`${prefix}gsn on [#channel]\``
                                }
                            )
                            .setFooter({ text: '[] Opcional | <> Obrigatório' })
                    ]
                }
            )
        }

        async function sugestKickOrBan() {

            const painel = [{
                type: 1,
                components: [{
                    type: 3,
                    custom_id: 'menu',
                    placeholder: "Escolher uma punição",
                    options: [
                        {
                            label: 'Expulsão',
                            description: 'Boa escolha, porém pode voltar.',
                            emoji: '🦶',
                            value: 'kick',
                        },
                        {
                            label: 'Banimento',
                            description: 'Uma escolha hardcore.',
                            emoji: e.catBan,
                            value: 'ban',
                        },
                        {
                            label: 'Mute',
                            description: 'Um mute é uma opção inteligente.',
                            emoji: '🔇',
                            value: 'mute',
                        },
                        {
                            label: 'Perdão',
                            description: 'Cancele a punição e mostre sua bondade',
                            emoji: '🙌',
                            value: 'perdon'
                        }
                    ]
                }
                ]
            }]

            let msg = await message.reply({
                content: `${e.QuestionMark} | Eu notei que ${member} possui mais de 3 warns. Quer aplicar uma punição maior?`,
                components: painel
            }),
                clicked = false

            const collector = msg.createMessageComponentCollector({
                filter: interaction => interaction.customId === 'menu' && interaction.user.id === message.author.id,
                max: 1,
                time: 50000,
                erros: ['max', 'time']
            })
                .on('collect', async interaction => {
                    interaction.deferUpdate().catch(() => { })

                    let value = interaction.values[0]
                    clicked = true

                    switch (value) {
                        case 'kick': kickMember(msg); break;
                        case 'ban': banMember(msg); break;
                        case 'mute': muteMember(msg); break;
                        case 'perdon': perdon(msg); break;
                        default: cancel(); break;
                    }

                    function cancel() {
                        return msg.edit({
                            content: `${e.Deny} | Punição cancelada com sucesso!`,
                            components: []
                        })
                    }

                })
                .on('end', () => {
                    if (clicked) return

                    return msg.edit({
                        content: `${e.Deny} | Punição cancelada com sucesso!`,
                        components: []
                    })
                })
        }

        async function kickMember(msg) {

            let emojis = ['✅', '❌'],
                react = false

            msg.edit({
                content: `${e.QuestionMark} | Você tem certeza que deseja expulsar ${member}?`,
                components: []
            })

            for (let i of emojis) msg.react(i).catch(() => { })

            let collector = msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id,
                time: 60000,
                erros: ['time']
            })
                .on('collect', (r) => {

                    if (r.emoji.name === emojis[1])
                        return collector.stop()

                    react = true
                    member.kick({ reason: `Solicitado por ${message.author.tag}` }).catch(err => {
                        return msg.edit(`${e.Warn} | Houve um erro ao executar a expulsar de ${member}`).catch(() => { })
                    })

                    return msg.edit(`${e.Check} | O usuário ${member.user.tag} foi expulso com sucesso com a solicitação de ${message.author}.`).catch(() => { })

                }).
                on('end', () => {
                    if (react) return
                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                })

        }

        async function banMember(msg) {

            let emojis = ['✅', '❌'],
                react = false

            msg.edit({
                content: `${e.QuestionMark} | Você tem certeza que deseja banir ${member}?`,
                components: []
            })

            for (let i of emojis) msg.react(i).catch(() => { })

            let collector = msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id,
                time: 60000,
                erros: ['time']
            })
                .on('collect', (r) => {

                    if (r.emoji.name === emojis[1])
                        return collector.stop()

                    react = true
                    member.ban({ reason: `Solicitado por ${message.author.tag}` }).catch(err => {
                        return msg.edit(`${e.Warn} | Houve um erro ao executar o banimento de ${member}`).catch(() => { })
                    })

                    return msg.edit(`${e.Check} | O usuário ${member.user.tag} foi banido com sucesso com a solicitação de ${message.author}.`).catch(() => { })

                }).
                on('end', () => {
                    if (react) return
                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                })

        }

        async function muteMember(msg) {

            let emojis = ['✅', '❌'],
                react = false

            msg.edit({
                content: `${e.QuestionMark} | Você tem certeza que deseja mutar ${member}?`,
                components: []
            })

            for (let i of emojis) msg.react(i).catch(() => { })

            let collector = msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id,
                time: 60000,
                erros: ['time']
            })
                .on('collect', (r) => {

                    if (r.emoji.name === emojis[1])
                        return collector.stop()

                    react = true
                    member.timeout(18000000, `Solicitado por ${message.author.tag}`).catch(err => {
                        return msg.edit(`${e.Warn} | Houve um erro ao executar o mutar ${member}`).catch(() => { })
                    })

                    return msg.edit(`${e.Check} | O usuário ${member.user.tag} foi mutado com sucesso com a solicitação de ${message.author}.`).catch(() => { })

                }).
                on('end', () => {
                    if (react) return
                    return msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
                })
            return

        }

        function perdon(msg) {
            return msg.edit({
                content: `🙌 | ${message.author} tem um coração generoso e ofereceu seu perdão e todas as punições foram anuladas.`,
                components: []
            })
        }

        async function listAllWarns() {

            let data = await Database.Guild.findOne({ id: message.guild.id }, 'Warns.Users'),
                allWarns = data?.Warns?.Users || {}

            let warns = Object.keys(allWarns || {}),
                control = 0

            if (!warns || warns.length === 0)
                return message.reply(`${e.Deny} | Este servidor não tem nenhum warn.`)

            let selectMenus = [],
                embeds = EmbedGenerator()

            if (!embeds || embeds.length === 0)
                return message.reply(`${e.Deny} | Este servidor não tem nenhum warn.`)

            let msg = await message.reply({
                embeds: [embeds[control]],
                components: [selectMenus[control]]
            })

            let selectCollector = msg.createMessageComponentCollector({
                filter: interaction => interaction.user.id === message.author.id && interaction.customId === 'menu',
                idle: 60000,
                erros: ['idle']
            })

            selectCollector.on('collect', async interaction => {
                interaction.deferUpdate().catch(() => { })

                refreshCollectors(msg)

                let id = interaction.values[0]

                if (id === 'inicial') {
                    control = 0
                    return msg.edit({ embeds: [embeds[0]] }).catch(() => { })
                }

                if (id === 'finish') {
                    let embed = embeds[control]
                    embed.color = client.red
                    embed.footer.text = 'Comando cancelado'
                    msg.reactions?.removeAll().catch(() => { })
                    return msg.edit({ embeds: [embed], components: [] }).catch(() => { })
                }

                return warnsList(id, msg)
            })

            if (embeds.length === 1) return

            let emojis = ['⏪', '⏩', '❌']
            for (const emoji of emojis) msg.react(emoji).catch(() => { })

            let reactionCollector = msg.createReactionCollector({
                filter: (r, u) => emojis.includes(r.emoji.name) && u.id === message.author.id,
                idle: 60000,
                erros: ['idle']
            })

            reactionCollector.on('collect', (reaction) => {

                if (reaction.emoji.name === emojis[2]) {
                    selectCollector.stop()
                    return reactionCollector.stop()
                }

                refreshCollectors()

                if (reaction.emoji.name === emojis[1]) {
                    control++
                    if (control >= embeds.length) control = 0
                    return msg.edit({
                        embeds: [embeds[control]],
                        components: [selectMenus[control]]
                    })
                }

                if (reaction.emoji.name === emojis[0]) {
                    control--
                    if (control < 0) control = embeds.length - 1
                    return msg.edit({
                        embeds: [embeds[control]],
                        components: [selectMenus[control]]
                    })
                }
                return
            })

            reactionCollector.on('end', () => {
                let embed = embeds[control]
                embed.color = client.red
                embed.footer.text = 'Comando cancelado'
                msg.reactions.removeAll().catch(() => { })
                return msg.edit({ embeds: [embed], components: [] }).catch(() => { })
            })

            function EmbedGenerator() {

                let amount = 5,
                    Page = 1,
                    embeds = [],
                    options = [],
                    length = warns.length / 5 <= 1 ? 1 : parseInt((warns.length / 5) + 1)

                for (let i = 0; i < warns.length; i += 5) {

                    let current = warns.slice(i, amount),
                        description = current.map(w => {

                            let member = message.guild.members.cache.get(w)

                            options.push({
                                label: member?.user?.tag || 'NOT FOUND',
                                description: w,
                                emoji: member ? '⚠️' : e.Deny,
                                value: w,
                            })

                            return member
                                ? `👤 ${member} - \`${member?.user?.tag?.replace(/`/, '')}\``
                                : `${e.Deny} NOT FOUND - \`${w}\``

                        }).join("\n")

                    if (current.length > 0) {

                        embeds.push({
                            color: client.blue,
                            title: `Warn List ${message.guild.name} - ${Page}/${length}`,
                            description: `${description}`,
                            footer: { text: `${warns.length} pessoas contabilizadas` }
                        })

                        selectMenus.push({
                            type: 1,
                            components: [{
                                type: 3,
                                custom_id: 'menu',
                                placeholder: 'Escolher um usuário',
                                options: [
                                    {
                                        label: 'Página de membros',
                                        emoji: '📜',
                                        description: 'Volte a página inicial',
                                        value: 'inicial',
                                    },
                                    options,
                                    {
                                        label: 'Cancelar',
                                        emoji: '❌',
                                        description: 'Cancele e termine a Warn List',
                                        value: 'finish',
                                    }
                                ]
                            }]
                        })

                        Page++
                        amount += 5
                        options = []
                    }

                }

                return embeds;
            }

        }

        function refreshCollectors(msg) {
            if (warnListControl.collector) {
                warnListControl.collector.stop()
                warnListControl.collector = false

                for (let i of warnListControl.emojis)
                    msg.reactions.cache.get(i).remove().catch(() => { })
            }
            return warnListControl = {}
        }

    }
}