import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Beef,
  Truck,
  Receipt,
  Printer,
  Sparkles,
  Trophy,
  Users,
  Bell,
  BarChart3,
  Wand2,
  Globe,
  Layers,
  Tag,
  MessageCircle,
  ShieldCheck,
  Smartphone,
  Monitor,
  ChefHat,
  ShoppingBag,
  ArrowRight,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Empório Ribeirão — Açougue com loja digital',
  description:
    'Catálogo pelo celular, pedido com cashback, cupom impresso na bancada e painel do dono com lista de quem não volta há 30 dias. Demo interativa de 4 minutos.',
  alternates: { canonical: '/landing' },
  openGraph: {
    title: 'Empório Ribeirão — Açougue com loja digital',
    description:
      'Catálogo pelo celular, pedido com cashback, cupom impresso na bancada e painel do dono. Demo interativa.',
    url: '/landing',
    type: 'website',
  },
};

// Mapa de funcionalidades que existem hoje no app.
const FEATURES = [
  {
    icon: Smartphone,
    titulo: 'Vitrine mobile-first',
    descricao:
      'Catálogo por categoria, busca, ofertas relâmpago e da semana, card-etiqueta com serrilhado de balança.',
    pagina: '/loja',
  },
  {
    icon: Beef,
    titulo: 'Detalhe do corte',
    descricao:
      'Peso rápido (0,5 a 2 kg) ou livre (passo 100 g), avisos sobre variação de balança, preparos em chips, observação por item.',
    pagina: '/loja/produto/picanha-maturada',
  },
  {
    icon: Sparkles,
    titulo: 'Sugestões cruzadas',
    descricao:
      '"Vai bem com isso" + sheet pós-adicionar com produtos complementares por categoria. Aumenta o ticket médio.',
    pagina: '/loja',
  },
  {
    icon: Receipt,
    titulo: 'Checkout em 1 tela',
    descricao:
      'Identificação por telefone, balcão ou entrega (com geolocalização Nominatim), Pix/Cartão/Dinheiro, cashback, troca de pontos.',
    pagina: '/loja/checkout',
  },
  {
    icon: Trophy,
    titulo: 'Cashback + Pontos + Níveis',
    descricao:
      '3–5% por categoria, bônus Prata +1% e Ouro +2%, pontos com validade infinita, 6 itens de resgate editáveis.',
    pagina: '/minha-conta/clube',
  },
  {
    icon: Tag,
    titulo: 'Ofertas da semana e relâmpago',
    descricao:
      'Relâmpago esgota de verdade (cota total + barra ao vivo), semana libera 24 h antes para clientes Ouro.',
    pagina: '/loja',
  },
  {
    icon: ChefHat,
    titulo: 'Cozinha + Bancada',
    descricao:
      'Cozinha com timer HMS e "marcar como pronto". Bancada com 3 colunas, som ao chegar pedido, impressão automática na TM-T20X.',
    pagina: '/bancada',
  },
  {
    icon: Printer,
    titulo: 'Cupom 80mm',
    descricao:
      'CSS de impressão próprio, `>> PREPARO` em destaque, sem diálogos do navegador (kiosk-printing).',
    pagina: '/bancada/cupom/0501',
  },
  {
    icon: BarChart3,
    titulo: 'Painel do dono',
    descricao:
      'KPIs do dia, gráfico de 30 d, 5 grupos de frequência clicáveis, top produtos, circulação de cashback.',
    pagina: '/painel',
  },
  {
    icon: Users,
    titulo: 'Carteira de clientes',
    descricao:
      'Lista com badge de frequência, WhatsApp em 1 clique, alerta de cashback prestes a vencer, "Pedir de novo".',
    pagina: '/painel/clientes',
  },
  {
    icon: MessageCircle,
    titulo: 'Campanhas + relatórios',
    descricao:
      'Templates com {{nome}} {{saldo}} {{dias}}, lista por grupo, exportação CSV de "em risco", gráficos Recharts.',
    pagina: '/painel/campanhas',
  },
  {
    icon: Layers,
    titulo: 'Backoffice completo',
    descricao:
      'Clientes, pedidos, produtos, promoções, combos, resgates, configurações (pts→R$, loja aberta, dados do estabelecimento).',
    pagina: '/backoffice',
  },
];

const PASSOS = [
  {
    n: 1,
    icon: Smartphone,
    titulo: 'Cliente escolhe pelo celular',
    texto:
      'Abre /loja, escolhe corte, peso e preparo. Adiciona sugestão cruzada. Vai pro checkout.',
  },
  {
    n: 2,
    icon: Bell,
    titulo: 'Bancada toca o alarme',
    texto:
      'Bip de 880 Hz, pedido aparece em "Novos" com timer. Imprime o cupom sozinho na TM-T20X.',
  },
  {
    n: 3,
    icon: ChefHat,
    titulo: 'Cozinha prepara',
    texto:
      'KDS mostra os preparos em destaque (>> CORTAR EM BIFES). Timer vira vermelho após 20 min.',
  },
  {
    n: 4,
    icon: BarChart3,
    titulo: 'Dono decide o amanhã',
    texto:
      'Painel lista 4 clientes "em risco" com WhatsApp pronto. Mensagem cita o saldo e a oferta da semana.',
  },
];

const STACK = [
  { nome: 'Next.js 16', papel: 'App Router + RSC' },
  { nome: 'TypeScript', papel: 'strict' },
  { nome: 'Tailwind v4', papel: 'tokens + shadcn/ui' },
  { nome: 'Zustand', papel: 'estado único persistido' },
  { nome: 'shadcn/ui', papel: 'Input, Select, Switch, Dialog, DropdownMenu' },
  { nome: 'Radix UI', papel: 'primitivos acessíveis' },
  { nome: 'Recharts', papel: 'gráficos do painel' },
  { nome: 'Sonner', papel: 'toasts' },
  { nome: 'Web Audio', papel: 'bip da bancada' },
  { nome: 'Supabase', papel: 'persistência opcional (mock local como fallback)' },
];

const MODOS_OPERACAO = [
  {
    icon: Globe,
    titulo: 'Online (Supabase)',
    texto:
      'Com env vars configuradas, lê e escreve no banco. Sincroniza entre abas e dispositivos via storage + polling.',
  },
  {
    icon: ShieldCheck,
    titulo: 'Offline (localStorage)',
    texto:
      'Sem env vars, cai automaticamente pro snapshot local. Badge "Offline" aparece no canto. Tudo funciona.',
  },
];

export default function LandingPage() {
  return (
    <main className="bg-branco text-preto">
      <Hero />
      <Problema />
      <Features />
      <PassoAPasso />
      <Tour />
      <Modos />
      <StackSecao />
      <CTAFinal />
    </main>
  );
}

// Componente fica aberto até a próxima seção — itens de tour reutilizam
// o tipo inline declarado em cada array.

/* ====================== Seções ====================== */

function Hero() {
  return (
    <section className="relative overflow-hidden bg-preto text-branco">
      <div className="absolute inset-0 bg-gradient-to-br from-vermelho via-vermelho to-preto opacity-90" aria-hidden />
      <div className="absolute inset-0 [background:radial-gradient(circle_at_20%_20%,rgba(245,197,24,0.15),transparent_50%),radial-gradient(circle_at_80%_60%,rgba(255,255,255,0.08),transparent_50%)]" aria-hidden />
      <nav className="relative mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-extrabold uppercase tracking-tight">
          <span className="w-9 h-9 rounded-md bg-amarelo text-preto grid place-items-center">R</span>
          <span>Empório Ribeirão</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/loja"
            className="hidden sm:inline-flex h-10 px-4 rounded-md bg-amarelo text-preto font-bold uppercase text-sm items-center"
          >
            Abrir a loja
          </Link>
          <Link
            href="/"
            className="inline-flex h-10 px-4 rounded-md border border-branco/30 text-branco font-semibold text-sm items-center hover:bg-branco/10"
          >
            Voltar ao índice
          </Link>
        </div>
      </nav>

      <div className="relative mx-auto max-w-6xl px-4 pt-10 pb-20 sm:pt-16 sm:pb-28 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-branco/10 px-3 py-1 text-xs uppercase tracking-wider font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amarelo" />
            Açougue de bairro · loja digital
          </span>
          <h1 className="mt-5 font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl uppercase tracking-tight leading-[1.05]">
            Carne boa,
            <br />
            <span className="text-amarelo">do balcão pro celular.</span>
          </h1>
          <p className="mt-5 text-lg text-branco/85 max-w-xl">
            Vitrine mobile, pedido com cashback, cupom impresso na bancada e painel do dono com a lista de quem não volta há um mês. Tudo numa demo de 4 minutos.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/loja"
              className="h-14 px-6 rounded-lg bg-amarelo text-preto font-extrabold uppercase tracking-wide inline-flex items-center gap-2 hover:bg-amarelo/90 active:translate-y-px"
            >
              Ver a vitrine <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/bancada"
              className="h-14 px-6 rounded-lg border border-branco/40 text-branco font-bold uppercase tracking-wide inline-flex items-center gap-2 hover:bg-branco/10"
            >
              <Monitor className="w-5 h-5" /> Abrir a bancada
            </Link>
          </div>
          <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-branco/80">
            {['Mobile-first', 'Cupom 80 mm', 'Cashback + pontos', 'Painel do dono'].map((s) => (
              <li key={s} className="inline-flex items-center gap-1.5">
                <Check className="w-4 h-4 text-amarelo" /> {s}
              </li>
            ))}
          </ul>
        </div>

        <HeroMascote />
      </div>
    </section>
  );
}

function HeroMascote() {
  // Mock visual de um celular com o card de um corte na vitrine.
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-amarelo rounded-full opacity-30 blur-3xl" aria-hidden />
      <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-vermelho rounded-full opacity-40 blur-3xl" aria-hidden />

      <div className="relative rounded-[2.5rem] bg-branco p-3 shadow-2xl border border-branco/20 rotate-[-3deg] hover:rotate-0 transition-transform">
        <div className="rounded-[1.8rem] overflow-hidden bg-branco">
          <div className="aspect-[3/4] bg-gradient-to-br from-cinza-claro to-branco relative">
            {/* Etiqueta */}
            <div className="absolute inset-4 bg-branco border border-sebo rounded-lg shadow-sm flex flex-col overflow-hidden">
              <div className="aspect-square bg-cinza-claro flex items-center justify-center">
                <Beef className="w-1/2 h-1/2 text-preto/15" strokeWidth={1.5} />
              </div>
              <div className="px-3 py-2 border-x border-sebo">
                <div className="font-display font-bold text-xs uppercase leading-tight">Picanha Maturada</div>
                <div className="mt-1 font-mono font-extrabold text-lg tabular-nums">
                  R$ 79,90<span className="text-xs font-normal text-preto/60"> /kg</span>
                </div>
              </div>
              <div className="tarja-barcode mx-3 border-x border-sebo" />
              <div className="px-3 py-2 border border-sebo border-t-0 etiqueta-serrilhada flex items-center justify-between text-[10px] font-mono">
                <span className="text-verde-fiel font-semibold inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> R$ 2,40/kg
                </span>
                <span className="uppercase tracking-wider">Bovino</span>
              </div>
            </div>
            {/* Faixa "10% off" */}
            <div className="absolute top-7 left-7 bg-amarelo text-preto text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-sm shadow">
              10% off
            </div>
          </div>
        </div>
      </div>

      {/* Card do cupom flutuando */}
      <div className="absolute -bottom-8 -left-4 sm:-left-8 rotate-[6deg] bg-branco rounded-lg shadow-xl p-3 w-44 font-mono text-[10px] leading-tight text-preto border border-sebo">
        <div className="text-center font-bold">EMPÓRIO RIBEIRÃO</div>
        <div className="border-t border-dashed border-preto my-1" />
        <div className="font-bold">PEDIDO Nº 0501</div>
        <div className="font-bold">2,000 kg PICANHA MATURADA</div>
        <div className="font-bold">&gt;&gt; CORTAR EM BIFES</div>
        <div className="text-right">R$ 159,80</div>
        <div className="border-t border-dashed border-preto my-1" />
        <div className="flex justify-between"><span>TOTAL</span><span>R$ 207,60</span></div>
      </div>
    </div>
  );
}

function Problema() {
  const pontos = [
    'Pedido chega por WhatsApp e é anotado à mão.',
    'Não existe registro de quem compra, com que frequência, nem mecanismo de retorno.',
    'Dono não enxerga quem parou de vir nem quem está prestes a vencer o saldo.',
  ];
  return (
    <section className="bg-branco py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 grid lg:grid-cols-2 gap-12 items-start">
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-vermelho">O problema</span>
          <h2 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight leading-tight">
            Açougue de bairro ainda funciona no caderno.
          </h2>
          <p className="mt-4 text-preto/70">
            A gente conhece o dono, o cliente e o churrasco de sexta. Mas o sistema não. Hoje o açougueiro perde cliente sem saber, dá desconto sem controle e manda cupom pelo WhatsApp em texto solto.
          </p>
        </div>
        <ul className="space-y-3">
          {pontos.map((p) => (
            <li key={p} className="flex gap-3 rounded-lg bg-sebo-claro p-4">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-vermelho text-branco grid place-items-center text-xs font-bold shrink-0">
                ✕
              </span>
              <span className="text-sm">{p}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="bg-sebo-claro py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-widest font-semibold text-vermelho">Funcionalidades</span>
          <h2 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight leading-tight">
            Tudo que tem hoje.
          </h2>
          <p className="mt-3 text-preto/70">
            {FEATURES.length} features entregues, todas clicáveis. Cada card leva pra página real do app — sem mockup, sem screenshot.
          </p>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.titulo}
                href={f.pagina}
                className="group rounded-xl bg-branco border border-sebo p-5 hover:border-vermelho hover:shadow-md transition-all flex flex-col"
              >
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-md bg-vermelho text-branco grid place-items-center">
                    <Icon className="w-5 h-5" />
                  </span>
                  <h3 className="font-display font-bold uppercase">{f.titulo}</h3>
                </div>
                <p className="mt-3 text-sm text-preto/70 flex-1">{f.descricao}</p>
                <div className="mt-3 inline-flex items-center gap-1 text-xs text-vermelho font-semibold">
                  Ver ao vivo <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function PassoAPasso() {
  return (
    <section className="bg-branco py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-widest font-semibold text-vermelho">Como funciona</span>
          <h2 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight leading-tight">
            Quatro toques do cliente até o próximo pedido dele.
          </h2>
        </div>
        <ol className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PASSOS.map((p) => {
            const Icon = p.icon;
            return (
              <li key={p.n} className="rounded-xl bg-branco border border-sebo p-5">
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-full bg-preto text-branco grid place-items-center font-mono font-bold">
                    {p.n}
                  </span>
                  <Icon className="w-5 h-5 text-vermelho" />
                </div>
                <h3 className="mt-3 font-display font-bold uppercase">{p.titulo}</h3>
                <p className="mt-2 text-sm text-preto/70">{p.texto}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function Tour() {
  // Compara lado a lado: o que o cliente vê × o que o atendente vê.
  const cliente = [
    { ic: <Smartphone className="w-3.5 h-3.5" />, txt: 'Abre a vitrine, escolhe corte e peso' },
    { ic: <Sparkles className="w-3.5 h-3.5" />, txt: 'Recebe sugestão cruzada (carvão + sal)' },
    { ic: <Receipt className="w-3.5 h-3.5" />, txt: 'Checkout em 1 tela: telefone, Pix, cashback' },
    { ic: <MessageCircle className="w-3.5 h-3.5" />, txt: 'Confirma e abre WhatsApp do açougue se precisar' },
  ];
  const atendente = [
    { ic: <Bell className="w-3.5 h-3.5" />, txt: 'Bip toca, pedido entra em "Novos"' },
    { ic: <Printer className="w-3.5 h-3.5" />, txt: 'Cupom sai sozinho na TM-T20X' },
    { ic: <ChefHat className="w-3.5 h-3.5" />, txt: 'Cozinha vê >> CORTAR EM BIFES em destaque' },
    { ic: <BarChart3 className="w-3.5 h-3.5" />, txt: 'Dono vê o ticket médio e o saldo gerado' },
  ];
  return (
    <section className="bg-preto text-branco py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-widest font-semibold text-amarelo">Tour</span>
          <h2 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight leading-tight">
            Dois lados do balcão, uma conversa só.
          </h2>
        </div>
        <div className="mt-8 grid md:grid-cols-2 gap-3">
          <LadoBloco
            rotulo="Cliente · celular"
            tom="bg-amarelo text-preto"
            icone={<Smartphone className="w-5 h-5" />}
            itens={cliente}
          />
          <LadoBloco
            rotulo="Açougue · bancada"
            tom="bg-vermelho text-branco"
            icone={<Monitor className="w-5 h-5" />}
            itens={atendente}
          />
        </div>
      </div>
    </section>
  );
}

function LadoBloco({
  rotulo,
  tom,
  icone,
  itens,
}: {
  rotulo: string;
  tom: string;
  icone: React.ReactNode;
  itens: { ic: React.ReactNode; txt: string }[];
}) {
  // O tipo dos itens é inline pra manter o componente coeso.
  return (
    <div className={cn('rounded-xl p-5', tom)}>
      <div className="flex items-center gap-2 font-display font-extrabold uppercase">
        {icone}
        {rotulo}
      </div>
      <ul className="mt-4 space-y-2.5">
        {itens.map((i, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 shrink-0">{i.ic}</span>
            <span>{i.txt}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Modos() {
  return (
    <section className="bg-branco py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-widest font-semibold text-vermelho">Modos de operação</span>
          <h2 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight leading-tight">
            Funciona com ou sem backend.
          </h2>
          <p className="mt-3 text-preto/70">
            A demo roda 100% no navegador. Pra produção real, pluga as env vars do Supabase e tudo passa a persistir lá — sem mudar uma linha de UI.
          </p>
        </div>
        <div className="mt-8 grid sm:grid-cols-2 gap-3">
          {MODOS_OPERACAO.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.titulo} className="rounded-xl border border-sebo p-5 bg-branco">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-vermelho" />
                  <h3 className="font-display font-bold uppercase">{m.titulo}</h3>
                </div>
                <p className="mt-3 text-sm text-preto/70">{m.texto}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function StackSecao() {
  return (
    <section className="bg-sebo-claro py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="max-w-3xl">
          <span className="text-xs uppercase tracking-widest font-semibold text-vermelho">Stack</span>
          <h2 className="mt-2 font-display font-extrabold text-3xl sm:text-4xl uppercase tracking-tight leading-tight">
            Construído pra durar.
          </h2>
        </div>
        <ul className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {STACK.map((s) => (
            <li key={s.nome} className="rounded-lg bg-branco border border-sebo px-4 py-3 flex items-baseline justify-between gap-3">
              <span className="font-mono font-bold">{s.nome}</span>
              <span className="text-xs text-preto/60">{s.papel}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function CTAFinal() {
  return (
    <section className="bg-vermelho text-branco py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="font-display font-extrabold text-3xl sm:text-5xl uppercase tracking-tight leading-[1.05]">
          Quatro minutos pra demonstrar.<br />
          Uma vida de cliente fiel depois.
        </h2>
        <p className="mt-4 text-branco/85 max-w-2xl mx-auto">
          A demo é navegável. Abre a bancada no notebook e o celular na mão. O pedido aparece com som, o cupom sai sozinho, e a lista de quem não volta há 30 dias já está no painel.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/loja"
            className="h-14 px-6 rounded-lg bg-amarelo text-preto font-extrabold uppercase tracking-wide inline-flex items-center gap-2 hover:bg-amarelo/90"
          >
            <ShoppingBag className="w-5 h-5" /> Começar pela loja
          </Link>
          <Link
            href="/bancada"
            className="h-14 px-6 rounded-lg border border-branco/40 text-branco font-bold uppercase tracking-wide inline-flex items-center gap-2 hover:bg-branco/10"
          >
            <Monitor className="w-5 h-5" /> Abrir a bancada
          </Link>
        </div>
        <Link
          href="/"
          className="mt-5 inline-block text-sm text-branco/80 underline underline-offset-4 hover:text-branco"
        >
          Ou ver todas as áreas no índice →
        </Link>
      </div>
    </section>
  );
}
