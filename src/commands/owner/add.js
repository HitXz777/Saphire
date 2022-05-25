const { e } = require('../../../JSON/emojis.json')
const Moeda = require('../../../modules/functions/public/moeda')
const Error = require('../../../modules/functions/config/errors')
const ms = require('ms')
const Vip = require('../../../modules/functions/public/vip')

module.exports = {
    name: 'adicionar',
    aliases: ['add'],
    category: 'owner',
    owner: true,
    emoji: `${e.OwnerCrow}`,
    usage: '<add> <class> <@user/id> <value>',
    description: 'Permite ao meu criador adicionar qualquer quantia de qualquer item a qualquer usuário',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = client.getUser(client, message, args, 'user')
        let amount = parseInt(args[2]?.replace(/k/g, '000')) || parseInt(args[1]?.replace(/k/g, '000'))
        let moeda = await Moeda(message)

        // NO USERS
        if (['commands', 'comandos', 'comando', 'cmd', 'cmds', 'commands'].includes(args[0]?.toLowerCase())) return AddCommands()
        if (['news'].includes(args[0]?.toLowerCase())) return newRole()

        if (!user) return message.channel.send(`${e.Deny} | Usuário não encontrado.`)
        if (user.bot) return message.channel.send(`${e.Deny} | No bots.`)

        if (!args[0])
            return message.reply(`${e.Info} <add> <class> <@user/id> <value>`)

        switch (args[0]?.toLowerCase()) {
            case 'money': case 'safiras': case 'safira': case 'coins': case 'moedas': case 'dinheiro': case 'cash': AddMoney(); break;
            case 'bônus': case 'bonus': AddBonus(); break;
            case 'bughunter': SetNewBugHunter(); break;
            case 'designer': SetNewDesigner(); break;
            case 'estrela6': case 'star6': AddNewSixthStar(); break;
            case 'dev': case 'developer': SetNewDeveloper(); break;
            case 'halloween': case 'h': AddNewTitleHalloween(); break;
            case 'bgacess': AddNewBgAcess(); break;
            case 'vip': AddTimeVip(); break;
            case 'xp': AddXp(); break;

            default: message.reply(`${e.Deny} | **${args[0]?.toLowerCase()}** | Não é um argumento válido.`); break;
        }

        async function AddXp() {
            if (!amount) return message.channel.send(`-> \`${prefix}add xp <@user/id> <quantia>\``)
            if (isNaN(amount)) return message.channel.send(`${e.Deny} | **${amount}** | Não é um número.`)
            Database.addItem(user.id, 'Xp', amount)
            return message.channel.send(`${e.Check} | Feito.`)
        }

        async function AddNewBgAcess() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'BackgroundAcess'),
                bgData = data.BackgroundAcess || []

            if (bgData.includes(user.id))
                return message.reply(`${e.Info} | ${user.username} já possui acesso aos background.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { BackgroundAcess: user.id } }
            )
            return message.reply(`${e.Check} | ${user.username} Agora possui acesso livre aos backgrounds.`)
        }

        function AddMoney() {
            if (!amount) return message.channel.send(`-> \`${prefix}add money <@user/id> <quantia>\``)
            if (isNaN(amount)) return message.channel.send(`${e.Deny} | **${amount}** | Não é um número.`)
            Database.add(user.id, amount)
            Database.PushTransaction(user.id, `${e.Admin} Recebeu ${amount} Safiras de um Administrador`)
            return message.channel.send(`${e.Check} | Feito.`)
        }

        async function AddBonus() {
            if (!amount) return message.channel.send(`-> \`${prefix}add bonus <@user/id> <quantia>\``)
            if (isNaN(amount)) return message.channel.send(`${e.Deny} | **${amount}** | Não é um número.`)
            Database.add(user.id, amount)
            user.send(`${e.SaphireFeliz} | Você recebeu um bônus de **${amount} ${moeda}**. Parabéns!`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.channel.send(`${e.Check} | Feito.`)
        }

        async function AddCommands() {
            if (!amount) return message.channel.send(`-> \`${prefix}add commands <quantia>\``)
            if (isNaN(amount)) return message.channel.send(`${e.Deny} | **${amount}** | Não é um número.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $inc: { ComandosUsados: amount } }
            )

            return message.channel.send(`${e.Check} | Feito`)
        }

        async function AddTimeVip() {

            if (!args[2]) return message.reply(`${e.Info} | Formato deste sub-comando: \`${prefix}add vip @user 4d\` ou \`${prefix}add vip @user permanent\``)

            if (['permanent', 'permanente', 'forever'].includes(args[2]?.toLowerCase())) return SetVipPermanent()

            if (!['s', 'm', 'h', 'd', 'y'].includes(args[2].slice(-1)))
                return message.reply(`${e.Deny} | Tempo inválido!`)

            let Time,
                vip = await Vip(user.id)

            try {
                Time = ms(`${args[2]}`)
            } catch (err) { return message.channel.send(`${e.Deny} | ERROR | \`${err}\``) }

            if (vip) {
                Database.addItem(user.id, 'Vip.TimeRemaing', Time)
            } else {

                await Database.User.updateOne(
                    { id: user.id },
                    {
                        'Vip.DateNow': Date.now(),
                        $inc: { 'Vip.TimeRemaing': Time }
                    }
                )
            }

            async function SetVipPermanent() {

                let get = await Database.User.findOne({ id: user.id }, 'Vip'),
                    Permanent = get.Vip?.Permanent

                if (Permanent)
                    return message.reply(`${e.Info} | Este usuário possui o Vip Permanente.`)

                Database.updateUserData(user.id, 'Vip.Permanent', true)
                return message.reply(`${e.Check} | Feito!`)
            }

            return message.reply(`${e.Check} | Feito!`)

        }

        async function SetNewBugHunter() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Titles.BugHunter'),
                dataUsers = data.Titles?.BugHunter || []

            if (dataUsers.includes(user.id))
                return message.channel.send(`${e.Info} | ${user.username} já é um Bug Hunter.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { 'Titles.BugHunter': user.id } }
            )

            user.send(`Parabéns! Você adquiriu o título **${e.Gear} Bug Hunter**.`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.channel.send(`${e.Check} | ${user.username} agora é um Bug Hunter!`)
        }

        async function SetNewDesigner() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Titles.OfficialDesigner'),
                dataUsers = data.Titles?.OfficialDesigner || []

            if (dataUsers.includes(user.id))
                return message.channel.send(`${e.Info} | ${user.username} já é um Designer Official & Emojis Productor.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { 'Titles.OfficialDesigner': user.id } }
            )

            user.send(`Parabéns! Você adquiriu o título **${e.SaphireFeliz} Designer Official & Emojis Productor**.`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.channel.send(`${e.Check} | ${user.username} agora é um Designer Official & Emojis Productor`)
        }

        async function SetNewDeveloper() {

            let data = await Database.Client.findOne({ id: client.user.id }, 'Titles.Developer'),
                dataUsers = data.Titles?.Developer || []

            if (dataUsers.includes(user.id))
                return message.channel.send(`${e.Info} | ${user.username} já é um Developer.`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { 'Titles.Developer': user.id } }
            )

            user.send(`Parabéns! Você adquiriu o título **${e.OwnerCrow} Official Developer**.`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.channel.send(`${e.Check} | ${user.username} agora é um Developer!`)
        }

        function newRole() {

            let button = [
                {
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'OBTER CARGO',
                            custom_id: 'newRole',
                            style: 'SUCCESS'
                        },
                        {
                            type: 2,
                            label: 'RETIRAR CARGO',
                            custom_id: 'delRole',
                            style: 'DANGER'
                        }
                    ]
                }
            ]

            let role = message.guild.roles.cache.get('914925531529609247')

            if (!role)
                return message.reply(`${e.Deny} | Eu não achei o cargo de novidades.`)

            return message.reply({
                content: `${e.Info} | Obtendo o cargo ${role}, você ficará por dentro de todas as novidades que a Saphire's Team anunciar.`,
                components: button
            })

        }

        async function AddNewSixthStar() {

            let get = await Database.User.findOne({ id: user.id }, 'Perfil.Estrela.Seis')

            if (!get) return message.channel.send(`${e.Database} | DATABASE | Usuário não encontrado.`)

            let data = get.Perfil?.Estrela?.Seis

            if (data)
                return message.reply(`${e.Info} | ${user.username} já tem a 6º Estrela.`)

            Database.updateUserData(user.id, 'Perfil.Estrela.Seis', true)

            user.send(`Parabéns! Você adquiriu um item de Classe Especial: **6º Estrela**`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })
            return message.reply(`${e.Check} | ${user.username} agora possui a **6º Estrela**!`)
        }

        async function AddNewTitleHalloween() {

            let get = await Database.Client.findOne({ id: client.user.id }, 'Titles.Halloween'),
                data = get.Titles?.Halloween || []

            if (data.includes(user.id))
                return message.reply(`${e.Info} | ${user.tag} já possui o título **🎃 Halloween 2021**`)

            await Database.Client.updateOne(
                { id: client.user.id },
                { $push: { 'Titles.Halloween': user.id } }
            )
            user.send(`Parabéns! Você adquiriu o título **🎃 Halloween 2021**!`).catch(err => {
                if (err.code === 50007)
                    return message.reply(`${e.Deny} | Não foi possível contactar este usuário.`)

                Error(message, err)
            })

            return message.reply(`${e.Check} | ${user.username} agora possui o título **🎃 Halloween 2021**!`)
        }
    }
}