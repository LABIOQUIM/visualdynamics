import { useRouter } from "next/router";

import { Icons } from "../Icons";

export function GoBackButton() {
  const router = useRouter();

  return (
    <button
      className="group inline-flex rounded-md bg-primary-400 p-2 transition-all duration-500 ease-linear hover:bg-primary-500/70"
      onClick={router.back}
      type="button"
    >
      <Icons.GoBack className="text-zinc-100 transition-all duration-500 ease-linear group-hover:text-zinc-50" />
    </button>
  );
}
