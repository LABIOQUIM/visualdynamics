import { Button } from "components/Button";

interface ItemProps {
  isCurrent?: boolean;
  number: number;
  onPageChange: (page: number) => void;
}

export function Item({
  isCurrent = false,
  number,
  onPageChange
}: ItemProps): JSX.Element {
  if (isCurrent) {
    return (
      <Button
        className="h-8 w-8"
        disabled
      >
        {number}
      </Button>
    );
  }

  return (
    <Button
      className="h-8 w-8"
      onClick={() => onPageChange(number)}
    >
      {number}
    </Button>
  );
}
