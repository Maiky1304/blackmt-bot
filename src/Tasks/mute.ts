import { Task } from '../Interfaces';
import { MuteModel } from '../Models';

import { Variables as MuteVariables } from '../Commands/Moderation/mute';
import ExtendedClient, { Severity } from '../Client';

export const task: Task = {
    rate: 1000,
    run: async (client: ExtendedClient) => {
        let unmutesProcessed = 0;
        const mutes = await MuteModel.find();
        
        for (const mute of mutes) {
            if (mute.expiry > Date.now()) continue;

            await MuteModel.deleteOne({ userId: mute.userId });

            const guild = await client.guilds.fetch(mute.guildId);
            const member = await guild.members.fetch(mute.userId);
            
            if (!member) continue;

            await member.roles.remove(MuteVariables.mutedRole);

            unmutesProcessed++;
        }

        if (unmutesProcessed != 0) {
            client.logger.log(Severity.SUCCESS, 'Unmuted %s members because their mute expired.', unmutesProcessed.toString());
        }
    }
}