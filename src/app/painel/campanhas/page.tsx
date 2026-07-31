'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { brl, formatarData, formatarTelefone } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MessageCircle, Plus, X, Save, Power, Send, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import type { Campanha, Cliente, Frequencia, Pedido, PublicoAlvo } from '@/lib/types';

function info(c: Cliente, pedidos: Pedido[]) {
  const ped = pedidos.filter((p) => p.clienteId === c.id);
  ped.sort((a, b) => (a.criadoEm < b.criadoEm ? 1 : -1));
  const ultimo = ped[0]?.criadoEm;
  const dias = ultimo ? Math.floor((Date.now() - new Date(ultimo).getTime()) / 86400000) : 9999;
  const noventaAtras = new Date();
  noventaAtras.setDate(noventaAtras.getDate() - 90);
  const ped90 = ped.filter((p) => new Date(p.criadoEm) >= noventaAtras).length;
  const diasCadastro = Math.floor((Date.now() - new Date(c.criadoEm).getTime()) / 86400000);
  let g: Frequencia = 'ocasional';
  if (dias >= 60) g = 'inativo';
  else if (dias >= 31) g = 'em_risco';
  else if (ped90 >= 6 && dias <= 15) g = 'fiel';
  else if (ped90 <= 1 && diasCadastro <= 30) g = 'novo';
  return { dias, g };
}

const PUBLICO_LABEL: Record<PublicoAlvo, string> = {
  novo: 'Novos',
  fiel: 'Fiéis',
  ocasional: 'Ocasionais',
  em_risco: 'Em risco',
  inativo: 'Inativos',
  todos: 'Todos os clientes',
  custom: 'Personalizado',
};

function destinatariosPara(publico: PublicoAlvo, clientes: Cliente[], pedidos: Pedido[]) {
  const aceitam = clientes.filter((c) => c.aceitaWhatsapp);
  if (publico === 'todos') return aceitam;
  if (publico === 'custom') return [];
  return aceitam.filter((c) => info(c, pedidos).g === publico);
}

function resolverMensagem(template: string, c: Cliente, dias: number): string {
  return template
    .replaceAll('{{nome}}', c.nome.split(' ')[0])
    .replaceAll('{{saldo}}', brl(c.saldoCashback))
    .replaceAll('{{dias}}', dias < 9999 ? String(dias) : '—');
}

export default function CampanhasPage() {
  const clientes = useStore((s) => s.clientes);
  const pedidos = useStore((s) => s.pedidos);
  const campanhas = useStore((s) => s.campanhas);
  const criar = useStore((s) => s.criarCampanha);
  const desativar = useStore((s) => s.desativarCampanha);
  const marcarEnviada = useStore((s) => s.marcarCampanhaEnviada);

  const [modalAberto, setModalAberto] = useState(false);
  const [expandida, setExpandida] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-papel pb-8">
      <header className="bg-carvao text-papel sticky top-0 z-30">
        <div className="mx-auto max-w-4xl px-3 sm:px-4 py-3 flex items-center gap-2 sm:gap-3">
          <Link href="/painel" aria-label="Voltar" className="shrink-0 grid place-items-center w-10 h-10 -ml-1.5 rounded-md hover:bg-papel/10">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="font-display font-extrabold text-base sm:text-xl uppercase flex-1">Campanhas</div>
          <Button onClick={() => setModalAberto(true)} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Nova
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-4 sm:py-6 space-y-3">
        <p className="text-sm text-carvao/70">
          Crie uma campanha, veja quantos clientes ela alcança, e gere os links do WhatsApp pra cada um.
        </p>

        {campanhas.length === 0 && (
          <div className="p-10 text-center text-carvao/60 bg-azulejo border border-sebo rounded-xl">Nenhuma campanha criada ainda.</div>
        )}

        {campanhas.map((camp) => {
          const destinatarios = destinatariosPara(camp.publicoAlvo, clientes, pedidos);
          const aberta = expandida === camp.id;
          return (
            <section key={camp.id} className="bg-azulejo border border-sebo rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandida(aberta ? null : camp.id)}
                className="w-full p-4 flex items-start gap-3 text-left"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-display font-bold uppercase text-sm truncate">{camp.titulo}</div>
                    {!camp.ativo && <span className="text-[10px] px-2 py-0.5 rounded-full bg-sebo text-carvao">Inativa</span>}
                  </div>
                  <div className="text-xs text-carvao/60 mt-0.5">
                    {PUBLICO_LABEL[camp.publicoAlvo]} · {destinatarios.length} destinatário{destinatarios.length === 1 ? '' : 's'}
                  </div>
                  <div className="text-xs text-carvao/60 mt-0.5">
                    {camp.dataEnvio
                      ? `Enviada em ${formatarData(camp.dataEnvio)} pra ${camp.totalDestinatarios} pessoas`
                      : 'Ainda não enviada'}
                  </div>
                </div>
                <ChevronDown className={`w-5 h-5 text-carvao/50 shrink-0 transition-transform ${aberta ? 'rotate-180' : ''}`} />
              </button>

              {aberta && (
                <div className="border-t border-sebo p-4 space-y-3">
                  <div className="text-xs text-carvao/70 italic bg-sebo-claro rounded-md p-2">{camp.mensagemTemplate}</div>

                  <ul className="space-y-1 max-h-64 overflow-auto">
                    {destinatarios.map((c) => {
                      const i = info(c, pedidos);
                      const msg = resolverMensagem(camp.mensagemTemplate, c, i.dias);
                      const tel = c.telefone.replace(/\D/g, '');
                      return (
                        <li key={c.id} className="flex items-center gap-2 text-sm py-1">
                          <span className="flex-1 min-w-0 truncate">{c.nome}</span>
                          <span className="font-mono text-xs text-carvao/60 hidden sm:inline shrink-0">{formatarTelefone(c.telefone)}</span>
                          <a href={`https://wa.me/55${tel}?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer" className="shrink-0">
                            <Button variant="ghost" size="sm" className="w-9 h-9 p-0"><MessageCircle className="w-4 h-4" /></Button>
                          </a>
                        </li>
                      );
                    })}
                    {destinatarios.length === 0 && (
                      <li className="text-xs text-carvao/60 py-2">Nenhum cliente nesse grupo agora.</li>
                    )}
                  </ul>

                  <div className="flex gap-2 pt-2 border-t border-sebo">
                    <button
                      onClick={() => {
                        void marcarEnviada(camp.id, destinatarios.length);
                        toast.success('Campanha marcada como enviada');
                      }}
                      disabled={destinatarios.length === 0}
                      className="flex-1 h-10 rounded-md bg-carvao text-papel text-xs font-semibold flex items-center justify-center gap-1 disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" /> Marcar como enviada
                    </button>
                    {camp.ativo && (
                      <button
                        onClick={() => { void desativar(camp.id); toast.success('Campanha desativada'); }}
                        className="h-10 px-3 rounded-md bg-sebo-claro text-carvao text-xs font-semibold flex items-center justify-center gap-1"
                      >
                        <Power className="w-3.5 h-3.5" /> Desativar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>
          );
        })}
      </main>

      {modalAberto && (
        <ModalCampanha
          onClose={() => setModalAberto(false)}
          onSalvar={(dados) => {
            void criar({
              id: `campanha-${Date.now()}`,
              dataCriacao: new Date().toISOString(),
              totalDestinatarios: 0,
              ativo: true,
              ...dados,
            });
            toast.success('Campanha criada');
            setModalAberto(false);
          }}
        />
      )}
    </div>
  );
}

function ModalCampanha({
  onClose,
  onSalvar,
}: {
  onClose: () => void;
  onSalvar: (dados: Omit<Campanha, 'id' | 'dataCriacao' | 'totalDestinatarios' | 'ativo'>) => void;
}) {
  const clientes = useStore((s) => s.clientes);
  const pedidos = useStore((s) => s.pedidos);
  const [titulo, setTitulo] = useState('');
  const [mensagemTemplate, setMensagemTemplate] = useState(
    'Oi {{nome}}, aqui é do Empório Ribeirão. Faz {{dias}} dias que você não aparece e você tem {{saldo}} de cashback pra usar. Quer que eu separe alguma coisa?',
  );
  const [publicoAlvo, setPublicoAlvo] = useState<PublicoAlvo>('em_risco');

  const previaCount = useMemo(
    () => destinatariosPara(publicoAlvo, clientes, pedidos).length,
    [publicoAlvo, clientes, pedidos],
  );

  return (
    <div className="fixed inset-0 z-50 bg-carvao/60 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-azulejo rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg shadow-xl max-h-[92vh] overflow-auto">
        <div className="p-4 sm:p-5 border-b border-sebo flex items-center gap-3 sticky top-0 bg-azulejo z-10">
          <div className="font-display font-extrabold uppercase">Nova campanha</div>
          <button className="ml-auto p-1" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <label className="block">
            <span className="text-xs text-carvao/70">Título (interno)</span>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Reativação de julho" className="mt-1 w-full h-12 rounded-md border border-sebo px-3" />
          </label>

          <label className="block">
            <span className="text-xs text-carvao/70">Público</span>
            <select value={publicoAlvo} onChange={(e) => setPublicoAlvo(e.target.value as PublicoAlvo)} className="mt-1 w-full h-12 rounded-md border border-sebo px-3">
              {(['em_risco', 'inativo', 'fiel', 'novo', 'ocasional', 'todos'] as PublicoAlvo[]).map((p) => (
                <option key={p} value={p}>{PUBLICO_LABEL[p]}</option>
              ))}
            </select>
            <div className="text-xs text-carvao/60 mt-1">{previaCount} cliente{previaCount === 1 ? '' : 's'} nesse grupo agora.</div>
          </label>

          <label className="block">
            <span className="text-xs text-carvao/70">Mensagem</span>
            <textarea
              value={mensagemTemplate}
              onChange={(e) => setMensagemTemplate(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-sebo px-3 py-2 text-sm"
            />
            <div className="text-[11px] text-carvao/60 mt-1">
              Use <code className="font-mono">{'{{nome}}'}</code>, <code className="font-mono">{'{{dias}}'}</code> e <code className="font-mono">{'{{saldo}}'}</code> — trocados por cliente na hora de gerar o link.
            </div>
          </label>
        </div>

        <div className="p-4 sm:p-5 border-t border-sebo flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sticky bottom-0 bg-azulejo">
          <Button variant="ghost" onClick={onClose} size="lg">Cancelar</Button>
          <Button
            size="lg"
            onClick={() => {
              if (!titulo.trim() || !mensagemTemplate.trim()) {
                toast.error('Preencha título e mensagem');
                return;
              }
              onSalvar({ titulo: titulo.trim(), mensagemTemplate: mensagemTemplate.trim(), publicoAlvo });
            }}
          >
            <Save className="w-4 h-4 mr-1" /> Criar campanha
          </Button>
        </div>
      </div>
    </div>
  );
}
