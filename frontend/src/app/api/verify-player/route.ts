import { NextRequest, NextResponse } from 'next/server';

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

  if (slug === 'free-fire') {
    const useruid = process.env.HL_GAMING_USERUID || 'Xv00AKjlBJMgOpxr05VP2Sreu0z1';
    const apiKey = process.env.HL_GAMING_API_KEY || 'Kjt47EN5VEvYVa77afIsd4hEAFicFg';
    const url = `https://proapis.hlgamingofficial.com/main/games/freefire/account/api?sectionName=AllData&PlayerUid=${uid}&region=sg&useruid=${useruid}&api=${apiKey}`;

    try {
      const response = await fetch(url, { cache: 'no-store' });

      if (response.ok) {
        const data = await response.json();
        if (data?.result?.AccountInfo) {
          const accountInfo = data.result.AccountInfo;
          return NextResponse.json({
            success: true,
            data: {
              uid,
              nickname: accountInfo.AccountName || 'Unknown Player',
              level: accountInfo.AccountLevel || 'N/A',
              region: accountInfo.AccountRegion || 'SG',
              avatar: null,
            },
          });
        }
      }
    } catch (err: any) {
      console.error('HL Gaming API Error:', err);
    }
  }

  // Generic Regex check for other games
  if (!/^\d{8,15}$/.test(uid)) {
    return NextResponse.json(
      { success: false, message: 'Player ID format invalid. Please check your ID' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      uid,
      nickname: `Player_${uid.slice(0, 5)}`,
      level: 65,
      region: 'Global',
      avatar: null,
    },
  });
}
