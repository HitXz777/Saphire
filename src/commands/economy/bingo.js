const { e } = require('../../../database/emojis.json')
const Moeda = require('../../../Routes/functions/moeda')
const Colors = require('../../../Routes/functions/colors')
const { PushTransaction } = require('../../../Routes/functions/transctionspush')

module.exports = {
    name: 'bingo',
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '💴',
    usage: '<bingo> quantia',
    description: 'Jogar bingo é divertido',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let money = parseInt(sdb.get(`Users.${message.author.id}.Balance`)),
            ChannelActived = db.get(`BingoOn${message.author.id}`)

        if (ChannelActived) return message.reply(`${e.Nagatoro} | Opa opa coisinha fofa! Já tem um bingo rolando nesse chat.\n${ChannelActived}`)

        const BingoEmbed = new MessageEmbed()
            .setColor(Colors(message.member))
            .setTitle(`💴 Bingo ${client.user.username}`)
            .setDescription('Jogar bingo é MUITO BOM! Com este comando você e todo o chat pode jogar bingo sem toda aquela burocracia')
            .addField(`${e.SaphireObs} Como jogar?`, `Quando alguém mandar um bingo no chat, basta você digitar o **NÚMERO** que você acha que é.`)
            .addField(`${e.SaphireObs} Como iniciar um bingo?`, `Use o comando \`${prefix}bingo [quantia/all]\`. É só isso mesmo.`)

        if (!args[0]) return message.reply({ embeds: [BingoEmbed] })

        let quantia = parseInt(args[0].replace(/k/g, '000'))
        if (['all', 'tudo'].includes(args[0]?.toLowerCase())) quantia = money
        if (isNaN(quantia)) return message.reply(`${e.Deny} | O valor não é um número`)
        if (quantia > money || quantia <= 0) return message.reply(`${e.Deny} | Você não tem todo esse dinheiro na carteira.`)

        sdb.add(`Users.${message.author.id}.Cache.BingoPrize`, quantia)
        sdb.subtract(`Users.${message.author.id}.Balance`, quantia)
        PushTransaction(
            message.author.id,
            `💸 Inicou um bingo no valor de ${quantia || 0} Moedas`
        )

        let Number = Math.floor(Math.random() * 90)
        Number = Number === 0 ? 1 : Number

        const Bingo = new MessageEmbed()
            .setColor('GREEN')
            .setTitle(`${message.author.username} iniciou um Bingo.`)
            .setDescription(`🏆 ${quantia} ${Moeda(message)}\n \nAdivinhe o número do bingo!\n**1 a 90**`)
            .setFooter('Tempo: 1 Minuto')

        message.channel.send({ embeds: [Bingo] }).then(msg => {
            db.set(`BingoOn${message.author.id}`, `${msg.url}`)

            const filter = msg => msg.content === (`${Number}`)
            const collector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 })

            collector.on('collect', WinnerMsg => {
                sdb.set(`Bingo.${message.channel.id}`, true)
                Bingo.setTitle(`${message.author.username} fez um Bingo.`).setDescription(`🏆 ${quantia} ${Moeda(message)}\n${e.OwnerCrow} ${WinnerMsg.author} Acertou o número: ${Number}`).setFooter('Concluído')
                msg.edit({ embeds: [Bingo] }).catch(() => { })
                sdb.add(`Users.${WinnerMsg.author.id}.Cache.Resgate`, (sdb.get(`Users.${message.author.id}.Cache.BingoPrize`) || 0))
                PushTransaction(
                    WinnerMsg.author.id,
                    `💰 Recebeu ${quantia || 0} Moedas jogando no bingo`
                )
                sdb.delete(`Users.${message.author.id}.Cache.BingoPrize`)
                WinnerMsg.reply(`${e.MoneyWings} | ${WinnerMsg.author} acertou o número do bingo! **${Number}**\n${e.PandaProfit} | ${(sdb.get(`Users.${WinnerMsg.author.id}.Cache.Resgate`) || 0)} ${Moeda(message)} estão no seu cache. Use \`${prefix}resgate\` para resgatar seu cache.\nBingo link: ${db.get(`BingoOn${message.author.id}`)}`).catch(() => { })
                db.delete(`BingoOn${message.author.id}`)
            })

            collector.on('end', () => {
                if (!sdb.get(`Bingo.${message.channel.id}`)) {
                    Bingo.setColor('RED').setTitle(`${message.author.username} fez um Bingo.`).setDescription(`🏆 ${quantia} ${Moeda(message)}\n${e.Deny} Ninguém acertou o número: ${Number}`).setFooter('Concluído')
                    msg.edit({ embeds: [Bingo] }).catch(() => { })
                    sdb.add(`Users.${message.author.id}.Cache.Resgate`, (sdb.get(`Users.${message.author.id}.Cache.BingoPrize`) || 0))
                    PushTransaction(
                        message.author.id,
                        `💰 Recebeu ${sdb.get(`Users.${message.author.id}.Cache.BingoPrize`) || 0} Moedas jogando no bingo`
                    )
                    sdb.delete(`Users.${message.author.id}.Cache.BingoPrize`)
                    message.channel.send(`${e.Deny} | Tempo do bingo expirado!\n${message.author}, o dinheiro lançado no Bingo está no seu cache.\nBingo Link: ${db.get(`BingoOn${message.author.id}`)}`)
                    db.delete(`BingoOn${message.author.id}`)
                } else {
                    sdb.delete(`Bingo.${message.channel.id}`)
                    db.get(`BingoOn${message.author.id}`)
                }
            })

        }).catch(() => {
            sdb.delete(`Bingo.${message.channel.id}`)
            db.delete(`BingoOn${message.author.id}`)
        })
    }
}