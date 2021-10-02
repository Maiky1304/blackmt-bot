import { MessageEmbed } from "discord.js";

export enum EmbedType {
    ERROR = '#cc0000',
    SUCCESS = '#1fcc00',
    WARNING = '#c2cc00',
    INFO = '#00ccbe',
    BLACKMT = '#cc8500'
}

export class Embed extends MessageEmbed {
    public embedType: EmbedType;

    public constructor(embedType) {
        super();
        this.embedType = embedType;
        this.setColor(this.embedType);
    }
}