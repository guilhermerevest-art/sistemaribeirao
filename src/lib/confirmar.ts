// Helper que troca o `confirm()` nativo do browser por um toast
// interativo do Sonner. Mantém a mesma API (`await confirmar(...)`)
// então quem chama não precisa mudar nada além de tirar o `if`.

import { toast } from 'sonner';

export async function confirmar(texto: string, opts?: { ok?: string; cancelar?: string }): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    let resolvido = false;
    const fechar = (valor: boolean) => {
      if (resolvido) return;
      resolvido = true;
      resolve(valor);
    };
    const id = toast(texto, {
      duration: Infinity,
      dismissible: true,
      action: {
        label: opts?.ok ?? 'Confirmar',
        onClick: () => {
          toast.dismiss(id);
          fechar(true);
        },
      },
      cancel: {
        label: opts?.cancelar ?? 'Cancelar',
        onClick: () => {
          toast.dismiss(id);
          fechar(false);
        },
      },
      onDismiss: () => fechar(false),
      onAutoClose: () => fechar(false),
    });
  });
}