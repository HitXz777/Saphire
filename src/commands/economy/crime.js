const { e } = require('../../../database/emojis.json')
const ms = require("parse-ms")
const Moeda = require('../../../Routes/functions/moeda')
const Error = require('../../../Routes/functions/errors')
const { PushTransaction } = require('../../../Routes/functions/transctionspush')

module.exports = {
    name: 'crime',
    category: 'economy',
    emoji: `${e.PandaBag}`,
    usage: '<crime>',
    description: 'A vida no crime não é um bom negócio',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        if (['info', 'help', 'ajuda', 'status'].includes(args[0]?.toLowerCase())) return CrimeHelp()
        let Helpier = sdb.get(`Users.${message.author.id}.Timeouts.Helpier`)

        // 1200000 - 20 Minutos
        let time = ms(1200000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Crime`)))
        if (sdb.get(`Users.${message.author.id}.Timeouts.Crime`) !== null && 1200000 - (Date.now() - sdb.get(`Users.${message.author.id}.Timeouts.Crime`)) > 0)
            return message.reply(`Calminha! O mundo do crime é perigoso, volte em \`${time.minutes}m e ${time.seconds}s\``)

        if (!sdb.get(`Users.${message.author.id}.Slot.Balaclava`))
            return message.reply(`${e.Deny} | Você precisa de uma ${e.Balaclava} \`Balaclava\` para cometer crimes.`)

        if (Helpier !== null && 604800000 - (Date.now() - Helpier) > 0) {
            Helpier = true
        } else { Heplier = false }

        let Mg
        Helpier ? Mg = ` | ${e.Helpier} +5%` : Mg = ''
        // Payment
        if (message.author.id === '262317854504779776')
            Msg = ` | ${e.Helpier} +10%`

        return message.reply(`${e.QuestionMark} | Diga o **NÚMERO** do lugar que você deseja assaltar${Mg}\n \n🏠 1 Casa\n🏦 2 Mansão\n🏛️ 3 Prefeitura\n🏣 4 Cartório\n📨 5 Correios\n💍 6 joalheria\n🏢 7 Shopping\n🏭 8 Fábrica\n🏩 9 Motel\n🪙 10 Banco\n${e.PandaBag} 11 Arrastão\n🚆 12 Trem\n${e.Deny} 0 Cancelar`).then(msg => {
            sdb.set(`Users.${message.author.id}.Timeouts.Crime`, Date.now())

            const filter = m => m.author.id === message.author.id
            const collector = message.channel.createMessageCollector({ filter, max: 1, time: 15000 });

            // 🏠 1 Casa - 🏦 2 Mansão - 🏛️ 3 Prefeitura - 🏣 4 Cartório - 📨 5 Correios - 💍 6 joalheria - 🏢 7 Shopping - 🏭 8 Fábrica - 🏩 9 Motel - 🪙 10 Banco
            let multa = Math.floor(Math.random() * 15000)
            let Luck = Math.floor(Math.random() * 11)
            collector.on('collect', m => {
                let content = parseInt(m.content)
                NewCrimeStart(content)

                function NewCrimeStart(value) {
                    switch (value) {
                        case 0: msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { }); sdb.delete(`Users.${message.author.id}.Timeouts.Crime`); break;
                        case 1: Casa(); break;
                        case 2: Mansao(); break;
                        case 3: Prefeitura(); break;
                        case 4: Cartorio(); break;
                        case 5: Correios(); break;
                        case 6: joalheria(); break;
                        case 7: Shopping(); break;
                        case 8: Fábrica(); break;
                        case 9: Motel(); break;
                        case 10: Banco(); break;
                        case 11: Arrastao(); break;
                        case 12: Trem(); break;
                        default: Cancel(); break;
                    }
                }
            })

            // FUNCTIONS
            function Cancel() {
                sdb.delete(`Users.${message.author.id}.Timeouts.Crime`)
                msg.edit(`${e.Deny} | Comando cancelado.`).catch(() => { })
            }

            function Preso() {

                msg.delete().catch(() => { })
                return message.reply(`${e.QuestionMark} | ${message.author}, você foi pego pela policia! Quer tentar a sorte e pagar um suborno de ${multa} ${Moeda(message)}?`).then(msg => {
                    sdb.set(`Request.${message.author.id}`, `${msg.url}`)
                    msg.react('✅').catch(() => { }) // Check
                    msg.react('❌').catch(() => { }) // X

                    const filter = (reaction, user) => { return ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id }

                    msg.awaitReactions({ filter, max: 1, time: 15000, errors: ['time'] }).then(collected => {
                        const reaction = collected.first()

                        if (reaction.emoji.name === '✅') {
                            sdb.delete(`Request.${message.author.id}`)
                            sdb.subtract(`Users.${message.author.id}.Balance`, multa)
                            PushTransaction(
                                message.author.id,
                                `${e.MoneyWithWings} Pagou ${multa} Moedas de multa por cometer um crime`
                            )
                            let chances = Math.floor(Math.random() * 10)
                            if (chances <= 5) {
                                return msg.edit(`${e.Check} | O policial aceitou o seu suborno e você foi liberado!`)
                            } else {
                                sdb.set(`Users.${message.author.id}.Timeouts.Preso`, Date.now())
                                return msg.edit(`${e.Sirene} | O policial recusou o seu suborno e você foi preso!`)
                            }
                        } else {
                            sdb.delete(`Request.${message.author.id}`)
                            sdb.set(`Users.${message.author.id}.Timeouts.Preso`, Date.now())
                            return msg.edit(`${e.Sirene} | Preso!`)
                        }
                    }).catch(() => {
                        sdb.delete(`Request.${message.author.id}`)
                        sdb.set(`Users.${message.author.id}.Timeouts.Preso`, Date.now())
                        return msg.edit(`${e.Sirene} | Preso!`)
                    })

                }).catch(err => {
                    Error(message, err)
                    message.channel.send(`${e.SaphireCry} | Ocorreu um erro durante o processo. Por favor, reporte o ocorrido usando \`${prefix}bug\`\n\`${err}\``)
                })

            }

            function Result() {
                let result = Math.floor(Math.random() * 101)

                if (Helpier)
                    result + 5

                if (message.author.id === '262317854504779776')
                    result + 10

                return result
            }

            function Lose() {
                if (Luck <= 5) {
                    return Preso()
                } else {
                    sdb.set(`Users.${message.author.id}.Timeouts.Preso`, Date.now());
                    sdb.subtract(`Users.${message.author.id}.Balance`, multa);
                    PushTransaction(
                        message.author.id,
                        `${e.MoneyWithWings} Pagou ${multa} Moedas de multa por cometer um crime`
                    )
                    msg.edit(`${e.Sirene} | Você foi pego no ato e o juiz decretou sua prisão mais multa!\n${e.PandaProfit} -${multa} ${Moeda(message)}`).catch(() => { })
                }
            }

            function add(amount) {
                sdb.add(`Users.${message.author.id}.Balance`, amount)
                PushTransaction(
                    message.author.id,
                    `${e.BagMoney} Recebeu ${amount} Moedas por cometer um crime`
                )
            }

            function Casa() {
                function Win(amount) { add(amount); return msg.edit(`${e.PandaBag} | ${message.author} roubou uma casa.\n+ ${amount} ${Moeda(message)}`).catch(() => { }) }
                Result() <= 50 ? Win(Math.floor(Math.random() * 3000)) : Lose()
            }

            function Arrastao() {
                function Win(amount) { add(amount); return msg.edit(`${e.PandaBag} | ${message.author} fez um arrastão.\n+ ${amount} ${Moeda(message)}`).catch(() => { }) }

                Result() <= 70 ? Win(Math.floor(Math.random() * 2000)) : Lose()
            }

            function Trem() {
                function Win(amount) { add(amount); return msg.edit(`${e.PandaBag} | ${message.author} assaltou um trem.\n+ ${amount} ${Moeda(message)}`).catch(() => { }) }
                Result() <= 40 ? Win(Math.floor(Math.random() * 6000)) : Lose()
            }

            function Mansao() {
                function Win(amount) { add(amount); return msg.edit(`${e.PandaBag} | ${message.author} roubou uma mansão.\n+ ${amount} ${Moeda(message)}`).catch(() => { }) }
                Result() <= 10 ? Win(Math.floor(Math.random() * 150000)) : Lose()
            }

            function Prefeitura() {
                function Win(amount) { add(amount); return msg.edit(`${e.PandaBag} | ${message.author} roubou a prefeitura.\n+ ${amount} ${Moeda(message)}`).catch(() => { }) }

                Result() <= 35 ? Win(Math.floor(Math.random() * 10000)) : Lose()
            }

            function Cartorio() {
                function Win(amount) { add(amount); return msg.edit(`${e.PandaBag} | ${message.author} roubou o cartório.\n+ ${amount} ${Moeda(message)}`).catch(() => { }) }

                Result() <= 41 ? Win(Math.floor(Math.random() * 14000)) : Lose()
            }

            function Correios() {
                function Win(amount) { add(amount); return msg.edit(`${e.PandaBag} | ${message.author} roubou os correios.\n+ ${amount} ${Moeda(message)}`).catch(() => { }) }

                Result() <= 32 ? Win(Math.floor(Math.random() * 8000)) : Lose()
            }

            function joalheria() {
                function Win(amount) { add(amount); return msg.edit(`${e.PandaBag} | ${message.author} roubou uma joalheria.\n+ ${amount} ${Moeda(message)}`).catch(() => { }) }

                Result() <= 15 ? Win(Math.floor(Math.random() * 300000)) : Lose()
            }

            function Shopping() {
                function Win(amount) { add(amount); return msg.edit(`${e.PandaBag} | ${message.author} roubou um shopping.\n+ ${amount} ${Moeda(message)}`).catch(() => { }) }

                Result() <= 34 ? Win(Math.floor(Math.random() * 80000)) : Lose()
            }

            function Fábrica() {
                function Win(amount) { add(amount); return msg.edit(`${e.PandaBag} | ${message.author} roubou uma fábrica.\n+ ${amount} ${Moeda(message)}`).catch(() => { }) }

                Result() <= 40 ? Win(Math.floor(Math.random() * 16000)) : Lose()
            }

            function Motel() {
                function Win(amount) { add(amount); return msg.edit(`${e.PandaBag} | ${message.author} roubou um motel.\n+ ${amount} ${Moeda(message)}`).catch(() => { }) }

                Result() <= 35 ? Win(Math.floor(Math.random() * 30000)) : Lose()
            }

            function Banco() {
                function Win(amount) { add(amount); return msg.edit(`${e.PandaBag} | ${message.author} roubou um banco.\n+ ${amount} ${Moeda(message)}`).catch(() => { }) }

                Result() <= 1 ? Win(Math.floor(Math.random() * 5000000)) : Lose()
            }

        }).catch(err => {
            Error(message, err)
            return message.reply(`${e.Deny} | Algo de errado não está certo.\n\`${err}\``)
        })

        function CrimeHelp() {
            const Info = new MessageEmbed()
                .setColor('#2f3136')
                .setTitle(`${e.Info} | Detalhes do comando Crime`)
                .setDescription(`Com o comando Crime, você pode obter dinheiro de forma perigosa, porém, pode ser preso e perder dinheiro.`)
                .addField(`${e.Check} Item Necessário`, `${e.Balaclava} Balaclava`)
                .addField(`${e.Gear} Comando`, `\`${prefix}crime\` - Lugar que você quer assaltar`)
            return message.reply({ embeds: [Info] })
        }
    }
}