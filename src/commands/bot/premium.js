const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'premium',
    category: 'bot',
    emoji: e.CoroaDourada,
    description: 'Informações sobre o sistema premium',

    run: async (client, message, args, prefix, MessageEmbed, Database) => {

        return message.reply(
            {
                embeds: [
                    new MessageEmbed()
                        .setColor(client.blue)
                        .setTitle(`${e.CoroaDourada} Servidores Premium`)
                        .setDescription(`Servidores Premium no meu sistema tem umas vantagens bem interessantes.`)
                        .addFields(
                            {
                                name: `${e.antlink} AntiLink System`,
                                value: `\`${prefix}antilink\` Bloqueie convite de outros servidores`
                            },
                            {
                                name: '🗣️ Antifake System',
                                value: `\`${prefix}antifake\` Bloqueie a entrada de contas fakes com menos de 7 dias após a criação.`
                            },
                            {
                                name: `${e.OwnerCrow} Saphire's Development`,
                                value: 'A equipe de Desenvolvimento e Planos está se esforçando para liberar mais e mais recursos para este sistema.'
                            },
                            {
                                name: `${e.Info} Adquira o Premium para seu servidor`,
                                value: `Para o desbloqueio, é necessário pagar **R$ 5,00**. Você pode obter todos os links e meios de pagamentos usando o comando \`${prefix}donate\``
                            },
                            {
                                name: `${e.Info} Observação`,
                                value: '*Todos os recursos atuais e futuros serão liberados sem cobranças adicionais para os servidores que já compraram o Sistema Premium.*'
                            }
                        )
                ]
            }
        )

    }
}