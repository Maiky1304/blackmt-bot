import {Event} from '../interfaces';
import {Message, TextChannel} from 'discord.js';
import {Embed, EmbedType, Severity} from '../client';

export const event: Event = {
    name: 'messageCreate',
    run: async (client, message: Message) => {
        const guildId = client.config.developerMode ? client.config.developer.guildId : client.config.default.guildId;
        if (message.guildId !== guildId) return;
        if (message.author.bot || !message.guild || (!message.content.startsWith(client.config.prefix.toUpperCase()) || !message.content.startsWith(client.config.prefix.toLowerCase())) || !message.channel.isText) return;

        const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
        const cmd = args.shift().toLowerCase();

        if (!cmd) return;
        
        const command = client.commands.get(cmd) || client.aliases.get(cmd);
        if (command) {
            if (command.permission && !message.member.permissions.has(command.permission)) {
                message.reply({ embeds: [
                    new Embed(EmbedType.ERROR)
                    .setTitle('Geen permissions!').setTimestamp()
                ] }).then(msg => client.cleanUp(5000, msg, message));
                return;
            }
            if (command.middleware) {
                const result = await command.middleware(message.channel as TextChannel, message.member);
                if (!result) {
                    message.reply({
                        embeds: [
                            new Embed(EmbedType.ERROR)
                                .setTitle('Dit kun je hier niet uitvoeren!').setTimestamp()
                        ]
                    }).then(msg => client.cleanUp(5000, msg, message));
                    return;
                }
            }
            try {
                command.run(client, message, args);
            } catch(err) {
                client.logger.log(Severity.ERROR, err.message);
            }
        }
    }
}