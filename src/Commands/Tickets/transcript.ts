import {Category, Command} from '../../Interfaces';
import {TicketModel} from "../../Models";

export const command: Command = {
    name: 'transcript',
    category: Category.TICKETS,
    description: 'Maak een transcript van de huidige ticket',
    permission: 'ADMINISTRATOR',
    middleware: async (channel, _member): Promise<boolean> => {
        return await TicketModel.isTicket(channel);
    },
    run: (client, message, args) => {

    }
}