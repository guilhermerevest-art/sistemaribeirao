// Endpoint de saúde simples. Retorna JSON com timestamp, online
// (Supabase configurado?) e contagem de entidades. Útil pra:
// 1. Verificar se o deploy está vivo (curl /status).
// 2. Diagnosticar se o Supabase responde.
// 3. Confirmar build recente (o JSON inclui o commit do build via
//    env var VERCEL_GIT_COMMIT_SHA, se existir).

import { NextResponse } from 'next/server';
import { hasSupabaseEnv } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    online: hasSupabaseEnv(),
    build: {
      commit: process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
      branch: process.env.VERCEL_GIT_COMMIT_REF ?? 'local',
    },
  });
}
