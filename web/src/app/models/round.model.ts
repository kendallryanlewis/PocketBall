export type GameType =
    | 'stroke_play'
    | 'match_play'
    | 'stableford'
    | 'skins'
    | 'wolf'
    | 'nassau'
    | 'reverse_mulligan'
    | 'best_ball'
    | 'scramble'
    | 'alternate_shot'
    | 'bingo_bango_bongo'
    | 'vegas'
    | 'chairman'
    | 'quota'
    // Challenges
    | 'one_club'
    | 'three_club_challenge'
    | 'iron_man'
    | 'random_bag'
    | 'club_of_the_hole'
    | 'worst_ball'
    | 'nines'
    | 'snake'
    | 'speed_golf';

export interface GameTypeMeta {
    id: GameType;
    label: string;
    description: string;
    minPlayers: number;
    maxPlayers: number;
    icon: string;
    category: 'individual' | 'team' | 'group';
}

export const GAME_TYPES: GameTypeMeta[] = [
    { id: 'stroke_play', label: 'Stroke Play', description: 'Fewest total strokes wins.', minPlayers: 1, maxPlayers: 8, icon: '⛳', category: 'individual' },
    { id: 'match_play', label: 'Match Play', description: 'Win holes, not strokes. Most holes wins.', minPlayers: 2, maxPlayers: 4, icon: '⚔️', category: 'individual' },
    { id: 'stableford', label: 'Stableford', description: 'Points above/below par. Most points wins.', minPlayers: 1, maxPlayers: 8, icon: '🎯', category: 'individual' },
    { id: 'skins', label: 'Skins', description: 'Lowest score on each hole wins the skin pot.', minPlayers: 2, maxPlayers: 6, icon: '💰', category: 'group' },
    { id: 'wolf', label: 'Wolf', description: 'Rotating wolf picks a partner or goes it alone each hole.', minPlayers: 3, maxPlayers: 4, icon: '🐺', category: 'group' },
    { id: 'nassau', label: 'Nassau', description: 'Three separate bets: front 9, back 9, and overall.', minPlayers: 2, maxPlayers: 4, icon: '🏦', category: 'individual' },
    { id: 'reverse_mulligan', label: 'Reverse Mulligan', description: 'Use opponents\' great shots against them.', minPlayers: 2, maxPlayers: 6, icon: '🔄', category: 'group' },
    { id: 'best_ball', label: 'Best Ball', description: 'Teams use each player\'s best score per hole.', minPlayers: 4, maxPlayers: 8, icon: '🤝', category: 'team' },
    { id: 'scramble', label: 'Scramble', description: 'All hit, pick the best shot each time.', minPlayers: 2, maxPlayers: 8, icon: '🔀', category: 'team' },
    { id: 'alternate_shot', label: 'Alternate Shot', description: 'Partners alternate shots on every hole.', minPlayers: 4, maxPlayers: 4, icon: '↔️', category: 'team' },
    { id: 'bingo_bango_bongo', label: 'Bingo Bango Bongo', description: 'Points for first on green, closest to pin, and first in.', minPlayers: 2, maxPlayers: 6, icon: '🎰', category: 'group' },
    { id: 'vegas', label: 'Vegas', description: 'Combine two-digit scores — big swings possible.', minPlayers: 4, maxPlayers: 4, icon: '🎲', category: 'team' },
    { id: 'chairman', label: 'Chairman', description: 'Lose a hole, you\'re out. Last player standing wins.', minPlayers: 3, maxPlayers: 8, icon: '👑', category: 'group' },
    { id: 'quota', label: 'Quota', description: 'Beat your handicap-based point quota.', minPlayers: 1, maxPlayers: 8, icon: '📊', category: 'individual' },
    // Challenges
    { id: 'one_club', label: 'One Club', description: 'Each player uses a single randomly assigned club for the entire round — plus the putter.', minPlayers: 1, maxPlayers: 8, icon: '🪄', category: 'individual' },
    { id: 'three_club_challenge', label: '3-Club Challenge', description: 'Each player gets 3 randomly drawn clubs + putter for the whole round.', minPlayers: 1, maxPlayers: 8, icon: '3️⃣', category: 'individual' },
    { id: 'iron_man', label: 'Iron Man', description: 'No woods, no wedges. Irons and putter only.', minPlayers: 1, maxPlayers: 8, icon: '🔩', category: 'individual' },
    { id: 'random_bag', label: 'Random Bag', description: 'Each player\'s bag is randomly assembled before the round — 7 clubs + putter.', minPlayers: 1, maxPlayers: 8, icon: '🎲', category: 'individual' },
    { id: 'club_of_the_hole', label: 'Club of the Hole', description: 'A club is randomly drawn before each hole. Everyone must use only that club (putter on the green allowed).', minPlayers: 1, maxPlayers: 8, icon: '🃏', category: 'group' },
    { id: 'worst_ball', label: 'Worst Ball', description: 'Always play your worst shot. A test of true scrambling skill.', minPlayers: 1, maxPlayers: 4, icon: '😬', category: 'individual' },
    { id: 'nines', label: 'Nines', description: '9 points are distributed each hole by finish order — fight for every stroke.', minPlayers: 3, maxPlayers: 4, icon: '9️⃣', category: 'group' },
    { id: 'snake', label: 'Snake', description: 'Three-putt and you hold the snake. Carry it to the end of the round and you pay.', minPlayers: 2, maxPlayers: 8, icon: '🐍', category: 'group' },
    { id: 'speed_golf', label: 'Speed Golf', description: 'Your score is strokes + minutes on course. Fewest combined points wins.', minPlayers: 1, maxPlayers: 8, icon: '⚡', category: 'individual' },
];

export interface StrokeDetail {
    club?: string;          // club name from GOLF_CLUBS
    distanceYards?: number; // estimated carry/total distance
}

export interface HoleScore {
    strokes: number | null;
    putts?: number | null;
    fairwayHit?: boolean | null;     // null = not applicable (par 3)
    fairwayMiss?: 'left' | 'right'; // direction when fairwayHit === false
    gir?: boolean | null;
    penalties?: number;              // penalty strokes
    strokeDetails?: StrokeDetail[]; // optional per-shot breakdown
}

export interface PlayerRound {
    playerId: string;
    scores: HoleScore[];
    stablefordPoints?: number[];
    skinsWon?: number[];
    wolfAlone?: number[];
    wolfWins?: number[];
    matchStatus?: number; // +/- relative to opponent
    nassauStatus?: { front: number; back: number; overall: number };
}

export interface Round {
    id: string;
    courseId: string;
    courseName: string;
    holes: number;
    gameType: GameType;
    playerRounds: PlayerRound[];
    date: number;
    completed: boolean;
    currentHole: number;
    tee: string;
    winner?: string;
    notes?: string;
    /**
     * Club draw data for club-challenge game types.
     * - per_player: each player key maps to their assigned club list
     * - per_hole: an array of clubs, one per hole index
     */
    clubDraw?: {
        type: 'per_player' | 'per_hole';
        perPlayer?: Record<string, string[]>;  // playerId → club names
        perHole?: string[];                    // index → club name
    };
    /** When true this round is being broadcast live via Firestore */
    liveSync?: boolean;
}

export function newRound(overrides: Partial<Round> & Pick<Round, 'courseId' | 'courseName' | 'holes' | 'gameType'>): Round {
    return {
        id: crypto.randomUUID(),
        date: Date.now(),
        completed: false,
        currentHole: 1,
        tee: 'White',
        playerRounds: [],
        winner: undefined,
        notes: '',
        ...overrides,
    };
}

export function roundTotal(pr: PlayerRound): number {
    return pr.scores.reduce((s, h) => s + (h.strokes ?? 0), 0);
}

export function holeTotal(pr: PlayerRound, upTo: number): number {
    return pr.scores.slice(0, upTo).reduce((s, h) => s + (h.strokes ?? 0), 0);
}
