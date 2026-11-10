"use client";

import Link from "next/link";

export default function ErroInesperado({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div role="alert" className="cartao mx-auto max-w-md text-center">
      <p className="text-5xl" aria-hidden>😕</p>
      <h1 className="mt-2 text-2xl font-black">Ops! Algo deu errado</h1>
      <p className="text-stone-600">Não conseguimos carregar esta página agora. Seu carrinho continua salvo.</p>
      <div className="mt-4 flex justify-center gap-2">
        <button type="button" onClick={reset} className="btn-primario">Tentar de novo</button>
        <Link href="/" className="btn-secundario">Ir para o cardápio</Link>
      </div>
    </div>
  );
}
