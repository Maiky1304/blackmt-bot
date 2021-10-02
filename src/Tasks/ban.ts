import { Task } from '../Interfaces';
import { BanModel } from '../Models';

export const task: Task = {
    rate: 1000,
    run: async (client) => {
        let unbansProcessed = 0;
        const bans = await BanModel.find();
        
        for (const ban of bans) {
            if (ban.expiry > Date.now()) continue;

            await BanModel.deleteOne({ userId: ban.userId });

            const guild = await client.guilds.fetch(ban.guildId);
            const guildBan = await guild.bans.fetch(ban.userId);
            
            if (!guildBan) continue;

            await guild.bans.remove(guildBan.user);

            unbansProcessed++;
        }

        if (unbansProcessed != 0) {
            console.log(`Unbanned ${unbansProcessed} members because their ban expired.`);
        }
    }
}