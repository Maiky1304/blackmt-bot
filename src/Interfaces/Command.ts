import Client from '../Client';
import { Message, PermissionString } from 'discord.js';

interface Run {
    (client: Client, message: Message, args: string[])
}

export enum Category {
    GENERAL = 'ℹ️ Algemeen',
    FUN = '🛹 Fun',
    MODERATION = '🔨 Moderatie',
    DEVELOPER = '👨‍💻 Developer'
}

export interface Command {
    name: string;
    category: Category;
    description?: string;
    aliases?: string[];
    permission?: PermissionString;
    run: Run;
}