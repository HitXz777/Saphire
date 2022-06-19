const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'setsexo',
    aliases: ['sexo', 'gênero', 'genero', 'setgenero', 'setgênero'],
    category: 'perfil',
    ClientPermissions: ['ADD_REACTIONS'],
    emoji: '🌛',
    usage: '/editprofile',
    description: 'Defina seu sexo no perfil',

    execute: async (client, message, args, prefix, MessageEmbed, Database) =>  {
        return message.reply(`${e.Info} | Este comando foi movido para Slash Command e será excluído em breve. Use \`/editprofile\``)
    }
}