"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CampoTexto } from "@/components/CampoTexto";
import { chamarApi, ErroApi } from "@/lib/api-cliente";

export function FormularioAuth({ modo, voltar }: { modo: "entrar" | "cadastro"; voltar: string }) {
  const router = useRouter();
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const cadastro = modo === "cadastro";

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEnviando(true);
    setErros({});
    setErroGeral(null);
    const dados = Object.fromEntries(new FormData(e.currentTarget));
    try {
      await chamarApi(cadastro ? "/api/auth/cadastro" : "/api/auth/entrar", { corpo: dados });
      router.push(voltar);
      router.refresh();
    } catch (err) {
      if (err instanceof ErroApi) {
        setErros(err.campos);
        setErroGeral(err.message);
      } else {
        setErroGeral("Não foi possível continuar. Tente novamente.");
      }
      setEnviando(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="cartao flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-black">{cadastro ? "Criar conta" : "Entrar"}</h1>
          <p className="text-stone-600">
            {cadastro ? "Leva menos de um minuto." : "Acesse para finalizar compras e acompanhar pedidos."}
          </p>
        </div>
        {erroGeral && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">{erroGeral}</p>
        )}
        <form onSubmit={enviar} className="flex flex-col gap-3" noValidate>
          {cadastro && <CampoTexto nome="nome" rotulo="Nome completo" autoComplete="name" required erro={erros.nome} />}
          <CampoTexto nome="email" rotulo="E-mail" type="email" autoComplete="email" required erro={erros.email} />
          {cadastro && (
            <CampoTexto nome="telefone" rotulo="Celular (opcional)" type="tel" autoComplete="tel" placeholder="(11) 91234-5678" erro={erros.telefone} dica="Usado apenas para avisos sobre a entrega." />
          )}
          <CampoTexto
            nome="senha"
            rotulo="Senha"
            type="password"
            autoComplete={cadastro ? "new-password" : "current-password"}
            required
            erro={erros.senha}
            dica={cadastro ? "Mínimo de 8 caracteres, com letras e números." : undefined}
          />
          {cadastro && (
            <CampoTexto nome="confirmacaoSenha" rotulo="Confirme a senha" type="password" autoComplete="new-password" required erro={erros.confirmacaoSenha} />
          )}
          <button className="btn-primario mt-2" disabled={enviando}>
            {enviando ? "Aguarde…" : cadastro ? "Criar conta" : "Entrar"}
          </button>
        </form>
        <p className="text-center text-sm">
          {cadastro ? "Já tem conta? " : "Ainda não tem conta? "}
          <Link href={`${cadastro ? "/entrar" : "/cadastro"}?voltar=${encodeURIComponent(voltar)}`} className="font-bold text-marca-700 hover:underline">
            {cadastro ? "Entrar" : "Cadastre-se"}
          </Link>
        </p>
      </div>
    </div>
  );
}
