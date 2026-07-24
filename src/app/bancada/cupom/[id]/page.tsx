'use client';

import { useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { brl, formatarData, formatarTelefone } from '@/lib/formato';
import { Button } from '@/components/ui/button';
import { Printer, ChevronLeft } from 'lucide-react';
import { nivelPorPontos } from '@/lib/regras';

export default function CupomPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const pedido = useStore((s) => s.pedidos.find((p) => p.id === params.id));
  const cliente = useStore((s) => s.clientes.find((c) => c.id === pedido?.clienteId));
  const produtos = useStore((s) => s.produtos);
  const marcarImpresso = useStore((s) => s.marcarImpresso);
  const jaImpresso = useRef(false);

  useEffect(() => {
    if (!pedido) router.push('/bancada');
  }, [pedido, router]);

  if (!pedido || !cliente) return null;

  const nivel = nivelPorPontos(cliente.pontosAcumuladoTotal);
  const labelNivel = { bronze: 'BRONZE', prata: 'PRATA', ouro: 'OURO' }[nivel];

  const linhas: { texto: string; bold?: boolean }[] = [];
  for (const it of pedido.itens) {
    const p = produtos.find((x) => x.id === it.produtoId);
    if (!p) continue;
    const peso = `${it.pesoKg.toFixed(3).replace('.', ',')} kg`;
    linhas.push({ texto: `${peso.padEnd(8, ' ')} ${p.nome.toUpperCase()}`, bold: true });
    for (const prep of it.preparos) {
      linhas.push({ texto: `          >> ${prep.toUpperCase()}`, bold: true });
    }
    if (it.observacao) {
      linhas.push({ texto: `          obs: ${it.observacao}` });
    }
    linhas.push({ texto: `${''.padEnd(20, ' ')}${brl(it.subtotal).padStart(12, ' ')}` });
  }

  const handlePrint = () => {
    if (jaImpresso.current) return;
    jaImpresso.current = true;
    marcarImpresso(pedido.id);
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
          <div className="text-base">AÇOUGUE RIBEIRÃO</div>
          <div>Rua .............., 000</div>
          <div>(34) 3333-0000</div>
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
        <div className="text-center">Obrigado pela preferencia</div>
      </div>
    </div>
  );
}
