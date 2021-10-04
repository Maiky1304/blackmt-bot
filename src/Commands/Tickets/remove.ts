import {Category, Command} from '../../Interfaces';
import {TicketModel} from "../../Models";
import {Embed, EmbedType} from "../../Client";
import {TextChannel} from "discord.js";

export const command: Command = {
    name: 'remove',
    category: Category.TICKETS,
    description: 'Verwijder iemand uit de ticket',
    permission: 'ADMINISTRATOR',
    middleware: async (channel, _member): Promise<boolean> => {
        return await TicketModel.isTicket(channel);
    },
    run: async (client, message, args) => {
        if (args.length !== 1) {
            message.reply({
                embeds: [new Embed(EmbedType.ERROR)
                    .setTitle('Geef een gebruiker op!')]
            }).then(msg => client.cleanUp(10000, msg, message));
            return;
        }

        const mentions = message.mentions.members;
        const target = mentions.first();

        if (!(message.channel as TextChannel).permissionOverwrites.cache.has(target.id)) {
            message.reply({
                embeds: [new Embed(EmbedType.ERROR)
                    .setTitle('Deze gebruiker zit niet in de ticket!')]
            }).then(msg => client.cleanUp(10000, msg, message));
            return;
        }

        await (message.channel as TextChannel).permissionOverwrites.delete(target.id);
        await message.reply({
            embeds: [new Embed(EmbedType.SUCCESS)
                .setTitle('Gebruiker verwijderd!')
                .setDescription(`Je hebt de gebruiker ${target} verwijderd uit de ticket.`)]
        });
    }
}