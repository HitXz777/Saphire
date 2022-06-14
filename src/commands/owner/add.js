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

        // NO USERS
        if (['commands', 'comandos', 'comando', 'cmd', 'cmds', 'commands'].includes(args[0]?.toLowerCase())) return AddCommands()
        if (['comprovante'].includes(args[0]?.toLowerCase())) return newComprovante()

        if (!user) return message.channel.send(`${e.Deny} | Usuário não encontrado.`)
        if (user.bot) return message.channel.send(`${e.Deny} | No bots.`)

        if (!args[0])
            return message.reply(`${e.Info} <add> <class> <@user/id> <value>`)

        switch (args[0]?.toLowerCase()) {
            case 'vip': AddTimeVip(); break;

            default: message.reply(`${e.Deny} | **${args[0]?.toLowerCase()}** | Não é um argumento válido.`); break;
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

        async function newComprovante() {

            return message.channel.send({
                content: `${e.Info} | **NÃO** abra um ticket de comprovante sem motivo! Toda a Staff é notificada e nós puniremos caso você faça isso.`,
                components: [{
                    type: 1,
                    components: [
                        {
                            type: 2,
                            label: 'Mostrar comprovante',
                            emoji: e.ballonChat || '🔍',
                            custom_id: 'newProof',
                            style: 'SUCCESS'
                        },
                        {
                            type: 2,
                            label: 'Deletar comprovante',
                            emoji: '✖',
                            custom_id: 'closeProof',
                            style: 'DANGER'
                        }
                    ]
                }]
            })
        }

    }
}