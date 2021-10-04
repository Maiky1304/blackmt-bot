import { Command, Category } from '../../Interfaces';
import { Embed, EmbedType, Severity } from '../../Client';
import { GuildMember, MessageEmbed, MessageActionRow, MessageButton, ButtonInteraction } from 'discord.js';

import { inlineCode } from '@discordjs/builders';

import uniqid from 'uniqid';

export class Variables {
    static mutedRole: string = '894016098121420810';
}

export const command: Command = {
    name: 'mute',
    category: Category.MODERATION,
    description: 'Mute een member in de guild',
    permission: 'MUTE_MEMBERS',
    run: (client, message, args) => {
        const mentionedMembers = message.mentions.members;
        
        if (mentionedMembers.size === 0) {
            message.reply({
                embeds: [
                    new Embed(EmbedType.WARNING)
                    .setTitle('Fout!').setDescription('Geef de gebruiker op die je wilt \
                    muten.')
                ]
            });
            return;
        }

        const reason = args.length === 1 ? undefined : args.splice(1).join('');
        const target = mentionedMembers.first();

        /**
         * Ban the member that was specified from the guild that the command was executed in
         */
        const guild = message.guild;
        target.roles.add(Variables.mutedRole).then(async ({user}: GuildMember) => {   
            // Log event to console
            client.logger.log(Severity.INFO, '%s muted the user %s in the guild %s for %s.', message.author.username + '#' + message.author.discriminator, user.username + '#' + user.discriminator, guild.name, reason || 'no reason specified');
            
            // Send embed to channel to confirm ban
            const embed: MessageEmbed = new Embed(EmbedType.SUCCESS);

            if (reason) embed.addField("✍️ Reden", reason, true);

            embed.setTitle('Gebruiker gemute!').setDescription(`Je hebt succesvol de gebruiker ${inlineCode(`${user.username}#${user.discriminator}`)} gemute.${reason ? `\n Met als reden ${inlineCode(reason)}.` : ''}`)
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
                if (!(button.member as GuildMember).permissions.has('MUTE_MEMBERS')) {
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
                    await target.roles.remove(Variables.mutedRole);                    
                    
                    // Log event to console
                    client.logger.log(Severity.INFO, '%s unmuted the user %s in the guild %s.', message.author.username + '#' + message.author.discriminator, user.username + '#' + user.discriminator, guild.name);
                    
                    const unbanEmbed: MessageEmbed = new Embed(EmbedType.SUCCESS)
                    .setTitle('Gebruiker geunmute!').setDescription(`Je hebt succesvol de gebruiker ${inlineCode(`${user.username}#${user.discriminator}`)} geunmute.`)
                    .setThumbnail(user.avatarURL({ dynamic: true })).setTimestamp().setFooter('✅ Uitgevoerd op');
                    button.channel.send({
                        embeds: [unbanEmbed]
                    }).then(msg => client.cleanUp(1000 * 10, msg));
                } catch(err) {
                    const alreadyUnbannedEmbed: MessageEmbed = new Embed(EmbedType.WARNING)
                    .setTitle('Gebruiker al geunmute!').setDescription(`De gebruiker ${inlineCode(`${user.username}#${user.discriminator}`)} zijn/haar mute is al opgeheven.`)
                    .setThumbnail(user.avatarURL({ dynamic: true }));
                    button.channel.send({
                        embeds: [alreadyUnbannedEmbed]
                    }).then(msg => client.cleanUp(1000 * 10, msg));
                }
            });
        });
    }
}