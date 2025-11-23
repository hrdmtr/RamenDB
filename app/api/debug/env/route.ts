import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// 環境変数デバッグ用エンドポイント（本番では削除すること）
export async function GET() {
  return NextResponse.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('SUPABASE')),
  });
}
