import {Category, Command} from '../../Interfaces';
import {TicketModel} from "../../Models";
import {MessageEmbed} from "discord.js";
import {Embed, EmbedType} from "../../Client";
import dateformat from 'dateformat';

export const command: Command = {
    name: 'ticketinfo',
    category: Category.TICKETS,
    description: 'Krijg informatie over de huidige ticket',
    permission: 'ADMINISTRATOR',
    middleware: async (channel, _member): Promise<boolean> => {
        return await TicketModel.isTicket(channel);
    },
    run: async (client, message, args) => {
        const ticket = await TicketModel.findOne({ channelId: message.channel.id })

        const embed: MessageEmbed = new Embed(EmbedType.INFO);
        embed.setTitle('Ticket Info');
        embed.setFields([
            {
                name: '📅 Gemaakt op',
                value: ticket.creationDate.toLocaleString(),
                inline: true
            },
            {
                name: '👤 Maker',
                value: `<@${ticket.creator}>`,
                inline: true
            }
        ]);
        embed.setFooter('⌚ Opgehaald op');
        embed.setTimestamp();

        await message.reply({ embeds: [embed] });
    }
}