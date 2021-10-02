import chalk from 'chalk';
import { Severity } from '../Client/Logger';
import { Event } from '../Interfaces';

export const event: Event = {
    name: 'ready',
    run: (client) => {
        client.logger.log(Severity.SUCCESS, "Logged in to %s.", chalk.gray(`${client.user.username}#${client.user.discriminator}`))
    }
}