import { Command, Category } from '../../interfaces';
import { Embed, EmbedType, Severity } from '../../client';
import { BanModel } from '../../models';
import { ButtonInteraction, GuildMember, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';

import { inlineCode } from '@discordjs/builders';

import ms from 'ms';
import uniqid from 'uniqid';

export const command: Command = {
    name: 'tempban',
    category: Category.MODERATION,
    description: 'Ban een member tijdelijk uit de guild',
    aliases: ['tijdelijkverban'],
    permission: 'BAN_MEMBERS',
    run: async (client, message, args) => {
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

        if (args.length === 1) {
            message.reply({
                embeds: [
                    new Embed(EmbedType.WARNING)
                    .setTitle('Fout!').setDescription(`Geef de duur van de ban op!\nVoorbeeld: ${inlineCode('24h, 1d, 1mo, 1y')}`)
                ]
            });
            return;
        }

        let time: number;
        try { 
            time = ms(args[1]);
        } catch(err) {
            time = undefined;
        }

        if (!time) {
            message.reply({
                embeds: [
                    new Embed(EmbedType.WARNING)
                    .setTitle('Fout!').setDescription(`Dit is een ongeldig tijdformat!\nGebruik bijvoorbeeld: ${inlineCode('24h, 1d, 1mo, 1y')}`)
                ]
            });
            return;
        }
        
        const reason = args.length === 2 ? undefined : args.splice(2).join(' ');
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
            client.logger.log(Severity.INFO, '%s temporarily banned the user %s from the guild %s for %s for the duration of %s.', message.author.username + '#' + message.author.discriminator, user.username + '#' + user.discriminator, guild.name, reason || 'no reason specified', ms(time, { long: true }));
            
            // Save ban to database
            await BanModel.create({
                userId: user.id,
                guildId: guild.id,
                reason: reason,
                punisher: message.author.id,
                expiry: Date.now() + time
            });
            
            // Send embed to channel to confirm ban
            const embed: MessageEmbed = new Embed(EmbedType.SUCCESS)
            .setTitle('Gebruiker verbannen!').setDescription(`Je hebt succesvol de gebruiker ${inlineCode(`${user.username}#${user.discriminator}`)} verbannen.`)
            .setThumbnail(user.avatarURL({ dynamic: true })).setTimestamp().setFooter('✅ Uitgevoerd op');

            if (reason) embed.addField("✍️ Reden", reason, true);
            embed.addField('🕐 Verbannen voor', ms(time, { long: true }), true)

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
                    await BanModel.deleteOne({ userId: user.id });
                    
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