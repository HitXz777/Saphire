const { e } = require('../../../database/emojis.json')

module.exports = {
    name: 'remove',
    aliases: ['remover', 'tirar'],
    category: 'owner',
    emoji: `${e.OwnerCrow}`,
    usage: '<remove> <user/id> <item>',
    description: 'Permite meu criador remover/subtrarir qualquer valor de qualquer um',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        
        let user = message.mentions.members.first() || message.user

        if (['fichas', 'ficha'].includes(args[0]?.toLowerCase())) {

            if (!user) { return message.channel.send('`' + prefix + 'remove fichas @user Valor`') }

            let amount = args[2]
            if (!amount) { return message.channel.send('`' + prefix + 'remove fichas @user Valor`') }
            if (isNaN(amount)) { return message.channel.send(`**${args[2]}** não é um número.`) }

            sdb.subtract(`Users.${user.id}.Slot.Fichas`, amount)
            return message.channel.send(`✅ Sucesso!`)
        }

        if (['fichasid', 'fichaid'].includes(args[0]?.toLowerCase())) {

            let id = args[1]
            if (!id) { return message.reply('`' + prefix + 'remove fichasid ID Valor`') }
            if (id.length < 17) { return message.channel.send("❌ Isso não é um ID") }
            if (isNaN(id)) { return message.channel.send("❌ Isso não é um número.") }

            let amount = args[2]
            if (!amount) { return message.channel.send('`' + prefix + 'remove fichasid ID Valor`') }
            if (isNaN(amount)) { return message.channel.send(`**${args[2]}** não é um número.`) }

            sdb.subtract(`Users.${id}.Slot.Fichas`, amount)
            return message.channel.send(`✅ Sucesso!`)
        }

    }
}