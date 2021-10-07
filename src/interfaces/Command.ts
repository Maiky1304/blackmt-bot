import Client from '../client';
import {GuildMember, Message, PermissionString, TextChannel} from 'discord.js';

interface Run {
    (client: Client, message: Message, args: string[])
}

export enum Category {
    GENERAL = 'ℹ️ Algemeen',
    FUN = '🛹 Fun',
    MODERATION = '🔨 Moderatie',
    DEVELOPER = '👨‍💻 Developer',
    TICKETS = '📝 Tickets'
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