import {Category, Command} from '../../interfaces';
import {Embed, EmbedType} from '../../client';
import {MessageActionRow, MessageButton, MessageEmbed} from 'discord.js';

export const command: Command = {
    name: 'verifyembed',
    description: 'Maak de verify embed hiermee',
    permission: 'ADMINISTRATOR',
    category: Category.MODERATION,
    run: (client, message, _args) => {
        const embed: MessageEmbed = new Embed(EmbedType.BLACKMT);
        embed.setTitle('Verifieer jezelf!');
        embed.setDescription('Klik op de knop hieronder om toegang te krijgen tot onze discord.');
        embed.setFooter('Bot created by Maiky1304', client.user.avatarURL({ dynamic: true }));

        const buttons = new MessageActionRow();
        const button = new MessageButton();
        button.setCustomId('verify-button');
        button.setLabel('Verifiëren');
        button.setStyle('SUCCESS');
        button.setEmoji('✅');
        buttons.addComponents(button);

        message.channel.send({ embeds: [embed], components: [buttons] }).then(() => client.cleanUp(250, message));
    }
};