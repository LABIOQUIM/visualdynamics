import { Spinner } from "@app/components/Spinner";

export function FullPageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <Spinner />
    </div>
  );
}
