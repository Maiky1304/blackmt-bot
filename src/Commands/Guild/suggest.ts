import {Category, Command} from '../../Interfaces';
import {Embed, EmbedType} from "../../Client";
import {TextChannel} from "discord.js";

export const command: Command = {
    name: 'suggest',
    category: Category.GENERAL,
    description: 'Laat hiermee een suggestie achter',
    aliases: ['suggestie','idee'],
    run: async (client, message, args) => {
        if (args.length === 0) {
            await message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle('Geef je suggestie op!')] } );
            return;
        }

        const suggestion = args.join(' ');
        const embed = new Embed(EmbedType.BLACKMT)
            .setTitle(`Suggestie - ${message.author.username}#${message.author.discriminator}`)
            .setFields([
                {
                    name: '📄 Suggestie',
                    value: suggestion,
                    inline: true
                }
            ]).setFooter('📅 Geplaatst op', client.user.avatarURL({dynamic:true}))
            .setTimestamp();

        const channel = await message.guild.channels.fetch('894956597971931187');
        (channel as TextChannel).send({embeds:[embed]}).then(async msg => {
            for (const emoji of ['797830310045155379', '797832538151845928']) {
                await msg.react(emoji);
            }
        });
        await message.reply({ content: `Je suggestie is geplaatst in ${channel}.` });
    }
}
