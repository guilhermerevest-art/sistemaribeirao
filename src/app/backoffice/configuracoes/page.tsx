'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { AdminHeader } from '@/components/ui/admin-header';
import { Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Faixa {
  pontos: number;
  reais: number;
}

function mapaParaFaixas(mapa: Record<string, number>): Faixa[] {
  return Object.entries(mapa)
    .map(([pontos, reais]) => ({ pontos: Number(pontos), reais }))
    .sort((a, b) => a.pontos - b.pontos);
}

export default function BackofficeConfiguracoesPage() {
  const ptsParaReais = useStore((s) => s.ptsParaReais);
  const setPontosParaReais = useStore((s) => s.setPontosParaReais);

  const [faixas, setFaixas] = useState<Faixa[]>(() => mapaParaFaixas(ptsParaReais));
  const [novoPontos, setNovoPontos] = useState(100);
  const [novoReais, setNovoReais] = useState(1);

  const adicionarFaixa = () => {
    if (novoPontos <= 0 || novoReais <= 0) return;
    setFaixas((prev) => {
      const semDuplicata = prev.filter((f) => f.pontos !== novoPontos);
      return [...semDuplicata, { pontos: novoPontos, reais: novoReais }].sort((a, b) => a.pontos - b.pontos);
    });
    setNovoPontos(100);
    setNovoReais(1);
  };

  const removerFaixa = (pontos: number) => {
    setFaixas((prev) => prev.filter((f) => f.pontos !== pontos));
  };

  const salvar = () => {
    if (faixas.length === 0) {
      toast.error('Deixe pelo menos uma faixa de pontos');
      return;
    }
    const mapa: Record<string, number> = {};
    for (const f of faixas) mapa[String(f.pontos)] = f.reais;
    void setPontosParaReais(mapa);
    toast.success('Tabela de pontos salva');
  };

  return (
    <div className="min-h-screen bg-papel pb-8">
      <AdminHeader titulo="Backoffice · Configurações" voltarPara="/backoffice" />

      <main className="mx-auto max-w-2xl px-4 py-4 space-y-4">
        <section className="bg-azulejo border border-sebo rounded-xl p-4">
          <div className="font-display font-bold uppercase text-sm">Pontos por real</div>
          <p className="text-xs text-carvao/60 mt-1">
            Define quanto o cliente pode descontar em reais no checkout trocando pontos. Ex: 500 pontos = R$ 5,00 de desconto.
          </p>

          <ul className="mt-3 space-y-2">
            {faixas.map((f) => (
              <li key={f.pontos} className="flex items-center gap-2 bg-sebo-claro rounded-md px-3 py-2 text-sm">
                <span className="font-mono font-bold flex-1">{f.pontos} pontos</span>
                <span className="text-carvao/60">=</span>
                <span className="font-mono font-bold text-brasa">R$ {f.reais.toFixed(2).replace('.', ',')}</span>
                <button onClick={() => removerFaixa(f.pontos)} className="text-vermelho-risco ml-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
            {faixas.length === 0 && (
              <li className="text-center text-carvao/60 text-sm py-4">Nenhuma faixa cadastrada.</li>
            )}
          </ul>

          <div className="mt-3 flex items-end gap-2">
            <label className="block flex-1">
              <span className="text-xs text-carvao/70">Pontos</span>
              <input type="number" step="50" min="1" value={novoPontos} onChange={(e) => setNovoPontos(Number(e.target.value))} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono text-sm" />
            </label>
            <label className="block flex-1">
              <span className="text-xs text-carvao/70">Vale R$</span>
              <input type="number" step="0.5" min="0.5" value={novoReais} onChange={(e) => setNovoReais(Number(e.target.value))} className="mt-1 w-full h-11 rounded-md border border-sebo px-3 font-mono text-sm" />
            </label>
            <button onClick={adicionarFaixa} className="h-11 px-3 rounded-md bg-carvao text-papel text-sm font-semibold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>

          <Button size="lg" full className="mt-4" onClick={salvar}>
            <Save className="w-4 h-4 mr-1" /> Salvar tabela
          </Button>
        </section>
      </main>
    </div>
  );
}
