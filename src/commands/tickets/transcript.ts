import {Category, Command} from '../../interfaces';
import {middleware} from "./middleware/ticket.middleware";

export const command: Command = {
    name: 'transcript',
    category: Category.TICKETS,
    description: 'Maak een transcript van de huidige ticket',
    permission: 'ADMINISTRATOR',
    middleware: middleware,
    run: (client, message, args) => {

    }
}