import {Guild, MessageActionRow, MessageButton, TextChannel} from 'discord.js';
import {Document, model, Model, Schema} from 'mongoose';
import ExtendedClient, {Embed, EmbedType} from '../client';
import uniqid from 'uniqid';
import {inlineCode} from "@discordjs/builders";

export interface Ticket extends Document {
    channelId?: string,
    guildId: string,
    embedId?: string,
    creator: string,
    open: boolean,
    creationDate?: Date
}

interface FunctionalModel extends Model<Ticket> {
    createTicket(context: Context): Promise<TextChannel>,
    canCreateTicket(userId: string): Promise<boolean>;
    closeTicket(context: Context): Promise<boolean>;
    reopenTicket(context: Context): Promise<void>;
    isTicket(channel: TextChannel): Promise<boolean>;
    deleteTicket(context: Context): Promise<void>;
}

const TicketSchema: Schema = new Schema<Ticket, FunctionalModel>({
    channelId: { type: String, required: true },
    guildId: { type: String, required: true },
    embedId: { type: String, required: false },
    creator: { type: String, required: true },
    open: { type: Boolean, required: true, default: true },
    creationDate: { type: Date, required: true }
});

export interface Context {
    client: ExtendedClient,
    creator: string,
    guild: Guild,
    ticket?: Ticket
}

TicketSchema.static('createTicket', async (context: Context): Promise<TextChannel> => {
    // Generate ticket id
    const ticketId: string = uniqid('ticket-');

    // Get category id for tickets
    const categoryModel = context.client.config.developerMode ? context.client.config.developer.ticketSettings.ticketCategoryId : context.client.config.default.ticketSettings.ticketCategoryId;

    // Get staff role id for tickets
    const staffRoleModel = context.client.config.developerMode ? context.client.config.developer.ticketSettings.ticketStaffRoleId : context.client.config.default.ticketSettings.ticketStaffRoleId;
    if (!staffRoleModel) return;
    
    // Create channel
    const channel: TextChannel = await context.guild.channels.create(ticketId, {
        type: 'GUILD_TEXT',
        parent: categoryModel,
        permissionOverwrites: [
            {
                id: staffRoleModel,
                type: 'role',
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            },
            {
                id: context.guild.roles.everyone.id,
                type: 'role',
                deny: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            },
            {
                id: context.creator,
                type: 'member',
                allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
            }
        ]
    });

    // Create in database
    const model = await TicketModel.create({
        channelId: channel.id,
        guildId: context.guild.id,
        creator: context.creator,
        creationDate: Date.now()
    });

    // send confirmation to channel
    const row = new MessageActionRow();
    const button = new MessageButton();
    button.setCustomId('ticket-context-close');
    button.setStyle('DANGER');
    button.setEmoji('🔒');
    button.setLabel('Sluit ticket');
    row.addComponents(button);

    const question = {
        embeds: [
            new Embed(EmbedType.BLACKMT)
                .setTitle(`Wat is je vraag voor ons staffteam?`)
                .setFooter('📝 Ticket gemaakt op')
                .setTimestamp()
        ]
    };
    const final = {
        embeds: [
            new Embed(EmbedType.BLACKMT)
                .setTitle(`Ticket - ${ticketId}`)
                .setDescription('Gebruik het menu hieronder voor verschillende opties die \nte maken hebben met je ticket.')
                .setFooter('📝 Ticket gemaakt op')
                .setTimestamp()
        ],
        components: [row]
    }

    await channel.send(`<@${context.creator}>`);
    const ticketConfirmation = await channel.send(question);

    model.embedId = ticketConfirmation.id;
    await model.save();

    const filter = m => m.author.id === context.creator;
    const collector = channel.createMessageCollector({ filter, max: 1 });
    collector.on('end', async data => {
        const response = data.first();
        if (!response) return;

        const {content} = response;

        final.embeds[0].addField('❓ Vraag', inlineCode(content), true);
        final.embeds[0].addField('👤 Ticket maker', `<@${context.creator}>`, true);
        await ticketConfirmation.edit(final);
        await response.delete();

        channel.send({ content: `<@&${staffRoleModel}>` }).then(resp => context.client.cleanUp(250, resp));
    });
    return channel;
});
TicketSchema.static('canCreateTicket', async (userId: string): Promise<boolean> => {
    const tickets = await TicketModel.find({ creator: userId });
    return tickets.length < 2;
});
TicketSchema.static('closeTicket', async (context: Context): Promise<boolean> => {
    const ticket = context.ticket;
    if (!ticket) return false;
    if (!ticket.open) return false;

    ticket.open = false;
    await ticket.save();

    const channel = await context.guild.channels.fetch(ticket.channelId) as TextChannel;
    await channel.permissionOverwrites.delete(ticket.creator);

    const message = await channel.messages.fetch(ticket.embedId);
    if (message) {
        const components = message.components;
        if (components.length > 0) {
            for (let i = 0; i < components.length; i++) {
                const inner = components[i];
                for (let j = 0; j < inner.components.length; j++) {
                    inner.components[j].setDisabled(true);
                }
            }
        }
        await message.edit({ embeds: message.embeds, components: components });
    }

    const row = new MessageActionRow();
    const undoButton = new MessageButton().setCustomId(uniqid()).setEmoji('🔄').setLabel('Undo actie').setStyle('SUCCESS');
    row.addComponents(undoButton);

    await channel.send({
        embeds: [new Embed(EmbedType.ERROR).setTitle('🔒 Ticket gesloten')
            .setDescription(`De ticket is gesloten door <@${context.creator}>.`)],
        components: [row]
    });
    const filter = interaction => interaction.customId === undoButton.customId;
    const collector = channel.createMessageComponentCollector({
        filter,
        componentType: 'BUTTON',
        interactionType: 'MESSAGE_COMPONENT',
        max: 1
    });
    collector.on('collect', async interaction => {
        await interaction.deferUpdate();

        await TicketModel.reopenTicket(context);

        await interaction.message.delete();
        interaction.channel.send({
            embeds: [
                new Embed(EmbedType.SUCCESS).setTitle('🔓 Ticket heropend')
                    .setDescription(`De ticket is heropend door <@${context.creator}>.`)
                    .setFooter('Dit bericht wordt over 15 seconden verwijderd...', context.client.user.avatarURL({dynamic: true}))
            ]
        }).then(msg => context.client.cleanUp(15*1000, msg));
    })
    return true;
});
TicketSchema.static('reopenTicket', async (context: Context) => {
    const ticket = context.ticket;
    const channel = await context.guild.channels.fetch(context.ticket.channelId) as TextChannel;

    if (!channel) return;

    if (ticket.open) {
        channel.send({ embeds: [new Embed(EmbedType.ERROR).setTitle('Deze ticket is al open!')] })
            .then(msg => context.client.cleanUp(10000, msg));
        return;
    }

    await channel.permissionOverwrites.edit(ticket.creator, {
        VIEW_CHANNEL: true,
        SEND_MESSAGES: true
    });

    ticket.open = true;
    await ticket.save();

    const message = await channel.messages.fetch(ticket.embedId);
    if (message) {
        const components = message.components;
        if (components.length > 0) {
            for (let i = 0; i < components.length; i++) {
                const inner = components[i];
                for (let j = 0; j < inner.components.length; j++) {
                    inner.components[j].setDisabled(false);
                }
            }
        }
        await message.edit({ embeds: message.embeds, components: components });
    }
});
TicketSchema.static('isTicket', async (channel: TextChannel): Promise<boolean> => {
    const ticket = await TicketModel.findOne({ channelId: channel.id });
    return ticket !== null;
});
TicketSchema.static('deleteTicket', async (context: Context): Promise<void> => {
    await TicketModel.deleteOne({ channelId: context.ticket.channelId });
    const channel = await context.guild.channels.fetch(context.ticket.channelId);
    await channel.delete();
});

export const TicketModel = model<Ticket, FunctionalModel>('tickets', TicketSchema);