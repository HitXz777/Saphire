const Database = require('../../../modules/classes/Database'),
    { e } = require('../../../JSON/emojis.json'),
    { eightyYears, Now, getUser, day } = require('../plugins/modalPlugins')

async function submitModalFunctions(interaction, client) {

    const { customId, fields, user, channel, guild } = interaction

    switch (customId) {
        case 'setStatusModal': setStatusModal(); break;
        case 'forcaChooseWord': forcaChooseWord(); break;
        case 'BugModalReport': BugModalReport(); break;
        case 'editProfile': editProfile(); break;
        case 'newLetter': newLetter(); break;
        case 'createNewGiveaway': createNewGiveaway(); break;
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
                return cancelReminder()

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

        let userLetted = getUser(usernameData, client)

        if (!userLetted)
            return await interaction.reply({
                content: `❌ | Não foi possível achar ninguém com o dado informado: "${usernameData}"`,
                embeds: [{
                    color: client.blue,
                    title: '📝 Lette\'s Content',
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

        let isAnonymous = ['sim', 'yes'].includes(anonymous?.toLowerCase()) ? true : false

        try {

            await userLetted.send({
                content: `ℹ | Algum problema com a carta? Contacte algúm administrador usando o comando \`-adm\``,
                embeds: [{
                    color: client.blue,
                    title: `📨 ${client.user.username}'s Letters System`,
                    description: `ℹ Está carta foi enviada por: ${isAnonymous ? '\`Usuário anônimo\`' : `${user.tag} - ${user.id}`}`,
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
                to: userLetted.id,
                guildId: guild.id,
                anonymous: isAnonymous,
                content: letterContent,
                date: Date.now()
            })

            Database.pushUserData(userLetted.id, 'Letters.Recieved', {
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

}

module.exports = submitModalFunctions