const Database = require('../../../modules/classes/Database'),
    { Emojis: e, Config: config } = Database,
    { eightyYears, Now, getUser, day } = require('../plugins/modalPlugins')

async function submitModalFunctions(interaction, client) {

    const { customId, fields, user, channel, guild } = interaction,
        guildData = await Database.Guild.findOne({ id: guild.id }, 'Prefix'),
        prefix = guildData?.Prefix || client.prefix

    switch (customId) {
        case 'setStatusModal': setStatusModal(); break;
        case 'forcaChooseWord': forcaChooseWord(); break;
        case 'BugModalReport': BugModalReport(); break;
        case 'editProfile': editProfile(); break;
        case 'newLetter': newLetter(); break;
        case 'newReminder': newReminder(); break;
        case 'createNewGiveaway': createNewGiveaway(); break;
        case 'lettersReport': lettersReport(); break;
        case 'reactionRoleCreateModal': reactionRoleCreateModal(); break;
        default:
            break;
    }

    return

    async function editProfile() {

        let data = await Database.User.findOne({ id: user.id }, 'Perfil'),
            moment = require('moment'), title = undefined,
            job = fields.getTextInputValue('profileJob'),
            status = fields.getTextInputValue('profileStatus'),
            birth = fields.getTextInputValue('profileBirth'),
            msg = 'ℹ | Validação concluída. Resultado:'

        if (data?.Perfil?.TitlePerm)
            title = fields.getTextInputValue('profileTitle')

        if (title && title !== data?.Perfil?.Titulo) {
            msg += '\n✅ | Título'
            Database.updateUserData(user.id, 'Perfil.Titulo', title)
        } else msg += '\n❌ | Título'

        if (job && job !== data?.Perfil?.Trabalho) {
            msg += '\n✅ | Trabalho'
            Database.updateUserData(user.id, 'Perfil.Trabalho', job)
        } else msg += '\n❌ | Trabalho'

        if (birth && birth !== data?.Profile?.Aniversario) {

            const date = moment(birth, "DDMMYYYY"),
                formatedData = date.locale('BR').format('L')

            if (!date.isValid() || date.isBefore(eightyYears()) || date.isAfter(Now())) {
                msg += '\n❌ | Aniversário'
            } else {
                msg += '\n✅ | Aniversário'
                Database.updateUserData(user.id, 'Perfil.Aniversario', formatedData)
            }

        } else msg += '\n❌ | Aniversário'

        if (status && status !== data?.Perfil?.Status) {
            msg += '\n✅ | Status'
            Database.updateUserData(user.id, 'Perfil.Status', status)
        } else msg += '\n❌ | Status'


        return await interaction.reply({
            content: msg,
            ephemeral: true
        })

    }

    async function newReminder() {

        const moment = require('moment')
        const time = fields.getTextInputValue('time')
        const dataInfo = fields.getTextInputValue('dataInfo')

        let Args = time.trim().split(/ +/g),
            DefinedTime = 0

        if (Args[0].includes('/') || Args[0].includes(':') || ['hoje', 'today', 'tomorrow', 'amanhã'].includes(Args[0]?.toLowerCase())) {

            let data = Args[0],
                hour = Args[1]

            if (['tomorrow', 'amanhã'].includes(data.toLowerCase()))
                data = day(true)

            if (['hoje', 'today'].includes(data.toLowerCase()))
                data = day()

            if (!hour && data.includes(':') && data.length <= 5) {
                data = day()
                hour = Args[0]
            }

            if (data.includes('/') && data.length === 10 && !hour)
                hour = '12:00'

            if (!data || !hour)
                return await interaction.reply({
                    content: `${e.Deny} | A data informada não é a correta.`,
                    embeds: [{ color: client.blue, title: 'Reminder Content', description: dataInfo }],
                    ephemeral: true
                })

            let dataArray = data.split('/'),
                hourArray = hour.split(':'),
                dia = parseInt(dataArray[0]),
                mes = parseInt(dataArray[1]) - 1,
                ano = parseInt(dataArray[2]),
                hora = parseInt(hourArray[0]),
                minutos = parseInt(hourArray[1]),
                segundos = parseInt(hourArray[2]) || 0

            let date = moment.tz({ day: dia, month: mes, year: ano, hour: hora, minutes: minutos, seconds: segundos }, "America/Sao_Paulo")

            if (!date.isValid()) {
                return await interaction.reply({
                    content: `${e.Deny} | A data informada não é a válida.`,
                    embeds: [{ color: client.blue, title: 'Reminder Content', description: dataInfo }],
                    ephemeral: true
                })
            }

            date = date.valueOf()

            if (date < Date.now())
                return await interaction.reply({
                    content: `${e.Deny} | A data informada é do passado.`,
                    embeds: [{ color: client.blue, title: 'Reminder Content', description: dataInfo }],
                    ephemeral: true
                })

            DefinedTime += date - Date.now()

        } else {

            for (let arg of Args) {

                if (arg.slice(-1).includes('d')) {
                    let time = arg.replace(/d/g, '000') * 60 * 60 * 24
                    if (isNaN(time)) return cancelReminder()
                    DefinedTime += parseInt(time)
                    continue
                }

                if (arg.slice(-1).includes('h')) {
                    let time = arg.replace(/h/g, '000') * 60 * 60
                    if (isNaN(time)) return cancelReminder()
                    DefinedTime += parseInt(time)
                    continue
                }

                if (arg.slice(-1).includes('m')) {
                    let time = arg.replace(/m/g, '000') * 60
                    if (isNaN(time)) return cancelReminder()
                    DefinedTime += parseInt(time)
                    continue
                }

                if (arg.slice(-1).includes('s')) {
                    let time = arg.replace(/s/g, '000')
                    if (isNaN(time)) return cancelReminder()
                    DefinedTime += parseInt(time)
                    continue
                }

                return cancelReminder()
            }
        }

        if (DefinedTime < 3000 || DefinedTime > 1262304000000)
            return await interaction.reply({
                content: '❌ | O tempo definido deve estar dentro de 3 segundos e 40 anos.',
                embeds: [{ color: client.blue, title: 'Reminder Content', description: dataInfo }],
                ephemeral: true
            })

        CreateNewReminder(dataInfo, DefinedTime)

        async function cancelReminder() {
            return await interaction.reply({
                content: '❌ | Data inválida! Verifique se a data esta realmente correta.',
                embeds: [{ color: client.blue, title: 'Reminder Content', description: dataInfo }],
                ephemeral: true
            })
        }

        async function CreateNewReminder(ReminderMessage, DefinedTime) {

            const PassCode = require('../../../modules/functions/plugins/PassCode'),
                ReminderCode = PassCode(7).toUpperCase(),
                Data = require('../../../modules/functions/plugins/data')

            new Database.Reminder({
                id: ReminderCode,
                userId: user.id,
                RemindMessage: ReminderMessage,
                Time: DefinedTime,
                DateNow: Date.now(),
                ChannelId: channel.id
            }).save()

            return await interaction.reply({
                content: `✅ | Tudo bem! Eu vou te lembrar em **${Data(DefinedTime)}** daqui **${client.GetTimeout(DefinedTime, 0, false)}**`,
                embeds: [{ color: client.blue, title: 'Reminder Content', description: dataInfo }],
                ephemeral: true
            }).catch(() => { })
        }

    }

    async function setStatusModal() {

        const newStatus = fields.getTextInputValue('newStatus')

        if (!newStatus)
            return await interaction.reply({
                content: '❌ | Não foi possível verificar o seu novo status.',
                ephemeral: true
            })

        Database.updateUserData(user.id, 'Perfil.Status', newStatus)
        return await interaction.reply({
            content: `✅ | Novo status definido com sucesso!\n📝 | ${newStatus}`,
            ephemeral: true
        })
    }

    async function forcaChooseWord() {
        const Forca = require('../../commands/games/classes/forca')
        const word = fields.getTextInputValue('componentOne')
        const { MessageEmbed } = require('discord.js')

        let data = await Database.Guild.findOne({ id: interaction.guildId }, 'Prefix'),
            prefix = data?.Prefix || Database.Config.Prefix

        let validate = /^[a-z ]+$/i

        if (!validate.test(word))
            return await interaction.reply({
                content: '❌ | O texto informado contém acentos ou números.',
                ephemeral: true
            })

        await interaction.reply({
            content: '✅ | Ok! Palavra coletada com sucesso!',
            fetchReply: true
        })

        return new Forca().game(client, false, [], prefix, MessageEmbed, Database, word?.toLowerCase(), user, channel)
    }

    async function createNewGiveaway() {

        const moment = require('moment'),
            Data = require('../../../modules/functions/plugins/data')

        let data = await Database.Guild.findOne({ id: guild.id }, 'GiveawayChannel Prefix'),
            prefix = data?.Prefix || '-',
            ChannelId = data?.GiveawayChannel,
            WinnersAmount = parseInt(fields.getTextInputValue('winners')),
            Time = fields.getTextInputValue('timing'),
            Prize = fields.getTextInputValue('prize'),
            Requisitos = fields.getTextInputValue('requires'),
            imageURL = fields.getTextInputValue('imageURL'),
            Channel = guild.channels.cache.get(ChannelId),
            TimeMs = 0

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

        if (!WinnersAmount || isNaN(WinnersAmount))
            return await interaction.reply({
                content: '❌ | O número de vencedores deve ser um número, não acha? Olha um exemplo: `1, 2, 3...`',
                ephemeral: true
            })

        if (WinnersAmount > 20 || WinnersAmount < 1)
            return await interaction.reply({
                content: `❌ | O limite máximo de vencedores é entre 1 e 20.`,
                ephemeral: true
            })

        let Args = Time.trim().split(/ +/g)

        if (Args[0].includes('/') || Args[0].includes(':') || ['hoje', 'today', 'tomorrow', 'amanhã'].includes(Args[0]?.toLowerCase())) {

            let data = Args[0],
                hour = Args[1]

            if (['tomorrow', 'amanhã'].includes(data.toLowerCase()))
                data = day(true)

            if (['hoje', 'today'].includes(data.toLowerCase()))
                data = day()

            if (!hour && data.includes(':') && data.length <= 5) {
                data = day()
                hour = Args[0]
            }

            if (data.includes('/') && data.length === 10 && !hour)
                hour = '12:00'

            if (!data || !hour)
                return await interaction.reply({
                    content: '❌ | A data informada para o sorteio não é correta. Veja alguma formas de dizer a data:\n> Formato 1: \`h, m, s\` - Exemplo: 1h 10m 40s *(1 hora, 10 minutos, 40 segundos)* ou \`1m 10s\`, \`2h 10m\`\n> Formato 2: \`30/01/2022 14:35:25\` - *(Os segundos são opcionais)*\n> Formato 3: \`hoje 14:35 | amanhã 14:35\`\n> Formato 4: \`14:35\` ou \`30/01/2022\`',
                    ephemeral: true
                })

            let dataArray = data.split('/'),
                hourArray = hour.split(':'),
                dia = parseInt(dataArray[0]),
                mes = parseInt(dataArray[1]) - 1,
                ano = parseInt(dataArray[2]),
                hora = parseInt(hourArray[0]),
                minutos = parseInt(hourArray[1]),
                segundos = parseInt(hourArray[2]) || 0

            let date = moment.tz({ day: dia, month: mes, year: ano, hour: hora, minutes: minutos, seconds: segundos }, "America/Sao_Paulo")

            if (!date.isValid())
                return await interaction.reply({
                    content: '❌ | O tempo informado não é válido. Verifique se você escreveu o tempo de forma correta.',
                    ephemeral: true
                })

            date = date.valueOf()

            if (date < Date.now()) return await interaction.reply({
                content: '❌ | O tempo do lembrete deve ser maior que o tempo de "agora", não acha?',
                ephemeral: true
            })

            TimeMs += date - Date.now()

        } else {

            for (let arg of Args) {

                if (arg.slice(-1).includes('d')) {
                    let time = arg.replace(/d/g, '000') * 60 * 60 * 24
                    if (isNaN(time)) return cancelReminder()
                    TimeMs += parseInt(time)
                    continue
                }

                if (arg.slice(-1).includes('h')) {
                    let time = arg.replace(/h/g, '000') * 60 * 60
                    if (isNaN(time)) return cancelReminder()
                    TimeMs += parseInt(time)
                    continue
                }

                if (arg.slice(-1).includes('m')) {
                    let time = arg.replace(/m/g, '000') * 60
                    if (isNaN(time)) return cancelReminder()
                    TimeMs += parseInt(time)
                    continue
                }

                if (arg.slice(-1).includes('s')) {
                    let time = arg.replace(/s/g, '000')
                    if (isNaN(time)) return cancelReminder()
                    TimeMs += parseInt(time)
                    continue
                }

                return cancelReminder()
                async function cancelReminder() {
                    return await interaction.reply({
                        content: '❌ | Data inválida! Verifique se a data esta realmente correta: \`dd/mm/aaaa hh:mm\` *(dia, mês, ano, horas, minutos)*\nℹ | Exemplo: \`30/01/2022 14:35:25\` *(Os segundos são opcionais)*\nℹ | \`hoje 14:35\`\nℹ | \`Amanhã 14:35\`',
                        ephemeral: true
                    })
                }
            }
        }

        if (TimeMs > 2592000000)
            return await interaction.reply({
                content: '❌ | O tempo limite é de 30 dias.',
                ephemeral: true
            })

        const msg = await Channel.send({ embeds: [{ color: client.blue, title: `${e.Loading} | Construindo sorteio...` }] }).catch(() => { })

        if (!msg?.id)
            return await interaction.reply({
                content: '❌ | Falha ao obter o ID da mensagem do sorteio. Verifique se eu realmente tenho permissão para enviar mensagem no canal de sorteios.',
                ephemeral: true
            })

        await interaction.reply({ content: '✅ | Tudo certo! Todos os dados foram coletados.', ephemeral: true })
        let Message = await channel.send({ content: `${e.Loading} | Tudo certo! Última parte agora. Escolha um emoji **\`do Discord ou deste servidor\`** que você quer para o sorteio e **\`reaja nesta mensagem\`**. Caso queira o padrão, basta reagir em 🎉` })
        Message.react('🎉').catch(() => { })
        let collected = false

        let collector = Message.createReactionCollector({
            filter: (r, u) => u.id === user.id,
            idle: 20000
        })
            .on('collect', (reaction) => {

                let emoji = reaction.emoji

                if (emoji.id && !guild.emojis.cache.get(emoji.id))
                    return Message.edit(`${Message.content}\n \n❌ | Este emoji não pertence a este servidor. Por favor, escolha um emoji deste servidor ou do Discord.`)

                let emojiData = emoji.id || emoji.name

                msg.react(emoji).catch(err => {
                    Database.deleteGiveaway(msg.id)
                    collected = true
                    collector.stop()
                    return channel.send(`${e.Warn} | Erro ao reagir no sorteio. | \`${err}\``)
                })

                collected = true
                collector.stop()
                return registerGiveaway(msg, emoji, emojiData, Message)
            })
            .on('end', () => {
                if (collected) return

                msg.react('🎉').catch(err => {
                    Database.deleteGiveaway(msg.id)
                    return channel.send(`${e.Warn} | Erro ao reagir no sorteio. | \`${err}\``)
                })

                return registerGiveaway(msg, '🎉', '🎉', Message)
            })

        return
        async function registerGiveaway(msg, emoji = '🎉', emojiData = '🎉', Message) {

            new Database.Giveaway({ // new Class Model
                MessageID: msg.id, // Id da Mensagem
                GuildId: guild.id, // Id do Servidor
                Prize: Prize, // Prêmio do sorteio
                Winners: WinnersAmount, // Quantos vencedores
                Emoji: emojiData, // Quantos vencedores
                TimeMs: TimeMs, // Tempo do Sorteio
                DateNow: Date.now(), // Agora
                ChannelId: ChannelId, // Id do Canal
                Actived: true, // Ativado
                MessageLink: msg.url, // Link da mensagem
                Sponsor: user.id, // Quem fez o sorteio
                TimeEnding: Data(TimeMs) // Hora que termina o sorteio
            }).save()

            const embed = {
                color: 0x0099ff,
                title: `${e.Tada} Sorteios ${guild.name}`,
                description: `Para entrar no sorteio, basta reagir no emoji ${emoji}`,
                fields: [
                    {
                        name: `${e.Star} Prêmio`,
                        value: `> ${Prize}`
                    },
                    {
                        name: '⏱️ Data de Término',
                        value: `> \`${Data(TimeMs)}\``,
                        inline: true
                    },
                    {
                        name: `${e.ModShield} Patrocinado por`,
                        value: `> ${user}`,
                        inline: true
                    },
                    {
                        name: `${e.CoroaDourada} Vencedores`,
                        value: `> ${parseInt(WinnersAmount)}`,
                        inline: true
                    }
                ],
                image: {
                    url: imageURL || null,
                },
                timestamp: new Date(),
                footer: {
                    text: `Giveaway ID: ${msg?.id}`
                }
            }

            if (Requisitos)
                embed.fields.push({
                    name: `${e.Commands} Requisitos`,
                    value: `${Requisitos}`
                })

            let isError = false

            msg.edit({ embeds: [embed] })
                .catch(err => {
                    isError = true
                    Database.deleteGiveaway(msg.id)
                    msg.delete().catch(() => { })

                    if (err.code === 50035)
                        return Message.edit(`${e.Warn} | Erro ao criar o sorteio.\n${e.Info} | O link de imagem fornecido não é compátivel com as embeds do Discord.`).catch(() => { })

                    return Message.edit(`${e.Warn} | Erro ao criar o sorteio. | \`${err}\``).catch(() => { })
                })

            if (isError) return
            return Message.edit(`${e.Check} | Sorteio criado com sucesso! Você pode vê-lo no canal ${msg.channel}`).catch(() => { })
        }

    }

    async function reactionRoleCreateModal() {

        const roleData = fields.getTextInputValue('roleData'),
            title = fields.getTextInputValue('roleTitle'),
            description = fields.getTextInputValue('roleDescription'),
            role = guild.roles.cache.find(role => role.id === roleData || role.name?.toLowerCase() === roleData?.toLowerCase()),
            guildData = await Database.Guild.findOne({ id: guild.id }, 'ReactionRole'),
            roleArray = guildData?.ReactionRole || []

        if (!role)
            return await interaction.reply({
                content: `❌ | Não existe nenhum cargo no servidor com o ID ou nome fornecido. \`${roleData}\`.\n \n> Não sabe pegar o ID do cargo? Olhe esse tópico do suporte do Discord: https://support.discord.com/hc/pt-br/articles/206346498-Onde-posso-encontrar-minhas-IDs-de-Usu%C3%A1rio-Servidor-Mensagem-`,
                ephemeral: true
            })

        if (roleArray.find(data => data.roleId === role.id))
            return await interaction.reply({
                content: `❌ | O cargo ${role} já foi configurado como reaction role.`
            })

        if (!role.editable)
            return await interaction.reply({
                content: `❌ | Eu não consigo adicionar o cargo ${role} por entrar acima de mim no ranking de cargos. Suba meu cargo para cima dele que tudo dará certo.`
            })

        const RolePermissions = role?.permissions.toArray() || [],
            BlockPermissionsArray = ['KICK_MEMBERS', 'BAN_MEMBERS', 'MANAGE_GUILD', 'MANAGE_MESSAGES', 'MUTE_MEMBERS', 'DEAFEN_MEMBERS', 'MOVE_MEMBERS', 'MANAGE_NICKNAMES', 'MANAGE_ROLES', 'ADMINISTRATOR', 'MODERATE_MEMBERS']

        for (const perm of RolePermissions)
            if (BlockPermissionsArray.includes(perm))
                return await interaction.reply({
                    content: `❌ | O cargo ${role} possui a permissão **${config.Perms[perm]}** ativada. Não vou prosseguir com a adição deste cargo, isso pode prejudicar o seu servidor.`
                })

        await interaction.reply({ content: '✅ | Tudo certo! Agora é hora de escolher qual o emoji do Reaction Role!', ephemeral: true })
        let msg = await channel.send({
            content: `${e.Loading} | Qual emoji você quer para este cargo?\n> **\`Reaja nesta mensagem com um emoji do Discord ou DESTE SERVIDOR.\`**\n> *Clique no ❌ caso não queria nenhum emoji.*`
        }), collected = false
        msg.react('❌').catch(() => { })

        let collector = msg.createReactionCollector({
            filter: (r, u) => u.id === user.id,
            time: 120000,
            errors: ['time']
        })
            .on('collect', (reaction) => {

                let { emoji } = reaction

                if (emoji.name === '❌') return registerReactionRole(null, msg)

                let emojiData = emoji.id || emoji.name

                if (emoji.id && !guild.emojis.cache.get(emoji.id))
                    return msg.edit(`${msg.content}\n \n❌ | Este emoji não pertence a este servidor. Por favor, escolha um emoji deste servidor ou do Discord.`)

                collected = true
                collector.stop()
                return registerReactionRole(emojiData, msg)
            })

            .on('end', () => {
                if (collected) return
                return msg.edit(`${e.Deny} | Criação do Reaction Role cancelado por falta de respota.`).catch(() => { })
            })

        async function registerReactionRole(emoji = null, msg) {
            msg.reactions.removeAll().catch(() => { })

            let objData = { roleId: role.id, title: title }

            if (emoji)
                objData.emoji = emoji

            if (description)
                objData.description = description


            let data = await Database.Guild.findOneAndUpdate(
                { id: guild.id },
                { $push: { ReactionRole: objData } }
            )

            return msg.edit({
                content: `${e.Check} | O cargo ${role} foi adicionado com sucesso a lista de reaction roles!\n${e.Info} | Para executar o novo reaction role, use o comando \`${prefix}reactionrole\` e clique em "Throw".\n${e.QuestionMark} | Configurou o cargo errado? Delete ele usando o comando \`${prefix}reactionrole\` na opção "Delete".\n${e.Stonks} | Agora, ${guild.name} possui ${data.ReactionRole?.length || 0} reaction roles!`
            }).catch(() => { })
        }
    }

    async function BugModalReport() {

        const textExplain = fields.getTextInputValue('bugTextInfo')
        const commandWithError = fields.getTextInputValue('commandBuggued') || 'Nenhum'
        let ChannelInvite = await channel.createInvite({ maxAge: 0 }).catch(() => { }) || null
        let guildName = ChannelInvite?.url ? `[${guild.name}](${ChannelInvite.url})` : guild.name

        const embed = {
            color: client.red,
            title: '📢 Report de Bug/Erro Recebido',
            url: ChannelInvite?.url || null,
            description: `> Reporte enviado de: ${guildName}\n> ${user.username} - \`${user.id}\`\n\`\`\`txt\n${textExplain || 'Nenhum dado coletado.'}\n\`\`\``,
            fields: [
                {
                    name: 'ℹ️ | Comando reportado',
                    value: `\`${commandWithError || 'Nenhum'}\``,
                }
            ],
            timestamp: new Date()
        }

        const { Config } = Database

        const guildChannel = client.channels.cache.get(Config.BugsChannelId)

        if (!guildChannel)
            return await interaction.reply({
                content: `❌ | Houve um erro ao encontrar o canal designado para recebimento de reports. Por favor, fale diretamente com meu criador: ${client.users.cache.get(Config.ownerId)?.tag || 'Não encontrado'}`,
                embeds: [embed],
                ephemeral: true
            })

        await guildChannel.send({ embeds: [embed] }).catch(async err => {
            return await interaction.reply({
                content: `❌ | Houve um erro ao enviar o reporte para o canal designado. Por favor, fale diretamente com meu criador: ${client.users.cache.get(Config.OwnerId)?.tag || 'Não encontrado'}\n${err}`,
                embeds: [embed],
                ephemeral: true
            })
        })

        return await interaction.reply({
            content: `✅ | Reporte enviado com sucesso! Muito obrigada pelo seu apoio.`,
            embeds: [embed],
            ephemeral: true
        })

    }

    async function newLetter() {

        let usernameData = fields.getTextInputValue('username')
        let anonymous = fields.getTextInputValue('anonymous')
        let letterContent = fields.getTextInputValue('letterContent'),
            isError = false

        let userLetted = getUser(usernameData, client),
            passCode = require('../../../modules/functions/plugins/PassCode')

        if (!userLetted)
            return await interaction.reply({
                content: `❌ | Não foi possível achar ninguém com o dado informado: "${usernameData}"`,
                embeds: [{
                    color: client.blue,
                    title: '📝 Letter\'s Content',
                    description: `\`\`\`txt\n${letterContent}\n\`\`\``
                }],
                ephemeral: true
            })

        if (userLetted.id === user.id)
            return await interaction.reply({
                content: '❌ | Você não pode enviar cartas para você mesmo.',
                ephemeral: true
            })

        if (userLetted.id === client.user.id)
            return await interaction.reply({
                content: '❌ | Eu agradeço seu gesto por me enviar uma carta, mas assim... Eu sou um bot, sabe? Fico te devendo essa.',
                ephemeral: true
            })

        if (userLetted.bot)
            return await interaction.reply({
                content: '❌ | Você não pode enviar cartas para bots.',
                ephemeral: true
            })

        let userData = await Database.User.findOne({ id: userLetted.id }, 'Letters.Blocked'),
            isBlock = userData?.Letters?.Blocked

        if (isBlock)
            return await interaction.reply({
                content: `❌ | Este usuário bloqueou o envio de cartas. Você vai precisar pedir para que ${userLetted.tag} libere o envio usando o comando '${prefix}carta block'`,
                ephemeral: true
            })

        let isAnonymous = ['sim', 'yes'].includes(anonymous?.toLowerCase()) ? true : false,
            ID = passCode(7).toLocaleUpperCase()

        try {

            await userLetted.send({
                content: `ℹ | Algum problema com a carta? Contacte algúm administrador usando o comando \`-adm\``,
                embeds: [{
                    color: client.blue,
                    title: `📨 ${client.user.username}'s Letters System`,
                    description: `ℹ Esta carta foi enviada por: ${isAnonymous ? '\`Usuário anônimo\`' : `${user.tag} - ${user.id}`}`,
                    fields: [{
                        name: `📝 Conteúdo da carta`,
                        value: `\`\`\`txt\n${letterContent}\n\`\`\``
                    }],
                    footer: { text: `A ${client.user.username} não se responsabiliza pelo conteúdo presente nesta carta.` }
                }]
            }).catch(() => {
                isError = true
                return error()
            })

            if (isError) return
            Database.subtractItem(user.id, 'Slot.Cartas', 1)
            Database.SetTimeout(user.id, 'Timeouts.Letter')

            Database.pushUserData(user.id, 'Letters.Sended', {
                letterId: ID,
                to: userLetted.id,
                guildId: guild.id,
                anonymous: isAnonymous,
                content: letterContent,
                date: Date.now()
            })

            Database.pushUserData(userLetted.id, 'Letters.Recieved', {
                letterId: ID,
                from: user.id,
                guildId: guild.id,
                anonymous: isAnonymous,
                content: letterContent,
                date: Date.now()
            })

            return await interaction.reply({
                content: `✅ | A carta foi enviada para ${userLetted.tag} com sucesso! (-1 carta)\n🕵️ | Anônimo: ${isAnonymous ? 'Sim' : 'Não'}`,
                ephemeral: true
            })

        } catch (err) {
            isError = true
            return error()
        }

        async function error() {
            isError = true
            return await interaction.reply({
                content: `❌ | Aparentemente a DM de ${userLetted.tag} está fechada e não posso efetuar o envio da carta.`,
                embeds: [{
                    color: client.blue,
                    title: '📝 Lette\'s Content',
                    description: `\`\`\`txt\n${letterContent}\n\`\`\``
                }],
                ephemeral: true
            })
        }

    }

    async function lettersReport() {

        let data = await Database.Guild.findOne({ id: guild.id }, 'Prefix'),
            prefix = data.Prefix || client.prefix

        let letterId = fields.getTextInputValue('letterId'),
            reason = fields.getTextInputValue('reason')

        let Channel = client.channels.cache.get(config.letterChannelReport)

        if (!Channel)
            return await interaction.reply({
                content: '❌ | Não foi possível contactar o canal de reports no servidor principal.',
                ephemeral: true
            })

        Channel.send({
            embeds: [{
                color: client.red,
                title: `${e.Loud} Novo reporte de carta recebido`,
                fields: [
                    {
                        name: '🆔 ID da Carta/Usuário',
                        value: `\`${letterId}\``
                    },
                    {
                        name: `${e.Info} Motivo do reporte`,
                        value: `\`\`\`txt\n${reason}\`\`\``
                    }
                ],
                footer: { text: `ID do usuário: ${user.id}` }
            }]
        })

        return await interaction.reply({
            content: `✅ | Seu reporte foi enviado com sucesso! Caso você não queira receber mais cartas através da Saphire, use o comando \'${prefix}carta block\'. A Staff da ${client.user.username} analisará o ocorrido e punirá o responsável a altura.`,
            ephemeral: true
        })
    }

}

module.exports = submitModalFunctions