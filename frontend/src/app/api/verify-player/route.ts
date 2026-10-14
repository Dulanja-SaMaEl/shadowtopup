import { NextRequest, NextResponse } from 'next/server';
import { incrementHLGamingUsage, getHLGamingAccounts } from '@/lib/hlgamingQuotaService';

// In-memory cache for resolved player nicknames (persists across requests during server runtime)
const playerCache = new Map<string, { nickname: string; level?: string | number; region?: string; timestamp: number }>();


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const uid = searchParams.get('uid');

  if (!uid) {
    return NextResponse.json(
      { success: false, message: 'Please enter your Player ID first' },
      { status: 400 }
    );
  }

  const cleanUid = uid.trim();

  // Validate format (8 to 15 digits)
  if (!/^\d{8,15}$/.test(cleanUid)) {
    return NextResponse.json(
      { success: false, message: 'Player ID format invalid. Must be 8 to 15 digits.' },
      { status: 400 }
    );
  }

  // 1. Check in-memory cache first (saves API quota and responds in 0ms)
  const cached = playerCache.get(cleanUid);
  if (cached && (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000)) {
    return NextResponse.json({
      success: true,
      data: {
        uid: cleanUid,
        nickname: cached.nickname,
        level: cached.level || 'Verified',
        region: cached.region || 'SG / MY',
        isCached: true,
        avatar: null,
      },
    });
  }

  // 2. Query HL Gaming Official API with Automatic Multi-Account Failover & Rotation
  if (slug === 'free-fire') {
    const accounts = getHLGamingAccounts();

    for (let i = 0; i < accounts.length; i++) {
      const acc = accounts[i];
      const url = `https://proapis.hlgamingofficial.com/main/games/freefire/account/api?sectionName=AllData&PlayerUid=${cleanUid}&region=sg&useruid=${encodeURIComponent(acc.useruid)}&api=${acc.apiKey}`;

      try {
        const response = await fetch(url, { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
        // Increment daily quota count on live request
        await incrementHLGamingUsage().catch(() => {});

        // If rate limited or unauthorized/expired, immediately rotate to next account
        if (response.status === 429 || response.status === 401 || response.status === 403) {
          console.warn(`[Verify Player API] HL Gaming ${acc.name} quota reached or unavailable (HTTP ${response.status}). Rotating to next account...`);
          continue;
        }

        if (response.ok) {
          const data = await response.json();
          // If response body reports quota or daily limit error, rotate to next account
          if (data?.error || data?.message?.toLowerCase()?.includes('limit') || data?.message?.toLowerCase()?.includes('quota')) {
            console.warn(`[Verify Player API] HL Gaming ${acc.name} reported limit: ${data.message || data.error}. Rotating to next account...`);
            continue;
          }

          if (data?.result?.AccountInfo?.AccountName) {
            const accountInfo = data.result.AccountInfo;
            const resolvedName = accountInfo.AccountName;
            const resolvedLevel = accountInfo.AccountLevel || 'N/A';
            const resolvedRegion = accountInfo.AccountRegion || 'SG';

            // Cache successfully resolved player
            playerCache.set(cleanUid, {
              nickname: resolvedName,
              level: resolvedLevel,
              region: resolvedRegion,
              timestamp: Date.now(),
            });

            return NextResponse.json({
              success: true,
              data: {
                uid: cleanUid,
                nickname: resolvedName,
                level: resolvedLevel,
                region: resolvedRegion,
                avatar: null,
              },
            });
          }
        } else {
          console.warn(`[Verify Player API] HL Gaming ${acc.name} returned HTTP ${response.status}. Rotating...`);
        }
      } catch (err: any) {
        console.error(`[Verify Player API] HL Gaming ${acc.name} Connection Error:`, err.message);
      }
    }
  }

  // 3. Graceful fallback when 3rd-party API quota is reached
  // Returns isFallback flag so the frontend can display a clean validated status and allow entering/editing the IGN
  return NextResponse.json({
    success: true,
    data: {
      uid: cleanUid,
      nickname: null,
      isFallback: true,
      level: 'Verified',
      region: 'SG / MY',
      avatar: null,
    },
  });
}
