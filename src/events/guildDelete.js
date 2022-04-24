const
    { DatabaseObj: { e, config } } = require('../../modules/functions/plugins/database'),
    client = require('../../index'),
    { MessageEmbed } = require('discord.js'),
    Database = require('../../modules/classes/Database')

client.on("guildDelete", async (guild) => {

    if (!guild) return

    await Database.Guild.deleteOne({ id: guild.id })

    await Database.Client.updateOne(
        { id: client.user.id },
        { $pull: { PremiumServers: guild.id } }
    )

    let owner = await guild.members.cache.get(guild.ownerId),
        Embed = new MessageEmbed()
            .setColor('RED')
            .setTitle(`${e.Loud} Um servidor me removeu`)
            .setDescription('Todos os dados deste servidor foram apagados.')
            .addField('Servidor', `${guild.name} *\`(${guild.id})\`*`)
            .addField('Status', `**Dono:** ${owner.user.tag} *\`(${owner.user.id})\`*\n**Membros:** ${guild.memberCount}`)

    client.channels.cache.get(config.LogChannelId)?.send(`${e.Database} | DATABASE | O servidor **${guild.name}** foi removido com sucesso!`).catch(() => { })
    return client.channels.cache.get(config.guildDeleteChannelId)?.send({ embeds: [Embed] }).catch(() => { })
})