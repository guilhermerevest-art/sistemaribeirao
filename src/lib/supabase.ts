// Cliente Supabase singleton para o Empório Ribeirão.
// Variáveis públicas (precisam estar no .env.local e na Vercel como
// NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).
//
// Nota: usamos `createClient<any>` aqui porque o generic do Supabase
// em conjunto com tipos manuais complexos estava gerando inferência
// `never` em chamadas `insert/update`. Como o app é 100% controlado
// pelo nosso código, validar o shape em runtime é suficiente.

import { createClient } from '@supabase/supabase-js';

// O tipo `any` aqui é proposital: o generic do Supabase + Database
// type manual estavam gerando inferência `never` em chamadas
// insert/update. Validamos o shape em runtime.
type Client = ReturnType<typeof createClient<any>>;

let _client: Client | null = null;

export function supabase(): Client {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (typeof window !== 'undefined' && !_warned) {
      // eslint-disable-next-line no-console
      console.warn(
        '[supabase] NEXT_PUBLIC_SUPABASE_URL/KEY não definidas. Configure no .env.local.',
      );
      _warned = true;
    }
    _client = createClient(
      url || 'http://127.0.0.1:54321',
      key || 'public-anon-key',
      { auth: { persistSession: false } },
    );
    return _client;
  }
  _client = createClient(url, key, {
    auth: { persistSession: false },
    realtime: { params: { eventsPerSecond: 2 } },
  });
  return _client;
}

let _warned = false;
