import {Category, Command} from '../../interfaces';
import {Context, TicketModel} from "../../models";
import {ConfirmMenu} from "../../menu";
import {TextChannel} from "discord.js";
import {middleware} from './middleware/ticket.middleware';

export const command: Command = {
    name: 'close',
    category: Category.TICKETS,
    description: 'Sluit de huidige ticket',
    permission: 'ADMINISTRATOR',
    middleware: middleware,
    run: async (client, message, args) => {
        const ticket = await TicketModel.findOne({ channelId: message.channel.id });

        client.cleanUp(1, message);

        const confirmMenu = new ConfirmMenu('Weet je het zeker?', undefined, message.channel as TextChannel, message.author.id,
            async (button) => {
                await TicketModel.closeTicket({
                    client: client,
                    creator: message.member.id,
                    guild: message.guild,
                    ticket: ticket
                } as Context);
            });
        await confirmMenu.send();
    }
}