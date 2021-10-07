import {Event} from '../interfaces';
import {ProfileModel} from '../models';
import {Message, ReplyMessageOptions} from "discord.js";
import {Embed, EmbedType} from "../client";

export const event: Event = {
    name: 'messageCreate',
    run: async (client, message: Message) => {
        if (message.author.bot) return;

        let profile = await ProfileModel.findOne({ userId: message.author.id });

        if (!profile) {
            profile = await ProfileModel.create({
                userId: message.author.id,
                guildId: message.guild.id
            });
        }

        if (client.xpCooldowns.has(profile.userId) && Date.now() < client.xpCooldowns.get(profile.userId).getDate()) {
            return;
        }

        client.xpCooldowns.set(profile.userId, new Date(Date.now() + 3000));

        profile.xp += 1;
        await profile.save();

        const levelUp = await ProfileModel.levelUp(profile.userId);
        if (levelUp) {
            const freshProfile = await ProfileModel.findOne({ userId: message.author.id });
            await message.reply({ embeds: [
                new Embed(EmbedType.BLACKMT)
                    .setTitle('🆙 Level up!')
                    .setDescription('Je bent nu level **' + freshProfile.level + '**, gefeliciteerd!')
                ], ephemeral: true } as ReplyMessageOptions);
        }
    }
}