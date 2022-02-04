const { Message, MessageEmbed } = require('discord.js')
const { sdb, db, DatabaseObj, ServerDb } = require('./database')
const { e, config } = DatabaseObj
const client = require('../../index')
const Moeda = require('./moeda')
const { PushTransaction } = require('./transctionspush')

/**
 * @param { Message } message
 */

function Error(message, err) {

    if ([10008, 50035, 50001].includes(err.code)) // Unknown message
        return

    if (err.code === 50013) // Missing Permissions
        return message.channel.send(`${e.Info} | Eu não tenho permissão suficiente para executar este comando.`).catch(() => { })

    let prefix = ServerDb.get(`Servers.${message.guild.id}.Prefix`) || config.prefix,
        args = message.content.slice(prefix.length).trim().split(/ +/g),
        cmd = args.shift().toLowerCase()

    Send();
    Block();

    async function Send() {
        let ChannelInvite

        try {
            ChannelInvite = await message.channel?.createInvite({ maxAge: 0 })
            return SendError()
        } catch (err) {
            return SendError()
        }

        async function SendError() {

            return await client.users.cache.get(config.ownerId)?.send({
                embeds: [
                    new MessageEmbed()
                        .setColor('RED')
                        .setTitle(`${e.Loud} Report de Erro | Handler`)
                        .setDescription(`Author: ${message.author} | ${message.author.tag} |*\`${message.author.id}\`*\nMensagem: \`${message.content}\`\nServidor: [${message.guild.name}](${ChannelInvite?.url || 'Não foi possivel obter o link deste servidor'})\nMensagem: [Link Mensagem](${message.url})\n\`\`\`js\n${err.stack?.slice(0, 2000)}\`\`\``)
                        .setFooter(`Error Code: ${err.code || 0}`)
                ]
            }).catch(() => { })

        }
    }

    function Block() {
        sdb.push('ComandosBloqueados', { cmd: cmd, error: err?.message || 'Indefinido' })
        sdb.add(`Users.${message.author.id}.Balance`, 1000)
        PushTransaction(
            message.author.id,
            `💰 Recebeu 1000 Moedas por descobrir um bug`
        )
        return message.channel.send(`${e.Warn} Ocorreu um erro neste comando. Mas não se preocupe! Eu já avisei meu criador e ele vai arrumar isso rapidinho.\n${e.PandaProfit} +1000 ${Moeda(message)}`).catch(() => { })
    }
}

module.exports = Error