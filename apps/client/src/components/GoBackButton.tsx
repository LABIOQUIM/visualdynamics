import { useRouter } from "next/router";

import { Icons } from "./Icons";

export function GoBackButton() {
  const router = useRouter();

  return (
    <button
      className="group inline-flex rounded bg-gray-1001 p-2 transition-colors duration-100 ease-linear hover:bg-gray-1001/70 w-fit"
      onClick={router.back}
      type="button"
    >
      <Icons.GoBack className="text-zinc-400 transition-colors duration-100 ease-linear group-hover:text-gray-100" />
    </button>
  );
}
