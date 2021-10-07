import {Category, Command} from '../../interfaces';
import {ProfileModel} from "../../models";
import {Embed, EmbedType} from "../../client";
import {inlineCode} from "@discordjs/builders";
import {ReplyMessageOptions} from "discord.js";

export const command: Command = {
    name: 'xp',
    category: Category.FUN,
    description: 'Bekijk je xp',
    run: async (client, message, args) => {
        const {level, xp} = await ProfileModel.findOne({ userId: message.author.id });
        const nextLevel = level * 8;

        const progress = Math.floor((xp / nextLevel) * 100);

        const embed = new Embed(EmbedType.BLACKMT);
        embed.setTitle('ℹ️ Jouw XP');
        embed.setDescription(`Je hebt nu ${inlineCode(xp.toString() + ' xp')} je hebt nog ${inlineCode((nextLevel-xp).toString() + ' xp')} nodig om naar ${inlineCode('Level ' + (level + 1))} te gaan.`);
        embed.setFooter('⌚ Opgehaald op', client.user.avatarURL({dynamic:true}));
        embed.setTimestamp();

        await message.reply({ embeds:[embed], ephemeral:true} as ReplyMessageOptions);
    }
}