const { e } = require('../../../JSON/emojis.json'),
    { Permissions } = require('discord.js'),
    Data = require('../../../modules/functions/plugins/data'),
    isUrl = require('../../../modules/functions/plugins/isurl')

module.exports = {
    name: 'ban',
    aliases: ['banir'],
    category: 'moderation',
    UserPermissions: ['BAN_MEMBERS'],
    ClientPermissions: ['BAN_MEMBERS'],
    emoji: `${e.ModShield}`,
    usage: '<ban> <@user> [Motivo] | <ban> <list> | <ban> <id>',
    description: 'Banir membros e checagem de bans',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let guildData = await Database.Guild.findOne({ id: message.guild.id }, 'LogChannel banGif'),
            IdChannel = guildData?.LogChannel, gif = guildData.banGif || null,
            reason = args.slice(1).join(" ")

        if (!reason) reason = 'Sem motivo informado'

        if (['lista', 'list', 'histórico', 'historico'].includes(args[0]?.toLowerCase())) return banList()
        if (['gif', 'image', 'setgif', 'setimage'].includes(args[0]?.toLowerCase())) return setGif()

        if (!isNaN(args[0])) {

            if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.reply(`${e.Deny} | Este comando é muito "forte". Então, é privado somente para administradores.`)
            let ID = args[0]
            if (ID.length !== 18) return message.reply(`${e.Deny} | ID's de usuários possuem 18 digitos, verifique o ID informado.`)

            return message.guild.bans.fetch(ID).then(() => {
                return message.reply(`${e.Deny} | Este ID já está banido.`)
            }).catch(async () => {

                const msg = await message.reply(`${e.QuestionMark} | Desejar forçar o ban do ID \`${ID}\` ?`)
                msg.react('✅').catch(() => { }) // e.Check
                msg.react('❌').catch(() => { }) // X

                return msg.awaitReactions({
                    filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                    max: 1,
                    time: 20000,
                    errors: ['time']
                }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {

                        return message.guild.bans.create(ID)
                            .then(ban => {
                                return IdChannel ?
                                    (() => {
                                        Notify(ban, true)
                                        msg.edit(`${e.Check} | Prontinho! Eu mandei as informações no canal <#${IdChannel}>`).catch(() => { })
                                    })()
                                    : msg.edit(`${e.Check} | Prontinho! Eu não achei o canal de logs no servidor :( Ativa ele ou apenas veja do que ele é capaz -> \`-logs\``).catch(() => { })
                            })
                            .catch(err => {

                                if (err.code === 10013) return msg.edit(`${e.Info} | Este id não confere com nenhum usuário do Discord.`).catch(() => { })
                                if (err.code === 50013) return msg.edit(`${e.Info} | Não tenho permissão o suficiente para forçar o ban deste usuário.`).catch(() => { })

                                return msg.edit(`${e.Warn} | Opa! Deu um erro aqui.\n\`${err}\``).catch(() => { })
                            })
                    }

                    return msg.edit(`${e.Check} | Request FORCEBAN abortada`)
                }).catch(() => msg.edit(`${e.Check} | Request FORCEBAN abortada: Tempo Expirado`))

            })

        }

        let searchForAnUser = message.mentions.members.first() || message.mentions.repliedUser || message.guild.members.cache.get(args[0])
        let user = message.guild.members.cache.get(searchForAnUser?.id)
        if (!user) return message.reply(`${e.Info} | Para banir alguém se faz assim \`${prefix}ban [@user] [Motivo do banimento]\`\n${e.QuestionMark} | Quer ver a lista de bans do servidor? \`${prefix}ban [list]\`\n${e.ModShield} | Quer banir usando a força? \`${prefix}ban [ID] [Motivo do banimento]\`\n🖼️ | Quer uma imagem irada? \`${prefix}ban [gif] [Link da imagem] ou [reset]\``)
        if (user.id === message.author.id) return message.reply(`${e.SaphireQ} | Por qual motivo neste mundo você se baniria? Vem ver isso @.everyone! Ele quer se banir`)
        if (user.id === message.guild.ownerId) return message.reply(`${e.Deny} | Não dá para banir o dono do servidor, sabia?`)
        if (user.permissions.toArray()?.find(data => ['ADMINISTRATOR', 'KICK_MEMBERS'].includes(data))) return message.reply(`${e.Deny} | Não posso banir ${user.user.username}... É muito poder envolvido.`)
        if (!user.bannable) return message.reply(`${e.SaphireQ} | Por algum motivo eu não posso banir esta pessoa.`)

        const msg = await message.reply(`${e.QuestionMark} | ${message.author}, você está prestes a banir ${user} do servidor pelo motivo -> "**${reason}**".\nDeseja prosseguir com o banimento?`)

        msg.react('✅').catch(() => { }) // e.Check
        msg.react('❌').catch(() => { }) // X

        return msg.awaitReactions({
            filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
            max: 1,
            time: 20000,
            errors: ['time']
        }).then(collected => {
            const reaction = collected.first()

            if (reaction.emoji.name === '✅') {
                user.ban({ days: 7, reason: reason })
                    .then(ban => {
                        if (IdChannel) {
                            msg.edit(`${e.Check} | Prontinho chefe! Eu mandei as informações no canal <#${IdChannel}>`)
                            return Notify(ban, false)
                        }
                        return message.reply(`${e.Check} | Feito! Cof Cof... \`-logs\``)
                    })
                    .catch(err => message.reply(`${e.Warn} | Ocorreu um erro durante o banimento... Caso você não saiba resolver, use o comando \`${prefix}bug\` e relate o problema.\n\`${err}\``))
            }

            return msg.edit(`${e.Deny} | Request BAN abortada`)
        }).catch(() => msg.edit(`${e.Deny} | Request BAN abortada: Tempo Expirado`))

        async function Notify(ban, x) {
            let banid = `${ban.user?.tag ?? ban.tag ?? ban}`

            if (!IdChannel) return

            const embed = new MessageEmbed()
                .setColor('RED')
                .addFields(
                    { name: '👤 Usuário', value: `${banid} - *\`${ban.id}\`*` },
                    { name: `${e.ModShield} Moderador`, value: `${message.author.tag}` },
                    { name: '📝 Razão', value: `${reason || 'Sem motivo informado'}` },
                    { name: '📅 Data', value: `${Data()}` }
                )
                .setImage(gif)
                .setFooter({ text: `${message.guild.name}`, iconURL: message.guild.iconURL({ dynamic: true }) })

            x ? embed.setTitle(`🛰️ | Global System Notification | Forceban`) : embed.setTitle(`🛰️ | Global System Notification | Banimento`)
            x ? embed.setThumbnail(ban?.displayAvatarURL({ dynamic: true })) : embed.setThumbnail(ban.user.displayAvatarURL({ dynamic: true }))

            return message.guild.channels.cache.get(IdChannel)?.send({ embeds: [embed] }).catch(() => { })

        }

        async function banList() {

            let banneds = await message.guild.bans.fetch()
            let banned = []

            banneds.forEach(ban => banned.push(ban))

            if (banned.length === 0) return message.reply(`${e.Check} | Nenhum usuário banido`)

            let emojis = ['⬅️', '➡️', '❌'],
                control = 0,
                embeds = EmbedGenerator(banned),
                Msg = await message.reply({ embeds: [embeds[0]] })

            if (embeds.length > 1)
                for (let i of emojis) Msg.react(i).catch(() => { })
            else return

            const collector = Msg.createReactionCollector({
                filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
                idle: 30000
            })

            collector.on('collect', (reaction) => {

                if (reaction.emoji.name === emojis[2]) return collector.stop()

                if (reaction.emoji.name === emojis[0]) {
                    control--
                    return embeds[control] ? Msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control++
                }

                if (reaction.emoji.name === emojis[1]) {
                    control++
                    return embeds[control] ? Msg.edit({ embeds: [embeds[control]] }).catch(() => { }) : control--
                }
                return
            })

            collector.on('end', () => Msg.edit({ content: `${e.Deny} | Comando cancelado` }).catch(() => { }))
            return


            function EmbedGenerator(array) {

                let amount = 5,
                    Page = 1,
                    embeds = [],
                    length = array.length / 5 <= 1 ? 1 : parseInt((array.length / 5) + 1)

                for (let i = 0; i < array.length; i += 5) {

                    let current = array.slice(i, amount),
                        description = current.map(user => `${user.user.tag} \`${user.user.id}\`\nMotivo: ${user.reason || 'Sem motivo informado'}\n--------------`).join('\n'),
                        PageCount = `${length > 1 ? `${Page}/${length}` : ''}`

                    if (current.length > 0) {

                        embeds.push({
                            color: client.blue,
                            title: `${e.ModShield} Lista de Banidos - ${PageCount}`,
                            description: `> ${description || 'Nada foi encontrado'} `,
                            footer: {
                                text: `${array.length} usuários banidos contabilizados`
                            },
                        })

                        Page++
                        amount += 5

                    }

                }

                return embeds;
            }

        }

        async function setGif() {

            if (['reset', 'del', 'delete', 'deletar', 'excluir'].includes(args[1]?.toLowerCase())) return resetBanGif()

            let gif = args[1]

            if (!gif)
                return message.reply(`${e.Deny} | Tenta assim: \`${prefix}ban gif https://linkDoGif.com/dsa...\``)

            if (!isUrl(gif))
                return message.reply(`${e.Deny} | O link do gif deve ser um link, não acha?`)

            await Database.Guild.updateOne(
                { id: message.guild.id },
                {
                    $set: {
                        banGif: gif
                    }
                }
            )

            return message.channel.send({
                content: `${e.Check} | Imagem de banimento alterada com sucesso!`,
                embeds: [{
                    color: client.blue,
                    description: `Para remover a imagem, use \`${prefix}ban gif reset\``,
                    image: { url: gif },
                    footer: { text: 'Se a imagem não aparecer, o link fornecido não é válido para o Discord.' }
                }]
            }).catch(async err => {

                await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { $unset: { banGif: 1 } }
                )

                return message.channel.send({
                    content: `${e.Warn} | Erro ao configurar o GIF.\n> \`${err}\``
                })
            })

        }

        async function resetBanGif() {

            if (banGif) return message.reply(`${e.Deny} | Este servidor não possui nenhum gif de ban. Para colocar um, use \`${prefix}ban gif <LinkDoGifOuImagem>\``)

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $unset: { banGif: 1 } }
            )

            return message.reply(`${e.Check} | O Gif de banimento foi removido com sucesso deste servidor!`)
        }

    }
}