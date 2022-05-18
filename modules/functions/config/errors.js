const { Message, MessageEmbed } = require('discord.js'),
    { DatabaseObj: { e, config } } = require('../plugins/database'),
    client = require('../../../index'),
    Moeda = require('../public/moeda'),
    Database = require('../../classes/Database')

/**
 * @param { Message } message
 */

async function Error(message, err) {

    /**
     * Errors to ignore
     * 
     * !message - No message
     * !err - No error
     * 10008 - Unknown Message
     * 500 - Internal Server Error
     * 50013 - DiscordAPIError: Missing Permissions
     */

    if (err?.code === 50013)
        return message?.channel?.send(`${e.Warn} | Eu não tenho permissão suficiente para prosseguir com este comando.`)

    if (!message || !err || [10008, 500].includes(err.code) || !message.guild || !message.channel)
        return

    /**
     * INTERACTION_COLLECTOR_ERROR - Buttons and Select Menu bad manipulated
     * Unknown message - INVALID FORM BODY Unknown Message
     */

    if (err.code === 'INTERACTION_COLLECTOR_ERROR' || err.message_reference === 'Unknown message')
        return message?.channel?.send(`${e.SaphireCry} | Deu ruim no meio do processamento, pode usar o comando novamente?`).catch(() => { })

    let guild = await Database.Guild.findOne({ id: message.guild.id }, 'Prefix'),
        prefix = guild?.Prefix || config.prefix,
        args = message.content.slice(prefix.length).trim().split(/ +/g),
        cmd = args.shift().toLowerCase()

    Send();
    Block();

    async function Send() {
        let ChannelInvite = await message.channel?.createInvite({ maxAge: 0 }).catch(async () => {
            return await client.users.cache.get(config.ownerId)?.send({
                embeds: [
                    new MessageEmbed()
                        .setColor('RED')
                        .setTitle(`${e.Loud} Report de Erro | Handler`)
                        .setDescription(`Author: ${message.author} | ${message.author.tag} |*\`${message.author.id}\`*\nMensagem: \`${message.content}\`\nServidor: ${message.guild.name}\nMensagem: [Link Mensagem](${message.url})\n\`\`\`js\n${err.stack?.slice(0, 2000)}\`\`\``)
                        .setFooter({ text: `Error Code: ${err.code || 0}` })
                ]
            }).catch(() => { })

        })

        return await client.users.cache.get(config.ownerId)?.send({
            embeds: [
                new MessageEmbed()
                    .setColor('RED')
                    .setTitle(`${e.Loud} Report de Erro | Handler`)
                    .setDescription(`Author: ${message.author} | ${message.author.tag} |*\`${message.author.id}\`*\nMensagem: \`${message.content}\`\nServidor: [${message.guild.name}](${ChannelInvite?.url || 'Não foi possivel obter o link deste servidor'})\nMensagem: [Link Mensagem](${message.url})\n\`\`\`js\n${err.stack?.slice(0, 2000)}\`\`\``)
                    .setFooter({ text: `Error Code: ${err.code || 0}` })
            ]
        }).catch(() => { })


    }

    async function Block() {

        let commandsAtDatabase = await Database.Client.findOne({ id: client.user.id }, 'ComandosBloqueados'),
            data = commandsAtDatabase?.ComandosBloqueados || []

        let command = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd))
        if (!command || data.some(d => d.cmd === cmd)) return

        Database.add(message.author.id, 1000)

        await Database.Client.updateOne(
            { id: client.user.id },
            { $push: { ComandosBloqueados: { $each: [{ cmd: command.name, error: err?.message || 'Indefinido' }], $position: 0 } } }
        )

        Database.PushTransaction(message.author.id, `${e.gain} Recebeu 1000 Safiras por descobrir um bug`)

        return message.channel.send(`${e.Warn} Ocorreu um erro neste comando. Mas não se preocupe! Eu já avisei meu criador e ele vai arrumar isso rapidinho.\n${e.PandaProfit} +1000 ${await Moeda(message)}`).catch(() => { })
    }
}

module.exports = Error