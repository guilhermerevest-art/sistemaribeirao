'use client';

// Error Boundary global: captura qualquer exception não-tratada
// nos client components e mostra tela amigável com botão "tentar
// de novo" em vez do "This page couldn't load" genérico do Chrome.

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  erro: Error | null;
  componentStack?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: null };

  static getDerivedStateFromError(erro: Error): State {
    return { erro };
  }

  componentDidCatch(erro: Error, info: { componentStack?: string }) {
    // eslint-disable-next-line no-console
    console.error(
      '[ErrorBoundary] message:',
      erro.message,
      '\n[ErrorBoundary] stack:',
      erro.stack,
      '\n[ErrorBoundary] componentStack:',
      info?.componentStack ?? '',
    );
    // Guarda o stack no state pra mostrar na tela.
    this.setState({ componentStack: info?.componentStack ?? '' });
  }

  handleRetry = () => {
    this.setState({ erro: null, componentStack: undefined });
  };

  handleReload = () => {
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <div className="min-h-screen grid place-items-center bg-papel p-6">
        <div className="max-w-md w-full rounded-2xl bg-branco border-2 border-vermelho-risco p-6 text-center">
          <div className="text-5xl mb-2">🥩</div>
          <h1 className="font-display font-extrabold text-xl uppercase">
            Algo deu errado
          </h1>
          <p className="mt-2 text-sm text-preto/70">
            Pode ser problema de cache local ou uma falha inesperada.
            Tente recarregar — se persistir, abra em janela anônima.
          </p>
          <div className="mt-5 flex gap-2 justify-center">
            <button
              onClick={this.handleRetry}
              className="h-11 px-4 rounded-md bg-cinza-claro text-preto font-bold uppercase text-sm hover:bg-sebo"
            >
              Tentar de novo
            </button>
            <button
              onClick={this.handleReload}
              className="h-11 px-4 rounded-md bg-vermelho text-branco font-bold uppercase text-sm hover:bg-vermelho/90"
            >
              Recarregar a página
            </button>
          </div>
          <div className="mt-4 text-[10px] text-preto/50 font-mono break-all">
            {this.state.erro.message}
          </div>
          {this.state.erro.stack && (
            <details className="mt-2 text-left">
              <summary className="text-[10px] text-preto/50 font-mono cursor-pointer">
                Stack técnico (pra debug)
              </summary>
              <pre className="mt-1 text-[9px] text-preto/40 font-mono break-all whitespace-pre-wrap max-h-48 overflow-auto">
                {this.state.erro.stack.slice(0, 1500)}
              </pre>
            </details>
          )}
          {this.state.componentStack && (
            <details className="mt-2 text-left">
              <summary className="text-[10px] text-preto/50 font-mono cursor-pointer">
                Component stack
              </summary>
              <pre className="mt-1 text-[9px] text-preto/40 font-mono break-all whitespace-pre-wrap max-h-48 overflow-auto">
                {this.state.componentStack.slice(0, 1500)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}
