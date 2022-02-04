const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const Data = require('../../../Routes/functions/data')
const { ServerDb } = require('../../../Routes/functions/database')

module.exports = {
    name: 'unban',
    aliases: ['desbanir', 'desban', 'ub'],
    category: 'moderation',
    UserPermissions: ['BAN_MEMBERS'],
    ClientPermissions: ['BAN_MEMBERS', 'EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: `${e.ModShield}`,
    usage: '<unban> <id>',
    description: 'Desban membros banidos',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
        if (!args[0]) return message.reply(`${e.Info} | Para desbanir um usuário, é necessário o ID dele. Para ver todos os membros banidos do servidor, use \`${prefix}ban list\`, basta copiar o ID e usar \`${prefix}unban ID [...Motivo]\``)

        let msgreason = args.slice(1).join(" ")
        if (!msgreason) msgreason = 'Sem motivo especificado'

        let IdChannel = ServerDb.get(`Servers.${message.guild.id}.LogChannel`)

        let ID = args[0]
        if (ID.length !== 18) return message.reply(`${e.Deny} | ID invalido. Todos os ID's possuem 18 caracteres, verique o ID informado.`)

        await message.guild.bans.fetch(ID).then(() => {
            return message.channel.send(`${e.QuestionMark} | Deseja desbanir o ID \`${ID}\` ?`).then(msg => {
                sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                msg.react('✅').catch(() => { }) // e.Check
                msg.react('❌').catch(() => { }) // X

                let reason = `${message.author.tag} diz: ${args.slice(1).join(" ")}`
                if (!reason) { reason = `${message.author.tag} não especificou nenhuma razão.` }

                const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                    const reaction = collected.first()

                    if (reaction.emoji.name === '✅') {
                        message.guild.bans.remove(ID, reason).then(ban => {
                            sdb.delete(`Request.${message.author.id}`)
                            IdChannel ? Notify(ban) : message.channel.send(`${e.NotStonks} | Servidor sem meu sistema logs? Usa \`${prefix}logs\` aí poxa...\n${e.Stonks} | But, no problem! ${ban.tag} foi desban com sucesso.`)
                            msg.delete().catch(() => { })
                        }).catch(err => { return message.channel.send(`${e.Warn} | O desban falhou! Caso você não saiba resolver o problema, use \`${prefix}bug\` e reporte o problema.\n\`${err}\``) })

                    } else {
                        sdb.delete(`Request.${message.author.id}`)
                        msg.edit(`${e.Check} | Request abortada | ${ID}/${message.author.id}/${message.guild.id}`)
                    }
                }).catch(() => {
                    sdb.delete(`Request.${message.author.id}`)
                    msg.edit(`${e.Check} | Request abortada: Tempo expirado | ${ID}/${message.author.id}/${message.guild.id}`)
                })

            })
        }).catch(() => { return message.reply(`${e.Deny} | Este ID não existe ou não está banido.`) })

        async function Notify(param) {

            const channel = await message.guild.channels.cache.get(IdChannel)
            if (!channel) return

            const embed = new MessageEmbed()
                .setColor('GREEN')
                .setTitle(`🛰️ | Global System Notification | Desbanimento`)
                .addFields(
                    { name: '👤 Usuário', value: `${param.tag} - *\`${param.id}\`*` },
                    { name: `${e.ModShield} Moderador`, value: `${message.author.tag}` },
                    { name: '📝 Razão', value: `${msgreason}` },
                    { name: '📅 Data', value: `${Data()}` }
                )
                .setThumbnail(param.displayAvatarURL({ dynamic: true }))
                .setFooter(`${message.guild.name}`, message.guild.iconURL({ dynamic: true }))

            return channel.send({ embeds: [embed] }).then(Message => {
                const embed = new MessageEmbed()
                    .setColor('GREEN')
                    .setDescription(`${e.Check} | Você pode ver mais detalhes [aqui](${Message.url})`)
                message.channel.send({ embeds: [embed] })
            }).catch(err => {
                message.channel.send(`${e.Deny} | Ocorreu um erro ao executar o comando.\n\`${err}\``)
            })
        }
    }
}