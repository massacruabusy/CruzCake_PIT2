import { notFound } from "next/navigation";
import { zona as carregarZona } from "@/controllers/admin.controller";
import { garantirAdminNaPagina } from "@/lib/guardas";
import { ErroNegocio } from "@/models/erros";
import { FormularioZona } from "./FormularioZona";

export default async function PaginaZona(props: PageProps<"/admin/frete/[id]">) {
  await garantirAdminNaPagina("/admin/frete");
  const { id } = await props.params;
  let zona = null;
  if (id !== "novo") {
    try {
      zona = await carregarZona(id);
    } catch (e) {
      if (e instanceof ErroNegocio && e.codigo === "NAO_ENCONTRADO") notFound();
      throw e;
    }
  }
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-black">{zona ? `Editar zona: ${zona.nome}` : "Nova zona de entrega"}</h1>
      <FormularioZona zona={zona} />
    </div>
  );
}
