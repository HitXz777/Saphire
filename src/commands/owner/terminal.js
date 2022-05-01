const { e } = require('../../../JSON/emojis.json'),
    axios = require('axios')
require('dotenv').config()

module.exports = {
    name: 'terminal',
    aliases: ['log'],
    category: 'owner',
    owner: true,
    emoji: `${e.OwnerCrow}`,
    usage: '<logs>',
    description: 'Permite meu criador olhar meu terminal',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        const msg = await message.reply(`${e.Loading} | Obtendo os dados necessários...`),
            terminal = (await axios.get(`https://discloud.app/status/bot/${client.user.id}/logs`, {
                headers: { "api-token": process.env.DISCLOUD_API_TOKEN }
            })).data

        return msg.edit({
            content: `${e.Check} | Tudo certo!`,
            embeds: [
                new MessageEmbed()
                    .setColor(client.blue)
                    .setTitle(`${e.Reference} Discloud Logs | ${terminal.bot_id}`)
                    .setURL(`${terminal.link}`)
                    .setDescription(`\`\`\`txt\n${terminal.logs}\`\`\``)
            ]
        })

    }
}