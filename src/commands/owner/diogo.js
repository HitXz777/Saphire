const { e } = require('../../../JSON/emojis.json')

module.exports = {
    name: 'diogo',
    aliases: ['dioguinho'],
    category: 'owner',
    emoji: e.OwnerCrow,
    usage: '<diogo>',
    description: 'Registros de comandos em .JSON',

    execute: async (client, message, args, prefix, MessageEmbed, Database) => {

        if (!['327332773108908032', '451619591320371213'].includes(message.author.id)) return message.reply(`${e.Deny} | Você não tem acesso a este comando.`)

        diogo()
        async function diogo() {
            const path = require('path');
            const fs = require('fs');
            const delay = (delay) => new Promise(resolve => setTimeout(resolve, delay));
            let i = 0;

            if (await fs.existsSync(path.resolve(__dirname, 'data.json'))) await fs.rmSync(path.resolve(__dirname, 'data.json'));
            const msg = await message.channel.send(`${e.Loading} | Gerando o arquivo...`);
            fs.appendFileSync(path.resolve(__dirname, 'data.json'), '[\n', 'utf-8');
            const commandsData = [];
            client.commands.forEach(command => commandsData.push(command));
            for (const command of commandsData) {
                await delay(10);
                if (i != 0 && i < commandsData.length) await fs.appendFileSync(path.resolve(__dirname, 'data.json'), ',\n', 'utf-8'); else i++;
                const { name, aliases, category, UserPermissions, ClientPermissions, emoji, usage, description } = command;
                let data = '\t{\n\t\t';
                data += `"name": "${name}",\n\t\t`;
                if (aliases && aliases.length > 0 && Array.isArray(aliases)) data += `"aliases": [${aliases.map(a => `"${a}"`).join(', ')}],\n\t\t`;
                else data += `"aliases": [],\n\t\t`;
                data += `"category": "${category}",\n\t\t`;
                if (UserPermissions && UserPermissions.length > 0 && Array.isArray(UserPermissions)) data += `"UserPermissions": [${UserPermissions.map(a => `"${a}"`).join(', ')}],\n\t\t`;
                else data += `"UserPermissions": [],\n\t\t`;
                if (ClientPermissions && ClientPermissions.length > 0 && Array.isArray(ClientPermissions)) data += `"ClientPermissions": [${ClientPermissions.map(a => `"${a}"`).join(', ')}],\n\t\t`;
                else data += `"ClientPermissions": [],\n\t\t`;
                data += `"emoji": "${emoji}",\n\t\t`;
                if (usage) data += `"usage": "${usage}",\n\t\t`;
                else data += `"usage": "${name}",\n\t\t`;
                if (description) data += `"description": "${description.replace(/"/g, '\\"')}"\n\t}`;
                else data += `"description": "Sem descrição"\n\t}`;
                await fs.appendFileSync(path.resolve(__dirname, 'data.json'), data, 'utf-8');
            }
            await fs.appendFileSync(path.resolve(__dirname, 'data.json'), '\n]', 'utf-8');
            await msg.delete();
            await message.channel.send({ content: `${e.Check} | <@${message.author.id}>, aqui está o arquivos dos comandos`, files: ['src/commands/owner/data.json'] });
            await fs.unlinkSync(path.resolve(__dirname, 'data.json'));
        }

        // let regData = new ark.Database('../../../data.json')

        // let msg = await message.channel.send(`${e.Loading} | Gerando o arquivo...`),
        //     array = []

        // client.commands.map(command => array.push({
        //     name: command.name,
        //     aliases: command.aliases || [],
        //     category: command.category || 'Indisponível',
        //     UserPermissions: command.UserPermissions || [],
        //     ClientPermissions: command.ClientPermissions || [],
        //     emoji: command.emoji || 'Nenhum',
        //     usage: command.usage || 'Indisponível',
        //     description: command.description || 'Indisponível'
        // }))

        // regData.set('data', array)

        // msg.delete().catch(() => { })

        // await message.channel.send({
        //     content: `${e.Check} | ${message.author}, aqui estão o arquivos dos comandos.`,
        //     files: [{
        //         attachment: 'data.json',
        //         name: 'data.json',
        //         description: 'Nothing'
        //     }]

        // })

        // regData.clear()
        return
    }
}
