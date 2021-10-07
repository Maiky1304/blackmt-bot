import {Middleware} from "../../../interfaces/Command";
import {EcoModel} from "../../../models";

export const middleware: Middleware = async (channel, member) : Promise<boolean> => {
    if (!await EcoModel.findOne({ userId: member.id })) {
        await EcoModel.create({ userId: member.id, guildId: member.guild.id });
    }
    return true;
}