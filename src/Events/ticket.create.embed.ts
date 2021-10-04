import {Event} from '../Interfaces';
import {ButtonInteraction, TextChannel} from "discord.js";
import {Context, TicketModel} from "../Models";
import {Embed, EmbedType} from "../Client";

export const event: Event = {
    name: 'interactionCreate',
    run: async (client, button: ButtonInteraction) => {
        if (button.customId !== 'create-ticket') return;

        if (!await TicketModel.canCreateTicket(button.user.id)) {
            await button.reply({ embeds: [
                    new Embed(EmbedType.ERROR).setTitle('Limiet bereikt!')
                        .setDescription('Je hebt de maximale hoeveelheid tickets open staan!')
                ], ephemeral: true });
            return;
        }

        const response: TextChannel = await TicketModel.createTicket({
            client: client,
            guild: button.guild,
            creator: button.user.id
        } as Context);
        await button.reply({ content: `Je ticket is aangemaakt in het channel ${response}.`, ephemeral: true });
    }
}
