
// const Command = require("../../structures/Command");

// const { MessageActionRow, MessageEmbed, MessageButton, MessageSelectMenu } = require("discord.js")
// const component = MessageActionRow;
// const embed = MessageEmbed;
// const button = MessageButton;
// const menu = MessageSelectMenu;

// module.exports = class Coins extends Command {
//     constructor(client) {
//         super(client);
//         this.client = client;

//         this.name = "criarembed";
//         this.category = "Economy";
//         this.description = "Comando para olhar seus coins/do usuário";
//         this.usage = "coins <@user>";
//         this.aliases = ["criarembed"];

//         this.enabled = true;
//         this.guildOnly = true;
//     }

//     async run({ message, args, prefix, author }, t) {
//         if (!message.member.permissions.has("BAN_MEMBERS"))
//             return message.reply(
//                 `${message.author}, você não tem permissão para banir membros.`
//             );
//         let channel = message.mentions.channels.first();
//         if (!channel) return message.reply("Forneça um canal **válido** para enviar a embed")

//         let conf = false;

//         let but = new component().addComponents(
//             new button()
//                 .setStyle("SUCCESS")
//                 .setLabel("Criar")
//                 .setEmoji("✅")
//                 .setCustomId("embc"),
//             new button()
//                 .setStyle("DANGER")
//                 .setLabel("Cancelar")
//                 .setEmoji("🗑")
//                 .setCustomId("embd")
//         )

//         let result = new embed()
//             .setColor("#2F3136");

//         let opt = new component().addComponents(
//             new menu()
//                 .setCustomId("embedder")
//                 .setPlaceholder("Selecione uma opção")
//                 .addOptions([
//                     {
//                         label: "título",
//                         description: "Defina um título para a embed",
//                         value: "etitle"
//                     },
//                     {
//                         label: "Descrição",
//                         description: "Defina uma descrição para a embed",
//                         value: "edesc"
//                     },
//                     {
//                         label: "Cor",
//                         description: "Defina uma cor para a embed",
//                         value: "ecolor"
//                     },
//                     {
//                         label: "Rodapé",
//                         description: "Defina um texto de rodapé para a embed",
//                         value: "efooter"
//                     },
//                     {
//                         label: "Thumbnail",
//                         description: "Defina uma Thumbnail para a embed",
//                         value: "ethumb"
//                     },
//                     {
//                         label: "Imagem",
//                         description: "Defina uma imagem para a embed (imagem grande na parte inferior central)",
//                         value: "eimg"
//                     },
//                     {
//                         label: "Autor",
//                         description: "Defina um texto de autor para a embed (texto acima do título)",
//                         value: "eauthor"
//                     },
//                     {
//                         label: "URL",
//                         description: "Defina uma URL para a embed (hiperlink para o título)",
//                         value: "eurl"
//                     },
//                     {
//                         label: "Timestamp",
//                         description: "Defina um carimbo de data / hora para a embed (ao lado do rodapé)",
//                         value: "etime"
//                     }
//                 ])
//         )

//         let filter1 = (i) => i.user.id === message.author.id;
//         let filter2 = (m) => m.author.id === message.author.id;

//         let cr = new embed()
//             .setTitle("Criador de embed")
//             .setDescription("Escolha uma opção abaixo para definir um valor para incorporar")
//             .setColor("GOLD")

//         let pre = new embed()
//             .setColor("#2F3136")
//             .setDescription("Nada ainda")


//         let msg = await message.channel.send({
//             embeds: [cr],
//             components: [opt]
//         })

//         let preview = await message.channel.send({
//             content: "**Como esta ficando:**",
//             embeds: [pre],
//             components: [but]
//         })

//         const colb = await preview.createMessageComponentCollector({
//             filter: filter1
//         })

//         colb.on("collect", async (i) => {
//             if (i.customId === "embc") {
//                 if (conf === false) return i.reply({
//                     content: "Você precisa colocar a descrição no embed antes de enviá-la!",
//                     ephemeral: true
//                 })
//                 i.channel.send(`A embed foi enviada com sucesso em ${channel}!`)
//                 msg.delete();
//                 preview.delete();
//                 channel.send({
//                     embeds: [result]
//                 })
//             }
//             if (i.customId === "embd") {
//                 i.channel.send("Embed cancelada com sucesso!")
//                 msg.delete();
//                 preview.delete();
//             }
//         })



//         const col = await msg.createMessageComponentCollector({
//             filter: filter1,
//             componentType: "SELECT_MENU"
//         })

//         col.on("collect", async (i) => {
//             if (i.values[0] === "etitle") {
//                 i.reply({
//                     content: "**Título** opção foi selecionada! Agora, forneça um título para a incorporação.",
//                     ephemeral: true
//                 })
//                 let t1 = await message.channel.awaitMessages({
//                     filter: filter2,
//                     max: 1
//                 })
//                 let title = t1.first().content;
//                 pre.setTitle(title);
//                 result.setTitle(title);
//                 t1.first().delete();
//                 preview.edit({
//                     content: "**Como esta ficando:**",
//                     embeds: [pre]
//                 });
//             }

//             if (i.values[0] === "edesc") {
//                 i.reply({
//                     content: "**Descrição** opção foi selecionada! Agora, forneça uma descrição para a embed.",
//                     ephemeral: true
//                 })
//                 let d1 = await message.channel.awaitMessages({
//                     filter: filter2,
//                     max: 1
//                 })
//                 let desc = d1.first().content;
//                 conf = true;
//                 pre.setDescription(desc);
//                 result.setDescription(desc);
//                 d1.first().delete();
//                 preview.edit({
//                     content: "**Como esta ficando:**",
//                     embeds: [pre]
//                 });
//             }
//             if (i.values[0] === "ecolor") {
//                 i.reply({
//                     content: "**Cor** opção foi selecionada! Agora, forneça HEX COLOR para a embed.",
//                     ephemeral: true
//                 })
//                 let c1 = await message.channel.awaitMessages({
//                     filter: filter2,
//                     max: 1
//                 })
//                 let color = c1.first().content;
//                 if (!color.startsWith("#")) return i.followUp({
//                     content: "O código hexadecimal deve começar com #. Para fornecer uma cor novamente, por favor clique no menu e pressione esta opção novamente.",
//                     ephemeral: true
//                 })
//                 result.setColor(color);
//                 pre.setColor(color);
//                 c1.first().delete();
//                 preview.edit({
//                     content: "**Como esta ficando:**",
//                     embeds: [pre]
//                 });
//             }

//             if (i.values[0] === "efooter") {
//                 i.reply({
//                     content: "**Rodapé** oopção foi selecionada! Agora, forneça o texto do rodapé para a embed.",
//                     ephemeral: true
//                 })
//                 let f1 = await message.channel.awaitMessages({
//                     filter: filter2,
//                     max: 1
//                 })
//                 let footer = f1.first().content;
//                 result.setFooter(footer);
//                 pre.setFooter(footer);
//                 f1.first().delete();
//                 preview.edit({
//                     content: "**Como esta ficando:**",
//                     embeds: [pre]
//                 });
//             }
//             if (i.values[0] === "ethumb") {
//                 i.reply({
//                     content: "**Thumbnail** opção foi selecionada! Agora, forneça o URL da Thumbnail para a embed.",
//                     ephemeral: true
//                 })
//                 let th1 = await message.channel.awaitMessages({
//                     filter: filter2,
//                     max: 1
//                 })
//                 let thumb = th1.first().content;
//                 function is_url(str) {
//                     let regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
//                     if (regexp.test(str)) {
//                         return true;
//                     } else {
//                         return false;
//                     }
//                 }

//                 if (is_url(thumb) === false) {
//                     th1.first().delete();
//                     return i.followUp({
//                         content: "**__Thumbnail__** deve ser um link. Para fornecer uma Thumbnail novamente, clique no menu e pressione esta opção novamente.",
//                         ephemeral: true
//                     })
//                 }
//                 pre.setThumbnail(thumb);
//                 result.setThumbnail(thumb);
//                 th1.first().delete();
//                 preview.edit({
//                     content: "**Como esta ficando:**",
//                     embeds: [pre]
//                 });
//             }
//             if (i.values[0] === "eimg") {
//                 i.reply({
//                     content: "A opção **Imagem** foi selecionada! Agora, forneça o link da imagem para a embed.",
//                     ephemeral: true
//                 })
//                 let i1 = await message.channel.awaitMessages({
//                     filter: filter2,
//                     max: 1
//                 })
//                 let img = i1.first().content;
//                 function is_url(str) {
//                     let regexp = /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
//                     if (regexp.test(str)) {
//                         return true;
//                     } else {
//                         return false;
//                     }
//                 }

//                 if (is_url(img) === false) {
//                     i1.first().delete();
//                     return i.followUp({
//                         content: "**__Imagem __ ** deve ser um link. Para fornecer uma imagem novamente, por favor clique no menu e pressione esta opção novamente.",
//                         ephemeral: true
//                     })
//                 }
//                 pre.setImage(img);
//                 pre.setImage(img);
//                 i1.first().delete();
//                 preview.edit({
//                     content: "**Como esta ficando:**",
//                     embeds: [pre]
//                 });
//             }
//             if (i.values[0] === "eurl") {
//                 i.reply({
//                     content: "**URL** opção foi selecionada! Agora, forneça o URL para a embed.",
//                     ephemeral: true
//                 })
//                 let u1 = await message.channel.awaitMessages({
//                     filter: filter2,
//                     max: 1
//                 })
//                 let url = u1.first().content;
//                 pre.setURL(url);
//                 result.setURL(url);
//                 u1.first().delete();
//                 preview.edit({
//                     content: "**Como esta ficando:**",
//                     embeds: [pre]
//                 });
//             }
//             if (i.values[0] === "eauthor") {
//                 i.reply({
//                     content: "A opção **Autor** foi selecionada! Agora, forneça o texto do autor para a embed.",
//                     ephemeral: true
//                 })
//                 let a1 = await message.channel.awaitMessages({
//                     filter: filter2,
//                     max: 1
//                 })
//                 let author =
//                     a1.first().content;
//                 result.setAuthor(author);
//                 pre.setAuthor(author);
//                 a1.first().delete();
//                 preview.edit({
//                     content: "**Como esta ficando:**",
//                     embeds: [pre]
//                 });
//             }
//             if (i.values[0] === "etime") {
//                 i.reply({
//                     content: "A opção ** Timestamp ** foi selecionada! ** Agora, __Tem certeza de que deseja definir o carimbo de data / hora? `true` ou `false` ",
//                     ephemeral: true
//                 })

//                 let ti1 = await message.channel.awaitMessages({
//                     filter: filter2,
//                     max: 1
//                 })
//                 let times = ti1.first().content;
//                 let tim = [
//                     "true",
//                     "false"
//                 ];
//                 if (!tim.includes(times)) return i.followUp({
//                     content: "A opção deve ser `true` ou` false`. Para definir um carimbo de data / hora novamente, clique no menu e pressione esta opção novamente.",
//                     ephemeral: true
//                 })
//                 if (times === "true") {
//                     pre.setTimestamp();
//                     result.setTimestamp();
//                     ti1.first().delete();
//                     preview.edit({
//                         content: "**Como esta ficando:**",
//                         embeds: [pre]
//                     });
//                 } else if (times === "false") {
//                     ti1.first().delete();
//                 }
//             }
//         })
//     }
// }