'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { brl, formatarData, formatarTelefone } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { Printer, ChevronLeft } from 'lucide-react';
import { nivelPorPontos } from '@/lib/regras';
import { useNoIndex } from '@/components/ui/use-no-index';
import { tocarBipImpressao } from '@/lib/som';

export default function CupomPage() {
  useNoIndex();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pedido = useStore((s) => s.pedidos.find((p) => p.id === params.id));
  const cliente = useStore((s) => s.clientes.find((c) => c.id === pedido?.clienteId));
  const produtos = useStore((s) => s.produtos);
  const combos = useStore((s) => s.combos);
  const ofertas = useStore((s) => s.ofertas);
  const marcarImpresso = useStore((s) => s.marcarImpresso);
  const estabelecimento = useStore((s) => s.estabelecimento);
  const jaImpresso = useRef(false);

  useEffect(() => {
    if (!pedido) router.push('/bancada');
  }, [pedido, router]);

  // Impressão automática: quando aberto com ?auto=1 (usado pela bancada
  // dentro de um iframe oculto), imprime sozinho e avisa a janela pai.
  useEffect(() => {
    if (!pedido) return;
    if (typeof window === 'undefined') return;
    const auto = new URLSearchParams(window.location.search).get('auto') === '1';
    if (!auto || jaImpresso.current) return;
    jaImpresso.current = true;
    void marcarImpresso(pedido.id);
    const avisarPai = () => {
      window.parent?.postMessage({ tipo: 'ribeirao-cupom-impresso', pedidoId: pedido.id }, '*');
    };
    // onafterprint roda quando o diálogo fecha (ou a impressão termina).
    // Aproveitamos pra tocar o bip de confirmação.
    window.onafterprint = () => {
      tocarBipImpressao();
      avisarPai();
    };
    // Pequeno atraso pra garantir que o layout terminou de pintar.
    const t = setTimeout(() => window.print(), 350);
    return () => clearTimeout(t);
  }, [pedido, marcarImpresso]);

  if (!pedido || !cliente) return null;

  const nivel = nivelPorPontos(cliente.pontosAcumuladoTotal);
  const labelNivel = { bronze: 'BRONZE', prata: 'PRATA', ouro: 'OURO' }[nivel];

  const linhas: { texto: string; bold?: boolean }[] = [];
  // Reservas fixas pra que produto e combo alinhem pelo mesmo grid:
  // 10 chars pra "X,XXX kg " (ou "Nx       "), espaço, nome, e o valor
  // cai na coluna 24 com 8 chars de largura.
  const RESERVA_QTD = 10;
  const COL_VALOR = 24;
  const LARGURA_VALOR = 8;
  for (const it of pedido.itens) {
    if (it.comboId) {
      const c = combos.find((x) => x.id === it.comboId);
      if (!c) continue;
      const qtd = `${it.pesoKg.toFixed(0)}x`;
      const nomeCombo = `COMBO ${c.nome}`.toUpperCase().slice(0, 32);
      linhas.push({ texto: `${qtd.padEnd(RESERVA_QTD, ' ')} ${nomeCombo}`, bold: true });
      linhas.push({
        texto: `${''.padEnd(COL_VALOR, ' ')}${brl(it.subtotal).padStart(LARGURA_VALOR, ' ')}`,
      });
      continue;
    }
    const p = produtos.find((x) => x.id === it.produtoId);
    if (!p) continue;
    const peso = `${it.pesoKg.toFixed(3).replace('.', ',')} kg`;
    linhas.push({ texto: `${peso.padEnd(RESERVA_QTD, ' ')} ${p.nome.toUpperCase()}`, bold: true });
    for (const prep of it.preparos) {
      linhas.push({ texto: `          >> ${prep.toUpperCase()}`, bold: true });
    }
    if (it.observacao) {
      linhas.push({ texto: `          obs: ${it.observacao}` });
    }
    linhas.push({
      texto: `${''.padEnd(COL_VALOR, ' ')}${brl(it.subtotal).padStart(LARGURA_VALOR, ' ')}`,
    });
    if (it.ofertaId) {
      const oferta = ofertas.find((o) => o.id === it.ofertaId);
      if (oferta?.brindeProdutoId) {
        const brinde = produtos.find((x) => x.id === oferta.brindeProdutoId);
        if (brinde) {
          linhas.push({ texto: `          >> BRINDE: ${brinde.nome.toUpperCase()}`, bold: true });
        }
      }
    }
  }

  const handlePrint = () => {
    if (jaImpresso.current) return;
    jaImpresso.current = true;
    void marcarImpresso(pedido.id);
    // Bipe de confirmação quando a impressora cuspir o cupom.
    window.onafterprint = () => tocarBipImpressao();
    window.print();
  };

  return (
    <div className="bg-papel min-h-screen p-4 print:p-0">
      <div className="no-print max-w-3xl mx-auto mb-4 flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="w-4 h-4" /> voltar
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-1" /> Imprimir
        </Button>
      </div>

      <div className="cupom shadow-xl print:shadow-none">
        <div className="text-center font-bold">
          <div className="text-base">{estabelecimento.nomeFantasia.toUpperCase()}</div>
          <div>{estabelecimento.endereco}</div>
          <div>{estabelecimento.telefone}</div>
          {estabelecimento.cnpj && <div className="text-[10px]">CNPJ: {estabelecimento.cnpj}</div>}
        </div>
        <div className="my-2 border-t border-dashed border-black" />
        <div className="flex justify-between">
          <span className="font-bold">PEDIDO Nº {pedido.id}</span>
          <span>{formatarData(pedido.criadoEm)} {pedido.criadoEm.slice(11, 16)}</span>
        </div>
        <div>CLIENTE: {cliente.nome.toUpperCase()}</div>
        <div>FONE:    {formatarTelefone(cliente.telefone)}</div>
        <div>TIPO:    {pedido.retirada === 'entrega' ? 'ENTREGA' : 'BALCAO'}</div>
        <div className="my-2 border-t border-dashed border-black" />
        {linhas.map((l, i) => (
          <div key={i} className={l.bold ? 'font-bold' : ''} style={{ whiteSpace: 'pre' }}>
            {l.texto}
          </div>
        ))}
        <div className="my-2 border-t border-dashed border-black" />
        <div className="flex justify-between"><span>SUBTOTAL</span><span>{brl(pedido.subtotal).padStart(12, ' ')}</span></div>
        {pedido.descontoOfertas > 0 && (
          <div className="flex justify-between"><span>DESCONTO OFERTA</span><span>-{brl(pedido.descontoOfertas).padStart(12, ' ')}</span></div>
        )}
        {pedido.cashbackUsado > 0 && (
          <div className="flex justify-between"><span>CASHBACK USADO</span><span>-{brl(pedido.cashbackUsado).padStart(12, ' ')}</span></div>
        )}
        {(pedido.descontoPontos ?? 0) > 0 && (
          <div className="flex justify-between"><span>PONTOS ({pedido.pontosUsados})</span><span>-{brl(pedido.descontoPontos ?? 0).padStart(12, ' ')}</span></div>
        )}
        <div className="flex justify-between"><span>ENTREGA</span><span>{(pedido.taxaEntrega === 0 ? 'GRATIS' : brl(pedido.taxaEntrega)).padStart(12, ' ')}</span></div>
        <div className="flex justify-between font-bold"><span>TOTAL</span><span>{brl(pedido.total).padStart(12, ' ')}</span></div>
        <div>PAGAMENTO: {pedido.pagamento === 'pix' ? 'PIX' : pedido.pagamento === 'cartao_entrega' ? 'CARTAO NA ENTREGA' : 'DINHEIRO'}</div>
        {pedido.observacaoGeral && (
          <div className="mt-1">OBS: {pedido.observacaoGeral}</div>
        )}
        <div className="my-2 border-t border-dashed border-black" />
        <div className="flex justify-between"><span>CASHBACK GERADO:</span><span>{brl(pedido.cashbackGerado).padStart(10, ' ')}</span></div>
        <div className="flex justify-between"><span>PONTOS:</span><span>{String(pedido.pontosGerados).padStart(10, ' ')}</span></div>
        <div className="flex justify-between"><span>SALDO ATUAL:</span><span>{brl(cliente.saldoCashback).padStart(10, ' ')}</span></div>
        <div className="flex justify-between"><span>NIVEL:</span><span>{labelNivel.padStart(10, ' ')}</span></div>
        <div className="my-2 border-t border-dashed border-black" />
        <div className="text-center">{estabelecimento.mensagemRodape || 'Obrigado pela preferencia'}</div>
      </div>
    </div>
  );
}
