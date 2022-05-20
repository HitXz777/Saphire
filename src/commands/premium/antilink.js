const { e } = require('../../../JSON/emojis.json')
const Notify = require('../../../modules/functions/plugins/notify')

module.exports = {
    name: 'antilink',
    aliases: ['antlink'],
    category: 'premium',
    UserPermissions: ['ADMINISTRATOR'],
    ClientPermissions: ['MANAGE_MESSAGES'],
    emoji: e.antlink,
    usage: '<antlink> <on/off>',
    description: 'Bloqueie todos os tipos de links no servidor',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let data = await Database.Guild.findOne({ id: message.guild.id }, 'AntLink'),
            status = data.AntLink

        if (['on', 'ligar', 'ativar'].includes(args[0]?.toLowerCase())) return turnOn()
        if (['off', 'desligar', 'desativar'].includes(args[0]?.toLowerCase())) return turnOff()
        return message.reply(
            {
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${e.antlink} Antilink System | PREMIUM`)
                        .setDescription('Com esse sistema você pode impedir que usuários enviem links de outros servidores.')
                        .addFields(
                            {
                                name: `${e.Gear} Status`,
                                value: status ? `${e.Check} Ativado` : `${e.Deny} Desativado`
                            },
                            {
                                name: `${e.On} Ative`,
                                value: `\`${prefix}antilink on\``
                            },
                            {
                                name: `${e.Off} Desative`,
                                value: `\`${prefix}antilink off\``
                            },
                            {
                                name: `${e.Info} Observação`,
                                value: 'Administradores são imunes a esse sistema.'
                            }
                        )
                ]
            }
        )

        async function turnOn() {

            if (status) return message.reply(`${e.Info} | Este sistema já está ativado.`)

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { AntLink: true }
            )

            Notify(message.guild.id, 'SISTEMA ATIVADO | ANTILINK PREMIUM', `${message.author} ativou o sistema de antilink neste servidor.`)
            return message.reply(`${e.Check} | Você ativou o sistema AntiLink com sucesso! De agora em diante, vou apagar a mensagem de todos os convites de servidores.`)

        }

        async function turnOff() {

            if (!status) return message.reply(`${e.Info} | Este sistema já está desativado.`)

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $unset: { AntLink: 1 } }
            )

            return message.reply(`${e.Check} | Você desativou o sistema AntiLink com sucesso!`)

        }
    }
}