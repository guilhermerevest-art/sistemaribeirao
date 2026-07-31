'use client';

import { useEffect, useRef, useState } from 'react';
import { useStore } from '@/lib/store';
import { lerCriadoLocalmente } from '@/lib/sync-flags';
import { tocarBipNovoPedido } from '@/lib/som';

// Sincronia entre abas: polling de 2s comparando o último pedido novo.
// Pedidos novos que aparecem no state (vindos de outra aba ou outro
// dispositivo) disparam recarregarPedidos() pra puxar a lista nova.
//
// Criações feitas por *esta* aba são registradas via
// `marcarCriadoLocalmente` numa flag de window — assim o polling não
// dispara um recarregamento em loop logo depois do criarPedido
// atualizar o state local.
export function useSyncEntreAbas() {
  const carregado = useRef(false);
  const ultimoId = useRef<string | null>(null);

  useEffect(() => {
    function checar() {
      const s = useStore.getState();
      const novo = s.pedidos[0]?.id ?? null;
      const criadoLocal = lerCriadoLocalmente();
      // Se o pedido no topo é um dos que esta aba acabou de criar,
      // sincroniza o últimoId mas não dispara recarregamento.
      if (novo && criadoLocal && novo === criadoLocal.id) {
        ultimoId.current = novo;
        carregado.current = true;
        return;
      }
      if (carregado.current && novo !== ultimoId.current) {
        // Outro lugar inseriu pedido; recarrega pra ter dados frescos.
        void s.recarregarPedidos();
      }
      ultimoId.current = novo;
      carregado.current = true;
    }
    const i = setInterval(checar, 2000);
    window.addEventListener('storage', checar);
    return () => {
      clearInterval(i);
      window.removeEventListener('storage', checar);
    };
  }, []);
}

// Avanço automático de status (mock para a demo).
//
// Tem que ser seguro com várias abas abertas ao mesmo tempo: se
// `/bancada` e `/cozinha` rodam em paralelo, qualquer uma delas pode
// observar o pedido como "novo" há mais de 90s e tentar promover. Sem
// coordenação, cada aba dispara a própria atualização e elas se
// atropelam. A regra é: cada aba sorteia um "dono" do pedido por
// compra de tempo e ignora pedidos que não são seus.
export function useAutoAvanco() {
  useEffect(() => {
    // Set persistente nesta aba (não em localStorage: outras abas
    // podem ter outro sortimento e tudo bem — o estado autoritativo é
    // o que está em s.pedidos, que é o que a checagem de status usa).
    const donosLocal = new Set<string>();

    const t = setInterval(() => {
      const s = useStore.getState();
      const agora = Date.now();
      const atualizar = s.atualizarStatusPedido;
      for (const p of s.pedidos) {
        if (p.status === 'novo') {
          const idade = agora - new Date(p.criadoEm).getTime();
          if (idade >= 90_000 && !donosLocal.has(p.id)) {
            donosLocal.add(p.id);
            void atualizar(p.id, 'preparando');
          }
        } else if (p.status === 'preparando') {
          const idade = agora - new Date(p.criadoEm).getTime();
          if (idade >= 180_000 && !donosLocal.has(p.id)) {
            donosLocal.add(p.id);
            void atualizar(p.id, 'pronto');
          }
        } else if (p.status === 'pronto' || p.status === 'entregue' || p.status === 'cancelado') {
          donosLocal.delete(p.id);
        }
      }
    }, 5000);
    return () => clearInterval(t);
  }, []);
}

// Fila de impressão automática: detecta pedidos "novo" que ainda não
// existiam quando o hook montou (ou seja, chegaram depois) e devolve
// os ids para o componente <ImpressaoAutomatica /> imprimir.
function useFilaImpressaoAutomatica(): { fila: string[]; concluir: (id: string) => void } {
  const pedidos = useStore((s) => s.pedidos);
  const impressaoAutomatica = useStore((s) => s.impressaoAutomatica);
  const somBancada = useStore((s) => s.somBancada);
  const conhecidos = useRef<Set<string> | null>(null);
  const [fila, setFila] = useState<string[]>([]);

  useEffect(() => {
    if (conhecidos.current === null) {
      // Primeira carga: registra o que já existe, sem imprimir nada.
      conhecidos.current = new Set(pedidos.map((p) => p.id));
      return;
    }
    const novos = pedidos.filter((p) => p.status === 'novo' && !conhecidos.current!.has(p.id));
    for (const p of pedidos) conhecidos.current.add(p.id);
    if (novos.length === 0) return;
    if (somBancada) tocarBipNovoPedido();
    if (impressaoAutomatica) {
      setFila((f) => [...f, ...novos.map((p) => p.id)]);
    }
  }, [pedidos, impressaoAutomatica, somBancada]);

  const concluir = (id: string) => setFila((f) => f.filter((x) => x !== id));

  return { fila, concluir };
}

function IframeImpressao({ pedidoId, onDone }: { pedidoId: string; onDone: (id: string) => void }) {
  useEffect(() => {
    // Segurança: se o aviso de "impresso" não chegar (ex: navegador sem
    // suporte a onafterprint), remove o iframe depois de um tempo.
    const t = setTimeout(() => onDone(pedidoId), 10_000);
    return () => clearTimeout(t);
  }, [pedidoId, onDone]);

  return (
    <iframe
      src={`/bancada/cupom/${pedidoId}?auto=1`}
      title={`Impressão automática do pedido ${pedidoId}`}
      aria-hidden
      style={{ position: 'fixed', left: -9999, top: 0, width: 320, height: 700, border: 0 }}
    />
  );
}

// Renderiza um iframe oculto por pedido novo, que se auto-imprime.
// Depende da impressora térmica estar configurada como padrão do
// Windows e do navegador rodar com a flag --kiosk-printing (ver README).
export function ImpressaoAutomatica() {
  const { fila, concluir } = useFilaImpressaoAutomatica();

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data?.tipo === 'ribeirao-cupom-impresso' && typeof e.data.pedidoId === 'string') {
        concluir(e.data.pedidoId);
      }
    }
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [concluir]);

  if (fila.length === 0) return null;

  return (
    <>
      {fila.map((id) => (
        <IframeImpressao key={id} pedidoId={id} onDone={concluir} />
      ))}
    </>
  );
}
