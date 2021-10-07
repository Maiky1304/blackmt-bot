import {Category, Command} from '../../interfaces';
import {middleware} from "./middlewares/eco.middleware";
import {EcoModel} from "../../models";
import {Embed, EmbedType} from "../../client";
import {inlineCode} from "@discordjs/builders";
import {translateNumber} from "./functions/translate.number";

export const command: Command = {
    name: 'bank',
    category: Category.ECONOMY,
    description: 'Bekijk je bank',
    middleware: middleware,
    run: async (client, message, args) => {
        const {bank} = await EcoModel.findOne({ userId: message.author.id });

        await message.reply({
            embeds: [
                new Embed(EmbedType.BLACKMT)
                    .setTitle('🏦 Geld')
                    .setDescription(`Je hebt op dit moment ${inlineCode(translateNumber(bank))}.`)
                    .setFooter('⌚ Opgehaald op')
                    .setTimestamp()
            ]
        });
    }
}