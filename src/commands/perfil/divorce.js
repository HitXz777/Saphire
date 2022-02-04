const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const Data = require('../../../Routes/functions/data')

module.exports = {
    name: 'divorcio',
    aliases: ['divórcio', 'divorce'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '💔',
    usage: '<divorce>',
    description: 'Divorcie do seu casamento',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
        if (!sdb.get(`Users.${message.author.id}.Perfil.Marry`)) return message.reply(`${e.Deny} | Você não está em um relacionamento.`)
        let ParID = sdb.get(`Users.${message.author.id}.Perfil.Marry`)

        return message.reply(`${e.QuestionMark} | Você deseja colocar um fim no seu casamento com <@${ParID}>?`).then(msg => {
            sdb.set(`Request.${message.author.id}`, `${msg.url}`)
            msg.react('✅').catch(() => { }) // Check
            msg.react('❌').catch(() => { }) // X

            const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

            msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                const reaction = collected.first()

                if (reaction.emoji.name === '✅') {
                    sdb.delete(`Request.${message.author.id}`)
                    Divorce()
                } else {
                    sdb.delete(`Request.${message.author.id}`)
                    msg.edit(`${e.Deny} | Comando cancelado.`)
                }
            }).catch(() => {
                sdb.delete(`Request.${message.author.id}`)
                msg.edit(`${e.Deny} | Comando cancelado por tempo expirado.`)
            })

            async function Divorce() {
                sdb.set(`Users.${ParID}.Perfil.Marry`, false)
                sdb.set(`Users.${message.author.id}.Perfil.Marry`, false)

                msg.edit(`${e.Check} | Divórcio concluído! Você não está mais se relacionando com <@${ParID}>.\nDivórcio pedido em: \`${Data()}\``)

                let Par = await client.users.cache.get(ParID)
                Par ? Par.send(`${e.Info} | ${message.author} > ${message.author.tag} \`${message.author.id}\` < pôs um fim no casamento.\nDivórcio pedido em: \`${Data()}\``).catch(() => { }) : ''
            }
        })
    }
}