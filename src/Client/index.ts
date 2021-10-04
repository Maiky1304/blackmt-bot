import { Client, Collection, Intents, Message, MessageEmbed } from 'discord.js';
import { connect } from 'mongoose';
import path from 'path';
import { readdirSync } from 'fs';
import { Command, Event, Config, Task, Category } from '../Interfaces';
import ConfigJson from '../config.json';
import { Logger, Severity } from './Logger';
import chalk from 'chalk';


class ExtendedClient extends Client {
    public commands: Collection<string, Command> = new Collection();
    public aliases: Collection<string, Command> = new Collection();
    public categories: Collection<Category, Array<Command>> = new Collection();
    public events: Collection<string, Event> = new Collection();

    public config: Config = ConfigJson;

    public logger: Logger = new Logger();

    public constructor() {
        super({
            intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS]
        });
        this.logger.log(Severity.INFO, 'Starting bot instance...')
    }

    public async init() {
        this.login(this.config.token);
        connect(this.config.mongoURI);

        const commandPath = path.join(__dirname, '..', 'Commands');
        readdirSync(commandPath).forEach(dir => {
            const commands = readdirSync(`${commandPath}/${dir}`).filter(file => file.endsWith('.ts'));

            for (const file of commands) {
                const { command } = require(`${commandPath}/${dir}/${file}`);
                this.commands.set(command.name, command);
                
                if (!this.categories.has(command.category)) {
                    this.categories.set(command.category, []);
                }

                const arr: Array<Command> = this.categories.get(command.category);
                arr.push(command);
                this.categories.set(command.category, arr);

                this.logger.log(Severity.INFO, 'Loaded command %s (%s)', chalk.gray(command.name), `${dir}/${file}`);

                if (command.aliases?.length !== 0) {
                    command.aliases?.forEach(alias => {
                        this.aliases.set(alias, command);
                    })
                }
            }
        });

        const eventPath = path.join(__dirname, '..', 'Events');
        for (const file of readdirSync(eventPath)) {
            const { event } = await import(`${eventPath}/${file}`);
            this.events.set(event.name, event);

            this.logger.log(Severity.INFO, 'Listening for %s (%s)', chalk.gray(event.name), file);

            this.on(event.name, event.run.bind(null, this));
        }

        setTimeout(() => {
            const taskPath = path.join(__dirname, '..', 'Tasks');
            readdirSync(taskPath).forEach((file) => {
                const { task } = require(`${taskPath}/${file}`);
                if (!this.schedule(task)) {
                    console.error(`Invalid task setup -> ${taskPath}/${file}`);
                } else {
                    this.logger.log(Severity.INFO, 'Scheduled task at %s', chalk.gray(file));
                }
            });
        }, 1000 * 5);
    }

    public schedule(task: Task): boolean {
        if (task.in && !task.rate) {
            setTimeout(() => task.run(this), task.in);
            return true;
        } else if (!task.in && task.rate) {
            setInterval(() => task.run(this), task.rate);
            return true;
        }
        return false;
    }

    public cleanUp(delay, ...messages: Message[]) {
        const task: Task = {
            in: delay,
            run: async (_client) => {
                for (const message of messages) {
                    message.delete().then(() => {}).catch(() => {});
                }
            }
        };
        this.schedule(task);
    }

}

export { Logger, Severity } from './Logger';
export { Embed, EmbedType } from './Embed';
export default ExtendedClient