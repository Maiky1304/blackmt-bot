import {Category, Command} from '../../interfaces';
import {Embed, EmbedType} from "../../client";
import {TextChannel} from "discord.js";
import {middleware} from './middleware/ticket.middleware';

export const command: Command = {
    name: 'add',
    category: Category.TICKETS,
    description: 'Voeg iemand toe aan een ticket',
    permission: 'MANAGE_CHANNELS',
    middleware: middleware,
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

        if ((message.channel as TextChannel).permissionOverwrites.cache.has(target.id)) {
            message.reply({
                embeds: [new Embed(EmbedType.ERROR)
                    .setTitle('Deze gebruiker zit al in de ticket!')]
            }).then(msg => client.cleanUp(10000, msg, message));
            return;
        }

        await (message.channel as TextChannel).permissionOverwrites.create(target.id, {
            VIEW_CHANNEL: true,
            SEND_MESSAGES: true
        });
        await message.reply({
            embeds: [new Embed(EmbedType.SUCCESS)
                .setTitle('Gebruiker toegevoegd!')
                .setDescription(`Je hebt de gebruiker ${target} toegevoegd aan de ticket.`)]
        });
    }
}