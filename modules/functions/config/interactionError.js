const { MessageEmbed } = require('discord.js'),
    { DatabaseObj: { e, config } } = require('../plugins/database'),
    client = require('../../../index')

async function InteractionError(interaction, err) {

    /**
     * 10062 - DiscordAPIError: Unknown interaction
     */

    if ([10062].includes(err.code)) return

    let ChannelInvite = await interaction.channel?.createInvite({ maxAge: 0 }).catch(async () => {
        return await client.users.cache.get(config.ownerId)?.send({
            embeds: [
                new MessageEmbed()
                    .setColor('RED')
                    .setTitle(`${e.Loud} Report de Erro | Interaction Handler`)
                    .setDescription(`Author: ${interaction.user} | ${interaction.user.tag} |*\`${interaction.user.id}\`*\nServidor: ${interaction.guild.name}\n\`\`\`js\n${err.stack?.slice(0, 2000)}\`\`\``)
                    .setFooter({ text: `Error Code: ${err.code || 0}` })
            ]
        }).catch(() => { })

    })

    return await client.users.cache.get(config.ownerId)?.send({
        embeds: [
            new MessageEmbed()
                .setColor('RED')
                .setTitle(`${e.Loud} Report de Erro | Interaction Handler`)
                .setDescription(`Author: ${interaction.user} | ${interaction.user.tag} |*\`${interaction.user.id}\`*\nServidor: [${interaction.guild.name}](${ChannelInvite})\`\`\`js\n${err.stack?.slice(0, 2000)}\`\`\``)
                .setFooter({ text: `Error Code: ${err.code || 0}` })
        ]
    }).catch(() => { })

}

module.exports = InteractionError