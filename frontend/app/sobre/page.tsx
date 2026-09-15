export default function SobrePage() {
  const sections = [
    ["Por que o sistema foi criado", "O método Simplex é fundamental em Pesquisa Operacional, porém é comum perder o raciocínio ao acompanhar várias operações matemáticas em sequência."],
    ["Objetivo", "Criar um ambiente didático capaz de ensinar o método Simplex de maneira interativa, visual e progressiva."],
    ["Importância", "Compreender o Simplex ajuda a entender otimização, alocação eficiente de recursos e tomada de decisão quantitativa."],
  ];
  return (
    <div className="container-page py-12 md:py-16">
      <p className="text-sm font-semibold uppercase tracking-[.18em] text-black/45">Sobre</p>
      <h1 className="mt-2 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">Aprender o raciocínio por trás da solução.</h1>
      <div className="mt-14 grid gap-10 md:grid-cols-3">{sections.map(([title, text]) => <section key={title} className="border-t-2 border-black pt-5"><h2 className="text-xl font-bold">{title}</h2><p className="mt-3 leading-7 text-black/65">{text}</p></section>)}</div>
      <section className="mt-16 border-y border-black/10 bg-[#F7F7F7] p-7 md:p-10"><h2 className="text-2xl font-bold">Benefícios do SimplexLab</h2><div className="mt-6 grid gap-3 md:grid-cols-2">{["Aprendizagem guiada", "Feedback imediato", "Visualização gráfica", "Prática progressiva", "Diferentes tipos de problema", "Compreensão das contas", "Menor dependência de respostas prontas"].map((item) => <p key={item}>— {item}</p>)}</div></section>
      <p className="mt-8 text-sm text-black/55">Limitações do MVP: maximização, duas variáveis, até três restrições do tipo ≤, não negatividade, sem Big M, sem duas fases, sem minimização, gráficos 2D, execução local e sem autenticação.</p>
    </div>
  );
}
