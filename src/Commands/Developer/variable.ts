import { inlineCode } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { Embed, EmbedType } from '../../Client';
import { Category, Command } from '../../Interfaces';
import { VariableModel, Variable } from '../../Models';

export const command: Command = {
    name: 'variable',
    description: 'Beheer variabelen in de database',
    permission: 'ADMINISTRATOR',
    category: Category.DEVELOPER,
    aliases: ['var', 'vars'],
    run: async (client, message, args) => {
        if (args.length === 0) {
            message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle('Geef een argument op!')] }).then(msg => client.cleanUp(5000, msg, message));
            return;
        }

        if (args.length === 0 || args.length === 1) {
            if (args[0] === 'put') {
                message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle(`Gebruik: ${client.config.prefix}var ${args[0]} <var> <value>`)] }).then(msg => client.cleanUp(5000, msg, message));
            } else if (args[0] === 'get') {
                message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle(`Gebruik: ${client.config.prefix}var ${args[0]} <var>`)] }).then(msg => client.cleanUp(5000, msg, message));
            } else if (args[0] === 'remove') {
                message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle(`Gebruik: ${client.config.prefix}var ${args[0]} <var>`)] }).then(msg => client.cleanUp(5000, msg, message));
            } else if (args[0] === 'list') {
                const vars = await VariableModel.find();
                const embed: MessageEmbed = new Embed(EmbedType.INFO);
                embed.setTitle(`Variables in database (${vars.length})`);
                embed.setDescription(vars.map(v => `• ${inlineCode(v.key)} -> ${inlineCode(v.value)}`).join('\n'));
                message.reply({ embeds: [embed] });
            } else {
                message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle('Dit is geen geldig subcommand!')] }).then(msg => client.cleanUp(5000, msg, message));
            }
            return;
        } else if (args.length === 2) {
            if (args[0] === 'put') {
                message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle(`Gebruik: ${client.config.prefix}var ${args[0]} <var> <value>`)] }).then(msg => client.cleanUp(5000, msg, message));
            } else if (args[0] === 'get') {
                const varName: string = args[1].toLowerCase();
                const variable = await VariableModel.findOne({ key: varName });

                if (!variable) {
                    message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle('Er bestaat geen variable met de naam: ' + varName)] }).then(msg => client.cleanUp(5000, msg, message));
                    return;
                }

                const value: any = variable.value;
                message.reply({
                    embeds: [
                        new Embed(EmbedType.INFO)
                        .setTitle('Variable: ' + varName)
                        .addField('Waarde:', inlineCode(value))
                    ]
                });
            } else if (args[0] === 'remove') {
                const varName: string = args[1].toLowerCase();
                const variable = await VariableModel.findOne({ key: varName });

                if (!variable) {
                    message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle('Er bestaat geen variable met de naam: ' + varName)] }).then(msg => client.cleanUp(5000, msg, message));
                    return;
                }
                
                await VariableModel.deleteOne({ key: varName });

                message.reply({
                    embeds: [
                        new Embed(EmbedType.INFO).setTitle('Variable verwijderd!')
                    ]
                }).then(msg => client.cleanUp(10000, msg, message));
            } else {
                message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle('Dit is geen geldig subcommand!')] }).then(msg => client.cleanUp(5000, msg, message));
            }
            return;
        } else {
            if (args[0] === 'put') {
                const varName: string = args[1].toLowerCase();
                const variable = await VariableModel.findOne({ key: varName });
                const input = args.splice(2).join(' ');

                if (variable) {
                    await VariableModel.updateOne({ key: varName }, { '$set': { value: input } })
                    message.reply({
                        embeds: [
                            new Embed(EmbedType.INFO)
                            .setTitle('Updated variable: ' + varName)
                            .addField('Waarde:', inlineCode(input))
                        ]
                    });
                    return;
                }

                const dbVariable: Variable = await VariableModel.create({
                    key: varName,
                    value: input
                });
                message.reply({
                    embeds: [
                        new Embed(EmbedType.INFO)
                        .setTitle('Ingestelde variable: ' + varName)
                        .addField('Waarde:', inlineCode(input))
                    ]
                });
            } else if (args[0] === 'get') {
                message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle(`Gebruik: ${client.config.prefix}var ${args[0]} <var>`)] }).then(msg => client.cleanUp(5000, msg, message));
            } else if (args[0] === 'remove') {
                message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle(`Gebruik: ${client.config.prefix}var ${args[0]} <var>`)] }).then(msg => client.cleanUp(5000, msg, message));
            } else {
                message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle('Dit is geen geldig subcommand!')] }).then(msg => client.cleanUp(5000, msg, message));
            }
            return;
        }
    }
}