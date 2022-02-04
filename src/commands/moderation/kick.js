const { e } = require('../../../database/emojis.json')
const { g } = require('../../../Routes/Images/gifs.json')
const { f } = require('../../../database/frases.json')
const { ServerDb } = require('../../../Routes/functions/database')

module.exports = {
    name: 'kick',
    aliases: ['expulsar', 'retirar'],
    category: 'moderation',
    UserPermissions: ['KICK_MEMBERS'],
    ClientPermissions: ['KICK_MEMBERS', 'ADD_REACTIONS'],
    emoji: `${e.ModShield}`,
    usage: '<kick> <@user> [ID]',
    description: 'Expulse membros do servidor',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        let member
        if (!isNaN(args[0])) {
            member = message.guild.members.cache.get(args[0])
            if (!member) {
                return args.length === 18 ? message.reply(`${e.Deny} | ID Inválido. ID's possuem 18 caracteres.`) : message.reply(`${e.Deny} | ID Inválido ou o usuário não está no servidor.`)
            }
        } else {
            member = message.mentions.members.first()
        }

        let reason = args.slice(1).join(" ") || 'Sem motivo informado'
        let logchannel = ServerDb.get(`Servers.${message.guild.id}.LogChannel`)

        if (!args[0]) { return message.reply(`${e.Info} | Comando Kick/Expulsar\n \n\`${prefix}kick @user [Razão(opicional)]\` - Expulse alguém do servidor.\n\`${prefix}kick ID [Razão(opicional)]\` - Expulse alguém pelo ID`) }
        if (!member) { return message.reply(`${e.Deny} | Você precisa marcar alguém ou fornecer um ID válido`) }
        if (!member.kickable) { return message.reply(`${e.Deny} | Eu não posso expulsar este usuário.`) }
        if (member.id === message.author.id) { return message.reply(`${e.Deny} | Foi mal, mas eu não vou te expulsar.`) }

        return message.reply(`${e.QuestionMark} | Você deseja expulsar ${member} do servidor pelo motivo: **${reason}**`).then(msg => {
            sdb.set(`Request.${message.author.id}`, `${msg.url}`)
            msg.react('✅').catch(() => { }) // Check
            msg.react('❌').catch(() => { }) // X

            const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '✅') {
                    sdb.delete(`Request.${message.author.id}`)
                    const KickEmbed = new MessageEmbed().setColor('#246FE0').setTitle(`🛰️ | Global System Notification | Kick`).setThumbnail(member.user.displayAvatarURL({ dynamic: true })).addField('Usuário Expulso', member.user.tag).addField('ID', `*\`${member.user.id}\`*`).addField('Kickado por', message.author.username).addField('Razão', reason).setFooter(`${message.guild.name}`).setTimestamp()
                    member.kick([`Author do Kick: ${message.author.tag} | ${reason}`]).then(async () => {

                        let canal = await message.guild.channels.cache.get(logchannel)
                        if (canal) canal.send({ embeds: [KickEmbed] })
                        msg.edit(`${e.Check} | O membro "${member.user.tag}" foi expulso do servidor sob as ordens de "${message.author}" com o motivo: "${reason}"\n${message.author.id}/${member.id}/${message.guild.id}`).catch(() => { })
                    }).catch(err => {
                        msg.edit(`${e.Deny} | Houve algo incomum na execução da expulsão. Caso não saiba resolver, use o comando \`${prefix}bug\` ou procure ajuda no meu servidor \`${prefix}servers\`\n\`${err}\``).catch(() => { })
                    })

                } else {
                    sdb.delete(`Request.${message.author.id}`)
                    msg.edit(`${e.Deny} | Request cancelada | ${message.author.id}`).catch(() => { })
                }
            }).catch(err => {
                sdb.delete(`Request.${message.author.id}`)
                msg.edit(`${e.Deny} | Request cancelada: Tempo expirado | ${message.author.id}`).catch(() => { })
            })
        })
    }
}