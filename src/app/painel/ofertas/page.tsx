import { redirect } from 'next/navigation';

// A gestão de ofertas foi consolidada em /backoffice/promocoes.
export default function Page() {
  redirect('/backoffice/promocoes');
}
