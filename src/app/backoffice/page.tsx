'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { brl } from '@/lib/formato';
import { Users, ShoppingBag, Tag, Package, ChevronRight, BarChart3, RotateCcw, Layers, Gift, Settings } from 'lucide-react';
import { AdminHeader } from '@/components/ui/admin-header';
import { toast } from 'sonner';
import { confirmar } from '@/lib/confirmar';

import { useNoIndex } from '@/components/ui/use-no-index';
export default function BackofficePage() {
  useNoIndex();
  const pedidos = useStore((s) => s.pedidos);
  const clientes = useStore((s) => s.clientes);
  const ofertas = useStore((s) => s.ofertas);
  const produtos = useStore((s) => s.produtos);
  const combos = useStore((s) => s.combos);
  const resgates = useStore((s) => s.resgates);
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
    <div className="min-h-screen bg-papel pb-8">
      <AdminHeader
        titulo="Backoffice"
        voltarPara="/"
        acoes={
          <button
            onClick={async () => {
              if (await confirmar('Reiniciar a demonstração?')) {
                try {
                  await reiniciar();
                  toast.success('Demonstração reiniciada');
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'Não consegui reiniciar');
                }
              }
            }}
            className="w-10 h-10 grid place-items-center rounded-md text-papel/80 hover:text-papel hover:bg-papel/10"
            title="Reiniciar demonstração"
            aria-label="Reiniciar demonstração"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        }
      />

      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
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
            href="/backoffice/combos"
            icon={<Layers />}
            titulo="Combos"
            subtitulo={`${combos.filter((c) => c.ativo).length} ativos`}
            descricao="Montar pacotes de produtos com preço fechado."
          />
          <Modulo
            href="/backoffice/resgates"
            icon={<Gift />}
            titulo="Resgates"
            subtitulo={`${resgates.filter((r) => r.ativo).length} no catálogo`}
            descricao="Editar o catálogo de troca de pontos."
          />
          <Modulo
            href="/backoffice/configuracoes"
            icon={<Settings />}
            titulo="Configurações"
            subtitulo="Pontos por real"
            descricao="Definir quanto os pontos valem em desconto."
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
    <div className="bg-azulejo border border-sebo rounded-xl p-3 sm:p-4 min-w-0">
      <div className="text-[10px] sm:text-xs uppercase tracking-wider text-carvao/60 truncate">{label}</div>
      <div className="font-mono font-extrabold text-lg sm:text-2xl mt-1.5 sm:mt-2 tabular-nums truncate">{valor}</div>
    </div>
  );
}

function Modulo({ href, icon, titulo, subtitulo, descricao }: { href: string; icon: React.ReactNode; titulo: string; subtitulo: string; descricao: string }) {
  return (
    <Link
      href={href}
      className="bg-azulejo border border-sebo rounded-xl p-5 hover:shadow-md active:bg-sebo-claro transition-shadow flex flex-col gap-2"
    >
      <div className="w-12 h-12 rounded-md bg-sangue text-papel grid place-items-center">{icon}</div>
      <div className="font-display font-extrabold uppercase text-lg">{titulo}</div>
      <div className="text-xs text-brasa font-semibold">{subtitulo}</div>
      <div className="text-sm text-carvao/70">{descricao}</div>
      <div className="text-xs text-brasa font-semibold mt-auto">Abrir <ChevronRight className="inline w-3 h-3" /></div>
    </Link>
  );
}
