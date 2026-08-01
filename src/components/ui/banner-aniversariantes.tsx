'use client';

// Banner no topo do /painel: mostra clientes que fazem aniversário
// hoje (ou nos próximos N dias se ninguém faz hoje). Cada um tem
// botão "Enviar parabéns" que abre o wa.me com mensagem pronta.

import { useStore } from '@/lib/store';
import { clientesAniversariantes, mensagemAniversario } from '@/lib/aniversario';
import { Cake, MessageCircle } from 'lucide-react';

export function BannerAniversariantes() {
  const clientes = useStore((s) => s.clientes);
  // Hoje + janela de 7 dias pra dar densidade (em açougue pequeno
  // pode não ter ninguém hoje, mas tem alguém na semana).
  const hoje = clientesAniversariantes(clientes, new Date(), 0);
  const proximos = clientesAniversariantes(clientes, new Date(), 7);
  // Se não tem ninguém hoje mas tem na semana, lista todos.
  const lista = hoje.length > 0 ? hoje : proximos;
  if (lista.length === 0) return null;

  const urlLoja = typeof window !== 'undefined' ? `${window.location.origin}/loja` : '/loja';
  const isHoje = hoje.length > 0;

  return (
    <section className={`rounded-xl border-2 p-4 ${isHoje ? 'border-amarelo bg-amarelo/10' : 'border-cinza-claro bg-branco'}`}>
      <div className="flex items-center gap-2 mb-3">
        <Cake className="w-5 h-5 text-amarelo" />
        <div className="font-display font-extrabold uppercase">
          {isHoje
            ? `${lista.length === 1 ? 'Aniversariante do dia' : `${lista.length} aniversariantes hoje`}`
            : 'Aniversariantes da semana'}
        </div>
      </div>
      <ul className="grid sm:grid-cols-2 gap-2">
        {lista.map((a) => {
          const isHojeItem = new Date(a.data).toDateString() === new Date().toDateString();
          return (
            <li
              key={a.cliente.id}
              className="flex items-center gap-3 rounded-lg bg-branco border border-sebo p-3"
            >
              <div className="w-10 h-10 rounded-full bg-amarelo text-preto grid place-items-center font-display font-bold shrink-0">
                {a.cliente.nome.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold uppercase text-sm truncate">{a.cliente.nome}</div>
                <div className="text-xs text-preto/60">
                  {isHojeItem
                    ? `Faz ${a.idade} anos hoje 🎉`
                    : `Faz ${a.idade} anos em ${new Date(a.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}`}
                </div>
              </div>
              <a
                href={`https://wa.me/55${a.cliente.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  mensagemAniversario({ nomeCliente: a.cliente.nome, idade: a.idade, urlLoja }),
                )}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 w-10 h-10 grid place-items-center rounded-md bg-verde-fiel text-branco hover:bg-verde-fiel/90"
                aria-label={`Enviar parabéns para ${a.cliente.nome}`}
                title="Mandar parabéns pelo WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
