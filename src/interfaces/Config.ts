interface ServerSettings {
    guildId: string;
    verifySettings: VerifySettings;
    suggestionSettings: SuggestionSettings;
    ticketSettings: TicketSettings;
}

interface TicketSettings {
    ticketCategoryId: string;
    ticketStaffRoleId: string;
}

interface VerifySettings {
    role: string;
    welcomeChannel: string;
}

interface SuggestionSettings {
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