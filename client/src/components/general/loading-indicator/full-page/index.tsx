import { LoadingThreeDotsWave } from "@app/components/general/loading-indicator/three-dots-wave";

export function PageLoadingIndicator() {
  return (
    <div className="flex flex-1 items-center justify-center">
      <LoadingThreeDotsWave />
    </div>
  );
}
