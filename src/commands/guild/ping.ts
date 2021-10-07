import {MessageEmbed} from 'discord.js';
import {Category, Command} from '../../interfaces';
import {bold} from '@discordjs/builders';

export const command: Command = {
    name: 'ping',
    category: Category.DEVELOPER,
    description: 'Bekijk de ping van de bot',
    run: async(client, message, args) => {
        const embed: MessageEmbed = new MessageEmbed();
        embed.setTitle('🏓 Pong!');
        embed.setDescription(`De ping met de bot is ${bold(`${Date.now() - message.createdTimestamp}ms`)}`);
        embed.setColor('#00a900');
        embed.setFooter('Dit bericht wordt over 15 seconden automatisch verwijderd...');
        embed.setTimestamp();

        message.channel.send({ embeds: [embed] }).then(sent => client.cleanUp(15000, sent, message));
    }
}