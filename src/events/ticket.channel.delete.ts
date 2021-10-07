import {Event} from '../interfaces';
import {Channel, TextChannel} from "discord.js";
import {TicketModel} from "../models";

export const event: Event = {
    name: 'channelDelete',
    run: async (client, channel: Channel) => {
        if (!channel.isText()) return;

        const textChannel: TextChannel = (channel as TextChannel);
        const ticket = TicketModel.findOne({ channelId: textChannel.id });

        if (!ticket) {
            return;
        }

        await TicketModel.deleteOne({ channelId: textChannel.id });
    }
}