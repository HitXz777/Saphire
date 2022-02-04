const { DatabaseObj } = require('../../Routes/functions/database')
const { e, config } = DatabaseObj
const { MessageEmbed } = require('discord.js')
const client = require('../../index')

client.on('warn', async (warn) => {
    const NewWarn = new MessageEmbed().setColor('RED').setTitle(`${e.Loud} Report de WARN - CLIENT WARN`).addField('Aviso', `${warn}`)
    await client.users.cache.get(config.ownerId).send({ embeds: [NewWarn] }).catch(() => { })
})