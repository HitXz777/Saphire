const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'servers',
    aliases: ['servidres', 'package'],
    category: 'bot',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: `${e.CatJump}`,
    usage: '<servers>',
    description: 'Meus servidores',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        const { Config: config } = Database        

        let moonGuild = client.guilds.cache.get(config.ghostServerId).name || 'Not Found'

        return message.reply({
            embeds: [
                {
                    color: client.blue,
                    title: `${e.Info} | Servers Party`,
                    description: `Eu estou em alguns servidores em participo. Deste interação, suporte e apostas. Basta escolher o seu.`,
                    fields: [
                        {
                            name: `📦 Package da ${client.user.username}`,
                            value: `Este é o [meu servidor onde tudo está guardado](${config.PackageInvite}). Figurinhas, gifs, fotos, tudo. Você pode ver como as coisas funcionam por trás das cortinas.`,
                        },
                        {
                            name: `${e.SaphireOk} Saphire Support Server`,
                            value: `Você pode obter toda e qualquer ajuda entrando no meu [servidor de suporte](${config.SupportServerLink}).`
                        },
                        {
                            name: `${e.NezukoDance} Animes`,
                            value: `Aproveite ao máximo o que o servidor [${moonGuild}](${config.MoonServerLink}) tem a oferecer`
                        },
                        {
                            name: `${e.gain} Apostas`,
                            value: `Talvez você conheça um dos melhores cassinos do Discord, o [Voltz](https://www.discord.gg/voltz)`
                        }
                    ]
                }
            ]
        })
    }
}