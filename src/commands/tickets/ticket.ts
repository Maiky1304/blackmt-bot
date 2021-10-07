import { Embed, EmbedType } from '../../client';
import { Category, Command } from '../../interfaces';
import { TicketModel, Context } from '../../models';
import {ReplyMessageOptions, TextChannel} from "discord.js";

export const command: Command = {
    name: 'ticket',
    description: 'Maak een ticket',
    category: Category.TICKETS,
    run: async (client, message, args) => {
        if (!await TicketModel.canCreateTicket(message.author.id)) {
            message.reply({ embeds: [
                new Embed(EmbedType.ERROR).setTitle('Limiet bereikt!')
                .setDescription('Je hebt de maximale hoeveelheid tickets open staan!')
            ] }).then(msg => client.cleanUp(5000, msg, message));
            return;
        }

        const response: TextChannel = await TicketModel.createTicket({
            client: client,
            guild: message.guild,
            creator: message.author.id
        } as Context);
        await message.reply({ content: `Je ticket is aangemaakt in het channel ${response}.`, ephemeral: true } as ReplyMessageOptions);
    }
}