import Client from '../Client';
import { Message } from 'discord.js';

interface Run {
    (client: Client, message: Message, args: string[])
}

export enum Category {
    FUN = '🛹 Fun',
    DEVELOPER = '👨‍💻 Developer',
    GENERAL = 'ℹ️ Algemeen'
}

export interface Command {
    name: string;
    category: Category;
    description?: string;
    aliases?: string[];
    run: Run;
}