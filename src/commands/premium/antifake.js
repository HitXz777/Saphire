const { e } = require('../../../JSON/emojis.json')
const Notify = require('../../../modules/functions/plugins/notify')

module.exports = {
    name: 'antifake',
    aliases: ['antfake'],
    category: 'premium',
    UserPermissions: ['BAN_MEMBERS'],
    ClientPermissions: ['KICK_MEMBERS'],
    emoji: '🗣️',
    usage: 'antifake on/off',
    description: 'Ative o sistema de proteção contra fakes',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        const guildData = await Database.Guild.findOne({ id: message.guild.id }, 'Antifake'),
            status = guildData?.Antifake

        if (['info', 'help', 'ajudar'].includes(args[0]?.toLowerCase())) return antifakeInfo()
        if (['on', 'ligar', 'ativar'].includes(args[0]?.toLowerCase())) return turnOn()
        if (['off', 'desligar', 'desativar'].includes(args[0]?.toLowerCase())) return turnOff()
        return message.reply(`${e.Deny} | Comando inválido. Tenta usar \`${prefix}antifake info\``)

        async function turnOn() {

            if (status)
                return message.reply(`${e.Deny} | O sistema antifake já está ativado.`)

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { Antifake: true }
            )

            Notify(message.guild.id, 'RECURSO PREMIUM HABILITADO', `${message.author} ativou o Antifake System.\n${e.Info} | Por padrão, expulsarei todos os membros que entrarem no servidor com a conta abaixo de 7 dias após a criação.`)
            return message.reply(`${e.Check} | O sistema antifake está ativado e vou expulsar todos os membros que entrarem no servidor com as contas criadas a menos de 7 dias.\n${e.Info} | Ative o sistema GSN \`${prefix}logs on <#canal>\`. Vou avisar sobre todos os fakes expulsos nele.`)
        }

        async function turnOff() {

            if (!status)
                return message.reply(`${e.Deny} | O sistema antifake já está desativado.`)

            await Database.Guild.updateOne(
                { id: message.guild.id },
                { $unset: { Antifake: 1 } }
            )

            Notify(message.guild.id, 'RECURSO PREMIUM DESABILITADO', `${message.author} desabilitou o Antifake System.`)
            return message.reply(`${e.Check} | O sistema antifake foi desativado.`)
        }

        function antifakeInfo() {

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle('🗣️ Antifake System | PREMIUM')
                        .setDescription('Este sistema protege os servidores contra membros com conta fakes. Por padrão, está configurado para a expulsão automática na diferença de tempo de 7 dias.')
                        .addFields(
                            {
                                name: `${e.On} Ative o sistema`,
                                value: `\`${prefix}antifake on\``
                            },
                            {
                                name: `${e.Off} Desative o sistema`,
                                value: `\`${prefix}antifake off\``
                            }
                        )
                        .setFooter('Permissão necessária: Expulsar Membros')
                ]
            })

        }

    }
}