import {Category, Command} from '../../Interfaces';
import {Context, TicketModel} from "../../Models";
import {ConfirmMenu} from "../../Menu";
import {TextChannel} from "discord.js";
import {Embed, EmbedType} from "../../Client";

export const command: Command = {
    name: 'reopen',
    category: Category.TICKETS,
    description: 'Heropen een gesloten ticket',
    permission: 'ADMINISTRATOR',
    aliases: ['heropen'],
    middleware: async (channel, _member): Promise<boolean> => {
        return await TicketModel.isTicket(channel);
    },
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