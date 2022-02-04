const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')
const ms = require('parse-ms')
const colors = require('../../../Routes/functions/colors')
const Moeda = require('../../../Routes/functions/moeda')
const PassCode = require('../../../Routes/functions/PassCode')
const { PushTransaction } = require('../../../Routes/functions/transctionspush')

// #246FE0 - Azul Saphire
module.exports = {
    name: 'investir',
    aliases: ['bolsadevalores', 'bolsa'],
    category: 'economy',
    emoji: '📊',
    usage: '<bolsa> <check/valor>',
    description: 'Bolsa de Valores',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let Empresa,
            Invest,
            Pass = PassCode(30),
            Bolsa = parseInt(sdb.get(`Users.${message.author.id}.Bolsa`)?.toFixed(0)) || 0,
            Money = parseInt(sdb.get(`Users.${message.author.id}.Balance`)?.toFixed(0)) || 0,
            Chance,
            Lucro,
            TimeBolsa = ms(172800000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Bolsa`))),
            Result,
            Valor = parseInt(args[1]) || false

        if (!args[0]) return InitialEmbed()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return BolsaInfo()
        if (['me', 'eu'].includes(args[0]?.toLowerCase())) return BolsaMeInfo()

        if (sdb.get(`Users.${message.author.id}.Timeouts.Bolsa`) !== null && 172800000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Bolsa`)) > 0) {
            return message.reply(`${e.Loading} Investimento em andamento. Tente novamente em: \`${TimeBolsa.days}d ${TimeBolsa.hours}h ${TimeBolsa.minutes}m e ${TimeBolsa.seconds}s\``)
        } else { sdb.delete(`Users.${message.author.id}.Timeouts.Bolsa`) }

        if (Valor && isNaN(args[1])) return message.reply(`${e.Deny} | **${args[1]}** | Não é um número.`)
        if (['resgate', 'resgatar'].includes(args[0]?.toLowerCase())) return NewResgate()
        if (['TSN', 'CNW'].includes(args[0]?.toUpperCase())) return NewInvest(args[0].toUpperCase(), Valor)

        return message.reply(`${e.Deny} | Empresa não encontrada. Lembre-se de usar a sigla da empresa! Use \`${prefix}bolsa\` que eu te mostra todas.`)

        function InitialEmbed() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(colors(message.member))
                        .setTitle(`📊 ${client.user.username} Bolsa de Valores`)
                        .setDescription(`${e.SaphireObs} Para investir, use a sigla da empresa`)
                        .addField('🚝 Train Station NYL | > TSN', `Taxa de Lucro: \`70%\`\nValor Mínimo: \`5.000.000\`\nGarantia de até: \`40%\``)
                        .addField('🏗️ Construction Newest World | > CNW', `Taxa de Lucro: \`50%\`\nValor Mínimo: \`7.000.000\`\nGarantia de até: \`50%\``)
                ]
            })
        }

        function NewInvest(value, Valor) {

            switch (value) {
                case 'TSN':
                    Empresa = '🚝 Train Station NYL'
                    Invest = 5000000
                    Chance = 40
                    Lucro = 70
                    break;
                case 'CNW':
                    Empresa = '🏗️ Construction Newest World'
                    Invest = 7000000
                    Chance = 50
                    Lucro = 50
                    break;
                default:
                    message.reply(`${e.Deny} | Algo deu errado. Tente novamente.`)
                    break;
            }

            if (Valor && Valor < Invest)
                return message.reply(`${e.Deny} | O valor de investimento da empresa **${Empresa}** deve ser acima de **${Invest} ${Moeda(message)}**`)

            if (Money < Invest)
                return message.reply(`${e.Deny} | Para investir na empresa **${Empresa}**, você precisa de **${Invest} ${Moeda(message)}** na carteira.`)

            Invest = Valor ? Valor : Invest

            if (Invest > Money) return message.reply(`${e.Deny} | Você não possui todo esse dinheiro.`)

            sdb.subtract(`Users.${message.author.id}.Balance`, parseInt(Invest))
            sdb.add(`Users.${message.author.id}.Cache.Bolsa`, parseInt(Invest))

            return message.reply(`${e.QuestionMark} | Pedido: Investir **${Invest?.toFixed(0)} ${Moeda(message)}** na empresa **${Empresa}**
            \nVocê terá que esperar **2 dias** até o resultado do investimento sair. Você tem **${Chance}%** de garantia que receberá até **${Lucro}%** de lucro.
            \nPara validar o investimento, digite o seu código de confirmação: **${Pass}**`).then(msg => {

                const filter = m => m.author.id === message.author.id
                const collector = message.channel.createMessageCollector({ filter, time: 60000 });

                collector.on('collect', m => {

                    m.content === Pass
                        ? (() => {
                            msg.delete().catch(() => { })
                            return SetNewInvestiment(msg, Invest)
                        })()
                        : (() => {
                            collector.stop()
                            parseInt(sdb.get(`Users.${message.author.id}.Cache.Bolsa`)) > 1 ? sdb.add(`Users.${message.author.id}.Balance`, parseInt(sdb.get(`Users.${message.author.id}.Cache.Bolsa`))) : null
                            sdb.delete(`Users.${message.author.id}.Cache.Bolsa`)
                            return msg.edit(`${e.Deny} | Investimento cancelado.`).catch(() => { })
                        })()

                });

                setTimeout(() => {
                    msg.edit(`${e.Deny} | Investimento cancelado.`).catch(() => { })
                }, 15000)
            })
        }

        function SetNewInvestiment(msg, Invest) {

            Result = parseInt(Invest + Math.floor(Math.random() * (Invest * `0.${Lucro}`))) || 0
            if (Math.floor(Math.random() * 100) > Chance) Result = 0

            sdb.delete(`Users.${message.author.id}.Cache.Bolsa`)
            sdb.set(`Users.${message.author.id}.Timeouts.Bolsa`, Date.now())
            sdb.set(`Users.${message.author.id}.Cache.BolsaValue`, Invest)
            sdb.set(`Users.${message.author.id}.Cache.BolsaEmpresa`, Empresa)
            sdb.add(`Users.${message.author.id}.Cache.BolsaLucro`, parseInt(Result) || 1)

            PushTransaction(
                message.author.id,
                `${e.MoneyWithWings} | Investiu ${Invest} Moedas na bolsa de valores`
            )

            return message.reply(`${e.Check} | Investimento efetuado com sucesso! Daqui 2 dias, use o comando \`${prefix}bolsa me\` ou \`${prefix}balance\` e veja seu resultado!`).catch(() => { })
        }

        function BolsaMeInfo() {

            const BolsaEmbed = new MessageEmbed()
                .setColor(colors(message.member))
                .setAuthor(`${message.author.username} Investimentos`, message.author.displayAvatarURL({ dynamic: true }))

            TimeBolsa = ms(172800000 - (Date.now() - (sdb.get(`Users.${message.author.id}.Timeouts.Bolsa`))))
            // if (sdb.get(`Users.${message.author.id}.Timeouts.Bolsa`) !== null && 172800000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Bolsa`)) > 0) {
            if (sdb.get(`Users.${message.author.id}.Timeouts.Bolsa`) !== null && 172800000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Bolsa`)) > 0) {
                BolsaEmbed
                    .addField('📊 Status', `Empresa: **${sdb.get(`Users.${message.author.id}.Cache.BolsaEmpresa`) || 'Nenhuma'}**\nValor Investido: **${sdb.get(`Users.${message.author.id}.Cache.BolsaValue`) || 0} ${Moeda(message)}**`)
                    .addField('Resgate', `${e.Loading} \`${TimeBolsa.days}d ${TimeBolsa.hours}h ${TimeBolsa.minutes}m e ${TimeBolsa.seconds}s\``)
            } else {
                BolsaEmbed
                    .addField('📊 Status', `Empresa: **${sdb.get(`Users.${message.author.id}.Cache.BolsaEmpresa`) || 'Nenhuma'}**\nValor Investido: **${sdb.get(`Users.${message.author.id}.Cache.BolsaValue`) || 0} ${Moeda(message)}**`)
                    .addField('Resgate', `${sdb.get(`Users.${message.author.id}.Cache.BolsaLucro`)?.toFixed(0) || 0} ${Moeda(message)}`)
                    .setFooter(`Valor para resgate? "${prefix}bolsa resgate"`)
            }

            return message.reply({ embeds: [BolsaEmbed] })
        }

        function NewResgate() {

            let Value = parseInt(sdb.get(`Users.${message.author.id}.Cache.BolsaLucro`)) || 0

            if (Value <= 0)
                return message.reply(`${e.Deny} | Você não tem nenhum valor na bolsa de valores para ser resgatado.`)

            sdb.add(`Users.${message.author.id}.Balance`, Value)
            sdb.delete(`Users.${message.author.id}.Cache.BolsaLucro`)
            sdb.delete(`Users.${message.author.id}.Timeouts.Bolsa`)

            PushTransaction(
                message.author.id,
                `${e.BagMoney} | Recebeu ${Value} Moedas na bolsa de valores`
            )

            return message.reply(`${e.Check} | Você resgatou **${Value} ${Moeda(message)}** da Bolsa de Valores.`)
        }

        function BolsaInfo() {
            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(colors(message.member))
                        .setTitle(`📊 ${client.user.username} Bolsa de Valores`)
                        .setDescription(`${message.author}, seja muito bem-vindo *(ou vinda)* a Bolsa de Valores! Aqui é o centro dos empresários e onde você pode obter muitos lucros ou perder tudo ||kkkkk||.\n \nLogo a baixo, você pode ver todos os meu comandos da bolsa de valores e informações uteis para seguir em diante.`)
                        .addFields(
                            {
                                name: `${e.NotStonks} Falha e Sucesso ${e.Stonks}`,
                                value: `Simples. Na falha do investimento, você perde todo o dinheiro investido. No sucesso, você ganha o dinheiro investido mais uma porcentagem em cima do valor.\nExemplo: Investiu 1000 ${Moeda(message)}. Você recebe de volta os 1000 mais uma porcentagem do valor de acordo a empresa.`
                            },
                            {
                                name: `${e.Stonks} Investir`,
                                value: `Comece a investir usando o comando \`${prefix}bolsa SIGLA <valor>\`. As siglas estão ao lado do nome da empresa. **Empresa | > "SIGLA"**, sempre seguidas de 3 letras. O valor mínimo é exigido para investir, porém valores maiores são aceitos.`
                            },
                            {
                                name: '📊 Acompanhamento',
                                value: `Você pode conferir seu investimento atual e o timeout restante usando \`${prefix}bolsa me\` ou \`${prefix}balance\``
                            },
                            {
                                name: `${e.MoneyWings} Resgate`,
                                value: `Você pode resgatar o valor mais lucro usando \`${prefix}bolsa resgate\`. O valor irá para a sua carteira, então cuidado para não ser assaltado/roubado*(a)*.`
                            },
                            {
                                name: '% Garantia e Lucro',
                                value: `A garantia não é nada mais que a porcentagem de sucesso que cada empresa tem de retorno de lucro.\nO lucro é a porcentagem máxima de retorno do valor investido.`
                            }
                        )
                ]
            })
        }

    }
}