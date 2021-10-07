import { Client } from "discord.js";

interface Run {
    (client: Client, ...args: any[]);
}

export interface Task {
    rate?: number;
    in?: number;
    run: Run;
}