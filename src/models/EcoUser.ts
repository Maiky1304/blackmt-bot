import {Document, model, Schema} from 'mongoose';

export interface EcoUser extends Document {
    userId: string,
    guildId: string,
    money: number,
    bank: number,
    nextClaim: number
}

const EcoSchema: Schema = new Schema<EcoUser>({
    userId: { type: 'String' },
    guildId: { type: 'String' },
    money: { type: 'number', default: 0 },
    bank: { type: 'number', default: 0 },
    nextClaim: { type: 'number', default: 0 }
});

export const EcoModel = model<EcoUser>('eco_users', EcoSchema);