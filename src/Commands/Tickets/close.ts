import {Category, Command} from '../../Interfaces';
import {Context, TicketModel} from "../../Models";
import {ConfirmMenu} from "../../Menu";
import {TextChannel} from "discord.js";

export const command: Command = {
    name: 'close',
    category: Category.TICKETS,
    description: 'Sluit de huidige ticket',
    permission: 'ADMINISTRATOR',
    middleware: async (channel, _member): Promise<boolean> => {
        return await TicketModel.isTicket(channel);
    },
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