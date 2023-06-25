import useTranslation from "next-translate/useTranslation";

import { Item } from "@app/components/general/pagination/item";

interface Props {
  totalRegisterCount: number;
  registersPerPage?: number;
  currentPage?: number;
  onPageChange: (page: number) => void;
}
const siblingsCount = 1;

function generatePagesArray(from: number, to: number) {
  return [...new Array(to - from)]
    .map((_, index) => {
      return from + index + 1;
    })
    .filter((page) => page > 0);
}

export function Pagination({
  totalRegisterCount,
  currentPage = 1,
  onPageChange,
  registersPerPage = 10
}: Props) {
  const { t } = useTranslation();
  const lastPage = Math.floor(totalRegisterCount / registersPerPage);

  const previousPages =
    currentPage > 1
      ? generatePagesArray(currentPage - 1 - siblingsCount, currentPage - 1)
      : [];

  const nextPages =
    currentPage < lastPage
      ? generatePagesArray(
          currentPage,
          Math.min(currentPage + siblingsCount, lastPage)
        )
      : [];

  return (
    <div className="flex w-full flex-col items-center justify-between gap-6 md:flex-row">
      <div>
        <strong>{(currentPage - 1) * 10 + 1}</strong> -{" "}
        <strong>{currentPage * 10}</strong> {t("common:of")}{" "}
        <strong>{totalRegisterCount}</strong>
      </div>
      <div className="flex gap-2">
        {currentPage > 1 + siblingsCount && (
          <>
            <Item
              number={1}
              onPageChange={onPageChange}
            />
            {2 + siblingsCount < currentPage && (
              <p className="h-8 w-8 text-center">...</p>
            )}
          </>
        )}
        {previousPages.length > 0 &&
          previousPages.map((page) => (
            <Item
              key={page}
              number={page}
              onPageChange={onPageChange}
            />
          ))}
        <Item
          number={currentPage}
          isCurrent
          onPageChange={onPageChange}
        />
        {nextPages.length > 0 &&
          nextPages.map((page) => (
            <Item
              key={page}
              number={page}
              onPageChange={onPageChange}
            />
          ))}

        {currentPage + siblingsCount < lastPage && (
          <>
            {currentPage + 1 + siblingsCount < lastPage && (
              <p className="h-8 w-8 text-center">...</p>
            )}
            <Item
              number={lastPage}
              onPageChange={onPageChange}
            />
          </>
        )}
      </div>
    </div>
  );
}
