import { ButtonInteraction, GuildMember, GuildMemberRoleManager, Interaction, TextChannel, MessageActionRow, MessageButton } from "discord.js";
import { Event } from '../Interfaces';
import { Embed, EmbedType } from '../Client';

export const event: Event = {
    name: 'interactionCreate',
    run: async (_client, interaction: Interaction) => {
        if (!interaction.isButton()) return;

        const buttonInteraction = (interaction as ButtonInteraction);
        if (buttonInteraction.customId !== 'verify-button') return;

        await interaction.deferUpdate();

        const member = (interaction.member as GuildMember);
        const roles = (member.roles as GuildMemberRoleManager);
        if (roles.cache.has('657947912109555722')) return;
        await roles.add(['657947912109555722']);

        const embed = new Embed(EmbedType.BLACKMT).setTitle(`👋 Welkom ${member.user.username}#${member.user.discriminator}!`)
        .setDescription(`Welkom ${member.toString()} in de BlackMT Discord!\nGebruik de buttons hier beneden voor wat meer **informatie**.`)
        .setTimestamp().setThumbnail(member.user.displayAvatarURL({ dynamic: true }) || 'https://cdn.discordapp.com/embed/avatars/0.png');

        const buttons = new MessageActionRow();
        buttons.addComponents(
            new MessageButton().setLabel('Regels').setEmoji('📙')
            .setURL('https://discord.gg/7zmfs4gA7c').setStyle('LINK'),
            new MessageButton().setLabel('Store').setEmoji('🛒')
            .setURL('https://store.blackmt.nl').setStyle('LINK'));

        const welcomeChannel = (await interaction.guild.channels.fetch('689612484486758432') as TextChannel);
        await welcomeChannel.send({ embeds: [embed], components: [buttons] });
    }
}