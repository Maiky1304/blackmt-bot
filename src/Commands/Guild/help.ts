import { Category, Command } from '../../Interfaces';
import uniqid from 'uniqid';
import ExtendedClient, { Embed, EmbedType } from '../../Client';
import { GuildMember, Message, MessageActionRow, MessageButton, MessageEmbed, Collection, TextChannel, InteractionCollectorOptions, MessageComponentInteraction, InteractionCollector, ButtonInteraction, MessagePayload, MessageEditOptions } from 'discord.js';
import { inlineCode } from '@discordjs/builders';

enum ViewState {
    OVERVIEW, CATEGORY
}

class HelpMenu {
    public viewer: GuildMember;
    public state?: ViewState;
    public client: ExtendedClient;
    /**
     * This only applies to when @see ViewState is equal to @see CATEGORY
     */
    public currentCategory?: Category;
    public embed?: MessageEmbed;
    public message?: Message;
    public buttonIds: Collection<string, Category> = new Collection();
    public channel: TextChannel;
    public collector?: InteractionCollector<MessageComponentInteraction>;

    public constructor(client: ExtendedClient, viewer: GuildMember, channel: TextChannel) {
        this.client = client;
        this.viewer = viewer;
        this.channel = channel;
    }

    public async show(): Promise<void> {
        this.state = ViewState.OVERVIEW;
        
        this.embed = new Embed(EmbedType.BLACKMT);
        this.embed.setTitle('📚 Help Menu');
        this.embed.setDescription(inlineCode('Maak een keuze door op een van de keuze buttons \nte klikken hieronder.'))
        this.embed.setFooter('⌚ Opgehaald op');
        this.embed.setTimestamp();

        const buttons = new MessageActionRow();
        
        for (const category in Category) {
            const name = Category[category];
            
            const button = new MessageButton();
            button.setCustomId(uniqid());
            button.setLabel(name.split(' ').splice(1).join(' '));
            button.setEmoji(name.split(' ')[0]);
            button.setStyle('SECONDARY');

            buttons.addComponents(button);

            this.buttonIds.set(button.customId, (category as Category));
        }

        if (this.message) {
            await this.message.edit({ embeds: [this.embed], components: [buttons] });
        } else {
            this.message = await this.channel.send({ embeds: [this.embed], components: [buttons] });
        }
        this.listenForMainButtons();
    }

    public listenForMainButtons(): void {
        if (!this.message) return;

        this.collector = this.message.createMessageComponentCollector({
            componentType: 'BUTTON',
            interactionType: 'MESSAGE_COMPONENT'
        } as InteractionCollectorOptions<MessageComponentInteraction>);
        this.collector.on('collect', async interaction => {
            if (this.state !== ViewState.OVERVIEW)
            if (!this.buttonIds.has(interaction.customId)) return;

            await interaction.deferUpdate();

            this.showCategory(this.buttonIds.get(interaction.customId));
            this.collector.stop();
        });
    }

    public async showCategory(category: Category): Promise<void> {
        this.state = ViewState.CATEGORY;
        this.currentCategory = category;

        const commands = this.client.categories.get(Category[this.currentCategory]) || new Array<Command>();

        this.embed = new Embed(EmbedType.BLACKMT);
        this.embed.setTitle('📚 Help Menu • ' + Category[this.currentCategory]);
        this.embed.setDescription(`Deze categorie heeft in totaal ${inlineCode(commands.length.toString())} command${commands.length === 1 ? '' : 's'}`)
        for (const command of commands) {
            const hasPermission: boolean = command.permission ? this.viewer.permissions.has(command.permission) : true;
            this.embed.addField(`${hasPermission ? '<:small_green_triangle_up:894020646495993887>' : '🔻'} ${this.client.config.prefix}${command.name}`,
            `${`• Aliases: ${(!command.aliases || command.aliases.length === 0) 
                ? inlineCode('Geen') : command.aliases.map(key =>
                `${inlineCode(this.client.config.prefix + key)}`).join(', ')}`}\n• Beschrijving: ${command.description ? inlineCode(command.description) : inlineCode('Geen beschrijving')}`, true);
        } 
        this.embed.setFooter('⌚ Opgehaald op');
        this.embed.setTimestamp();

        const buttons = new MessageActionRow();
        const back = new MessageButton();
        back.setCustomId(uniqid());
        back.setEmoji('⬅️');
        back.setLabel('Terug naar vorige menu');
        back.setStyle('SECONDARY');
        buttons.addComponents(back);

        await this.message.edit({
            embeds: [this.embed],
            components: [buttons]
        } as MessageEditOptions);
        this.collector = this.message.createMessageComponentCollector({
            componentType: 'BUTTON',
            interactionType: 'MESSAGE_COMPONENT'
        } as InteractionCollectorOptions<MessageComponentInteraction>);
        this.collector.on('collect', async interaction => {
            if (this.state !== ViewState.OVERVIEW)
            if (interaction.customId !== back.customId) return;

            await interaction.deferUpdate();

            this.show();
            this.collector.stop();
        });
    }

}

export const command: Command = {
    name: 'help',
    category: Category.GENERAL,
    description: 'Bekijk een help menu met alle commands van de bot.',
    aliases: ['hulp', 'commands', 'cmds'],
    run: async (client, message, args) => {
        const menu: HelpMenu = new HelpMenu(client, message.member, (message.channel as TextChannel));
        menu.show();
    }
};