import {Category, Command} from '../../interfaces';
import {Context, TicketModel} from "../../models";
import {ConfirmMenu} from "../../menu";
import {TextChannel} from "discord.js";
import {Embed, EmbedType} from "../../client";
import {middleware} from "./middleware/ticket.middleware";

export const command: Command = {
    name: 'reopen',
    category: Category.TICKETS,
    description: 'Heropen een gesloten ticket',
    permission: 'ADMINISTRATOR',
    aliases: ['heropen'],
    middleware: middleware,
    run: async (client, message, args) => {
        const ticket = await TicketModel.findOne({ channelId: message.channel.id });

        if (ticket.open) {
            message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle('Deze ticket is al open!')] }).then(msg => client.cleanUp(15000, msg, message));
            return;
        }

        const confirmMenu = new ConfirmMenu('Weet je het zeker?', undefined, message.channel as TextChannel, message.author.id,
            async (_button) => {
                await TicketModel.reopenTicket({
                    client: client,
                    creator: message.member.id,
                    guild: message.guild,
                    ticket: ticket
                } as Context);
            });
        await confirmMenu.send();
    }
}