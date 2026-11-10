/**
 * Marca CruzCake: cupcake cuja cobertura é coroada por uma estrela laranja desenhada em traço,
 * homenagem à estrela da Universidade Cruzeiro do Sul (projeto acadêmico).
 */
export function IconeCruzCake({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true" focusable="false">
      {/* forminha */}
      <path d="M30 72 L90 72 L81 110 L39 110 Z" fill="#0a2d63" />
      <path d="M45 74 L48 108 M60 74 L60 108 M75 74 L72 108" stroke="#3d64a8" strokeWidth="3" strokeLinecap="round" />
      {/* cobertura */}
      <path
        d="M24 74 C18 60 30 48 43 52 C42 38 60 32 69 42 C82 36 100 46 95 61 C104 64 103 74 96 76 Z"
        fill="#fff6e3"
        stroke="#0a2d63"
        strokeWidth="3.5"
        strokeLinejoin="round"
      />
      {/* estrela em traço contínuo (pentagrama) */}
      <path
        d="M61 6 L73 47 L39 22 L82 22 L47 47 Z"
        fill="none"
        stroke="#f5a000"
        strokeWidth="6.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        transform="rotate(-8 61 28)"
      />
    </svg>
  );
}

export function LogoCruzCake() {
  return (
    <span className="flex items-center gap-1.5">
      <IconeCruzCake className="h-10 w-10" />
      <span className="text-2xl font-black tracking-tight">
        <span className="text-marca-700">Cruz</span>
        <span className="text-estrela-500">Cake</span>
      </span>
    </span>
  );
}
