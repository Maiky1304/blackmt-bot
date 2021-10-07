import {Category, Command} from '../../interfaces';
import {TicketModel} from "../../models";
import {ConfirmMenu} from "../../menu";
import {TextChannel} from "discord.js";
import {middleware} from "./middleware/ticket.middleware";

export const command: Command = {
    name: 'delete',
    category: Category.TICKETS,
    description: 'Verwijder de huidige ticket',
    permission: 'ADMINISTRATOR',
    middleware: middleware,
    run: async (client, message, args) => {
        const ticket = await TicketModel.findOne({ channelId: message.channel.id });

        const confirmMenu = new ConfirmMenu('Weet je het zeker?', undefined, message.channel as TextChannel, message.author.id,
            async (button) => {
                await TicketModel.deleteTicket({
                    client: client,
                    creator: message.author.id,
                    guild: message.guild,
                    ticket: ticket
                });
            });
        await confirmMenu.send();
    }
}