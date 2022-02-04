const ms = require("parse-ms")
const { e } = require('../../../database/emojis.json')
const Moeda = require('../../../Routes/functions/moeda')
const Timeout = require("../../../Routes/functions/Timeout")
const { PushTransaction, TransactionsPush } = require("../../../Routes/functions/transctionspush")

module.exports = {
    name: 'roubar',
    aliases: ['rob'],
    category: 'economy',
    emoji: `${e.Coin}`,
    usage: '<rob> <@user/ID>',
    description: 'Roube dinheiro da carteira de outras pessoas',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const RouboInfo = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`${e.Info} | Informações do comando Roubo`)
            .setDescription(`O sistema de roubo da ${client.user.username} é um pouco diferente.\nVocê rouba uma quantia aleatória do valor que o seu alvo possui na **carteira**. E você só tem duas possibilidades.`)
            .addField(`${e.Sirene} | Falha`, `Se a tentativa do roubo falhar, você vai preso e pagará uma fiança. Esta fiança tem o valor de **4x a quantia que você iria roubar**. Sendo assim, quanto maior a quantia, maior o dinheiro que você irá perder.\n~~ O dinheiro será retirado de seu banco.`)
            .addField(`${e.PandaBag} | Sucesso`, `Você receberá uma quantia aleatória do valor que seu alvo possui na carteira, envolve de **1 a 100% do valor**.\n~~O dinheiro será adicionado na sua carteira.`)
            .addField(`${e.Info} | Roubar o Ranking Global`, `Você pode tentar roubar os **Top 10 Globais** usando o ID que é mostrado no \`${prefix}rank money\`.\n~~As regras de falha/sucesso também se aplica nesta categoria.`)
            .addField(`${e.On} | Comando`, `\`${prefix}roubar @user/ID\``)

        if (['help', 'info', 'ajuda'].includes(args[0]?.toLowerCase())) return message.reply({ embeds: [RouboInfo] })

        let timeout = 1200000,
            daily = sdb.get(`Users.${message.author.id}.Timeouts.Roubo`),
            time = ms(timeout - (Date.now() - daily))

        if (Timeout(timeout, daily))
            return message.reply(`${e.Sirene} | ${message.author}, a polícia está em sua busca... Tente novamente em \`${time.minutes}m e ${time.seconds}s\`.`)

        let user = message.mentions.users.first() || client.users.cache.get(args[0]) || message.mentions.repliedUser || client.users.cache.find(user => user.username?.toLowerCase() == args[0]?.toLowerCase() || user.tag?.toLowerCase() == args[0]?.toLowerCase())

        if (!user)
            return message.reply(`${e.Info} | Mencione alguém ou use \`${prefix}roubar info\``)

        if (args[0] && !user)
            return message.reply(`${e.Deny} | Eu não consegui encontar ninguém...`)

        if (user.id === message.author.id) return message.reply(`${e.Deny} | Vou nem responder isso, ok?`)
        if (user.id === client.user.id) return message.reply(`${e.Nagatoro} | Você realmente quer me roubar?`)
        let usermoney = sdb.get(`Users.${user.id}.Balance`) || 0
        if (usermoney <= 0) return message.reply(`${e.Deny} | ${user.username} não possui dinheiro na carteira.`)

        let luck = ['true', 'false'],
            result = luck[Math.floor(Math.random() * luck.length)],
            amount = Math.floor(Math.random() * usermoney * 4) + 1,
            amount1 = Math.floor(Math.random() * usermoney) + 1
            
        result === 'true' ? win() : lose()

        function lose() {
            sdb.subtract(`Users.${message.author.id}.Balance`, amount);

            PushTransaction(
                message.author.id,
                `${e.MoneyWithWings} Perdeu ${amount} Moedas ao tentar roubar ${user.tag}`
            )

            sdb.set(`Users.${message.author.id}.Timeouts.Roubo`, Date.now())
            return message.reply(`${e.Sirene} | A polícia te pegou mas você escapou.\n-${amount} ${Moeda(message)}`)
        }

        function win() {
            sdb.subtract(`Users.${user.id}.Balance`, amount1);
            sdb.add(`Users.${message.author.id}.Balance`, amount1);
            sdb.set(`Users.${message.author.id}.Timeouts.Roubo`, Date.now())

            TransactionsPush(
                user.id,
                message.author.id,
                `${e.MoneyWithWings} Perdeu ${amount1} Moeda em um roubo para ${message.author.tag}`,
                `${e.BagMoney} Roubou ${amount1} Moedas de ${user.tag}`
            )

            return message.reply(`${e.PandaBag} | Você roubou ${user.username} com sucesso!\n+${amount1} ${Moeda(message)}`)
        }

    }
}

