const { e } = require('../../../database/emojis.json')
const Moeda = require('../../../Routes/functions/moeda')
const Error = require('../../../Routes/functions/errors')
const UserManager = require('../../../Routes/classes/UserManager')
const ms = require('ms')

module.exports = {
    name: 'adicionar',
    aliases: ['add'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    usage: '<add> <class> <@user/id> <value>',
    description: 'Permite ao meu criador adicionar qualquer quantia de qualquer item a qualquer usuário',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let u = message.mentions.users.first() || message.mentions.repliedUser || await client.users.cache.get(args[0]) ||await  client.users.cache.get(args[1]) || message.author
        let user = await client.users.cache.get(u.id)

        const User = new UserManager(message, user)

        let amount = args[2]?.replace(/k/g, '000') || args[1]?.replace(/k/g, '000')

        // NO USERS
        if (['commands', 'comandos', 'comando'].includes(args[0]?.toLowerCase())) return AddCommands()

        if (!user) return message.channel.send(`${e.Deny} | Usuário não encontrado.`)
        if (user.bot) return message.channel.send(`${e.Deny} | No bots.`)

        if (!args[0])
            return message.reply(`${e.Info} <add> <class> <@user/id> <value>`)

        switch (args[0].toLowerCase()) {
            case 'money': case 'coins': case 'moedas': case 'dinheiro': case 'cash': AddMoney(); break;
            case 'bank': case 'banco': AddBank(); break;
            case 'bônus': case 'bonus': AddBonus(); break;
            case 'bughunter': SetNewBugHunter(); break;
            case 'designer': SetNewDesigner(); break;
            case 'estrela6': case 'star6': AddNewSixthStar(); break;
            case 'dev': case 'developer': SetNewDeveloper(); break;
            case 'helpier': case 'ajudante': AddNewHelpier(); break;
            case 'halloween': case 'h': AddNewTitleHalloween(); break;
            case 'bgacess': AddNewBgAcess(); break;
            case 'vip': AddTimeVip(); break;

            default: message.reply(`${e.Deny} | **${args[0]?.toLowerCase()}** | Não é um argumento válido.`); break;
        }

        function AddNewBgAcess() {
            if (sdb.get(`Client.BackgroundAcess.${user.id}`))
                return message.reply(`${e.Info} | ${user.username} já possui acesso aos background.`)

            sdb.set(`Client.BackgroundAcess.${user.id}`, true)
            return message.reply(`${e.Check} | ${user.username} Agora possui acesso livre aos backgrounds.`)
        }

        function AddMoney() {
            if (!amount) return message.channel.send(`-> \`${prefix}add money <@user/id> <quantia>\``)
            if (isNaN(amount)) return message.channel.send(`${e.Deny} | **${amount}** | Não é um número.`)
            User.addBalance(amount)
            return message.channel.send(`${e.Check} | Feito.`)
        }

        function AddBank() {
            if (!amount) return message.channel.send(`-> \`${prefix}add bank <@user/id> <quantia>\``)
            if (isNaN(amount)) return message.channel.send(`${e.Deny} | **${amount}** | Não é um número.`)
            User.addBank(amount)
            return message.channel.send(`${e.Check} | Feito.`)
        }

        function AddBonus() {
            if (!amount) return message.channel.send(`-> \`${prefix}add bonus <@user/id> <quantia>\``)
            if (isNaN(amount)) return message.channel.send(`${e.Deny} | **${amount}** | Não é um número.`)
            sdb.add(`Users.${user.id}.Cache.Resgate`, parseInt(amount))
            user.send(`${e.SaphireFeliz} | Você recebeu um bônus de **${amount} ${Moeda(message)}**. Parabéns!`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.channel.send(`${e.Check} | Feito.`)
        }

        function AddCommands() {
            const amount = parseInt(args[1])
            if (!amount) return message.channel.send(`-> \`${prefix}add commands <quantia>\``)
            if (isNaN(amount)) return message.channel.send(`${e.Deny} | **${amount}** | Não é um número.`)
            sdb.add('Client.ComandosUsados', amount)
            return message.channel.send(`${e.Check} | ${sdb.get('Client.ComandosUsados')}`)
        }

        function AddTimeVip() {

            if (!args[1]) return message.reply(`${e.Info} | Formato deste sub-comando: \`${prefix}add vip 4d\` ou \`${prefix}add vip permanent\``)

            if (['permanent', 'permanente', 'forever'].includes(args[1]?.toLowerCase())) return SetVipPermanent()

            if (!['s', 'm', 'h', 'd', 'y'].includes(args[1].slice(-1)))
                return message.reply(`${e.Deny} | Tempo inválido!`)

            const Time = ms(`${args[1]}`)

            sdb.add(`Users.${user.id}.Timeouts.Vip.TimeRemaing`, Time)

            function SetVipPermanent() {

                if (sdb.get(`Users.${user.id}.Timeouts.Vip.Permanent`))
                    return message.reply(`${e.Info} | Este usuário possui o Vip Permanente.`)

                sdb.set(`Users.${user.id}.Timeouts.Vip.Permanent`, true)
                return message.reply(`${e.Check} | Feito!`)
            }

            return message.reply(`${e.Check} | Feito!`)

        }

        function SetNewBugHunter() {
            if (sdb.get(`Client.BugHunter.${user.id}`))
                return message.channel.send(`${e.Info} | ${user.username} já é um Bug Hunter.`)

            sdb.set(`Client.BugHunter.${user.id}`, true)
            user.send(`Parabéns! Você adquiriu o título **${e.Gear} Bug Hunter**.`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.channel.send(`${e.Check} | ${user.username} agora é um Bug Hunter!`)
        }

        function SetNewDesigner() {
            if (sdb.get(`Client.OfficialDesigner.${user.id}`))
                return message.channel.send(`${e.Info} | ${user.username} já é um Designer Official & Emojis Productor.`)

            sdb.set(`Client.OfficialDesigner.${user.id}`, true)
            user.send(`Parabéns! Você adquiriu o título **${e.SaphireFeliz} Designer Official & Emojis Productor**.`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.channel.send(`${e.Check} | ${user.username} agora é um Designer Official & Emojis Productor`)
        }

        function SetNewDeveloper() {
            if (sdb.get(`Client.Developer.${user.id}`))
                return message.channel.send(`${e.Info} | ${user.username} já é um Developer.`)

            sdb.set(`Client.Developer.${user.id}`, true)
            user.send(`Parabéns! Você adquiriu o título **${e.OwnerCrow} Official Developer**.`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.channel.send(`${e.Check} | ${user.username} agora é um Developer!`)
        }

        function AddNewSixthStar() {
            if (sdb.get(`Users.${user.id}.Perfil.Estrela.Seis`))
                return message.reply(`${e.Info} | ${user.username} já tem a 6º Estrela.`)

            sdb.set(`Users.${user.id}.Perfil.Estrela.Seis`, true)
            user.send(`Parabéns! Você adquiriu um item de Classe Especial: **6º Estrela**`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.reply(`${e.Check} | ${user.username} agora possui a **6º Estrela**!`)
        }

        function AddNewHelpier() {
            if (sdb.get(`Users.${user.id}.Timeouts.Helpier`) !== null && 604800000 - (Date.now() - sdb.get(`Users.${user.id}.Timeouts.Helpier`)) > 0)
                return message.reply(`${e.Info} | ${user.username} já tem o ajudante.`)

            sdb.set(`Users.${user.id}.Timeouts.Helpier`, Date.now())
            user.send(`Parabéns! Você adquiriu um ${e.Helpier} **Ajudante** por 7 dias!`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.reply(`${e.Check} | ${user.username} agora possui um ${e.Helpier} **Ajudante** por 7 dias!`)
        }

        function AddNewTitleHalloween() {
            if (sdb.get(`Titulos.Halloween`)?.includes(user.id))
                return message.reply(`${e.Info} | ${user.tag} já possui o título **🎃 Halloween 2021**`)

            sdb.push(`Titulos.Halloween`, user.id)
            user.send(`Parabéns! Você adquiriu o título **🎃 Halloween 2021**!`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.reply(`${e.Check} | ${user.username} agora possui o título **🎃 Halloween 2021**!`)
        }
    }
}