const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const { TransactionsPush } = require('../../../Routes/functions/transctionspush')
const Moeda = require('../../../Routes/functions/moeda')


module.exports = {
    name: 'pix',
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.Pix}`,
    usage: '<pix> <user/id> <quantia>',
    description: 'Faça um Pix direto pro banco de alguém.',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return InfoPix()

        let user = message.mentions.users.first() || client.users.cache.get(args[0]) || client.users.cache.get(args[1]) || client.users.cache.find(user => user.username?.toLowerCase() == args[0]?.toLowerCase() || user.tag?.toLowerCase() == args[0]?.toLowerCase()) || message.mentions.repliedUser
        if (!isNaN(args[0]) && !user) return message.reply(`${e.Deny} | Eu não encontrei ninguém com esse ID...`)
        if (!user) return message.reply(`${e.Pix} | Transfira dinheiro de banco para banco, evitando roubos e assaltos. É assim olha: \`${prefix}pix <@user/id> <quantia>\``)
        if (user.id === client.user.id) return message.reply(`${e.HiNagatoro} | Preciso não coisa fofa, eu já sou rica.`)
        if (user.id === message.author.id) return message.reply(`${e.Deny} | Nada de pix para você mesmo.`)
        if (user.bot) return message.reply(`${e.Deny} | Nada de bots.`)

        let money = parseInt(sdb.get(`Users.${message.author.id}.Bank`)) || 0
        if (money <= 0) return message.reply(`${e.Deny} | Você não possui dinheiro no banco para fazer Pix.`)

        let quantia = parseInt(args[1]?.replace(/k/g, '000'))
        !isNaN(quantia) ? (quantia = quantia) : (quantia = parseInt(args[0]?.replace(/k/g, '000')))

        if (['all', 'tudo'].includes(args[0]?.toLowerCase()) || ['all', 'tudo'].includes(args[1]?.toLowerCase())) quantia = money || 0
        if (!quantia) return message.reply(`${e.Deny} | Só faltou dizer o valor do pix`)
        if (isNaN(quantia)) return message.reply(`${e.Deny} | **${quantia}** | A quantia deve ser um número.`)
        if (quantia > money) return message.reply(`${e.Deny} | Você não tem essa quantia no seu banco.`)
        if (quantia <= 0) return message.reply(`${e.Deny} | Você não pode fazer um pix menor que 1 ${Moeda(message)}, baaaaka.`)
        sdb.add(`Users.${message.author.id}.Cache.Pix`, quantia)
        sdb.subtract(`Users.${message.author.id}.Bank`, quantia)

        return message.reply(`${e.Pix} | Você confirma a Transação PIX no valor de **${sdb.get(`Users.${message.author.id}.Cache.Pix`)} ${Moeda(message)}** para ${user.username}?`).then(msg => {
            sdb.set(`Request.${message.author.id}`, `${msg.url}`)
            msg.react('✅').catch(() => { }) // Check
            msg.react('❌').catch(() => { }) // X

            msg.awaitReactions({
                filter: (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id,
                max: 1,
                time: 20000,
                errors: ['time']
            }).then(collected => {
                const reaction = collected.first()
                sdb.delete(`Request.${message.author.id}`)

                return reaction.emoji.name === '✅' ? NewPix(msg) : PixCancel(msg)
            }).catch(() => {
                sdb.delete(`Request.${message.author.id}`)
                PixTimeout(msg)
            })

        })

        function NewPix(msg) {
            sdb.add(`Users.${user.id}.Bank`, (sdb.get(`Users.${message.author.id}.Cache.Pix`) || 0))
            TransactionsPush(
                user.id,
                message.author.id,
                `💰 Recebeu ${sdb.get(`Users.${message.author.id}.Cache.Pix`) || 0} Moedas de ${message.author.tag} via pix`,
                `💸 Enviou ${sdb.get(`Users.${message.author.id}.Cache.Pix`) || 0} Moedas para ${user.tag} via pix`
            )
            msg.edit(`${e.Pix} | Transação PIX efetuada com sucesso!\n${e.PandaProfit} Stats\n${message.author.tag} -${sdb.get(`Users.${message.author.id}.Cache.Pix`) || 0} ${Moeda(message)}\n${user.username} +${sdb.get(`Users.${message.author.id}.Cache.Pix`) || 0} ${Moeda(message)}`).catch(() => { })
            sdb.delete(`Users.${message.author.id}.Cache.Pix`)
        }

        function PixCancel(msg) {
            sdb.add(`Users.${message.author.id}.Bank`, (sdb.get(`Users.${message.author.id}.Cache.Pix`) || 0))
            sdb.delete(`Users.${message.author.id}.Cache.Pix`)

            return msg.edit(`${e.Deny} | Transação PIX cancelada.`)
        }

        function PixTimeout(msg) {
            let value = sdb.get(`Users.${message.author.id}.Cache.Pix`) || 0
            if (value > 0) sdb.add(`Users.${message.author.id}.Bank`, value)
            sdb.delete(`Users.${message.author.id}.Cache.Pix`)

            return msg.edit(`${e.Deny} | Transação PIX cancelada por tempo expirado.`)
        }

        function InfoPix() {
            const PixEmbed = new MessageEmbed().setColor('#00BDAE').setTitle(`${e.Pix} ${client.user.username} PIX`).setDescription(`${e.SaphireObs} Com o comando \`${prefix}pix\`, você pode fazer uma transferência de banco para banco.`).addField(`- Comando`, `\`${prefix}pix <@user/Id> <quantia>\``)
            return message.reply({ embeds: [PixEmbed] })
        }
    }
}