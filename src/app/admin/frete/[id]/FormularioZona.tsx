"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CampoTexto } from "@/components/CampoTexto";
import { useCarrinho } from "@/components/CarrinhoProvider";
import { chamarApi, ErroApi } from "@/lib/api-cliente";
import { reaisParaCentavos } from "@/models/regras/dinheiro";

interface Zona {
  id: number;
  nome: string;
  cepInicial: string;
  cepFinal: string;
  valorCentavos: number;
  freteGratisAPartirCentavos: number | null;
  prazoHoras: number;
  ativo: boolean;
}

const reais = (c: number | null | undefined) => (c === null || c === undefined ? "" : (c / 100).toFixed(2).replace(".", ","));
const cep = (c?: string) => (c ? `${c.slice(0, 5)}-${c.slice(5)}` : "");

export function FormularioZona({ zona }: { zona: Zona | null }) {
  const router = useRouter();
  const { avisar } = useCarrinho();
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const valor = reaisParaCentavos(String(f.get("valor") ?? ""));
    const gratisTexto = String(f.get("gratis") ?? "").trim();
    const gratis = gratisTexto ? reaisParaCentavos(gratisTexto) : null;
    const locais: Record<string, string> = {};
    if (Number.isNaN(valor)) locais.valor = "Informe um valor válido, ex.: 9,90 (use 0 para frete grátis).";
    if (gratis !== null && Number.isNaN(gratis)) locais.gratis = "Informe um valor válido ou deixe em branco.";
    if (Object.keys(locais).length) {
      setErros(locais);
      setErroGeral("Confira os campos destacados.");
      return;
    }
    setEnviando(true);
    setErros({});
    setErroGeral(null);
    try {
      await chamarApi(zona ? `/api/admin/zonas-entrega/${zona.id}` : "/api/admin/zonas-entrega", {
        method: zona ? "PUT" : "POST",
        corpo: {
          nome: f.get("nome"),
          cepInicial: f.get("cepInicial"),
          cepFinal: f.get("cepFinal"),
          valorCentavos: valor,
          freteGratisAPartirCentavos: gratis,
          prazoHoras: Number(f.get("prazoHoras")),
          ativo: f.get("ativo") === "on",
        },
      });
      avisar(zona ? "Zona atualizada" : "Zona cadastrada");
      router.push("/admin/frete");
      router.refresh();
    } catch (err) {
      setEnviando(false);
      if (err instanceof ErroApi) {
        const c = { ...err.campos };
        if (c.valorCentavos) c.valor = c.valorCentavos;
        if (c.freteGratisAPartirCentavos) c.gratis = c.freteGratisAPartirCentavos;
        setErros(c);
        setErroGeral(err.message);
      } else setErroGeral("Não foi possível salvar.");
    }
  }

  return (
    <form onSubmit={salvar} noValidate className="cartao flex max-w-2xl flex-col gap-4">
      {erroGeral && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">{erroGeral}</p>}
      <CampoTexto nome="nome" rotulo="Nome da zona" defaultValue={zona?.nome} placeholder="Ex.: Zona Sul (SP)" erro={erros.nome} />
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto nome="cepInicial" rotulo="CEP inicial" inputMode="numeric" defaultValue={cep(zona?.cepInicial)} placeholder="04000-000" erro={erros.cepInicial} />
        <CampoTexto nome="cepFinal" rotulo="CEP final" inputMode="numeric" defaultValue={cep(zona?.cepFinal)} placeholder="04999-999" erro={erros.cepFinal} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <CampoTexto nome="valor" rotulo="Frete (R$)" inputMode="decimal" defaultValue={reais(zona?.valorCentavos)} placeholder="9,90" erro={erros.valor} />
        <CampoTexto nome="gratis" rotulo="Grátis a partir de (R$)" inputMode="decimal" defaultValue={reais(zona?.freteGratisAPartirCentavos)} placeholder="Opcional" erro={erros.gratis} dica="Em branco = nunca grátis." />
        <CampoTexto nome="prazoHoras" rotulo="Prazo (horas após o preparo)" type="number" min={1} defaultValue={zona?.prazoHoras ?? 2} erro={erros.prazoHoras} />
      </div>
      <label className="flex items-center gap-2"><input type="checkbox" name="ativo" defaultChecked={zona?.ativo ?? true} className="accent-marca-600" /> Zona ativa</label>
      <div className="flex gap-2">
        <button className="btn-primario" disabled={enviando}>{enviando ? "Salvando…" : "Salvar"}</button>
        <Link href="/admin/frete" className="btn-secundario">Cancelar</Link>
      </div>
    </form>
  );
}
