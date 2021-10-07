import { Schema, model, Document, Model } from 'mongoose';

export interface Profile extends Document {
    userId: string,
    guildId: string,
    xp: number,
    level: number,
    points: number,
    join_date: number
}

interface FunctionalModel extends Model<Profile> {
    levelUp(userId: string): Promise<boolean>;
}

const ProfileSchema: Schema = new Schema<Profile, FunctionalModel>({
    userId: { type: 'String' },
    guildId: { type: 'String' },
    xp: { type: 'Number', default: 0 },
    level: { type: 'Number', default: 1 },
    points: { type: 'Number', default: 0 },
    join_date: { type: 'Number', default: Date.now() }
});

ProfileSchema.static('levelUp', async (userId: string) => {
    const profile = await ProfileModel.findOne({userId: userId});
    const oldLevel = profile.level;
    let nextLevel = profile.level * 8;

    while (profile.xp >= nextLevel) {
        profile.xp -= nextLevel;
        profile.level += 1;
        profile.points += 1;

        nextLevel = profile.level * 8;
    }

    if (oldLevel != profile.level) {
        await profile.save();
    }

    return oldLevel != profile.level;
});

export const ProfileModel = model<Profile, FunctionalModel>('profiles', ProfileSchema);