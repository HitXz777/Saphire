const Moeda = require('../../../modules/functions/public/moeda')

async function InteractionError({ interaction, Database, user, e, client, guild, channel }, err) {

    const { Config: config } = Database,
        moeda = await Moeda(null, guild.id)

    /**
     * 10062 - DiscordAPIError: Unknown interaction
     */

    if ([10062].includes(err.code)) return

    let ChannelInvite = await interaction.channel?.createInvite({ maxAge: 0 }).catch(async () => {
        return await client.users.cache.get(config.ownerId)?.send({
            embeds: [
                {
                    color: client.red,
                    title: `${e.Loud} Report de Erro | Interaction Handler`,
                    description: `Author: ${user} | ${user.tag} |*\`${user.id}\`*\nServidor: ${interaction.guild.name}\n\`\`\`js\n${err.stack?.slice(0, 2000)}\`\`\``,
                    footer: { text: `Error Code: ${err.code || 0}` }
                }
            ]
        }).catch(() => { })

    })

    await client.users.cache.get(config.ownerId)?.send({
        embeds: [
            {
                color: client.red,
                title: `${e.Loud} Report de Erro | Interaction Handler`,
                description: `Author: ${user} | ${user.tag} |*\`${user.id}\`*\nServidor: [${interaction.guild.name}](${ChannelInvite})\nCanal: ${channel} - ${channel?.name}\`\`\`js\n${err.stack?.slice(0, 2000)}\`\`\``,
                footer: { text: `Error Code: ${err.code || 0}` }
            }
        ]
    }).catch(() => { })


    let commandsAtDatabase = await Database.Client.findOne({ id: client.user.id }, 'ComandosBloqueadosSlash'),
        data = commandsAtDatabase?.ComandosBloqueadosSlash || []

    let command = client.slashCommands.get(interaction.commandName)
    if (!command || data.some(d => d.cmd === interaction.commandName)) return

    Database.add(user.id, 1500)

    await Database.Client.updateOne(
        { id: client.user.id },
        { $push: { ComandosBloqueadosSlash: { $each: [{ cmd: command.name, error: err?.message || 'Indefinido' }], $position: 0 } } }
    )

    Database.PushTransaction(user.id, `${e.gain} Recebeu 1500 Safiras por descobrir um bug em um Slash Command`)

    return await interaction.reply({
        content: `${e.Warn} | Ocorreu um erro neste comando. Mas não se preocupe! Eu já avisei meu criador e ele vai arrumar isso rapidinho.\n${e.PandaProfit} +1500 ${moeda}`,
        ephemeral: true
    })

}

module.exports = InteractionError