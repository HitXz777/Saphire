const { e } = require('../../../JSON/emojis.json'),
    axios = require('axios')
require('dotenv').config()

module.exports = {
    name: 'stats',
    aliases: ['s'],
    category: 'owner',
    emoji: e.OwnerCrow,
    owner: true,
    description: 'Stats Bot',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        const msg = await message.reply(`${e.Loading} | Obtendo os dados necessários...`),
            info = (await axios.get(`https://discloud.app/status/bot/${client.user.id}`, {
                headers: {
                    "api-token": process.env.DISCLOUD_API_TOKEN
                }
            })).data,
            user = (await axios.get('https://discloud.app/status/user', {
                headers: {
                    "api-token": process.env.DISCLOUD_API_TOKEN
                }
            })).data

        return msg.edit({
            content: `${e.Check} Sucess`,
            embeds: [
                new MessageEmbed()
                    .setColor(client.blue)
                    .setTitle('Discloud Host Information')
                    .addFields(
                        {
                            name: `${e.Gear} Bot Stats`,
                            value: `> Bot: ${client.users.cache.get(info?.bot_id)?.tag || "Não encontrado"} \`${info?.bot_id || 'Indefinido'}\`\n> Plano: ${user.plan}`
                        },
                        {
                            name: `${e.Loading} Plan End date`,
                            value: `> ${new Date(user.planDataEnd).toLocaleString('pt-br', { timeZone: 'America/Sao_Paulo' })}`
                        },
                        {
                            name: '<:container:918511382125768824> Container',
                            value: `> ${info.container === 'Online' ? `🟢 Online` : `🔴 Offline`}`
                        },
                        {
                            name: '<:gds_cpu:918512199155220481> Cpu Usage',
                            value: `> ${info.cpu}`
                        },
                        {
                            name: `${e.Ram} Ram Memory Usage`,
                            value: `> ${info.memory}`
                        },
                        {
                            name: `🔄 Last Discloud Restart`,
                            value: `> ${info.last_restart?.replace(/a few seconds/g, 'A alguns segundos').replace(/a minute/g, 'Menos de um minuto').replace(/minutes/g, 'minutos').replace(/hours/g, 'horas').replace(/days/g, 'dias').replace(/a day/g, 'Por volta de um dia')}`
                        }
                    )
            ]
        }).catch(() => { })

    }
}