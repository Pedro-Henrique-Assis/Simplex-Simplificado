import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full">
      <section className="container-page grid min-h-[68vh] items-center gap-10 bg-black py-16 text-white md:grid-cols-[1.25fr_.75fr]">
        <div>
          <p className="mb-5 text-sm font-semibold uppercase tracking-[.2em] text-[#80FFF6]">Pesquisa Operacional • Tutor interativo</p>
          <h1 className="max-w-4xl text-5xl font-bold tracking-[-.04em] md:text-7xl">Aprenda Simplex passo a passo.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">Entenda a lógica por trás do método, pratique problemas de diferentes níveis e acompanhe cada etapa até a solução ótima.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/aprender" className="btn-primary">Começar a aprender</Link>
            <Link href="/resolver" className="rounded-lg border border-white/35 px-4 py-3 font-semibold text-white hover:border-white">Resolver um problema</Link>
          </div>
        </div>
        <div className="border-l border-white/20 pl-6 md:pl-10">
          <p className="text-sm text-white/50">A ideia central</p>
          <p className="mt-3 text-2xl font-semibold leading-9">Você não recebe apenas a resposta. Você acompanha a decisão, a conta e o motivo de cada pivoteamento.</p>
        </div>
      </section>

      <section className="container-page py-16">
        <p className="text-sm font-semibold uppercase tracking-[.18em] text-black/45">Como funciona</p>
        <div className="mt-7 grid gap-7 md:grid-cols-4">
          {["Escolha um problema", "Resolva de forma guiada", "Entenda cada operação", "Visualize graficamente"].map((item, i) => (
            <div key={item} className="border-t-2 border-black pt-4"><span className="text-sm text-black/45">0{i + 1}</span><h2 className="mt-2 text-xl font-bold">{item}</h2></div>
          ))}
        </div>
      </section>

      <section className="container-page border-y border-black/10 bg-[#F7F7F7] py-14">
        <div className="grid gap-10 md:grid-cols-2">
          <h2 className="text-3xl font-bold tracking-tight">Um tutor digital, não uma calculadora.</h2>
          <div className="grid gap-3 text-black/70 sm:grid-cols-2">
            {['Resolução guiada', 'Biblioteca com 18 problemas', 'Gráfico 2D e região viável', 'Dificuldades progressivas', 'Contas de cada iteração', 'Dicas progressivas'].map((item) => <p key={item} className="border-b border-black/15 pb-3">{item}</p>)}
          </div>
        </div>
      </section>

      <section className="container-page flex flex-col items-start justify-between gap-6 py-16 md:flex-row md:items-center">
        <div><p className="text-sm text-black/45">Pronto para praticar?</p><h2 className="mt-1 text-3xl font-bold">Comece sua primeira resolução.</h2></div>
        <Link href="/problemas" className="btn-primary">Explorar problemas</Link>
      </section>
    </div>
  );
}
