"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useCarrinho } from "@/components/CarrinhoProvider";
import { CampoTexto } from "@/components/CampoTexto";
import { ResumoValores } from "@/components/ResumoValores";
import { usePrecificacao } from "@/components/usePrecificacao";
import { chamarApi, ErroApi } from "@/lib/api-cliente";

interface EnderecoSalvo {
  id: number;
  apelido: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string | null;
  bairro: string;
  cidade: string;
  uf: string;
}

const enderecoVazio = { cep: "", logradouro: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" };

function formatarCep(cep: string) {
  const d = cep.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
}

export function TelaCheckout({ enderecos }: { enderecos: EnderecoSalvo[] }) {
  const router = useRouter();
  const { itens, cupom, limpar, carregado } = useCarrinho();
  const [tipoEntrega, setTipoEntrega] = useState<"ENTREGA" | "RETIRADA">("ENTREGA");
  const [enderecoId, setEnderecoId] = useState<number | "novo">(enderecos[0]?.id ?? "novo");
  const [novo, setNovo] = useState(enderecoVazio);
  const [salvarEndereco, setSalvarEndereco] = useState(true);
  const [metodo, setMetodo] = useState<"PIX" | "CARTAO">("PIX");
  const [cartao, setCartao] = useState({ numero: "", nomeImpresso: "", validade: "", cvv: "" });
  const [observacao, setObservacao] = useState("");
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<{ mensagem: string; codigo: string } | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const { dados, carregando } = usePrecificacao(tipoEntrega);

  if (carregado && itens.length === 0 && !enviando) {
    return (
      <div className="cartao mx-auto max-w-md text-center">
        <h1 className="text-2xl font-black">Seu carrinho está vazio</h1>
        <Link href="/" className="btn-primario mt-4">Ver cardápio</Link>
      </div>
    );
  }

  async function buscarCep(valor: string) {
    const cep = valor.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setBuscandoCep(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const j = await r.json();
      if (j.erro) {
        setErros((e) => ({ ...e, "endereco.cep": "CEP não encontrado. Confira ou preencha o endereço manualmente." }));
      } else {
        setNovo((n) => ({ ...n, logradouro: j.logradouro || n.logradouro, bairro: j.bairro || n.bairro, cidade: j.localidade || n.cidade, uf: j.uf || n.uf }));
        setErros((e) => ({ ...e, "endereco.cep": "" }));
      }
    } catch {
      // Serviço de CEP fora do ar: o cliente preenche manualmente.
    } finally {
      setBuscandoCep(false);
    }
  }

  async function finalizar(e: FormEvent) {
    e.preventDefault();
    setErros({});
    setErroGeral(null);
    const salvo = enderecos.find((x) => x.id === enderecoId);
    const endereco =
      tipoEntrega === "RETIRADA" ? null : salvo ? { ...salvo, id: undefined, apelido: undefined } : { ...novo };
    setEnviando(true);
    try {
      const r = await chamarApi<{ pedidoId: number }>("/api/pedidos", {
        corpo: {
          itens: itens.map((i) => ({ produtoId: i.produtoId, quantidade: i.quantidade })),
          tipoEntrega,
          endereco,
          salvarEndereco: tipoEntrega === "ENTREGA" && enderecoId === "novo" && salvarEndereco,
          codigoCupom: cupom || null,
          metodoPagamento: metodo,
          cartao: metodo === "CARTAO" ? cartao : null,
          observacao: observacao || null,
        },
      });
      limpar();
      router.push(`/pedidos/${r.pedidoId}?novo=1`);
      router.refresh();
    } catch (err) {
      setEnviando(false);
      if (err instanceof ErroApi) {
        setErros(err.campos);
        setErroGeral({ mensagem: err.message, codigo: err.codigo });
        if (err.status === 401) router.push("/entrar?voltar=/checkout");
      } else {
        setErroGeral({ mensagem: "Não foi possível finalizar. Tente novamente.", codigo: "ERRO" });
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  const opcao = (ativo: boolean) =>
    `flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 ${ativo ? "border-marca-600 bg-marca-50" : "border-stone-200 bg-white"}`;

  return (
    <form onSubmit={finalizar} noValidate className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-black">Finalizar compra</h1>
        {erroGeral && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-bold">{erroGeral.mensagem}</p>
            {["ESTOQUE_INSUFICIENTE", "PRODUTO_INDISPONIVEL", "CUPOM_INVALIDO"].includes(erroGeral.codigo) && (
              <Link href="/carrinho" className="font-semibold underline">Voltar ao carrinho para ajustar</Link>
            )}
          </div>
        )}

        <fieldset className="cartao flex flex-col gap-3">
          <legend className="px-1 text-lg font-black">1. Como quer receber?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={opcao(tipoEntrega === "ENTREGA")}>
              <input type="radio" name="tipoEntrega" checked={tipoEntrega === "ENTREGA"} onChange={() => setTipoEntrega("ENTREGA")} className="mt-1 accent-marca-600" />
              <span><strong>Entrega</strong><br /><span className="text-sm text-stone-600">Hoje, em até 2h após o preparo</span></span>
            </label>
            <label className={opcao(tipoEntrega === "RETIRADA")}>
              <input type="radio" name="tipoEntrega" checked={tipoEntrega === "RETIRADA"} onChange={() => setTipoEntrega("RETIRADA")} className="mt-1 accent-marca-600" />
              <span><strong>Retirar na loja</strong><br /><span className="text-sm text-stone-600">Rua das Confeitarias, 123 · grátis</span></span>
            </label>
          </div>

          {tipoEntrega === "ENTREGA" && (
            <div className="flex flex-col gap-3">
              {enderecos.length > 0 && (
                <div className="flex flex-col gap-2" role="radiogroup" aria-label="Endereço de entrega">
                  {enderecos.map((en) => (
                    <label key={en.id} className={opcao(enderecoId === en.id)}>
                      <input type="radio" name="endereco" checked={enderecoId === en.id} onChange={() => setEnderecoId(en.id)} className="mt-1 accent-marca-600" />
                      <span className="text-sm">
                        <strong>{en.apelido}</strong> — {en.logradouro}, {en.numero}
                        {en.complemento ? ` (${en.complemento})` : ""} · {en.bairro}, {en.cidade}/{en.uf} · CEP {formatarCep(en.cep)}
                      </span>
                    </label>
                  ))}
                  <label className={opcao(enderecoId === "novo")}>
                    <input type="radio" name="endereco" checked={enderecoId === "novo"} onChange={() => setEnderecoId("novo")} className="mt-1 accent-marca-600" />
                    <span className="font-bold">Usar outro endereço</span>
                  </label>
                </div>
              )}
              {enderecoId === "novo" && (
                <div className="grid gap-3 sm:grid-cols-6">
                  <CampoTexto
                    className="sm:col-span-2"
                    nome="cep"
                    rotulo="CEP"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={novo.cep}
                    onChange={(e) => setNovo({ ...novo, cep: formatarCep(e.target.value) })}
                    onBlur={(e) => buscarCep(e.target.value)}
                    erro={erros["endereco.cep"] || erros["endereco"]}
                    dica={buscandoCep ? "Buscando endereço…" : "Preenchemos a rua automaticamente."}
                  />
                  <CampoTexto className="sm:col-span-4" nome="logradouro" rotulo="Rua" autoComplete="address-line1" value={novo.logradouro} onChange={(e) => setNovo({ ...novo, logradouro: e.target.value })} erro={erros["endereco.logradouro"]} />
                  <CampoTexto className="sm:col-span-2" nome="numero" rotulo="Número" value={novo.numero} onChange={(e) => setNovo({ ...novo, numero: e.target.value })} erro={erros["endereco.numero"]} />
                  <CampoTexto className="sm:col-span-4" nome="complemento" rotulo="Complemento (opcional)" value={novo.complemento} onChange={(e) => setNovo({ ...novo, complemento: e.target.value })} />
                  <CampoTexto className="sm:col-span-2" nome="bairro" rotulo="Bairro" value={novo.bairro} onChange={(e) => setNovo({ ...novo, bairro: e.target.value })} erro={erros["endereco.bairro"]} />
                  <CampoTexto className="sm:col-span-3" nome="cidade" rotulo="Cidade" autoComplete="address-level2" value={novo.cidade} onChange={(e) => setNovo({ ...novo, cidade: e.target.value })} erro={erros["endereco.cidade"]} />
                  <CampoTexto className="sm:col-span-1" nome="uf" rotulo="UF" maxLength={2} value={novo.uf} onChange={(e) => setNovo({ ...novo, uf: e.target.value.toUpperCase() })} erro={erros["endereco.uf"]} />
                  <label className="flex items-center gap-2 text-sm sm:col-span-6">
                    <input type="checkbox" checked={salvarEndereco} onChange={(e) => setSalvarEndereco(e.target.checked)} className="accent-marca-600" />
                    Salvar este endereço para as próximas compras
                  </label>
                </div>
              )}
            </div>
          )}
        </fieldset>

        <fieldset className="cartao flex flex-col gap-3">
          <legend className="px-1 text-lg font-black">2. Pagamento</legend>
          <p className="rounded-lg bg-amber-50 p-2 text-sm text-amber-900">
            Ambiente de demonstração: nenhum valor é cobrado de verdade.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={opcao(metodo === "PIX")}>
              <input type="radio" name="metodo" checked={metodo === "PIX"} onChange={() => setMetodo("PIX")} className="mt-1 accent-marca-600" />
              <span><strong>PIX</strong><br /><span className="text-sm text-stone-600">Código gerado após confirmar</span></span>
            </label>
            <label className={opcao(metodo === "CARTAO")}>
              <input type="radio" name="metodo" checked={metodo === "CARTAO"} onChange={() => setMetodo("CARTAO")} className="mt-1 accent-marca-600" />
              <span><strong>Cartão de crédito</strong><br /><span className="text-sm text-stone-600">Aprovação na hora</span></span>
            </label>
          </div>
          {metodo === "CARTAO" && (
            <div className="grid gap-3 sm:grid-cols-4">
              <CampoTexto className="sm:col-span-4" nome="cartao-numero" rotulo="Número do cartão" inputMode="numeric" autoComplete="cc-number" value={cartao.numero} onChange={(e) => setCartao({ ...cartao, numero: e.target.value.replace(/[^\d ]/g, "").slice(0, 23) })} erro={erros["cartao.numero"] || erros["cartao"]} dica="Teste: 4111 1111 1111 1111 (aprovado) · 4000 0000 0002 0000 (recusado)" />
              <CampoTexto className="sm:col-span-4" nome="cartao-nome" rotulo="Nome impresso no cartão" autoComplete="cc-name" value={cartao.nomeImpresso} onChange={(e) => setCartao({ ...cartao, nomeImpresso: e.target.value.toUpperCase() })} erro={erros["cartao.nomeImpresso"]} />
              <CampoTexto className="sm:col-span-2" nome="cartao-validade" rotulo="Validade (MM/AA)" inputMode="numeric" autoComplete="cc-exp" placeholder="MM/AA" value={cartao.validade}
                onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); setCartao({ ...cartao, validade: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }); }}
                erro={erros["cartao.validade"]} />
              <CampoTexto className="sm:col-span-2" nome="cartao-cvv" rotulo="CVV" inputMode="numeric" autoComplete="cc-csc" maxLength={4} value={cartao.cvv} onChange={(e) => setCartao({ ...cartao, cvv: e.target.value.replace(/\D/g, "") })} erro={erros["cartao.cvv"]} />
            </div>
          )}
        </fieldset>

        <div className="cartao">
          <label htmlFor="observacao" className="rotulo">Observações para a loja (opcional)</label>
          <textarea id="observacao" maxLength={300} value={observacao} onChange={(e) => setObservacao(e.target.value)} className="campo min-h-20" placeholder="Ex.: é para presente, tocar o interfone 12" />
        </div>
      </div>

      <aside className="cartao flex h-fit flex-col gap-4 lg:sticky lg:top-24" aria-label="Resumo do pedido">
        <h2 className="text-lg font-black">Resumo</h2>
        <ul className="flex flex-col gap-1 text-sm">
          {(dados?.itens ?? []).map((i) => (
            <li key={i.produtoId} className="flex justify-between gap-2">
              <span>{i.quantidade}× {i.nome}</span>
            </li>
          ))}
        </ul>
        {dados?.cupom && <p className="text-sm text-green-700">Cupom {dados.cupom.codigo} aplicado</p>}
        {dados?.erroCupom && <p className="text-sm text-red-700">{dados.erroCupom}</p>}
        {dados && <ResumoValores {...dados} tipoEntrega={tipoEntrega} />}
        <button className="btn-primario" disabled={enviando || carregando || (dados?.problemas.length ?? 0) > 0}>
          {enviando ? "Processando…" : metodo === "PIX" ? "Confirmar e gerar PIX" : "Pagar e confirmar pedido"}
        </button>
        {(dados?.problemas.length ?? 0) > 0 && (
          <p className="text-sm text-red-700">
            Há itens indisponíveis. <Link href="/carrinho" className="underline">Ajuste o carrinho</Link>.
          </p>
        )}
      </aside>
    </form>
  );
}
