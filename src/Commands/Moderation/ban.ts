import { Command, Category } from '../../Interfaces';
import ExtendedClient, { Embed, EmbedType, Severity } from '../../Client';
import { GuildMember, MessageEmbed, MessageActionRow, MessageButton, ButtonInteraction } from 'discord.js';

import { inlineCode } from '@discordjs/builders';

import uniqid from 'uniqid';

export const command: Command = {
    name: 'ban',
    category: Category.MODERATION,
    description: 'Ban een member uit de guild',
    aliases: ['verban'],
    permission: 'BAN_MEMBERS',
    run: (client: ExtendedClient, message, args) => {
        const mentionedMembers = message.mentions.members;
        
        if (mentionedMembers.size === 0) {
            message.reply({
                embeds: [
                    new Embed(EmbedType.WARNING)
                    .setTitle('Fout!').setDescription('Geef de gebruiker op die je wilt \
                    verbannen.')
                ]
            });
            return;
        }

        const reason = args.length === 1 ? undefined : args.splice(1).join(' ');
        const target = mentionedMembers.first();
    
        if (!target.bannable) {
            message.reply({
                embeds: [
                    new Embed(EmbedType.WARNING)
                    .setTitle('Fout!').setDescription('Deze gebruiker kun je niet verbannen.')
                ]
            });
            return;
        }

        /**
         * Ban the member that was specified from the guild that the command was executed in
         */
        const guild = message.guild;
        guild.members.ban(target, { reason: reason }).then(async ({user}: GuildMember) => {    
            // Log event to console
            client.logger.log(Severity.INFO, '%s banned the user %s from the guild %s for %s.', message.author.username + '#' + message.author.discriminator, user.username + '#' + user.discriminator, guild.name, reason || 'no reason specified');
            
            // Send embed to channel to confirm ban
            const embed: MessageEmbed = new Embed(EmbedType.SUCCESS);

            if (reason) embed.addField("✍️ Reden", reason, true);

            embed.setTitle('Gebruiker verbannen!').setDescription(`Je hebt succesvol de gebruiker ${inlineCode(`${user.username}#${user.discriminator}`)} verbannen.${reason ? `\n Met als reden ${inlineCode(reason)}.` : ''}`)
            .setThumbnail(user.avatarURL({ dynamic: true })).setTimestamp().setFooter('✅ Uitgevoerd op');

            const buttons = new MessageActionRow();
            const undoButton = new MessageButton().setCustomId(uniqid()).setEmoji('🔄').setLabel('Undo actie').setStyle('SUCCESS');
            buttons.addComponents(undoButton);

            const replyMessage = await message.reply({ embeds: [embed], components: [buttons] });
            const filter = interaction => interaction.channelId === replyMessage.channelId && interaction.customId === undoButton.customId;
            const collector = replyMessage.createMessageComponentCollector({
                filter,
                componentType: 'BUTTON',
                interactionType: 'MESSAGE_COMPONENT',
                max: 1
            });
            collector.on('collect', async (button: ButtonInteraction) => {
                if (!(button.member as GuildMember).permissions.has('BAN_MEMBERS')) {
                    await button.reply({ content: 'Je hebt hier helaas geen permissions voor!', ephemeral: true });
                    return;
                }

                await button.deferUpdate();

                const buttons = new MessageActionRow();
                undoButton.setDisabled(true);
                buttons.addComponents(undoButton);
                await replyMessage.edit({
                    embeds: [embed],
                    components: [buttons]
                });

                try {
                    await guild.bans.remove(user);

                    // Log event to console
                    client.logger.log(Severity.INFO, '%s unbanned the user %s from the guild %s.', message.author.username + '#' + message.author.discriminator, user.username + '#' + user.discriminator, guild.name);
                    
                    const unbanEmbed: MessageEmbed = new Embed(EmbedType.SUCCESS)
                    .setTitle('Gebruiker geunbanned!').setDescription(`Je hebt succesvol de gebruiker ${inlineCode(`${user.username}#${user.discriminator}`)} geunbanned.`)
                    .setThumbnail(user.avatarURL({ dynamic: true })).setTimestamp().setFooter('✅ Uitgevoerd op');
                    button.channel.send({
                        embeds: [unbanEmbed]
                    }).then(msg => client.cleanUp(1000 * 10, msg));
                } catch(err) {
                    const alreadyUnbannedEmbed: MessageEmbed = new Embed(EmbedType.WARNING)
                    .setTitle('Gebruiker al geunbanned!').setDescription(`De gebruiker ${inlineCode(`${user.username}#${user.discriminator}`)} zijn/haar ban is al opgeheven.`)
                    .setThumbnail(user.avatarURL({ dynamic: true }));
                    button.channel.send({
                        embeds: [alreadyUnbannedEmbed]
                    }).then(msg => client.cleanUp(1000 * 10, msg));
                }
            });
        });
    }
}