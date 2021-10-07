import {Category, Command} from '../../interfaces';
import {Embed, EmbedType} from "../../client";
import {MessageActionRow, MessageButton} from "discord.js";

export const command: Command = {
    name: 'ticketembed',
    category: Category.TICKETS,
    description: 'Maak een ticket embed aan',
    permission: "ADMINISTRATOR",
    run: async (client, message, args) => {
        const embed = new Embed(EmbedType.BLACKMT);
        embed.setTitle('Ticket');
        embed.setDescription('Klik op de knop hieronder om een ticket aan te maken.');
        embed.setFooter('🕐 Gemiddelde wachttijd: 2-6 uur', client.user.avatarURL({dynamic:true}));

        const row = new MessageActionRow();
        const button = new MessageButton();
        button.setCustomId('create-ticket');
        button.setStyle('SECONDARY');
        button.setLabel('Maak ticket');
        button.setEmoji('🎟️');
        row.addComponents(button);

        await message.channel.send({ embeds: [embed], components: [row] });
    }
}