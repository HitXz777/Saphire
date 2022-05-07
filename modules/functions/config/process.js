const { e } = require('../../../JSON/emojis.json')
const { MessageEmbed } = require('discord.js')
const { config } = require('../../../JSON/config.json')
const client = require('../../../index')

process.on('unhandledRejection', async (reason) => {

    /**
     *  "reason.code" to ignore
     * 
     * 500 Internal Server Error
     * 10004 Unknown Guild
     * 10008 Unknown Message
     * 50035 Invalid Form Body (Error Handling Filter)
     * 11000 Duplicated Creating Document Mongoose - Ignore Error
     */

    if ([500, 10004, 10008, 50035, 11000].includes(reason.code)) return

    return await client.users.cache.get(`${config.ownerId}`)?.send({
        embeds: [
            new MessageEmbed()
                .setColor('RED')
                .setTitle(`${e.Loud} Report de Erro | unhandledRejection`)
                .setDescription(`\`\`\`js\n${reason.stack.slice(0, 2000)}\`\`\``)
                .setFooter({ text: `Error Code: ${reason.code || 0}` })
        ]
    }).catch(() => console.log(reason))

})

process.on('uncaughtExceptionMonitor', async (error, origin) => {

    if (error.code === 10008)
        return

    return await client.users.cache.get(`${config.ownerId}`)?.send({
        embeds: [
            new MessageEmbed()
                .setColor('RED').setTitle(`${e.Loud} Report de Erro | uncaughtExceptionMonitor`)
                .setDescription(`\`\`\`js\n${error.stack.slice(0, 2000)}\`\`\``)
                .setFooter({ text: `Error Code: ${error.code || 0}` }),
            new MessageEmbed()
                .setColor('RED')
                .setDescription(`\`\`\`js\n${origin}\`\`\``)
        ]
    }).catch(() => console.log(reason, origin))

})