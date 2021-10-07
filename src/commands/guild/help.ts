import { Category, Command } from '../../interfaces';
import uniqid from 'uniqid';
import ExtendedClient, { Embed, EmbedType, Severity } from '../../client';
import { GuildMember, Message, MessageActionRow, MessageButton, MessageEmbed, Collection, TextChannel, InteractionCollectorOptions, MessageComponentInteraction, InteractionCollector, ButtonInteraction, MessagePayload, MessageEditOptions, MessageSelectMenu, MessageSelectOptionData, SelectMenuInteraction } from 'discord.js';
import { inlineCode, hyperlink } from '@discordjs/builders';

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
    public categoryPage?: number;
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
        this.embed.setTitle('📚 Help menu');
        this.embed.setFields([
            {
                name: '👨‍💻 Developer',
                value: `${inlineCode('Maiky Perlee')} ${hyperlink('(Github)', 'https://github.com/Maiky1304')}`
            }
        ])
        this.embed.setFooter('⌚ Opgehaald op');
        this.embed.setTimestamp();

        const row = new MessageActionRow();
        const menu = new MessageSelectMenu();
        menu.setCustomId(uniqid());
        menu.setPlaceholder('Kies een categorie');
        
        for (const category in Category) {
            const name = Category[category];
            const commands = this.client.categories.get(name) || new Array<Command>();
            
            const data = {
                label: name.split(' ').splice(1).join(' '),
                value: uniqid(),
                emoji: name.split(' ')[0],
                description: `${commands.length} command${commands.length === 1 ? '' : 's'}`
            } as MessageSelectOptionData;

            menu.addOptions(data);

            this.buttonIds.set(data.value, (category as Category));
        }

        row.addComponents(menu);

        if (this.message) {
            await this.message.edit({ embeds: [this.embed], components: [row] });
        } else {
            this.message = await this.channel.send({ embeds: [this.embed], components: [row] });
        }
        this.listenForMainButtons();
    }

    public listenForMainButtons(): void {
        if (!this.message) return;

        const filter = interaction => interaction.member.user.id === this.viewer.id && this.state === ViewState.OVERVIEW && this.buttonIds.has((interaction as SelectMenuInteraction).values[0]);
        const collector = this.message.createMessageComponentCollector({
            filter,
            componentType: 'SELECT_MENU',
            interactionType: 'MESSAGE_COMPONENT'
        } as InteractionCollectorOptions<MessageComponentInteraction>);
        collector.on('collect', async interaction => {
            const menu = (interaction as SelectMenuInteraction);

            await interaction.deferUpdate();

            await this.showCategory(this.buttonIds.get(menu.values[0]));
            collector.stop();
        });
    }

    public async showCategory(category: Category, page?: number): Promise<void> {
        if (page > 0 && category === this.currentCategory) {
            this.categoryPage = page;
        } else {
            this.state = ViewState.CATEGORY;
            this.currentCategory = category;
            this.categoryPage = 0;
        }

        const commands = this.client.categories.get(Category[this.currentCategory]) || new Array<Command>();

        const pages = Math.floor(commands.length / 6);
        const start = this.categoryPage * 6, end = start + 6;

        this.embed = new Embed(EmbedType.BLACKMT);
        this.embed.setTitle('📚 Help menu • ' + Category[this.currentCategory] + ` (${this.categoryPage + 1}/${(commands.length === 6 ? 1 : pages + 1)})`);
        this.embed.setDescription(`Deze categorie heeft in totaal ${inlineCode(commands.length.toString())} command${commands.length === 1 ? '' : 's'}\n🟢 = Toestemming • 🔻 = Geen toestemming • 🔸 = Niet voor hier`)

        for (let i = start; i < end; i++) {
            try {
                const command: Command = commands[i];
                if (!command) continue;
                const hasPermission: boolean = command.permission ? this.viewer.permissions.has(command.permission) && !command.middleware : true;
                this.embed.addField(`${hasPermission ? '🟢' : command.middleware ? (await command.middleware(this.channel, this.viewer) ? '🟢' : '🔶') : '🔻'} ${this.client.config.prefix}${command.name}`,
                `${`• Aliases: ${(!command.aliases || command.aliases.length === 0) 
                    ? inlineCode('Geen') : command.aliases.map(key =>
                    `${inlineCode(this.client.config.prefix + key)}`).join(', ')}`}\n• Beschrijving: ${command.description ? inlineCode(command.description) : inlineCode('Geen beschrijving')}`, true); 
            } catch(err) {
                this.client.logger.log(Severity.ERROR, err.message);
                break;
            }
        }

        this.embed.setFooter('⌚ Opgehaald op');
        this.embed.setTimestamp();

        const buttons = new MessageActionRow();
        const back = new MessageButton();
        back.setCustomId(uniqid());
        back.setEmoji('⬅️');
        back.setLabel('Terug naar het hoofdmenu');
        back.setStyle('SECONDARY');
        buttons.addComponents(back);
        // Pagination buttons
        const pageBack = new MessageButton();
        pageBack.setCustomId(uniqid());
        pageBack.setEmoji('⏪');
        pageBack.setStyle('SECONDARY');
        pageBack.setDisabled(this.categoryPage == 0);
        const pageForward = new MessageButton();
        pageForward.setCustomId(uniqid());
        pageForward.setEmoji('⏩');
        pageForward.setStyle('SECONDARY');
        pageForward.setDisabled(this.categoryPage === pages || commands.length === 6);
        // add to row
        buttons.addComponents(pageBack, pageForward);

        await this.message.edit({
            embeds: [this.embed],
            components: [buttons]
        } as MessageEditOptions);
        const collector = this.message.createMessageComponentCollector({
            componentType: 'BUTTON',
            interactionType: 'MESSAGE_COMPONENT'
        });
        collector.on('collect', async interaction => {
            if (interaction.member.user.id !== this.viewer.id) return;

            await interaction.deferUpdate();

            if (interaction.customId === back.customId) {
                await this.show();
            } else if (interaction.customId === pageBack.customId) {
                await this.showCategory(category, this.categoryPage - 1);
            } else if (interaction.customId === pageForward.customId) {
                await this.showCategory(category, this.categoryPage + 1);
            }
            
            collector.stop();
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
        await menu.show();
    }
};