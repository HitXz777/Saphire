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

        return new Bet().execute(client, message, args, prefix, MessageEmbed, Database)

    }
}