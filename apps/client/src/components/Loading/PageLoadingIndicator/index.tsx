import { LoadingThreeDotsWave } from "@app/components/Loading/ThreeDotsWave";

export function PageLoadingIndicator() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <LoadingThreeDotsWave />
    </div>
  );
}
