import {Event} from '../Interfaces';
import {MessageComponentInteraction, SelectMenuInteraction} from "discord.js";
import {Context, TicketModel} from '../Models';

export const event: Event = {
    name: 'interactionCreate',
    run: async (client, interaction: MessageComponentInteraction) => {
        if (!interaction.isButton()) return;
        if (interaction.customId !== 'ticket-context-close') return;

        const ticket = await TicketModel.findOne({ channelId: interaction.channel.id });
        if (!ticket) return;

        await interaction.deferUpdate();
        await TicketModel.closeTicket({
            client: client,
            creator: interaction.member.user.id,
            guild: interaction.guild,
            ticket: ticket
        } as Context);
    }
}