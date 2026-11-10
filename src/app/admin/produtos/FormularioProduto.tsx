"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CampoTexto } from "@/components/CampoTexto";
import { useCarrinho } from "@/components/CarrinhoProvider";
import { chamarApi, ErroApi } from "@/lib/api-cliente";
import { reaisParaCentavos } from "@/models/regras/dinheiro";

interface Props {
  categorias: { id: number; nome: string }[];
  imagens: string[];
  produto: {
    id: number;
    nome: string;
    categoriaId: number;
    descricao: string;
    ingredientes: string | null;
    precoCentavos: number;
    estoque: number;
    imagemUrl: string;
    ativo: boolean;
    destaque: boolean;
  } | null;
}

export function FormularioProduto({ categorias, imagens, produto }: Props) {
  const router = useRouter();
  const { avisar } = useCarrinho();
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [imagem, setImagem] = useState(produto?.imagemUrl ?? imagens[0]);

  async function salvar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const preco = reaisParaCentavos(String(f.get("preco") ?? ""));
    const corpo = {
      nome: f.get("nome"),
      categoriaId: Number(f.get("categoriaId")),
      descricao: f.get("descricao"),
      ingredientes: f.get("ingredientes") || null,
      precoCentavos: Number.isNaN(preco) ? -1 : preco,
      estoque: Number(f.get("estoque")),
      imagemUrl: imagem,
      ativo: f.get("ativo") === "on",
      destaque: f.get("destaque") === "on",
    };
    setEnviando(true);
    setErros({});
    setErroGeral(null);
    try {
      await chamarApi(produto ? `/api/admin/produtos/${produto.id}` : "/api/admin/produtos", {
        method: produto ? "PUT" : "POST",
        corpo,
      });
      avisar(produto ? "Produto atualizado" : "Produto cadastrado");
      router.push("/admin/produtos");
      router.refresh();
    } catch (err) {
      setEnviando(false);
      if (err instanceof ErroApi) {
        const campos = { ...err.campos };
        if (campos.precoCentavos) campos.preco = Number.isNaN(preco) ? "Informe um preço válido, ex.: 12,50" : campos.precoCentavos;
        setErros(campos);
        setErroGeral(err.message);
      } else setErroGeral("Não foi possível salvar.");
    }
  }

  return (
    <form onSubmit={salvar} noValidate className="cartao flex max-w-3xl flex-col gap-4">
      {erroGeral && <p role="alert" className="rounded-xl bg-red-50 p-3 text-red-800">{erroGeral}</p>}
      <CampoTexto nome="nome" rotulo="Nome do produto" defaultValue={produto?.nome} required erro={erros.nome} />
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="categoriaId" className="rotulo">Categoria</label>
          <select id="categoriaId" name="categoriaId" defaultValue={produto?.categoriaId ?? ""} className="campo" aria-invalid={Boolean(erros.categoriaId)}>
            <option value="" disabled>Selecione…</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          {erros.categoriaId && <p className="erro-campo">{erros.categoriaId}</p>}
        </div>
        <CampoTexto nome="preco" rotulo="Preço (R$)" inputMode="decimal" defaultValue={produto ? (produto.precoCentavos / 100).toFixed(2).replace(".", ",") : ""} placeholder="12,50" erro={erros.preco} />
        <CampoTexto nome="estoque" rotulo="Estoque (unidades)" type="number" min={0} defaultValue={produto?.estoque ?? 0} erro={erros.estoque} />
      </div>
      <div>
        <label htmlFor="descricao" className="rotulo">Descrição</label>
        <textarea id="descricao" name="descricao" defaultValue={produto?.descricao} className="campo min-h-24" aria-invalid={Boolean(erros.descricao)} />
        {erros.descricao && <p className="erro-campo">{erros.descricao}</p>}
      </div>
      <div>
        <label htmlFor="ingredientes" className="rotulo">Ingredientes e alérgenos (opcional)</label>
        <textarea id="ingredientes" name="ingredientes" defaultValue={produto?.ingredientes ?? ""} className="campo min-h-16" />
      </div>
      <fieldset>
        <legend className="rotulo">Imagem</legend>
        <div className="flex flex-wrap gap-2">
          {imagens.map((src) => (
            <label key={src} className={`cursor-pointer rounded-xl border-2 p-1 ${imagem === src ? "border-marca-600" : "border-transparent"}`}>
              <input type="radio" name="imagem" value={src} checked={imagem === src} onChange={() => setImagem(src)} className="sr-only" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={src.split("/").pop()?.replace(/\.\w+$/, "")} width={56} height={56} className="rounded-lg" />
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2"><input type="checkbox" name="ativo" defaultChecked={produto?.ativo ?? true} className="accent-marca-600" /> Ativo (aparece na vitrine)</label>
        <label className="flex items-center gap-2"><input type="checkbox" name="destaque" defaultChecked={produto?.destaque ?? false} className="accent-marca-600" /> Destaque</label>
      </div>
      <div className="flex gap-2">
        <button className="btn-primario" disabled={enviando}>{enviando ? "Salvando…" : "Salvar"}</button>
        <Link href="/admin/produtos" className="btn-secundario">Cancelar</Link>
      </div>
    </form>
  );
}
