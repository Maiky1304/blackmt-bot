import { Task } from '../Interfaces';

class Variables {
    static index: number = 0;
    static statuses: string[] = [
        '👥 | %s leden',
        '🎮 | %s speler%s',
        '📋 | %s ticket%s'
    ]
}

export const task: Task = {
    rate: 5000,
    run: (client) => {
        const guild = client
    }
};