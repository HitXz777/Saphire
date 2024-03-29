const { e } = require('../../../JSON/emojis.json')
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
     * 50013 Missing Permissions
     * 11000 Duplicated Creating Document Mongoose - Ignore Error
     * 50001 DiscordAPIError: Missing Access (send message)
     * 10062 Unknow Interaction
     */

    if ([500, 10004, 10008, 50035, 11000, 50001, 10062, 50013].includes(reason.code)) return

    return await client.users.cache.get(`${config.ownerId}`)?.send({
        embeds: [
            {
                color: 'RED',
                title: `${e.Loud} Report de Erro | unhandledRejection`,
                description: `\`\`\`js\n${reason.stack?.slice(0, 2000)}\`\`\``,
                footer: { text: `Error Code: ${reason.code || 0}` }
            }
        ]
    }).catch(() => console.log(reason))

})

process.on('uncaughtExceptionMonitor', async (error, origin) => {

    if (error.code === 10008)
        return

    return await client.users.cache.get(`${config.ownerId}`)?.send({
        embeds: [
            {
                color: client.red,
                title: `${e.Loud} Report de Erro | uncaughtExceptionMonitor`,
                description: `\`\`\`js\n${error.stack.slice(0, 2000)}\`\`\``,
                footer: { text: `Error Code: ${error.code || 0}` }
            },
            {
                color: client.red,
                description: `\`\`\`js\n${origin}\`\`\``

            }
        ]
    }).catch(() => console.log(reason, origin))

})