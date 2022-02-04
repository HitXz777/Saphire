const { e } = require('../../../database/emojis.json')
const { f } = require('../../../database/frases.json')

module.exports = {
    name: 'noreact',
    aliases: ['semreação', 'nomentions', 'nmarca', 'nomention'],
    category: 'config',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: `${e.Deny}`,
    usage: '<noreact>',
    description: 'Bloqueie todos de usarem comandos de interação com você',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        sdb.set(`Users.${message.author.id}.NoReact`, !sdb.get(`Users.${message.author.id}.NoReact`))
        message.channel.send(sdb.get(`Users.${message.author.id}.NoReact`) ? `${e.Check} | Ativado! Ninguém vai interagir com você usando os comandos de interações.` : `${e.Deny} | Desativado! Agora todos podem interagir com você usando os comandos de interações.`)
    }
}