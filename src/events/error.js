const { DatabaseObj } = require('../../Routes/functions/database')
const { e, config } = DatabaseObj
const { MessageEmbed } = require('discord.js')
const client = require('../../index')

client.on('error', async (error) => {
    const NewError = new MessageEmbed().setColor('RED').setTitle(`${e.Loud} Report de Erro - CLIENT ERROR`).addField('Aviso', `${error}`)
    await client.users.cache.get(config.ownerId).send({ embeds: [NewError] }).catch(() => { })
})