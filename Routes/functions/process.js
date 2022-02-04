const { e } = require('../../database/emojis.json')
const { MessageEmbed } = require('discord.js')
const { config } = require('../../database/config.json')
const client = require('../../index')

process.on('unhandledRejection', async (reason) => {

    if (reason.code === 10008 || reason.code === 50035 || reason.code === 500)
        return

    await client.users.cache.get(`${config.ownerId}`)?.send({
        embeds: [
            new MessageEmbed()
                .setColor('RED')
                .setTitle(`${e.Loud} Report de Erro | unhandledRejection`)
                .setDescription(`\`\`\`js\n${reason.stack.slice(0, 2000)}\`\`\``)
                .setFooter(`Error Code: ${reason.code || 0}`)
        ]
    }).catch(() => { console.log(reason) })

})

process.on('uncaughtExceptionMonitor', async (error, origin) => {

    if (error.code === 10008 || error.code === 500)
        return

    await client.users.cache.get(`${config.ownerId}`)?.send({
        embeds: [
            new MessageEmbed()
                .setColor('RED').setTitle(`${e.Loud} Report de Erro | uncaughtExceptionMonitor`)
                .setDescription(`\`\`\`js\n${error.stack.slice(0, 2000)}\`\`\``)
                .setFooter(`Error Code: ${error.code || 0}`),
            new MessageEmbed()
                .setColor('RED')
                .setDescription(`\`\`\`js\n${origin}\`\`\``)
        ]
    }).catch(() => { console.log(reason); console.log(origin) })

})