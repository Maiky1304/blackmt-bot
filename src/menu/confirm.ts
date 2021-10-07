import {Menu} from "./Menu";
import {
    ButtonInteraction,
    Collection,
    Message,
    MessageActionRow,
    MessageButton,
    MessageOptions,
    TextChannel
} from "discord.js";
import uniqid from 'uniqid';
import ExtendedClient from "../client";

interface Run {
    (button: ButtonInteraction);
}

export class ConfirmMenu extends Menu {
    public buttonIds: Collection<string, Run> = new Collection();
    public onConfirm: Run;

    constructor(title: string, message: string, channel: TextChannel, receivers: string, onConfirm: Run) {
        super('Weet je het zeker?', message, channel, receivers);
        this.onConfirm = onConfirm;
    }

    public modify(options: MessageOptions): MessageOptions {
        const newOptions = super.modify(options);

        const row = new MessageActionRow();
        const yes = new MessageButton().setCustomId(uniqid())
            .setEmoji('✅').setStyle('SECONDARY').setLabel('Ja');
        const no = new MessageButton().setCustomId(uniqid())
            .setEmoji('❌').setStyle('SECONDARY').setLabel('Nee');
        row.addComponents(yes, no);

        this.buttonIds.set(yes.customId, this.onConfirm);
        this.buttonIds.set(no.customId, async button => await (button.message as Message).delete());

        newOptions.components = [row]
        return newOptions;
    }

    send(): Promise<Message> {
        this.listenForButtons();
        return super.send();
    }

    public listenForButtons() {
        const collector = this.channel.createMessageComponentCollector({
            componentType: 'BUTTON'
        });
        collector.on('collect', async interaction => {
            if (!this.receivers.includes(interaction.user.id) || !this.buttonIds.has(interaction.customId)) return;
            (interaction.client as ExtendedClient).cleanUp(1, interaction.message as Message);
            await interaction.deferUpdate();
            this.buttonIds.get(interaction.customId)(interaction as ButtonInteraction);
            collector.stop();
        });
    }

}