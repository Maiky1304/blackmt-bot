import {Category, Command} from '../../interfaces';
import {Embed, EmbedType} from "../../client";
import {inlineCode} from "@discordjs/builders";
import {EcoModel} from "../../models";
import {middleware} from './middlewares/eco.middleware';
import {translateNumber} from './functions/translate.number';

export const command: Command = {
    name: 'money',
    category: Category.ECONOMY,
    description: 'Bekijk je geld',
    middleware: middleware,
    aliases: ['geld', 'doekoe'],
    run: async (client, message, args) => {
        const {money} = await EcoModel.findOne({ userId: message.author.id });

        await message.reply({
            embeds: [
                new Embed(EmbedType.BLACKMT)
                    .setTitle('💸 Geld')
                    .setDescription(`Je hebt op dit moment ${inlineCode(translateNumber(money))}.`)
                    .setFooter('⌚ Opgehaald op')
                    .setTimestamp()
            ]
        });
    }
}