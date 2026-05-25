export const AVATAR_COLORS = [
    '#4A7A2B', '#C8912C', '#2A6DB5', '#9B3FB5', '#B83232',
    '#2A9B8A', '#E85D1A', '#5C5CB5', '#2A7A5C', '#B52A6E',
];

export interface Player {
    id: string;
    name: string;
    initials: string;
    handicap: number;
    color: string;
    isMe: boolean;
    roundsPlayed: number;
    wins: number;
    createdAt: number;
    /** Stable Apple user ID; only present on "Me" after Sign In */
    appleId?: string;
    /** Short code others use to look up this player */
    friendCode?: string;
    /** Unique @handle, lowercase letters/numbers/underscores, 3-20 chars */
    username?: string;
    /** Email address — shown in search results for easy identification */
    email?: string;
}

export interface Trophy {
    id: string;
    roundId: string;
    playerId: string;
    playerName: string;
    title: string;
    description: string;
    gameType: string;
    courseName: string;
    date: number;
    type: 'win' | 'eagle' | 'ace' | 'birdie_streak' | 'best_round' | 'closest_to_pin';
    icon: string;
    score?: number;
    par?: number;
}

export function newPlayer(name: string, isMe = false): Player {
    const words = name.trim().split(/\s+/);
    const initials = words.length >= 2
        ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
    return {
        id: crypto.randomUUID(),
        name: name.trim(),
        initials,
        handicap: 18,
        color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        isMe,
        roundsPlayed: 0,
        wins: 0,
        createdAt: Date.now(),
    };
}
