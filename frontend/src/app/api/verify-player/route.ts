import { NextRequest, NextResponse } from 'next/server';

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

  // 2. Query HL Gaming Official API if configured
  if (slug === 'free-fire') {
    const useruid = process.env.HL_GAMING_USERUID || 'Xv00AKjlBJMgOpxr05VP2Sreu0z1';
    const apiKey = process.env.HL_GAMING_API_KEY || 'Kjt47EN5VEvYVa77afIsd4hEAFicFg';

    // Support comma-separated pool of API keys if provided
    const apiKeys = apiKey.split(',').map((k) => k.trim()).filter(Boolean);

    for (const currentKey of apiKeys) {
      const url = `https://proapis.hlgamingofficial.com/main/games/freefire/account/api?sectionName=AllData&PlayerUid=${cleanUid}&region=sg&useruid=${encodeURIComponent(useruid)}&api=${currentKey}`;

      try {
        const response = await fetch(url, { cache: 'no-store' });

        if (response.ok) {
          const data = await response.json();
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
        } else if (response.status === 429) {
          console.warn(`[Verify Player API] HL Gaming daily quota reached (HTTP 429) on key: ${currentKey.slice(0, 6)}...`);
        }
      } catch (err: any) {
        console.error('[Verify Player API] HL Gaming API Connection Error:', err.message);
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
