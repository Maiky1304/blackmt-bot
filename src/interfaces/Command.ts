import Client from '../client';
import {GuildMember, Message, PermissionString, TextChannel} from 'discord.js';

interface Run {
    (client: Client, message: Message, args: string[])
}

export enum Category {
    GENERAL = 'âšī¸ Algemeen',
    FUN = 'đš Fun',
    MODERATION = 'đ¨ Moderatie',
    DEVELOPER = 'đ¨âđģ Developer',
    TICKETS = 'đ Tickets',
    ECONOMY = 'đ° Economy'
}

export interface Middleware {
    (channel: TextChannel, member: GuildMember): Promise<boolean>;
}

export interface Command {
    name: string;
    category: Category;
    description?: string;
    aliases?: string[];
    permission?: PermissionString;
    middleware?: Middleware;
    run: Run;
}