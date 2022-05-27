const { e } = require('../../../JSON/emojis.json')
const Error = require('../../../modules/functions/config/errors')

module.exports = {
    name: 'carta',
    aliases: ['letter'],
    category: 'interactions',
    emoji: '📨',
    usage: '<carta> <@user/id> <Sua mensagem em diante>',
    description: 'Envie cartas para as pessoas',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let authorData = await Database.User.findOne({ id: message.author.id }, 'Balance Slot.Cartas Timeouts.Letter'),
            cartas = authorData?.Slot?.Cartas || 0,
            Timer = authorData?.Timeouts?.Letter || 0, isDisabled = false

        if (client.Timeout(900000, Timer))
            return message.reply(`${e.Loading} | Letters System Cooldown | Tempo restante para o envio de uma próxima carta: \`${client.GetTimeout(900000, Timer)}\``)

        let buttons = [{
            type: 1,
            components: [
                {
                    type: 2,
                    label: 'ENVIAR UMA CARTA',
                    emoji: '📨',
                    custom_id: 'sendNewLetter',
                    style: 'SUCCESS'
                },
                {
                    type: 2,
                    label: 'CANCELAR',
                    custom_id: 'cancel',
                    style: 'DANGER'
                }
            ]
        }]

        if (cartas <= 0) {
            isDisabled = true
            buttons[0].components[0].disabled = true
        }

        let msg = await message.reply({
            content: `📨 | Com este comando você consegue enviar cartas para outras pessoas. Anonimamente ou não.${isDisabled ? '\n> *Botão de enviar cartas desativado? Compre algumas na loja.*' : ''}`,
            components: buttons
        })

        let collector = msg.createMessageComponentCollector({
            filter: interaction => interaction.user.id === message.author.id,
            idle: 30000,
            errors: ['idle']
        })
            .on('collect', interaction => {

                const { customId } = interaction

                if (customId === 'cancel') {
                    collector.stop()
                    return msg.edit({ content: `${e.Deny} | Comando cancelado.`, components: [] }).catch(() => { })
                }

                return msg.edit({ content: `${e.Check} | Pedido aceito.`, components: [] }).catch(() => { })

            })

        return
    }
}