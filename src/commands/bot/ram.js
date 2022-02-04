const { e } = require('../../../database/emojis.json')
const discloud = require("discloud-status")

module.exports = {
    name: 'ram',
    aliases: 'memory',
    category: 'bot',
    emoji: `${e.BongoScript}`,
    usage: 'ram',
    description: 'Memória ram usada em tempo real',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        message.reply(`${e.Ram} | ${discloud.ram()} usados atualmente`)
    }
}