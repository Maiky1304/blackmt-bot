import {Category, Command} from '../../interfaces';
import {middleware} from "./middlewares/eco.middleware";
import {Embed, EmbedType} from "../../client";
import {inlineCode} from "@discordjs/builders";
import {ReplyMessageOptions} from "discord.js";
import {EcoModel} from "../../models";
import {translateNumber} from "./functions/translate.number";

export const command: Command = {
    name: 'withdraw',
    description: 'Neem geld op van je bank',
    aliases: ['dep', 'neemop', 'opnemen'],
    category: Category.ECONOMY,
    middleware: middleware,
    run: async (client, message, args) => {
        if (args.length !== 1) {
            await message.reply({ embeds: [new Embed(EmbedType.ERROR).setTitle('Error!')
                    .setDescription(inlineCode(`Gebruik: b/withdraw <bedrag>`))], ephemeral: true } as ReplyMessageOptions);
            client.cleanUp(250, message);
            return;
        }

        const ecoUser = await EcoModel.findOne({userId: message.author.id});
        const arg0 = args[0];

        // check if it's a number
        if (!Number.isInteger(arg0)) return;

        const amount: number = Number.parseInt(arg0);
        if (ecoUser.bank < amount) {
            await message.reply({embeds:[new Embed(EmbedType.ERROR).setTitle('Je hebt niet genoeg geld hiervoor!')], ephemeral: true} as ReplyMessageOptions)
            client.cleanUp(250, message);
            return;
        }
        ecoUser.bank -= amount;
        ecoUser.money += amount;
        await ecoUser.save();

        await message.reply({embeds:[new Embed(EmbedType.SUCCESS).setTitle('Gelukt!').setDescription(`Je hebt succesvol ${inlineCode(translateNumber(amount))} opgenomen van je bank.`)
                .setFields([
                    {
                        name: '🏦 Nieuw banksaldo',
                        value: inlineCode(translateNumber(ecoUser.bank)),
                        inline: true
                    },
                    {
                        name: '💸 Nieuw geldsaldo',
                        value: inlineCode(translateNumber(ecoUser.money)),
                        inline: true
                    }
                ])]});
    }
}