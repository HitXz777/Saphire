module.exports = {
    name: 'forca',
    aliases: ['hangman'],
    category: 'games',
    ClientPermissions: ['MANAGE_MESSAGES'],
    emoji: '😵',
    usage: '/forca',
    description: 'Movido para Slash Command',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        return message.reply(`⚠ | Este comando foi movido para o Slash Command. Tente usar \`/forca\`. Se não aparecer nada para você, acesse: \`Configurações do Servidor -> Integrações -> ${client.user.username} -> Ativar para everyone\``)

    }
}