const simplydjs = require('simply-djs')

module.exports = {
    name: 'calculadora',
    aliases: ['cal'],
    category: 'util',
    emoji: '🧮',
    usage: 'Não informado',
    description: 'Calculadora simples',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {
        try {
            await simplydjs.calculator(message, { embedColor: '#246FE0', credit: false })?.catch(() => { })
        } catch (err) { return }
    }
}