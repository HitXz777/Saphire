const { f } = require("../../../database/frases.json")
const { DatabaseObj } = require('../../../Routes/functions/database')
const { e, N, config } = DatabaseObj

module.exports = {
    name: 'request',
    category: 'bot',
    emoji: '⏱️',
    description: 'O que é Request?',

    run: async (client, message, args, prefix, db, MessageEmbed, request, sdb) => {

        const RequestEmbed = new MessageEmbed()
            .setColor('#246FE0')
            .setTitle(`${e.Info} | ${client.user.username} Requests`)
            .setDescription(`O sistema de Request foi implementado pelo ${N.Rody} no dia 10/09/2021, visando o flood de requests envolvendo reações(emojis) e spamms de mensagem que acessam diretamente as configurações do Discord.`)
            .addField(`${e.QuestionMark} O que é Request?`, `Requests são chamados que os Bots fazem diretamente ao Discord para executar alguma atividade, por exemplo, adicionar reações nas mensagens ou adicionar cargos.`)
            .addField(`${e.Info} Aviso de Request Aberta`, `"${e.Deny} | ${f.Request}"\nSe você já viu a mensagem acima, indica que você tem alguma tarefa pendente/em aberto com a ${client.user.username}. Basta concluir o comando que você abriu que o bloqueio some.`)
            .addField(`${e.QuestionMark} Eu fechei o comando mas continuo com o aviso`, `Não se preocupe. Em caso de "bugs" no fechamento do comando, por padrão, a ${client.user.username} exclui as requests abertas de 2 em 2 minutos.`)
            .addField(`${e.QuestionMark} Tenho outra dúvida`, `Você pode acessar o \`${prefix}faq\` ou entrar no [meu servidor](${config.ServerLink})`)
            .setFooter(`Em casos de bugs extremos, existe o comando "${prefix}del request" que deleta todas as requests.`)

        return message.channel.send({ embeds: [RequestEmbed] })
    }
}