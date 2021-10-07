import {Document, model, Schema} from 'mongoose';

export interface Mute extends Document {
    userId: string,
    guildId: string,
    reason: string,
    expiry: number,
    date: number,
    punisher: string,
    active: boolean
}

const MuteSchema: Schema = new Schema<Mute>({
    userId: { type: String, required: true },
    guildId: { type: String, required: true },
    reason: { type: String, default: 'Geen reden opgegegven' },
    expiry: { type: Number, required: true },
    date: { type: Number, default: Date.now() },
    punisher: { type: String, required: true },
    active: { type: Boolean, default: true }
});

export const MuteModel = model<Mute>('mutes', MuteSchema);