// const { formatString } = require('../plugins/gamePlugins')

// class Quiz {

//     async init(client, message, args, prefix, MessageEmbed, Database, e) {

//         if (['edit', 'editar'].includes(args[0]?.toLowerCase())) return editCharacter()

//         async function editCharacter() {

//             let { Rody, Gowther } = Database.Names

//             if (![Rody, Gowther].includes(message.author.id))
//                 return message.reply(`${e.Admin} | Apenas os administradores do quiz *Anime Theme* tem o poder de editar personagens.`)

//             let characters = Database.Characters.get('Characters') || []

//             if (['nome', 'name'].includes(args[1]?.toLowerCase())) return editName()
//             if (['link', 'image', 'imagem', 'foto', 'personagem', 'p'].includes(args[1]?.toLowerCase())) return editImage()
//             if (args[1]?.toLowerCase() === 'anime') return editAnime()
//             return message.reply(`${e.Deny} | Forneça o nome ou o link da imagem para que eu possa buscar um personagem no banco de dados. Logo após, forneça o conteúdo a ser editado.\n\`${prefix}quiz edit <name/image/anime> <Nome/Link>\`\n\`<comando> <editar> <oq editar> <quem editar>\``)

//             async function editName() {

//                 let request = args.slice(2).join(' ')

//                 if (!request)
//                     return message.reply(`${e.Deny} | Forneça o nome ou o link da imagem do personagem que você quer editar o nome.\n\`${prefix}quiz edit name <Nome do Personagem> ou <Link Do Personagem>\``)

//                 let has = characters?.find(p => p.name.toLowerCase() === request?.toLowerCase()
//                     || p.name.toLowerCase().includes(request?.toLowerCase())
//                     || p.image === request) || null

//                 if (!has)
//                     return message.reply(`${e.Deny} | Nenhum personagem foi encontrado com o requisito: \`${request}\``)

//                 let embed = {
//                     color: client.blue,
//                     title: `${e.Database} Database's Edit Information System`,
//                     description: `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Name\`**`,
//                     image: { url: has.image || null },
//                     footer: { text: 'Quiz Anime Theme Selection' }
//                 }

//                 let msg = await message.reply({
//                     content: `${e.Loading} | Diga no chat o novo nome do personagem. Para cancelar, digite \`CANCEL\``,
//                     embeds: [embed]
//                 })

//                 let collector = msg.channel.createMessageCollector({
//                     filter: m => m.author.id === message.author.id,
//                     time: 60000,
//                     erros: ['time']
//                 })
//                     .on('collect', Message => {

//                         if (Message.content === 'CANCEL') return collector.stop()

//                         control.collected = true

//                         embed.description = `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Name\`**\nNew Name: \`${formatString(Message.content)}\``

//                         msg.edit({
//                             content: `${e.Loading} | Confirme as informações abaixo caso tudo esteja correto.`,
//                             embeds: [embed]
//                         }).catch(() => { })

//                         let emojis = ['✅', '❌']

//                         for (let i of emojis) msg.react(i).catch(() => { })

//                         return msg.createReactionCollector({
//                             filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
//                             time: 60000,
//                             max: 1,
//                             erros: ['time', 'max']
//                         })
//                             .on('collect', (reaction) => {

//                                 if (reaction.emoji.name === emojis[1]) return collector.stop()

//                                 control.collectedReaction = true

//                                 let newSet = characters.filter(data => data.name !== has.name)

//                                 Database.Characters.set('Characters', [{ name: Message.content, image: has.image, anime: has.anime }, ...newSet])

//                                 embed.color = client.green
//                                 embed.description = `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Name\`**\nNew Name: \`${formatString(Message.content)}\``

//                                 msg.edit({
//                                     content: `${e.Check} | O nome do personagem **\`${formatString(has.name)}\`** foi alterado para **\`${formatString(Message.content)}\`**`,
//                                     embeds: [embed]
//                                 }).catch(() => { })
//                                 return collector.stop()
//                             })
//                             .on('end', () => {
//                                 if (control.collectedReaction) return
//                                 return msg.edit({
//                                     content: `${e.Deny} | Comando cancelado.`,
//                                     embeds: []
//                                 }).catch(() => { })
//                             })
//                     })
//                     .on('end', () => {
//                         if (control.collected) return
//                         return msg.edit({
//                             content: `${e.Deny} | Comando cancelado.`,
//                             embeds: []
//                         }).catch(() => { })
//                     })
//                 return
//             }

//             async function editImage() {

//                 let request = args.slice(2).join(' ')

//                 if (!request)
//                     return message.reply(`${e.Deny} | Forneça o nome ou o link da imagem do personagem que você quer editar a imagem.\n\`${prefix}quiz edit image <Nome do Personagem> ou <Link Do Personagem>\``)

//                 let has = characters?.find(p => p.name.toLowerCase() === request?.toLowerCase()
//                     || p.name.toLowerCase().includes(request?.toLowerCase())
//                     || p.image === request) || null

//                 if (!has)
//                     return message.reply(`${e.Deny} | Nenhum personagem foi encontrado com o requisito: \`${request}\``)

//                 let embed = {
//                     color: client.blue,
//                     title: `${e.Database} Database's Edit Information System`,
//                     description: `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Image\`**`,
//                     image: { url: has.image || null },
//                     footer: { text: 'Quiz Anime Theme Selection' }
//                 }

//                 let msg = await message.reply({
//                     content: `${e.Loading} | Diga no chat o novo link da imagem do personagem. Para cancelar, digite \`CANCEL\``,
//                     embeds: [embed]
//                 })

//                 let collector = msg.channel.createMessageCollector({
//                     filter: m => m.author.id === message.author.id,
//                     time: 60000,
//                     erros: ['time']
//                 })
//                     .on('collect', Message => {

//                         if (Message.content === 'CANCEL') return collector.stop()

//                         if (!Message.content.includes('https://media.discordapp.net/attachments') && !Message.content.includes('https://cdn.discordapp.com/attachments/'))
//                             return Message.reply(`${e.Deny} | Verique se o link da imagem segue um desses formatos: \`https://media.discordapp.net/attachments\` | \`https://cdn.discordapp.com/attachments/\``)

//                         let alreadyHas = characters?.find(p => p.image === Message.content) || null

//                         if (alreadyHas && alreadyHas.image === Message.content)
//                             return Message.reply(`${e.Deny} | Esta imagem já pertence a este personagem`)

//                         if (alreadyHas)
//                             return Message.reply(`${e.Deny} | Esta imagem já pertence ao personagem **\`${formatString(alreadyHas.name) || 'NAME NOT FOUND'}\`**.`)

//                         control.collected = true

//                         embed.description = `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Image\`**\nNew Image:`
//                         embed.image.url = Message.content

//                         msg.edit({
//                             content: `${e.Loading} | Confirme as informações abaixo caso tudo esteja correto.\n${e.Info} | Se a imagem não apareceu, o link não é válido ou a imagem no canal package foi deletada.`,
//                             embeds: [embed]
//                         }).catch(() => { })

//                         let emojis = ['✅', '❌']

//                         for (let i of emojis) msg.react(i).catch(() => { })

//                         return msg.createReactionCollector({
//                             filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
//                             time: 60000,
//                             max: 1,
//                             erros: ['time', 'max']
//                         })
//                             .on('collect', (reaction) => {

//                                 if (reaction.emoji.name === emojis[1]) return collector.stop()

//                                 control.collectedReaction = true

//                                 let newSet = characters.filter(data => data.name !== has.name)

//                                 Database.Characters.set('Characters', [{ name: has.name, image: Message.content }, ...newSet])

//                                 embed.color = client.green
//                                 embed.description = `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Image\`**`
//                                 embed.image.url = null

//                                 msg.edit({
//                                     content: `${e.Check} | A imagem do personagem **\`${formatString(has.name)}\`** foi alterada com sucesso.`,
//                                     embeds: [
//                                         embed,
//                                         {
//                                             color: client.blue,
//                                             title: `New Image`,
//                                             image: { url: Message.content }
//                                         },
//                                         {
//                                             color: client.blue,
//                                             title: `Old Image`,
//                                             image: { url: has.image }
//                                         }
//                                     ]
//                                 }).catch(() => { })
//                                 return collector.stop()
//                             })
//                             .on('end', () => {
//                                 if (control.collectedReaction) return
//                                 return msg.edit({
//                                     content: `${e.Deny} | Comando cancelado.`,
//                                     embeds: []
//                                 }).catch(() => { })
//                             })
//                     })
//                     .on('end', () => {
//                         if (control.collected) return
//                         return msg.edit({
//                             content: `${e.Deny} | Comando cancelado.`,
//                             embeds: []
//                         }).catch(() => { })
//                     })
//                 return
//             }

//             async function editAnime() {

//                 let request = args.slice(2).join(' ')

//                 if (!request)
//                     return message.reply(`${e.Deny} | Forneça o nome ou o link do personagem que você quer editar o anime.\n\`${prefix}quiz edit anime <Nome do Personagem> ou <Link Do Personagem>\``)

//                 let has = characters?.find(p => p.name.toLowerCase() === request?.toLowerCase()
//                     || p.name.toLowerCase().includes(request?.toLowerCase())
//                     || p.image === request) || null

//                 if (!has)
//                     return message.reply(`${e.Deny} | Nenhum personagem foi encontrado com o requisito: \`${request}\``)

//                 let embed = {
//                     color: client.blue,
//                     title: `${e.Database} Database's Edit Information System`,
//                     description: `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Anime\`**`,
//                     image: { url: has.image || null },
//                     footer: { text: 'Quiz Anime Theme Selection' }
//                 }

//                 let msg = await message.reply({
//                     content: `${e.Loading} | Diga no chat o novo anime do personagem. Para cancelar, digite \`CANCEL\``,
//                     embeds: [embed]
//                 })

//                 let collector = msg.channel.createMessageCollector({
//                     filter: m => m.author.id === message.author.id,
//                     time: 60000,
//                     erros: ['time']
//                 })
//                     .on('collect', Message => {

//                         if (Message.content === 'CANCEL') return collector.stop()

//                         if (has.anime === Message.content)
//                             return Message.reply(`${e.Deny} | Este anime já foi configurado com este personagem`)

//                         control.collected = true
//                         embed.description = `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Anime\`**\nNew Anime Data: \`${Message.content}\``

//                         msg.edit({
//                             content: `${e.Loading} | Confirme as informações abaixo caso tudo esteja correto.`,
//                             embeds: [embed]
//                         }).catch(() => { })

//                         let emojis = ['✅', '❌']

//                         for (let i of emojis) msg.react(i).catch(() => { })

//                         return msg.createReactionCollector({
//                             filter: (reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,
//                             time: 60000,
//                             max: 1,
//                             erros: ['time', 'max']
//                         })
//                             .on('collect', (reaction) => {

//                                 if (reaction.emoji.name === emojis[1]) return collector.stop()

//                                 control.collectedReaction = true

//                                 let newSet = characters.filter(data => data.name !== has.name)

//                                 Database.Characters.set('Characters', [{ name: has.name, image: has.image, anime: Message.content }, ...newSet])

//                                 embed.color = client.green
//                                 embed.description = `Personagem selecionado: **\`${formatString(has.name)}\`**\nInformação para edição: **\`Character's Anime\`**\nNew Anime Data: \`${Message.content}\``
//                                 embed.image.url = null

//                                 msg.edit({
//                                     content: `${e.Check} | O anime do personagem **\`${formatString(has.name)}\`** foi alterada com sucesso para **\`${Message.content}\`**.`,
//                                     embeds: [embed]
//                                 }).catch(() => { })
//                                 return collector.stop()

//                             })
//                             .on('end', () => {
//                                 if (control.collectedReaction) return
//                                 return msg.edit({
//                                     content: `${e.Deny} | Comando cancelado.`,
//                                     embeds: []
//                                 }).catch(() => { })
//                             })
//                     })
//                     .on('end', () => {
//                         if (control.collected) return
//                         return msg.edit({
//                             content: `${e.Deny} | Comando cancelado.`,
//                             embeds: []
//                         }).catch(() => { })
//                     })
//                 return
//             }

//         }

//     }

// }

// module.exports = Quiz