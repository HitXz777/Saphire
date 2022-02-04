const { e } = require('../../../database/emojis.json')
const { ServerDb } = require('../../../Routes/functions/database')

module.exports = {
    name: 'config',
    aliases: ['serverstatus', 'serverconfig', 'configserver', 'configstatus'],
    category: 'servidor',
    emoji: `${e.ModShield}`,
    usage: '<configstats>',
    description: 'Status da configuração do servidor',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const ConfigEmbed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`${e.ModShield} Configurações ${message.guild.name}`)
            .setDescription(`Dica: Você pode ver todos os comandos de ativação no painel \`configuração\` no comando \`${prefix}help\``)
            .addFields(
                {
                    name: `${e.Verify} Autorole System`,
                    value: GetAutorole()
                },
                {
                    name: `🛰️ Global System Notification`,
                    value: GetChannel('LogChannel')
                },
                {
                    name: '💬 Canal de Ideias',
                    value: GetChannel('IdeiaChannel')
                },
                {
                    name: `${e.Leave} Canal de Saida`,
                    value: GetChannel('LeaveChannel.Canal')
                },
                {
                    name: `${e.Join} Canal de Boas-Vindas`,
                    value: GetChannel('WelcomeChannel.Canal')
                },
                {
                    name: `${e.RedStar} Canal de XP`,
                    value: GetChannel('XPChannel')
                },
                {
                    name: `${e.Report} Canal de Reports`,
                    value: GetChannel('ReportChannel')
                },
                {
                    name: `📝 Confessionário`,
                    value: GetChannel('ConfessChannel')
                },
                {
                    name: `${e.Tada} Canal de Sorteios`,
                    value: GetChannel('GiveawayChannel')
                },
                {
                    name: '🔦 Canal de Busca',
                    value: GetChannel('Farm.BuscaChannel')
                },
                {
                    name: '🎣 Canal de Pesca',
                    value: GetChannel('Farm.PescaChannel')
                },
                {
                    name: '⛏️ Canal de Mineração',
                    value: GetChannel('Farm.MineChannel')
                }
            )

        message.channel.send({ embeds: [ConfigEmbed] }).catch(() => { })

        function GetAutorole() {
            let Autorole1 = ServerDb.get(`Servers.${message.guild.id}.Autorole.First`) ? `Autorole 1: <@&${ServerDb.get(`Servers.${message.guild.id}.Autorole.First`)}>` : 'Autorole 1: Desativado'
            let Autorole2 = ServerDb.get(`Servers.${message.guild.id}.Autorole.Second`) ? `Autorole 2: <@&${ServerDb.get(`Servers.${message.guild.id}.Autorole.Second`)}>` : 'Autorole 2: Desativado'

            return `${Autorole1}\n${Autorole2}`
        }

        function GetChannel(x) {

            if (!ServerDb.get(`Servers.${message.guild.id}.${x}`))
                return 'Desativado'

            let Channel = message.guild.channels.cache.get(ServerDb.get(`Servers.${message.guild.id}.${x}`))
            if (!Channel) ServerDb.delete(`Servers.${message.guild.id}.${x}`)

            return Channel ? `Ativado: ${Channel}` : 'Desativado'
        }

    }
}