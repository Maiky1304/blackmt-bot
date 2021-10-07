import {Category, Command} from '../../interfaces';
import {middleware} from './middlewares/eco.middleware';
import {EcoModel} from "../../models";
import {translateNumber} from './functions/translate.number';
import {Embed, EmbedType} from "../../client";
import {inlineCode} from "@discordjs/builders";

export const command: Command = {
    name: 'daily',
    description: 'Claim dagelijks je geld rewards',
    category: Category.ECONOMY,
    aliases: [
        'dagelijks'
    ],
    middleware: middleware,
    run: async (client, message, args) => {
        const user = await EcoModel.findOne({userId:message.author.id});

        if (user.nextClaim > Date.now()) {
            await message.reply({
                embeds: [new Embed(EmbedType.ERROR).setTitle('⏲️Je moet nog even wachten voordat je deze reward kan ophalen!')]
            });
            return;
        }

        const generatedMoneyAmount = randomMoneyAmount();
        user.nextClaim = Date.now() + (1000 * 60 * 60 * 24);
        user.money += generatedMoneyAmount;
        await user.save();

        await message.reply({
            embeds: [new Embed(EmbedType.BLACKMT)
                .setTitle('⏲️ Dagelijkse Beloning')
                .setDescription(`Je hebt je dagelijkse beloning van ${inlineCode(translateNumber(generatedMoneyAmount))} opgehaald.\nJe hebt nu ${inlineCode(translateNumber(user.money))} in je bezit.`)]
        });
    }
}

function randomMoneyAmount() {
    return Math.floor(Math.random() * 1500) + 300;
}