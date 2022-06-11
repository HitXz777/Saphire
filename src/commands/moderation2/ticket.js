const { e } = require('../../../JSON/emojis.json'),
    TicketManager = require('./TicketsManager/TicketManager')

module.exports = {
    name: 'ticket',
    aliases: ['tickets'],
    category: 'moderation',
    UserPermissions: ['MANAGE_CHANNELS'],
    ClientPermissions: ['MANAGE_CHANNELS'],
    emoji: e.Reference,
    usage: '<ticket> <info>',
    description: 'Gerencia o sistema de tickets no seu servidor.',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        return message.reply(`${e.Loading} | Este sistema esta sendo construindo. Calma calma.`)

        const ticket = new TicketManager(message, client)

        if (['create', 'criar', 'new'].includes(args[0]?.toLowerCase())) return ticket.create()
        if (['info', 'help', 'ajuda'].includes(args[0]?.toLowerCase())) return ticket.ticketInfo()
        if (['drop', 'send', 'enviar', 'soltar', 'lançar'].includes(args[0]?.toLowerCase())) return ticket.dropTicket()

        return message.reply({ content: `${e.Info} | Este é um comando com diversos comandos. Caso você não conheça eles, tente usar o comando \`${prefix}ticket info\`` })

    }
}