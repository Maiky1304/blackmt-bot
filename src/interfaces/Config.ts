export interface ServerSettings {
    guildId: string;
    verifySettings: VerifySettings;
    suggestionSettings: SuggestionSettings;
    ticketSettings: TicketSettings;
    roleSettings: RoleSettings;
}

export interface RoleSettingsData {
    name: string;
    id: string;
    emoji: string;
}

export interface RoleSettings {
    roles: RoleSettingsData[];
}

export interface TicketSettings {
    ticketCategoryId: string;
    ticketStaffRoleId: string;
}

export interface VerifySettings {
    role: string;
    welcomeChannel: string;
}

export interface SuggestionSettings {
    emojis: string[];
    channel: string;
}

export interface Config {
    token: string;
    mongoURI: string;
    prefix: string;
    developerMode: boolean;
    default: ServerSettings;
    developer: ServerSettings;
}