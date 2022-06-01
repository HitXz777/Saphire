const { Permissions } = require('discord.js'),
    { DatabaseObj: { e, config } } = require('../../../modules/functions/plugins/database')

module.exports = {
    name: 'comprovante',
    category: 'bot',
    ClientPermissions: ['MANAGE_CHANNELS', 'ADD_REACTIONS'],
    emoji: `${e.Pix}`,
    usage: '<comprovante>',
    description: 'Comprove doações e adquira seu VIP mais bônus',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (message.guild.id !== config.guildId)
            return message.reply(`${e.SaphireObs} | Este é um comando privado do meu servidor de suporte para comprovação de doações. Você fez alguma doação? Simples! Entre no meu servidor e use o comando \`${prefix}comprovante\`.\n${config.SupportServerLink}`)

        let user = await Database.User.findOne({ id: message.author.id }, 'Cache')

        if (user?.Cache?.ComprovanteOpen)
            return message.reply(`${e.Deny} | Você já possui um canal de comprovação aberto!`)

        let channel = await message.guild.channels.create(message.author.tag, {
            type: 'GUILD_TEXT',
            topic: `${message.author.id}`,
            parent: '893307009246580746',
            reason: `Pedido feito por: ${message.author.tag}`,
            permissionOverwrites: [
                {
                    id: message.guild.id,
                    deny: [Permissions.FLAGS.VIEW_CHANNEL],
                },
                {
                    id: message.author.id,
                    allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ATTACH_FILES, Permissions.FLAGS.EMBED_LINKS],
                },
            ]
        })

        await Database.User.updateOne(
            { id: message.author.id },
            { 'Cache.ComprovanteOpen': true },
            { upsert: true }
        )

        message.react(`${e.Check}`).catch(() => { })
        channel.send(`${message.author}, mande o **COMPROVANTE** do pagamento/pix/transação contendo **DATA, HORA** e **VALOR**.\nCaso você queria VIP, é só dizer.\n \nPara fechar este canal, manda \`fechar\``)

        const Msg = await message.reply(`Aqui está o seu canal: ${channel}`),
            collector = channel.createMessageCollector({
                filter: m => ['cancelar', 'cancel', 'close', 'fechar', 'terminar'].includes(m.content?.toLowerCase()),
                time: 1800000
            });

        collector.on('collect', async m => {

            await Database.User.updateOne(
                { id: message.author.id },
                { $unset: { 'Cache.ComprovanteOpen': 1 } }
            )

            Msg.delete().catch(() => { })
            return channel.delete().catch(() => { })
        })

    }
}