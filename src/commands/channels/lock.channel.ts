import { Category, Command } from '../../interfaces';

export const command: Command = {
    name: 'lockchannel',
    category: Category.MODERATION,
    description: 'Lock een channel in nood',
    permission: 'ADMINISTRATOR',
    run: (client, message, args) => {
        
    }
};