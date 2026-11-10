import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <div className="cartao mx-auto max-w-md text-center">
      <p className="text-5xl" aria-hidden>🧁❓</p>
      <h1 className="mt-2 text-2xl font-black">Página não encontrada</h1>
      <p className="text-stone-600">O endereço pode estar errado ou o item não existe mais.</p>
      <Link href="/" className="btn-primario mt-4">Voltar ao cardápio</Link>
    </div>
  );
}
