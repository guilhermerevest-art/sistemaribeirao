'use client';

import Link from 'next/link';
import { Store, ChefHat, LayoutDashboard, ShoppingCart, Users, Tag, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-papel">
      <header className="bg-carvao text-papel p-6">
        <div className="mx-auto max-w-5xl flex items-center gap-3">
          <div className="w-12 h-12 rounded-md bg-sangue grid place-items-center font-display font-extrabold text-2xl">R</div>
          <div>
            <div className="font-display font-extrabold text-2xl uppercase">Empório Ribeirão</div>
            <div className="text-papel/60 text-sm">Sistema de pedidos e fidelidade</div>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-8">
        <div className="font-display font-extrabold text-2xl uppercase mb-1">Acessos rápidos</div>
        <p className="text-sm text-carvao/70 mb-6">Cada área é uma porta separada. Use o link certo para cada tela.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <CartaoAcesso
            href="/loja"
            icon={<Store />}
            titulo="Loja / Cardápio"
            descricao="Vitrine, carrinho e checkout para o cliente."
            tom="sangue"
          />
          <CartaoAcesso
            href="/cozinha"
            icon={<ChefHat />}
            titulo="Cozinha"
            descricao="Pedidos em preparo, fila com timer e botão de pronto."
            tom="brasa"
          />
          <CartaoAcesso
            href="/bancada"
            icon={<ShoppingCart />}
            titulo="Bancada / KDS"
            descricao="Fila de pedidos no balcão, impressão de cupom."
            tom="carvao"
          />
          <CartaoAcesso
            href="/painel"
            icon={<BarChart3 />}
            titulo="Painel do Dono"
            descricao="KPIs do dia, frequência dos clientes, WhatsApp."
            tom="carvao"
          />
          <CartaoAcesso
            href="/backoffice"
            icon={<LayoutDashboard />}
            titulo="Backoffice"
            descricao="Cadastros, gestão de pedidos e promoções."
            tom="sangue"
          />
          <CartaoAcesso
            href="/minha-conta"
            icon={<Users />}
            titulo="Minha Conta"
            descricao="Espaço do cliente identificado."
            tom="carvao"
          />
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-4 pb-8 text-xs text-carvao/50 text-center">
        Mock navegável para demonstração. Dados persistidos em localStorage.
      </footer>
    </main>
  );
}

function CartaoAcesso({
  href,
  icon,
  titulo,
  descricao,
  tom,
}: {
  href: string;
  icon: React.ReactNode;
  titulo: string;
  descricao: string;
  tom: 'sangue' | 'carvao' | 'brasa';
}) {
  const tomClass: Record<typeof tom, string> = {
    sangue: 'bg-sangue',
    brasa: 'bg-brasa',
    carvao: 'bg-carvao',
  };
  return (
    <Link
      href={href}
      className="group bg-azulejo border border-sebo rounded-xl p-5 hover:shadow-md transition-shadow flex flex-col gap-3"
    >
      <div className={`w-12 h-12 rounded-md ${tomClass[tom]} text-papel grid place-items-center`}>
        {icon}
      </div>
      <div>
        <div className="font-display font-extrabold uppercase text-lg">{titulo}</div>
        <div className="text-sm text-carvao/70 mt-1">{descricao}</div>
      </div>
      <div className="text-xs text-brasa font-semibold mt-auto">Entrar →</div>
    </Link>
  );
}
