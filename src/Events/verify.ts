import { ButtonInteraction, GuildMember, GuildMemberRoleManager, Interaction, TextChannel } from "discord.js";
import { Event } from '../Interfaces';
import { Embed, EmbedType } from '../Client';

export const event: Event = {
    name: 'interactionCreate',
    run: async (_client, interaction: Interaction) => {
        if (!interaction.isButton()) return;

        const buttonInteraction = (interaction as ButtonInteraction);
        if (buttonInteraction.customId !== 'verify-button') return;

        const member = (interaction.member as GuildMember);
        const roles = (member.roles as GuildMemberRoleManager);
        roles.add('657947912109555722');

        const embed = new Embed(EmbedType.BLACKMT).setTitle(`👋 Welkom ${member.user.username}#${member.user.discriminator}!`)
        .setDescription(`Welkom @! Emiel in de BlackMT Discord!\nGebruik de buttons hier beneden voor wat meer **informatie**.`)
        .setTimestamp().setThumbnail(member.user.displayAvatarURL({ dynamic: true }) || 'https://cdn.discordapp.com/embed/avatars/0.png');
        const welcomeChannel = (await interaction.guild.channels.fetch('893926238073286706') as TextChannel);
        await welcomeChannel.send({ embeds: [embed] });
    }
}