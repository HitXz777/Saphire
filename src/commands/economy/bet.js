const Bet = require('./classes/bet')

module.exports = {
    name: 'bet',
    aliases: ['apostar', 'aposta'],
    category: 'economy',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '💵',
    usage: '<bet> <info>',
    description: 'Aposte dinheiro no chat',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        let member = client.getUser(client, message, args, 'member')        

        if (member) return new Bet().betWithUser(client, message, args, prefix, MessageEmbed, member)

        return new Bet().execute(client, message, args, prefix, MessageEmbed)

    }
}