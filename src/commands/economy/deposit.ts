import {Category, Command} from '../../interfaces';
import {middleware} from "./middlewares/eco.middleware";
import {inlineCode} from "@discordjs/builders";
import {Embed, EmbedType} from "../../client";
import {EcoModel} from "../../models";
import {ReplyMessageOptions} from "discord.js";
import {translateNumber} from './functions/translate.number';

export const command: Command = {
    name: 'deposit',
    description: 'Stort geld op je bank',
    aliases: ['dep', 'stort'],
    category: Category.ECONOMY,
    middleware: middleware,
    run: async (client, message, args) => {
        console.log(args.length);
        if (args.length !== 1) {
            await message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle('Error!')
                    .setDescription(inlineCode(`Gebruik: b/deposit <bedrag>`))], ephemeral: true } as ReplyMessageOptions);
            return;
        }

        const ecoUser = await EcoModel.findOne({userId: message.author.id});
        const arg0 = args[0];

        // check if it's a number
        if (!Number.parseInt(arg0)) {
            console.log(`${arg0} is not a number`);
            return;
        }

        const amount: number = Number.parseInt(arg0);
        if (ecoUser.money < amount) {
            await message.reply({embeds:[new Embed(EmbedType.ERROR).setTitle('Je hebt niet genoeg geld hiervoor!')], ephemeral: true} as ReplyMessageOptions)
            return;
        }
        ecoUser.money -= amount;
        ecoUser.bank += amount;
        await ecoUser.save();

        await message.reply({embeds:[new Embed(EmbedType.SUCCESS).setTitle('Gelukt!').setDescription(`Je hebt succesvol ${inlineCode(translateNumber(amount))} gestort op je bank.`)
                .setFields([
                    {
                        name: '💸 Nieuw geldsaldo',
                        value: inlineCode(translateNumber(ecoUser.money)),
                        inline: true
                    },
                    {
                        name: '🏦 Nieuw banksaldo',
                        value: inlineCode(translateNumber(ecoUser.bank)),
                        inline: true
                    }
                ])]});
    }
}