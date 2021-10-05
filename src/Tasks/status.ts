import { ActivitiesOptions, PresenceData } from 'discord.js';
import { Task } from '../Interfaces';
import {TicketModel} from "../Models";

class Variables {
    static index: number = 0;
    static statuses: string[] = [
        '👥 | {members} leden',
        '🎮 | {players} speler{players_s}',
        '🎟️ | {tickets} ticket{tickets_s}'
    ]
}

export const task: Task = {
    rate: 5000,
    run: async (client) => {
        const tickets = await TicketModel.find();
        const guild = await client.guilds.fetch('654593439303991306');
        const text = Variables.statuses[Variables.index]
        .replaceAll('{members}', guild.memberCount.toString())
        .replaceAll('{players}', '0').replaceAll('{tickets}', tickets.length.toString())
        .replaceAll('{players_s}', 's').replaceAll('{tickets_s}', 's');

        client.user.setPresence({
            status: 'online',
            activities: [
                {
                    name: text,
                    type: 'WATCHING'
                } as ActivitiesOptions
            ]
        } as PresenceData)

        Variables.index++;
        if (Variables.index === Variables.statuses.length) {
            Variables.index = 0;
        }
    }
};