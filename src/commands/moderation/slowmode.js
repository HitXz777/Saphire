
const { e } = require('../../../database/emojis.json')
const Error = require('../../../Routes/functions/errors')

module.exports = {
    name: 'slowmode',
    aliases: ['modolento', 'slow'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS'],
    ClientPermissions: ['MANAGE_CHANNELS'],
    emoji: `${e.ModShield}`,
    usage: '<slowmode> <TEMPO EM SEGUNDOS> [#canal(opicional)]',
    description: 'Ative o slowmode no chat',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        let canal = message.mentions.channels.first() || message.channel

        if (!args[0]) return message.reply({ embeds: [new MessageEmbed().setColor('#246FE0').setTitle(`${e.QuestionMark} | Slowmode Command`).setDescription('Com o slowmode, você dita um intervalo em que os membros podem mandar mensagens nos canais.').addFields({ name: `${e.On} Ative o Slowmode`, value: `\`${prefix}slowmode 10s/20s...\`\nMax: 21600 (6hrs)`, inline: true }, { name: `${e.Off} Desative o Slowmode`, value: `\`${prefix}slowmode 0/off`, inline: true })] })

        if (['off', '0', 'desligar'].includes(args[0]?.toLowerCase())) return TurnItOff()

        if (isNaN(args[0])) return message.reply(`${e.Deny} | O tempo deve ser um número entre **1 ~ 21600 segundos**`)
        if (args[0] < 1 || args[0] > 21600) return message.reply(`${e.Deny} | O tempo mínimo é **1 segundo**, o máximo é **21600 segundos** *(6 horas)*`)

        try {
            canal.setRateLimitPerUser(parseInt(args[0]).toFixed(0), [`Author do comando: ${message.author.tag}`])
            return message.reply(`${e.Check} | Slowmode ativado em ${parseInt(args[0]).toFixed(0)} segundos.`)
        } catch (err) {
            Error(message, err)
            return message.channel.send(`${e.Deny} | Ocorreu um erro ao setar o slowmode em **${args[0]} segundos**. Caso não saiba resolver este problema, use o comando \`${prefix}bug\` e relate o problema.\n\`${err}\``)

        }

        function TurnItOff() {
            try {
                canal.setRateLimitPerUser(0)
                return message.reply(`${e.Check} | Slowmode desativado.`)
            } catch (err) {
                Error(message, err)
                return message.channel.send(`${e.Deny} | Ocorreu um erro ao desativar o slowmode. Caso não saiba resolver este problema, use o comando \`${prefix}bug\` e relate o problema.\n\`${err}\``)
            }
        }
    }
}