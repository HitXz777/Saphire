const { DatabaseObj: { e, config } } = require('../../modules/functions/plugins/database')
const { MessageEmbed } = require('discord.js')
const client = require('../../index')

client.on('warn', async (warn) => {
    const NewWarn = new MessageEmbed().setColor('RED').setTitle(`${e.Loud} Report de WARN - CLIENT WARN`).addField('Aviso', `${warn}`)
    return await client.users.cache.get(config.ownerId).send({ embeds: [NewWarn] }).catch(() => { })
})