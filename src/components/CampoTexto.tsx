import type { InputHTMLAttributes } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  nome: string;
  rotulo: string;
  erro?: string;
  dica?: string;
}

/** Campo com rótulo, mensagem de erro associada (aria-describedby) e dica opcional. */
export function CampoTexto({ nome, rotulo, erro, dica, className, ...resto }: Props) {
  const idErro = `${nome}-erro`;
  const idDica = `${nome}-dica`;
  return (
    <div className={className}>
      <label htmlFor={nome} className="rotulo">{rotulo}</label>
      <input
        id={nome}
        name={nome}
        className="campo"
        aria-invalid={Boolean(erro)}
        aria-describedby={[erro ? idErro : null, dica ? idDica : null].filter(Boolean).join(" ") || undefined}
        {...resto}
      />
      {dica && !erro && <p id={idDica} className="mt-1 text-xs text-stone-500">{dica}</p>}
      {erro && <p id={idErro} className="erro-campo">{erro}</p>}
    </div>
  );
}
