import {
    ButtonInteraction,
    GuildMember,
    GuildMemberRoleManager,
    Interaction,
    MessageActionRow,
    MessageButton,
    TextChannel
} from "discord.js";
import {Event} from '../interfaces';
import {Embed, EmbedType} from '../client';

export const event: Event = {
    name: 'interactionCreate',
    run: async (client, interaction: Interaction) => {
        if (!interaction.isButton()) return;

        const buttonInteraction = (interaction as ButtonInteraction);
        if (buttonInteraction.customId !== 'verify-button') return;

        await interaction.deferUpdate();

        const member = (interaction.member as GuildMember);
        const roles = (member.roles as GuildMemberRoleManager);
        const roleId = client.config.developerMode ? client.config.developer.verifySettings.role : client.config.default.verifySettings.role;
        if (roles.cache.has(roleId)) return;
        await roles.add([roleId]);

        const embed = new Embed(EmbedType.BLACKMT).setTitle(`👋 Welkom ${member.user.username}#${member.user.discriminator}!`)
        .setDescription(`Welkom ${member.toString()} in de BlackMT Discord!\nGebruik de buttons hier beneden voor wat meer **informatie**.`)
        .setTimestamp().setThumbnail(member.user.displayAvatarURL({ dynamic: true }) || 'https://cdn.discordapp.com/embed/avatars/0.png');

        const buttons = new MessageActionRow();
        buttons.addComponents(
            new MessageButton().setLabel('Regels').setEmoji('📙')
            .setURL('https://discord.gg/7zmfs4gA7c').setStyle('LINK'),
            new MessageButton().setLabel('Store').setEmoji('🛒')
            .setURL('https://store.blackmt.nl').setStyle('LINK'));

        const welcomeChannel = (await interaction.guild.channels.fetch(client.config.developerMode ? client.config.developer.verifySettings.welcomeChannel : client.config.default.verifySettings.welcomeChannel) as TextChannel);
        await welcomeChannel.send({ embeds: [embed], components: [buttons] });
    }
}