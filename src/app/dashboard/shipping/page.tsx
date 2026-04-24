export default function DashboardShippingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-white">Centro de logística (EUA)</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Etiquetas comerciais via API agregadora —{" "}
          <strong className="font-medium text-zinc-300">Shippo</strong> ou{" "}
          <strong className="font-medium text-zinc-300">EasyPost</strong> para comprar etiquetas{" "}
          <strong className="font-medium text-zinc-300">USPS</strong>, <strong className="font-medium text-zinc-300">UPS</strong>{" "}
          e <strong className="font-medium text-zinc-300">FedEx</strong> a partir dos dados do pacote (lbs, in) e do
          endereço.
        </p>
        <p className="mt-2 text-sm text-zinc-500">
          Frete ao consumidor: tabelas ou cotação em tempo real por <strong className="text-zinc-400">ZIP Code</strong>{" "}
          (zona + peso/volume). Abaixo: UI de protótipo até ligar credenciais da transportadora.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="tech-card space-y-4 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white">Integração de etiquetas</h3>
          <p className="text-sm text-zinc-400">
            Fluxo típico: escolher transportadora e serviço → gerar PDF/ZPL → imprimir. Um único adaptador (Shippo ou
            EasyPost) unifica carriers.
          </p>
          <div className="flex flex-wrap gap-2">
            {["USPS", "UPS", "FedEx"].map((c) => (
              <button
                key={c}
                type="button"
                className="rounded-lg border border-white/15 px-3 py-2 text-sm text-zinc-200 transition hover:border-neon/40"
              >
                Cotar / pré-visualizar {c}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="rounded-lg bg-neon px-4 py-2 text-sm font-semibold text-black opacity-80"
            disabled
          >
            Gerar e imprimir etiqueta (conectar API)
          </button>
        </section>

        <section className="tech-card space-y-4 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white">Cálculo de frete por ZIP</h3>
          <label className="flex flex-col gap-2 text-sm text-zinc-300">
            ZIP do destino (EUA)
            <input
              placeholder="94107"
              className="rounded-md border border-white/15 bg-black/30 p-2"
              maxLength={10}
            />
          </label>
          <p className="text-xs text-zinc-500">
            Ajuste dinâmico: zona postal + peso (lbs) + dimensões da caixa (in). Stub até ligar rating API (mesmo
            provider das etiquetas ou tabela própria).
          </p>
          <button
            type="button"
            className="rounded-lg border border-neon/40 px-4 py-2 text-sm text-neon opacity-70"
            disabled
          >
            Calcular frete
          </button>
        </section>
      </div>
    </div>
  );
}
