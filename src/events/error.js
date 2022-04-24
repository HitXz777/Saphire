const { DatabaseObj: { e, config } } = require('../../modules/functions/plugins/database'),
    { MessageEmbed } = require('discord.js'),
    client = require('../../index')

client.on('error', async (error) => {
    const NewError = new MessageEmbed().setColor('RED').setTitle(`${e.Loud} Report de Erro - CLIENT ERROR`).addField('Aviso', `${error}`)
    return client.users.cache.get(config.ownerId).send({ embeds: [NewError] }).catch(() => { })
})