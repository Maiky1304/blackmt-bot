import {Event} from '../interfaces';
import {GuildMember, SelectMenuInteraction} from "discord.js";
import {ServerSettings} from "../interfaces/Config";

export const event: Event = {
    name: 'interactionCreate',
    run: async (client, menu: SelectMenuInteraction) => {
        if (menu.customId !== 'role-menu-rr') return;
        if (!menu.isSelectMenu()) return;

        await menu.deferUpdate();

        const serverSettings: ServerSettings = client.config.developerMode ? client.config.developer : client.config.default;

        const roles = serverSettings.roleSettings.roles.map(rsd => rsd.id);
        const input = menu.values.map(val => val.slice('rr-'.length));

        for (const role of roles) {
            if (!input.includes(role)) {
                // check if member has role; if so remove role
                if ((menu.member as GuildMember).roles.cache.has(role)) {
                    await (menu.member as GuildMember).roles.remove(role);
                }
                continue;
            }

            // check if member has role; if not add role
            if ((menu.member as GuildMember).roles.cache.has(role)) continue;
            await (menu.member as GuildMember).roles.add(role);
        }
    }
}