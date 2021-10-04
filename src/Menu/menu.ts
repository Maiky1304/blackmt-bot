import {Message, MessageEmbed, MessageOptions, TextChannel} from "discord.js";
import {Embed, EmbedType} from "../Client";

export class Menu {
    public title: string;
    public message?: any;
    public channel: TextChannel;
    public receivers: string[];

    public embed?: MessageEmbed;

    public constructor(title: string, message: string, channel: TextChannel, ...receivers: string[]) {
        this.title = title;
        this.message = message;
        this.channel = channel;
        this.receivers = receivers;

        this.init();
    }

    public init(): MessageEmbed {
        this.embed = new Embed(EmbedType.INFO);
        this.embed.setTitle(this.title);
        if (this.message) {
            this.embed.setDescription(this.message);
        }
        return this.embed;
    }

    public modify(options: MessageOptions): MessageOptions {
        return options;
    }

    public send(): Promise<Message> {
        let options = { embeds: [this.embed] } as MessageOptions;
        options = this.modify(options);
        return this.channel.send(options);
    }

}