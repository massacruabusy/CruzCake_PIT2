import { formatarCentavos } from "@/models/regras/dinheiro";

interface Props {
  subtotalCentavos: number;
  descontoCentavos: number;
  freteCentavos: number;
  totalCentavos: number;
  tipoEntrega?: "ENTREGA" | "RETIRADA";
}

export function ResumoValores({ subtotalCentavos, descontoCentavos, freteCentavos, totalCentavos, tipoEntrega }: Props) {
  return (
    <dl className="flex flex-col gap-1 text-stone-700">
      <div className="flex justify-between">
        <dt>Subtotal</dt>
        <dd>{formatarCentavos(subtotalCentavos)}</dd>
      </div>
      {descontoCentavos > 0 && (
        <div className="flex justify-between text-green-700">
          <dt>Desconto</dt>
          <dd>− {formatarCentavos(descontoCentavos)}</dd>
        </div>
      )}
      <div className="flex justify-between">
        <dt>{tipoEntrega === "RETIRADA" ? "Retirada na loja" : "Frete"}</dt>
        <dd>{freteCentavos === 0 ? "Grátis" : formatarCentavos(freteCentavos)}</dd>
      </div>
      <div className="mt-2 flex justify-between border-t border-marca-100 pt-2 text-xl font-black text-cacau-900">
        <dt>Total</dt>
        <dd>{formatarCentavos(totalCentavos)}</dd>
      </div>
    </dl>
  );
}
