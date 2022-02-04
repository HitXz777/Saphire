
const { DatabaseObj } = require('../../../Routes/functions/database')
const { config, e } = DatabaseObj

module.exports = {
    name: 'donate',
    aliases: ['doar', 'doação'],
    category: 'bot',
    ClientPermissions: ['EMBED_LINKS'],
    emoji: `${e.MoneyWings}`,
    usage: '<donate>',
    description: 'Quer me dar um dinheirinho?',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const LinkObj = {
            Link1RMercadoPago: 'https://mpago.la/2YbvxZd',
            LinkPicPay: 'https://picpay.me/donatesaphire',
            PixEmail: 'saphirediscord@gmail.com',
            LinkServidor: `${config.ServerLink}`
        }

        const DonateEmbed = new MessageEmbed()
            .setColor('#FDFF00')
            .setTitle(`${e.PandaProfit} Donate`)
            .setDescription(`Aqui você pode efetuar doações e adquirir seu VIP.`)
            .addField(`${e.QuestionMark} | O que eu ganho doando dinheiro além do Vip?`, `Um grande obrigado e me ajuda a ficar online ${e.SaphireTimida}`)
            .addField(`${e.Info} Meios de Doações`, `${e.Pix} **Pix**\nEmail: ${LinkObj.PixEmail}\n${e.Picpay} ${LinkObj.LinkPicPay}\n${e.Mercadopago} **Mercado Pago 1 Real**\nLink: ${LinkObj.Link1RMercadoPago}`)
            .addField(`${e.Check} Comprove o pagamento`, `${LinkObj.LinkServidor}`)

        return message.reply({ embeds: [DonateEmbed] })
    }
}