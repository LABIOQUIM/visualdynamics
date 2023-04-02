import Link from "next/link";

type TimelineItem = {
  date: string;
  title: string;
  description?: string;
};

interface TimelineProps {
  showRecentsOnly?: boolean;
  showTitle?: boolean;
}

const items: TimelineItem[] = [
  {
    date: "Março de 2023",
    title:
      "Publicação de Artigo sobre o Visual Dynamics na revista BMC Bioinformatics"
  },
  {
    date: "Julho de 2022",
    title:
      "Saída da equipe do projeto DERUN - Pesquisa e desenvolvimento de sistema para definição de rotas eficientes em redes urbanas"
  },
  {
    date: "Dezembro de 2021",
    title: "Inclusão no time do projeto Visual Dynamics"
  },
  {
    date: "Setembro de 2021",
    title:
      "Início do trabalho no projeto DERUN - Pesquisa e desenvolvimento de sistema para definição de rotas eficientes em redes urbanas"
  },
  {
    date: "Julho 2021",
    title: "Conclusão do trabalho no projeto Ictiobiometria"
  },
  {
    date: "Agosto de 2020",
    title: "Início do trabalho no projeto Ictiobiometria (PIBIC)"
  },
  {
    date: "Fevereiro de 2019",
    title: "Início da graduação em Ciência da Computação"
  }
];

export function Timeline({ showRecentsOnly, showTitle }: TimelineProps) {
  const renderableItems = showRecentsOnly ? items.slice(0, 3) : items;

  return (
    <section className={`${!showTitle ? "mt-5" : ""} flex flex-col gap-y-2`}>
      {showTitle ? <h2 className="text-2xl">Linha do Tempo</h2> : null}
      <ol className="relative border-l border-gray-200 dark:border-gray-700">
        {renderableItems.map((item) => (
          <li
            className="ml-4 mt-3 first-of-type:mt-0"
            key={item.title}
          >
            <div className="absolute w-3 h-3 bg-gray-200 rounded-full mt-1.5 -left-1.5 border border-white dark:border-gray-900 dark:bg-gray-700"></div>
            <time className="mb-1 text-sm font-normal leading-none text-zinc-400 dark:text-gray-500">
              {item.date}
            </time>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {item.title}
            </h3>
            {item.description ? (
              <p className="mb-4 text-base font-normal text-gray-500 dark:text-zinc-400">
                {item.description}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
      {showRecentsOnly && items.length > 3 ? (
        <Link
          className="flex w-fit items-center font-inter text-sm font-medium text-[#888] transition-all duration-75 ease-linear hover:text-zinc-50"
          href="/timeline"
        >
          Ver mais
        </Link>
      ) : null}
    </section>
  );
}
