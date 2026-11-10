import { readdir } from "node:fs/promises";
import path from "node:path";
import { notFound } from "next/navigation";
import { formularioProduto } from "@/controllers/admin.controller";
import { ErroNegocio } from "@/models/erros";
import { FormularioProduto } from "../FormularioProduto";
import { garantirAdminNaPagina } from "@/lib/guardas";

async function imagensDisponiveis() {
  const arquivos = await readdir(path.join(process.cwd(), "public", "img", "cupcakes"));
  return arquivos.filter((a) => a.endsWith(".svg")).map((a) => `/img/cupcakes/${a}`);
}

export default async function PaginaEditarProduto(props: PageProps<"/admin/produtos/[id]">) {
  await garantirAdminNaPagina("/admin/produtos");
  const { id } = await props.params;
  const ehNovo = id === "novo";
  let dados;
  try {
    dados = await formularioProduto(ehNovo ? undefined : id);
  } catch (e) {
    if (e instanceof ErroNegocio && e.codigo === "NAO_ENCONTRADO") notFound();
    throw e;
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-black">{ehNovo ? "Novo produto" : `Editar: ${dados.produto?.nome}`}</h1>
      <FormularioProduto categorias={dados.categorias} produto={dados.produto} imagens={await imagensDisponiveis()} />
    </div>
  );
}
