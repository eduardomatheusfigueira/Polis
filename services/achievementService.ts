import { User, GameSessionState, Achievement } from '../types';
import { getAchievements } from './dataService';
import { unlockAchievement } from './firestoreService';

export const checkAchievements = async (user: User, finalState: GameSessionState) => {
    const allAchievements = getAchievements();
    const unlocked: Achievement[] = [];

    // 1. Victory Achievements
    if (finalState.winner) {
        // "First Election" - id: a1
        const a1 = allAchievements.find(a => a.id === 'a1');
        if (a1 && !user.achievements.some(ua => ua.id === 'a1')) {
            const success = await unlockAchievement(user.id, a1);
            if (success) unlocked.push(a1);
        }
    }

    // 2. Stat-based Achievements
    // Example: "Silver Tongue" - Compromise 0% (checking coherence as proxy or custom logic needed)
    // For now, let's say "High Popularity" > 90%
    if (finalState.playerState.stats.popularity >= 90) {
        // Mock ID for example
        // const popAch = allAchievements.find(a => a.id === 'a_pop_90');
    }

    return unlocked;
};
