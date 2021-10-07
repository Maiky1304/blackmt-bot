import {Category, Command} from '../../interfaces';
import {Embed, EmbedType} from "../../client";
import {MessageActionRow, MessageSelectMenu, MessageSelectOptionData} from "discord.js";
import {ServerSettings} from "../../interfaces/Config";

export const command: Command = {
    name: 'reactrolesembed',
    description: 'Maak de reaction roles embed',
    permission: 'ADMINISTRATOR',
    category: Category.DEVELOPER,
    run: async (client, message, args) => {
        const embed = new Embed(EmbedType.BLACKMT);
        embed.setTitle('Reaction Roles');
        embed.setDescription('Hier kun je de rollen kiezen voor de tags/pings die je wilt ontvangen in onze channels.');
        embed.setFooter('BlackMT Bot', client.user.avatarURL({dynamic:true}));

        const serverSettings: ServerSettings = client.config.developerMode ? client.config.developer : client.config.default;
        const data = [];
        for (const rsd of serverSettings.roleSettings.roles) {
            data.push({
                label: rsd.name,
                value: `rr-${rsd.id}`,
                emoji: rsd.emoji,
                description: `Selecteer dit om de ${rsd.name} rol te ontvangen.`
            } as MessageSelectOptionData)
        }


        const menu = new MessageSelectMenu();
        menu.setCustomId('role-menu-rr');
        menu.setPlaceholder('Selecteer rollen');
        menu.addOptions(data);
        menu.setMinValues(0);
        menu.setMaxValues(data.length);

        const row = new MessageActionRow();
        row.addComponents(menu);

        await message.delete();
        await message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }
}