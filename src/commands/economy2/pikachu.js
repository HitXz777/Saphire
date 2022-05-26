const { e } = require('../../../JSON/emojis.json'),
    Moeda = require('../../../modules/functions/public/moeda'),
    Pikachu = require('./classes/pikachu')

module.exports = {
    name: 'pikachu',
    aliases: ['zeppelin', 'zep', 'pika', 'pk'],
    category: 'economy',
    emoji: `${e.pikachuRunning} || '🎈'`,
    usage: 'pikachu <info>',
    description: 'Um jogo de aposta na base da sorte com o Pikachu.',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let zeppelin = await Database.Client.findOne({ id: client.user.id }, 'Zeppelin'),
            moeda = await Moeda(message),
            ballon = e.pikachuRunning || '🎈',
            boom = e.pikachuLose || '💥',
            stateZero = e.pikachuInBrush || '🎈',
            jumping = e.pikachuJump || '🎈'

        if (!args[0] || ['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return zeppelinInfo()

        return new Pikachu().game(client, message, args, prefix, Database, data = {
            zeppelin: zeppelin,
            moeda: moeda,
            ballon: ballon,
            boom: boom,
            stateZero: stateZero,
            jumping: jumping,
            e: e
        })

        function zeppelinInfo() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${ballon} Jogue a aposte na base dos números`)
                        .setDescription(`Você aposta uma quantia de Safiras e deve cancelar a aposta antes que o balão estoure.`)
                        .addFields(
                            {
                                name: `${e.QuestionMark} Como funciona?`,
                                value: 'O balão vai voando e voando carregando o Pikachu e a distância vai aumentando. Se ele estourar, você perde. Se você cancelar antes dele estourar, você ganha metade do valor da sua aposta vezes o número da distância que você parou o voo.'
                            },
                            {
                                name: `${e.Stonks} 1.8`,
                                value: 'O número minímo para você salvar o Pikachu é **1.8**. Se o balão estourar antes disso, meus pesâmes. Você perdeu e o Pikachu também.'
                            },
                            {
                                name: '🔍 Dados do Pikachu Running',
                                value: `Total de dinheiro ganho: ${zeppelin.Zeppelin.winTotalMoney?.toFixed(0) || 0} ${moeda}\nTotal de dinheiro perdido: ${zeppelin.Zeppelin.loseTotalMoney?.toFixed(0) || 0} ${moeda}\nMaior distância: ${zeppelin.Zeppelin.distanceData?.winner || 'Nenhum dado encontrado.'}`
                            }
                        )
                        .setFooter({ text: `${client.user.username}'s Bet Games` })
                ]
            })
        }

    }
}