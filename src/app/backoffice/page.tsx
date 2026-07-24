'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { brl } from '@/lib/formato';
import { Home, Users, ShoppingBag, Tag, Package, ChevronRight, BarChart3, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BackofficePage() {
  const pedidos = useStore((s) => s.pedidos);
  const clientes = useStore((s) => s.clientes);
  const ofertas = useStore((s) => s.ofertas);
  const produtos = useStore((s) => s.produtos);
  const reiniciar = useStore((s) => s.reiniciarDemonstracao);

  const hoje = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const pedHoje = pedidos.filter((p) => new Date(p.criadoEm) >= hoje);
  const fat = pedHoje.reduce((s, p) => s + p.total, 0);
  const emAberto = pedidos.filter((p) => ['novo', 'preparando', 'pronto'].includes(p.status)).length;
  const cancelados = pedidos.filter((p) => p.status === 'cancelado').length;
  const ativas = ofertas.filter((o) => o.ativa).length;

  return (
    <div className="min-h-screen bg-papel">
      <header className="bg-carvao text-papel p-4 sticky top-0 z-30">
        <div className="mx-auto max-w-6xl flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            <div className="font-display font-extrabold text-2xl uppercase">Backoffice</div>
          </Link>
          <div className="ml-auto">
            <button
              onClick={() => { if (confirm('Reiniciar a demonstração?')) reiniciar(); }}
              className="text-papel/70 hover:text-papel p-2"
              title="Reiniciar demonstração"
            >
              <RotateCcw />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KPI label="Pedidos hoje" valor={String(pedHoje.length)} />
          <KPI label="Faturamento hoje" valor={brl(fat)} />
          <KPI label="Em aberto" valor={String(emAberto)} />
          <KPI label="Cancelados" valor={String(cancelados)} />
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <Modulo
            href="/backoffice/clientes"
            icon={<Users />}
            titulo="Clientes"
            subtitulo={`${clientes.length} cadastrados`}
            descricao="Cadastrar, editar, buscar e ver histórico de cada cliente."
          />
          <Modulo
            href="/backoffice/pedidos"
            icon={<ShoppingBag />}
            titulo="Pedidos"
            subtitulo={`${pedidos.length} no total`}
            descricao="Lista de todos os pedidos, com filtros por status e data."
          />
          <Modulo
            href="/backoffice/promocoes"
            icon={<Tag />}
            titulo="Promoções"
            subtitulo={`${ativas} ativas`}
            descricao="Criar e desativar ofertas da semana e relâmpago."
          />
          <Modulo
            href="/backoffice/produtos"
            icon={<Package />}
            titulo="Produtos"
            subtitulo={`${produtos.length} no cardápio`}
            descricao="Editar preço, disponibilidade e percentual de cashback."
          />
          <Modulo
            href="/painel"
            icon={<BarChart3 />}
            titulo="Painel do Dono"
            subtitulo="Relatórios"
            descricao="KPIs, gráfico de faturamento, top 10, frequência."
          />
          <Modulo
            href="/painel/campanhas"
            icon={<Users />}
            titulo="Campanhas"
            subtitulo="Mensagens em massa"
            descricao="Listas de WhatsApp por grupo de frequência."
          />
        </section>
      </main>
    </div>
  );
}

function KPI({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="bg-azulejo border border-sebo rounded-xl p-4">
      <div className="text-[10px] uppercase tracking-wider text-carvao/60">{label}</div>
      <div className="font-mono font-extrabold text-2xl mt-2 tabular-nums">{valor}</div>
    </div>
  );
}

function Modulo({ href, icon, titulo, subtitulo, descricao }: { href: string; icon: React.ReactNode; titulo: string; subtitulo: string; descricao: string }) {
  return (
    <Link
      href={href}
      className="bg-azulejo border border-sebo rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col gap-2"
    >
      <div className="w-12 h-12 rounded-md bg-sangue text-papel grid place-items-center">{icon}</div>
      <div className="font-display font-extrabold uppercase text-lg">{titulo}</div>
      <div className="text-xs text-brasa font-semibold">{subtitulo}</div>
      <div className="text-sm text-carvao/70">{descricao}</div>
      <div className="text-xs text-brasa font-semibold mt-auto">Abrir <ChevronRight className="inline w-3 h-3" /></div>
    </Link>
  );
}
