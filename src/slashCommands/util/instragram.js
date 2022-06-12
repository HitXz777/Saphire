module.exports = {
    name: 'instagram',
    description: '[util] Veja os status de um usuário no Instagram',
    dm_permission: false,
    type: 1,
    options: [
        {
            name: 'username',
            description: 'username da pessoa',
            required: true,
            type: 3
        }
    ],
    async execute({ interaction: interaction, client: client }) {

        const axios = require('axios')
        let username = interaction.options.getString('username')

        try {

            const headers = { 'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36' };
            const result = await axios.get(`https://instagram.com/${username}/feed/?__a=1`, { headers }).then(res => res.data);
            const account = result.graphql.user

            return interaction.reply({
                embeds: [{
                    color: client.blue,
                    author: {
                        name: account.full_name,
                        iconURL: 'https://i.imgur.com/wgMjJvq.png',
                        url: `https://instagram.com/${username}`
                    },
                    thumbnail: {
                        url: account.profile_pic_url_hd
                    },
                    description: account.biography.length === 0 ? 'Nenhuma biografia por aqui' : account.biography,
                    fields: [
                        {
                            name: '👤 Username',
                            value: `${account.username}${account.is_verified ? '☑️' : ''}${account.is_private ? '🔒' : ''}`
                        },
                        {
                            name: '🖼️ Posts',
                            value: account.edge_owner_to_timeline_media.count.toLocaleString() || 0
                        },
                        {
                            name: '➡️ Seguidores',
                            value: account.edge_followed_by.count.toLocaleString() || 0
                        },
                        {
                            name: '⬅️ Seguindo',
                            value: account.edge_follow.count.toLocaleString() || 0
                        }
                    ]
                }],
                components: [
                    {
                        type: 1,
                        components: [
                            {
                                type: 2,
                                label: 'Ir para o perfil',
                                style: 'LINK',
                                url: `https://instagram.com/${account.username}`
                            }
                        ]
                    }
                ],
                ephemeral: true
            })

        } catch (err) {
            return await interaction.reply({
                content: '❌ | Eu não encontrei ninguém no instagram com esse username.',
                ephemeral: true
            })
        }
    }
}