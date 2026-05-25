import { Injectable } from '@angular/core';
import QRCode from 'qrcode';
import { AuthUser } from './auth.service';
import { Player } from '../models/player.model';
import { Round } from '../models/round.model';

export interface FriendQrData {
    name: string;
    code: string;
    username?: string;
}

export interface RoundQrData {
    id: string;
    course: string;
    host: string;
    game: string;
}

@Injectable({ providedIn: 'root' })
export class QrService {
    /** Generate a QR code as a PNG data URL. */
    async generate(value: string): Promise<string> {
        return QRCode.toDataURL(value, {
            width: 280,
            margin: 2,
            errorCorrectionLevel: 'M',
            color: { dark: '#111111', light: '#ffffff' },
        });
    }

    /** Build the QR string for your own friend profile. */
    friendQrValue(user: AuthUser | null, player: Player | null): string {
        const code = user?.friendCode ?? player?.friendCode ?? '';
        const name = user?.displayName ?? player?.name ?? 'Golfer';
        const username = user?.username ?? player?.username ?? '';
        const params = new URLSearchParams({ code, name });
        if (username) params.set('username', username);
        return `cgolf://add-friend?${params.toString()}`;
    }

    /** Build the QR string for a round invite. */
    roundQrValue(round: Round, hostName: string): string {
        const params = new URLSearchParams({
            id: round.id,
            course: round.courseName,
            host: hostName,
            game: round.gameType,
            holes: round.holes.toString(),
        });
        return `cgolf://join-round?${params.toString()}`;
    }

    /** Parse a scanned QR string as a friend code. Returns null if not a friend QR. */
    parseFriendQr(raw: string): FriendQrData | null {
        if (!raw.startsWith('cgolf://add-friend')) return null;
        try {
            const qs = raw.split('?')[1] ?? '';
            const p = new URLSearchParams(qs);
            const name = p.get('name') ?? '';
            const code = p.get('code') ?? '';
            if (!name && !code) return null;
            const username = p.get('username') ?? undefined;
            return { name, code, username };
        } catch {
            return null;
        }
    }

    /** Parse a scanned QR string as a round invite. Returns null if not a round QR. */
    parseRoundQr(raw: string): RoundQrData | null {
        if (!raw.startsWith('cgolf://join-round')) return null;
        try {
            const qs = raw.split('?')[1] ?? '';
            const p = new URLSearchParams(qs);
            return {
                id: p.get('id') ?? '',
                course: p.get('course') ?? '',
                host: p.get('host') ?? '',
                game: p.get('game') ?? '',
            };
        } catch {
            return null;
        }
    }
}
