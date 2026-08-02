'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { brl, formatarData, formatarHora } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { AdminHeader } from '@/components/ui/admin-header';
import { Plus, X, Save, Power, Pencil, Check } from 'lucide-react';
import { toast } from 'sonner';
import {
  DIAS_SEMANA,
  DIAS_UTEIS,
  FINS_DE_SEMANA,
  TODOS_OS_DIAS,
  type Oferta,
} from '@/lib/types';
import { proximaOcorrenciaOferta } from '@/lib/regras';

import { useNoIndex } from '@/components/ui/use-no-index';
function inicioDeHojeISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}
function daquiSeteDiasISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}
function daquiUmDiaISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(23, 59, 0, 0);
  return d.toISOString();
}

// Junta 0..6 em rótulo curto tipo "SEX·SÁB". Quando vazio, mostra
// "Todos os dias" pra deixar claro o comportamento legado.
function resumirDias(dias: number[] | undefined): string {
  if (!dias || dias.length === 0) return 'Todos os dias';
  if (dias.length === 7) return 'Todos os dias';
  const set = new Set(dias);
  if (set.size === 5 && DIAS_UTEIS.every((d) => set.has(d))) return 'Dias úteis';
  if (set.size === 2 && FINS_DE_SEMANA.every((d) => set.has(d))) return 'Fins de semana';
  return dias
    .slice()
    .sort((a, b) => a - b)
    .map((d) => DIAS_SEMANA[d].curto)
    .join('·');
}

export default function BackofficePromocoesPage() {
  useNoIndex();
  const ofertas = useStore((s) => s.ofertas);
  const produtos = useStore((s) => s.produtos);
  const criar = useStore((s) => s.criarOferta);
  const atualizar = useStore((s) => s.atualizarOferta);
  const alternar = useStore((s) => s.alternarAtivacaoOferta);

  const [modal, setModal] = useState<{ tipo: 'criar' | 'editar'; oferta?: Oferta } | null>(null);

  return (
    <div className="min-h-screen bg-papel pb-8">
      <AdminHeader
        titulo="Backoffice · Promoções"
        voltarPara="/backoffice"
        acoes={
          <Button onClick={() => setModal({ tipo: 'criar' })} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Nova
          </Button>
        }
      />

      <main className="mx-auto max-w-3xl px-4 py-4 space-y-2">
        <div className="text-xs text-carvao/60">{ofertas.length} promoção{ofertas.length === 1 ? '' : 'es'}</div>

        <ul className="space-y-2">
          {ofertas.map((o) => {
            const p = produtos.find((x) => x.id === o.produtoId);
            const total = o.quantidadeTotalKg;
            const pctVendido = total ? Math.min(100, (o.quantidadeVendidaKg / total) * 100) : 0;
            const resumoDias = resumirDias(o.diasSemana);
            const ehRecorrente = !!o.diasSemana && o.diasSemana.length > 0 && o.diasSemana.length < 7;
            return (
              <li key={o.id} className="bg-azulejo border border-sebo rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${o.tipo === 'relampago' ? 'bg-brasa text-papel' : 'bg-carvao text-papel'}`}>
                        {o.tipo === 'relampago' ? 'RELÂMPAGO' : 'SEMANA'}
                      </span>
                      <span className={`inline-block w-2.5 h-2.5 rounded-full ${o.ativa ? 'bg-verde-fiel' : 'bg-sebo'}`} title={o.ativa ? 'Ativa' : 'Inativa'} />
                      {o.comboId && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amarelo text-carvao">COMBO</span>
                      )}
                      {o.brindeProdutoId && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-verde-fiel text-papel">BRINDE</span>
                      )}
                      {ehRecorrente && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amarelo text-carvao">
                          Recorrente · {resumoDias}
                        </span>
                      )}
                    </div>
                    <div className="font-display font-bold uppercase truncate mt-1">{p?.nome}</div>
                    <div className="text-xs text-carvao/60 truncate">{o.chamada}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono line-through text-carvao/40 text-xs">{brl(o.precoDe)}</div>
                    <div className="font-mono font-bold text-brasa">{brl(o.precoPor)}</div>
                  </div>
                </div>

                <div className="text-[11px] text-carvao/60 mt-2">
                  {formatarData(o.inicioEm)} {formatarHora(o.inicioEm)} até {formatarData(o.fimEm)}
                </div>

                {total && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full bg-sebo overflow-hidden">
                      <div className="h-full bg-brasa" style={{ width: `${pctVendido}%` }} />
                    </div>
                    <div className="text-[11px] text-carvao/60 mt-0.5">{o.quantidadeVendidaKg.toFixed(1)} kg de {total} kg vendidos</div>
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setModal({ tipo: 'editar', oferta: o })}
                    className="h-11 rounded-md bg-sebo-claro text-carvao text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    <Pencil className="w-4 h-4" /> Editar
                  </button>
                  <button
                    onClick={() => {
                      const proximaAtiva = !o.ativa;
                      void alternar(o.id);
                      toast.success(proximaAtiva ? 'Promoção reativada' : 'Promoção desativada');
                    }}
                    className={`h-11 rounded-md text-xs font-semibold flex items-center justify-center gap-1 ${
                      o.ativa
                        ? 'bg-sebo-claro text-carvao'
                        : 'bg-verde-fiel text-papel'
                    }`}
                  >
                    {o.ativa ? (
                      <><Power className="w-4 h-4" /> Desativar</>
                    ) : (
                      <><Check className="w-4 h-4" /> Reativar</>
                    )}
                  </button>
                </div>
              </li>
            );
          })}
          {ofertas.length === 0 && (
            <li className="p-10 text-center text-carvao/60 bg-azulejo border border-sebo rounded-xl">Nenhuma promoção cadastrada.</li>
          )}
        </ul>
      </main>

      {modal && (
        <ModalPromocao
          oferta={modal.oferta}
          onClose={() => setModal(null)}
          onSalvar={(dados) => {
            if (modal.tipo === 'criar') {
              void criar({
                id: `o-${Date.now()}`,
                ...dados,
                quantidadeVendidaKg: 0,
                ativa: true,
              } as Oferta);
              toast.success('Promoção criada');
            } else if (modal.oferta) {
              void atualizar({ ...modal.oferta, ...dados });
              toast.success('Promoção atualizada');
            }
            setModal(null);
          }}
        />
      )}
    </div>
  );
}

function ModalPromocao({
  oferta,
  onClose,
  onSalvar,
}: {
  oferta?: Oferta;
  onClose: () => void;
  onSalvar: (dados: Omit<Oferta, 'id' | 'quantidadeVendidaKg' | 'ativa'>) => void;
}) {
  const produtos = useStore((s) => s.produtos);
  const combos = useStore((s) => s.combos);
  const [tipo, setTipo] = useState<'semana' | 'relampago'>(oferta?.tipo ?? 'semana');
  const [produtoId, setProdutoId] = useState(oferta?.produtoId ?? '');
  const [precoDe, setPrecoDe] = useState(oferta?.precoDe ?? 0);
  const [precoPor, setPrecoPor] = useState(oferta?.precoPor ?? 0);
  const [inicioEm, setInicioEm] = useState(oferta?.inicioEm ?? inicioDeHojeISO());
  const [fimEm, setFimEm] = useState(oferta?.fimEm ?? (tipo === 'semana' ? daquiSeteDiasISO() : daquiUmDiaISO()));
  const [limitePorCliente, setLimitePorCliente] = useState(oferta?.limitePorCliente ?? 2);
  const [quantidadeTotalKg, setQuantidadeTotalKg] = useState(oferta?.quantidadeTotalKg ?? 20);
  const [chamada, setChamada] = useState(oferta?.chamada ?? '');
  const [comboId, setComboId] = useState(oferta?.comboId ?? '');
  const [brindeProdutoId, setBrindeProdutoId] = useState(oferta?.brindeProdutoId ?? '');
  // `diasSemana` é a recorrência semanal. Quando vazio, vale todos os
  // dias do intervalo (legado). Quando preenchido, só nos dias marcados.
  const [diasSemana, setDiasSemana] = useState<number[]>(oferta?.diasSemana ?? []);

  const produto = produtos.find((p) => p.id === produtoId);
  const ehRecorrente = diasSemana.length > 0;
  const proxima = ehRecorrente
    ? proximaOcorrenciaOferta(
        {
          id: '',
          tipo,
          produtoId,
          precoDe,
          precoPor,
          inicioEm,
          fimEm,
          chamada: chamada || ' ',
          ativa: true,
          quantidadeVendidaKg: 0,
          diasSemana,
        },
        new Date(),
      )
    : null;

  function alternarDia(d: number) {
    setDiasSemana((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b),
    );
  }
  function setAtalho(dias: number[]) {
    setDiasSemana(dias.slice());
  }

  return (
    <div className="fixed inset-0 z-50 bg-carvao/60 flex items-end sm:items-center justify-center sm:p-4">
      <div className="bg-azulejo rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl shadow-xl max-h-[92vh] overflow-auto">
        <div className="p-4 sm:p-5 border-b border-sebo flex items-center gap-3 sticky top-0 bg-azulejo z-10">
          <div className="font-display font-extrabold uppercase">{oferta ? 'Editar promoção' : 'Nova promoção'}</div>
          <button className="ml-auto p-1" onClick={onClose}><X className="w-5 h-5" /></button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-carvao/70">Tipo</span>
              <select value={tipo} onChange={(e) => {
                const t = e.target.value as 'semana' | 'relampago';
                setTipo(t);
                setFimEm(t === 'semana' ? daquiSeteDiasISO() : daquiUmDiaISO());
              }} className="mt-1 w-full h-12 rounded-md border border-sebo px-3">
                <option value="semana">Semana</option>
                <option value="relampago">Relâmpago</option>
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Produto</span>
              <select value={produtoId} onChange={(e) => {
                setProdutoId(e.target.value);
                const p = produtos.find((x) => x.id === e.target.value);
                if (p) {
                  setPrecoDe(p.precoKg);
                  if (!precoPor) setPrecoPor(p.precoKg);
                }
              }} className="mt-1 w-full h-12 rounded-md border border-sebo px-3">
                <option value="">Selecione…</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Preço de (R$/kg)</span>
              <input type="number" step="0.10" inputMode="decimal" value={precoDe} onChange={(e) => setPrecoDe(Number(e.target.value))} className="mt-1 w-full h-12 rounded-md border border-sebo px-3 font-mono" />
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Preço por (R$/kg)</span>
              <input type="number" step="0.10" inputMode="decimal" value={precoPor} onChange={(e) => setPrecoPor(Number(e.target.value))} className="mt-1 w-full h-12 rounded-md border border-sebo px-3 font-mono" />
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Início</span>
              <input type="datetime-local" value={toInputDateTime(inicioEm)} onChange={(e) => setInicioEm(new Date(e.target.value).toISOString())} className="mt-1 w-full h-12 rounded-md border border-sebo px-3 font-mono" />
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Fim</span>
              <input type="datetime-local" value={toInputDateTime(fimEm)} onChange={(e) => setFimEm(new Date(e.target.value).toISOString())} className="mt-1 w-full h-12 rounded-md border border-sebo px-3 font-mono" />
            </label>
            {tipo === 'semana' ? (
              <label className="block">
                <span className="text-xs text-carvao/70">Limite por cliente (kg)</span>
                <input type="number" step="0.5" inputMode="decimal" value={limitePorCliente} onChange={(e) => setLimitePorCliente(Number(e.target.value))} className="mt-1 w-full h-12 rounded-md border border-sebo px-3 font-mono" />
              </label>
            ) : (
              <label className="block">
                <span className="text-xs text-carvao/70">Quantidade total (kg)</span>
                <input type="number" step="1" inputMode="decimal" value={quantidadeTotalKg} onChange={(e) => setQuantidadeTotalKg(Number(e.target.value))} className="mt-1 w-full h-12 rounded-md border border-sebo px-3 font-mono" />
              </label>
            )}
            <label className="block sm:col-span-2">
              <span className="text-xs text-carvao/70">Chamada</span>
              <input value={chamada} onChange={(e) => setChamada(e.target.value)} placeholder="Ex: Só hoje até acabar" className="mt-1 w-full h-12 rounded-md border border-sebo px-3" />
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Combo relacionado (opcional)</span>
              <select value={comboId} onChange={(e) => setComboId(e.target.value)} className="mt-1 w-full h-12 rounded-md border border-sebo px-3">
                <option value="">Nenhum</option>
                {combos.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-carvao/70">Brinde — produto grátis (opcional)</span>
              <select value={brindeProdutoId} onChange={(e) => setBrindeProdutoId(e.target.value)} className="mt-1 w-full h-12 rounded-md border border-sebo px-3">
                <option value="">Nenhum</option>
                {produtos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </label>
          </div>

          {tipo === 'semana' && (
            <fieldset className="border border-sebo rounded-md p-3">
              <legend className="text-xs text-carvao/70 px-1">Recorrência semanal</legend>
              <p className="text-[11px] text-carvao/60 mb-2">
                Sem dias marcados, vale todos os dias do período. Marque os dias em que a oferta
                deve aparecer — toda sexta e sábado, por exemplo.
              </p>
              <div className="flex items-center gap-1">
                {DIAS_SEMANA.map((d) => {
                  const ativo = diasSemana.includes(d.valor);
                  return (
                    <button
                      key={d.valor}
                      type="button"
                      onClick={() => alternarDia(d.valor)}
                      title={d.longo}
                      className={`w-10 h-10 rounded-md font-display font-bold text-sm border ${
                        ativo
                          ? 'bg-sangue text-papel border-sangue'
                          : 'bg-azulejo text-carvao border-sebo'
                      }`}
                    >
                      {d.curto}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setAtalho([])}
                  className="text-[11px] h-8 px-2 rounded-md bg-sebo-claro text-carvao"
                >
                  Limpar
                </button>
                <button
                  type="button"
                  onClick={() => setAtalho(DIAS_UTEIS)}
                  className="text-[11px] h-8 px-2 rounded-md bg-sebo-claro text-carvao"
                >
                  Dias úteis
                </button>
                <button
                  type="button"
                  onClick={() => setAtalho(FINS_DE_SEMANA)}
                  className="text-[11px] h-8 px-2 rounded-md bg-sebo-claro text-carvao"
                >
                  Fins de semana
                </button>
                <button
                  type="button"
                  onClick={() => setAtalho(TODOS_OS_DIAS)}
                  className="text-[11px] h-8 px-2 rounded-md bg-sebo-claro text-carvao"
                >
                  Todos
                </button>
              </div>
              {ehRecorrente && proxima && (
                <div className="mt-2 text-[11px] text-carvao/70 font-mono">
                  Próxima abertura: {formatarData(proxima.toISOString())}
                </div>
              )}
            </fieldset>
          )}

          {produto && precoPor > 0 && (
            <div className="border border-sebo rounded-md p-3 bg-sebo-claro text-sm">
              <div className="text-xs text-carvao/70 mb-2">Pré-visualização na loja</div>
              <div className="flex items-center gap-3">
                <img src={produto.imagem} alt="" className="w-14 h-14 rounded-md object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold uppercase text-sm truncate">{produto.nome}</div>
                  <div className="text-xs text-carvao/60 truncate">{chamada || 'Oferta especial'}</div>
                  {ehRecorrente && (
                    <div className="text-[10px] text-carvao/70 mt-0.5">Recorrente · {resumirDias(diasSemana)}</div>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono line-through text-carvao/50 text-xs">{brl(precoDe)}</div>
                  <div className="font-mono font-extrabold text-lg text-brasa">{brl(precoPor)}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-sebo flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sticky bottom-0 bg-azulejo">
          <Button variant="ghost" onClick={onClose} size="lg">Cancelar</Button>
          <Button
            size="lg"
            onClick={() => {
              if (!produtoId || !precoDe || !precoPor) { toast.error('Preencha produto, preço de e preço por'); return; }
              onSalvar({
                tipo,
                produtoId,
                precoDe,
                precoPor,
                inicioEm,
                fimEm,
                limitePorCliente: tipo === 'semana' ? limitePorCliente : undefined,
                quantidadeTotalKg: tipo === 'relampago' ? quantidadeTotalKg : undefined,
                chamada: chamada || (tipo === 'relampago' ? 'Só hoje até acabar' : 'Oferta da semana'),
                comboId: comboId || undefined,
                brindeProdutoId: brindeProdutoId || undefined,
                // Relâmpago não faz sentido com recorrência — só "semana".
                diasSemana: tipo === 'semana' ? diasSemana : undefined,
              });
            }}
          >
            <Save className="w-4 h-4 mr-1" /> Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

function toInputDateTime(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
