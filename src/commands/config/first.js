const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'first',
    aliases: ['primeiro', 'primeira'],
    category: 'config',
    emoji: `${e.SaphireFeliz}`,
    UserPermissions: ['ADMINISTRATOR'],
    usage: '<first> <on/off>',
    description: 'Eu vou falar first em todos os canais que serem criados.',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let embedTurnOnOff = new MessageEmbed()
            .setColor(client.blue)
            .setTitle('First!')
            .setDescription(`Com este sistema ativado, eu posso falar "First!" em todos os canais que forem criados antes de qualquer um!`)
            .addFields(
                {
                    name: `${e.On} Ative`,
                    value: `\`${prefix}first on\``,
                },
                {
                    name: `${e.Off} Desative`,
                    value: `\`${prefix}first off\``
                }
            )
            .setFooter({ text: 'Permissão necessária: Administrador' })

        let turn = args[0],
            data = await Database.Guild.findOne({ id: message.guild.id }, 'FirstSystem'),
            atualStat = data?.FirstSystem

        if (['on', 'ligar', 'ativar'].includes(turn?.toLowerCase())) return turnFirstOn()
        if (['off', 'desligar', 'desativar'].includes(turn?.toLowerCase())) return turnFirstOff()
        return message.reply({ embeds: [embedTurnOnOff] })

        function turnFirstOn() {
            if (atualStat) return message.reply(`${e.Deny} | Este sistema já está ativado.`)

            trade(true)
            return message.reply(`${e.Check} | Prontinho! Agora eu vou falar First em todos os canais que forem criados!`)
        }

        function turnFirstOff() {
            if (!atualStat) return message.reply(`${e.Deny} | Este sistema já está desativado.`)

            trade()
            return message.reply(`${e.Check} | Prontinho! Não falei mais nada em nenhum canal que for criado.`)
        }

        async function trade(validate) {

            return validate
                ? await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { FirstSystem: true }
                )
                : await Database.Guild.updateOne(
                    { id: message.guild.id },
                    { $unset: { FirstSystem: 1 } }
                )

        }

    }
}