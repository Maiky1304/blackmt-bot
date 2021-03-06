import {Category, Command} from '../../interfaces';
import {ProfileModel} from "../../models";
import {Embed, EmbedType} from "../../client";
import {bold, inlineCode} from "@discordjs/builders";
import {ReplyMessageOptions} from "discord.js";

export const command: Command = {
    name: 'profile',
    category: Category.FUN,
    description: 'Bekijk je profiel',
    aliases: ['profiel', 'level', 'userstats'],
    run: async (client, message, args) => {
        const {level, xp, points} = await ProfileModel.findOne({ userId: message.author.id });
        const nextLevel = level * 8;

        const progress = Math.floor((xp / nextLevel) * 100);

        const embed = new Embed(EmbedType.BLACKMT);
        embed.setTitle('âšī¸ Jouw profiel');
        embed.setDescription('| Wist je dat elke keer dat je level up gaat een punt krijgt die je kunt besteden aan items voor in-game?');
        embed.setFields([
            {
                name: 'đī¸ Level',
                value: `Lvl ${level} ${bold('â')} Lvl ${level+1} (${bold(progress.toString() + '%')})`,
                inline: true
            },
            {
                name: 'đĨ XP',
                value: inlineCode(`${xp} XP`),
                inline: true
            },
            {
                name: 'đĒ Punten',
                value: inlineCode(`${points}`),
                inline: true
            }
        ]);
        embed.setFooter('â Opgehaald op', client.user.avatarURL({dynamic:true}));
        embed.setTimestamp();

        await message.reply({ embeds:[embed], ephemeral:true} as ReplyMessageOptions);
    }
}