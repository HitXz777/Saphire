const convert = require("parse-ms"),
    { e } = require('../../../JSON/emojis.json'),
    Error = require('../../../modules/functions/config/errors')

module.exports = {
    name: 'spotify',
    aliases: ['spot'],
    category: 'util',
    ClientPermissions: ['EMBED_LINKS', 'ADD_REACTIONS'],
    emoji: '💿',
    usage: '<spotify> [@user]',
    description: 'Veja o que os outros estão escutando',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        let user = message.mentions.members.first() || message.guild.members.cache.get(args[0]) || message.mentions.repliedUser || message.member,
            avatar = user.user.displayAvatarURL({ dynamic: true, format: "png", size: 1024 }),
            fotospot = 'https://imgur.com/vw6z7v4.png',
            status,
            AlreadySendedArray = []

        if (user.presence?.activities?.length === 1) status = user.presence?.activities[0]
        if (user.presence?.activities?.length > 1) status = user.presence?.activities[1]
        // Spotify command necessita dessa intent para o funcionamento
        if (!status || user.presence?.activities?.length === 0 || status.name !== "Spotify" && status.type !== "LISTENING")
            return message.reply(`${e.Deny} | Essa pessoa não está ouvindo nada no Spotify ou não vinculou o Spotify com o Discord`)

        if (status !== null && status.type === "LISTENING" && status.name === "Spotify" && status.assets !== null) {

            let image = `https://i.scdn.co/image/${status.assets.largeImage.slice(8)}`,
                url = `https:/open.spotify.com/track/${status.syncID}`,
                name = status.details,
                artist = status.state,
                album = status.assets.largeText,
                timeStart = status.timestamps.start,
                timeEnd = status.timestamps.end,
                timeConvert = convert(timeEnd - timeStart),
                minutes = timeConvert.minutes < 10 ? `0${timeConvert.minutes}` : timeConvert.minutes,
                seconds = timeConvert.seconds < 10 ? `0${timeConvert.seconds}` : timeConvert.seconds,
                time = `${minutes}:${seconds}`,
                embed = new MessageEmbed()
                    .setColor(0x1ED768)
                    .setAuthor({ name: `${user.user.username} está escutando...`, iconURL: avatar })
                    .setDescription(`**Nome:**\n[${name}](${url})`)
                    .setThumbnail(image)
                    .addField("Duração", time, true)
                    .addField("Artista", artist, false)
                    .addField("Album", album, true)
                    .addField("Resumo", `${artist} - ${name}\n📨 Receba a música no seu privado`, false),
                embed2 = new MessageEmbed()
                    .setColor(0x1ED768)
                    .setAuthor({ name: `${user.user.username} ouviu essa música`, iconURL: avatar })
                    .setDescription(`**Nome:**\n[${name}](${url})`)
                    .setThumbnail(image)
                    .addField("Duração", time, true)
                    .addField("Artista", artist, false)
                    .addField("Album", album, true)
                    .addField("Resumo", `${artist} - ${name}`, false)
                    .setFooter({ text: 'Spotify e Discord fazendo seu dia melhor', iconURL: fotospot }),
                msg = await message.reply({ embeds: [embed] })

            msg.react('📨').catch(() => { }) // Troca

            let Collector = msg.createReactionCollector({
                filter: (reaction, u) => reaction.emoji.name === '📨' && u.id !== client.user.id,
                idle: 30000
            })

            Collector.on('collect', (reaction, user) => {

                if (AlreadySendedArray.includes(user.id)) return

                user.send({ embeds: [embed2] }).then(() => {
                    message.channel.send(`${e.Check} | Envio concluido, ${user}.`)
                    return AlreadySendedArray.push(user.id)
                }).catch(err => {
                    if (err.code === 50007)
                        return message.channel.send(`${e.Deny} | ${user}, a sua DM está trancada. Verifique suas configurações de privacidade e tente novamente.`)

                    Error(message, err)
                })
            })

            Collector.on('end', () => {
                embed.setColor('RED').setFooter({ text: 'Sessao expirada por: Tempo de interação execido' })
                return msg.edit({ embeds: [embed] }).catch(() => { })
            })
        }
    }
}
