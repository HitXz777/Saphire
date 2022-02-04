const { DatabaseObj } = require('../../../Routes/functions/database')
const { e, config, N} = DatabaseObj
const { f } = require('../../../database/frases.json')

module.exports = {
    name: 'vip',
    category: 'bot',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: `${e.VipStar}`,
    usage: '<vip>',
    description: 'Informações sobre o vip',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {
        if (request) return message.reply(`${e.Deny} | ${f.Request}${sdb.get(`Request.${message.author.id}`)}`)

        const link1Real = 'https://mpago.la/2YbvxZd'
        const LinkServidor = `${config.ServerLink}`

        if (['vantagens'].includes(args[0]?.toLowerCase())) return VantageFunction()

        return message.reply({
            embeds: [
                new MessageEmbed()
                    .setColor('#FDFF00')
                    .setTitle(`${e.VipStar} VIP System ${client.user.username}`)
                    .setDescription(`*Antes de tudo, fique ciente de que o VIP System não dá previlégios ou vantagens a ninguém. O VIP System é uma forma de agradecimento e libera funções que não dão vantagens, apenas é legal tê-las, como bônus em alguns comandos.*`)
                    .addField(`${e.QuestionMark} O que eu ganho com o VIP?`, 'Acesso a comandos restritos para vips, que por sua vez, não dão vantagens em nenhum sistema.')
                    .addField(`${e.QuestionMark} Como obter o VIP?`, `Simples! Você pode fazer uma doação de [R$1,00](${link1Real}) no Mercado Pago ou fazer um PIX para o meu criador, basta digitar \`${prefix}donate\` para mais informações. A cada real doado, você ganha 1 semana de Vip.`)
                    .addField(`${e.QuestionMark} Como comprovar o pagamento?`, `Simples! Entre no [meu servidor](${LinkServidor}) e use o comando \`${prefix}comprovante\`. Tudo será dito a você.`)
                    .addField(`${e.QuestionMark} Tem mais perguntas?`, `Entre no [meu servidor](${LinkServidor}) e tire suas dúvidas`)
            ]
        })

        function VantageFunction() {

            return message.reply({
                embeds: [
                    new MessageEmbed()
                        .setColor('#FDFF00')
                        .setTitle(`${e.VipStar} VIP System Saphire | Vantagens`)
                        .setDescription(`As vantagens do vip incluem: Maiores recompensas no \`${prefix}daily\`, \`${prefix}work\`, \`${prefix}semanal\` e \`${prefix}mensal\`, canal privado no servidor principal usando o comando \`${prefix}privatechannel\` e alguns comandos que ainda estão em produção.`)

                ]
            })
        }
    }
}