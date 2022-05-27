const Database = require('../../../modules/classes/Database'),
    { Emojis: e } = Database,
    { eightyYears, Now, getUser } = require('./modalPlugins')

async function submitModalFunctions(interaction, client) {

    const { customId, fields, user, channel, guild } = interaction

    switch (customId) {
        case 'setStatusModal': setStatusModal(); break;
        case 'forcaChooseWord': forcaChooseWord(); break;
        case 'BugModalReport': BugModalReport(); break;
        case 'editProfile': editProfile(); break;
        case 'newLetter': newLetter(); break;
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

        let message = await interaction.reply({
            content: '✅ | Ok! Palavra coletada com sucesso!',
            fetchReply: true
        })

        return new Forca().game(client, false, [], prefix, MessageEmbed, Database, word?.toLowerCase(), user, message.channel)
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
                content: `${e.Info} | Algum problema com a carta? Contacte algúm administrador usando o comando \`-adm\``,
                embeds: [{
                    color: client.blue,
                    title: `📨 ${client.user.username}'s Letters System`,
                    description: `${e.Info} Está carta foi enviada por: ${isAnonymous ? '\`Usuário anônimo\`' : `${user.tag} - ${user.id}`}`,
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